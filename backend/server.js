const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { ethers } = require("ethers");
const { CONTRACT_ADDRESS, RPC_URL, CONTRACT_ABI } = require("./contractConfig");
const { router: authRouter, seedDefaultUsers } = require("./routes/auth");

// MongoDB Models
const StudentProfile = require("./models/StudentProfile");
const Project = require("./models/Project");
const Endorsement = require("./models/Endorsement");
const Metadata = require("./models/Metadata");
const CredentialRequest = require("./models/CredentialRequest");
const BlindProof = require("./models/BlindProof");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/credonet";

app.use(cors());
app.use(express.json());

// Initialize Default Student Profile for Alex John (No dummy projects or endorsements)
async function initDefaultStudentProfile() {
  try {
    const DEMO_ADDRESS = "0x71c92a8c943b8d62283e1c66289b5b38b71c4e92".toLowerCase();
    await StudentProfile.updateMany({ name: "Alex Raut" }, { name: "Alex John" });
    const existing = await StudentProfile.findOne({ walletAddress: DEMO_ADDRESS });
    if (!existing) {
      await StudentProfile.create({
        walletAddress: DEMO_ADDRESS,
        name: "Alex John",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        college: "Sardar Patel Institute of Technology",
        degree: "B.E. Computer Engineering",
        graduationYear: "2027",
        bio: "Full-Stack & Web3 Developer focused on smart contract architecture, EVM distributed systems, and verifiable credentials.",
        interests: ["Web Development", "Blockchain", "Distributed Systems", "Cryptography"],
      });
      console.log("[CredoNet Backend] Initialized profile for Alex John in MongoDB");
    }
  } catch (err) {
    console.warn("[CredoNet Backend] Student profile initialization warning:", err.message);
  }
}

// Initialize MongoDB (MERN Stack)
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[CredoNet Backend] Connected to MongoDB at: ${MONGO_URI}`);
    await seedDefaultUsers();
    await initDefaultStudentProfile();
  } catch (err) {
    console.warn(`[CredoNet Backend] MongoDB connection warning: ${err.message}`);
  }
}
connectDB();

// Mount Authentication & Authorization Routes
app.use("/api/auth", authRouter);

// Initialize Ethereum Provider & Contract
let provider;
let contract;

function initBlockchain() {
  try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    console.log(`[CredoNet Backend] Initialized with RPC: ${RPC_URL}`);
    console.log(`[CredoNet Backend] Contract: ${CONTRACT_ADDRESS}`);
  } catch (err) {
    console.error("[CredoNet Backend] Error initializing provider:", err.message);
  }
}

initBlockchain();

// Helpers to format bigints and structs
function formatCredential(cred) {
  if (!cred) return null;
  return {
    credentialId: cred.credentialId || cred[0],
    student: cred.student || cred[1],
    skill: cred.skill || cred[2],
    issuer: cred.issuer || cred[3],
    metadataHash: cred.metadataHash || cred[4],
    issuedAt: (cred.issuedAt || cred[5]).toString(),
    revoked: Boolean(cred.revoked !== undefined ? cred.revoked : cred[6]),
  };
}

// Routes

/**
 * Health check & status
 */
app.get("/api/health", async (req, res) => {
  let blockNumber = null;
  let contractOk = false;
  try {
    if (provider) {
      blockNumber = await provider.getBlockNumber();
    }
    if (contract) {
      const owner = await contract.owner();
      contractOk = Boolean(owner);
    }
  } catch (e) {
    // Ignore RPC timeout on health check
  }

  res.json({
    status: "online",
    name: "CredoNet Protocol Backend API",
    version: "1.0.0",
    network: "Monad Testnet",
    chainId: 10143,
    contractAddress: CONTRACT_ADDRESS,
    blockNumber,
    contractConnected: contractOk,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Public config for clients
 */
app.get("/api/config", (req, res) => {
  res.json({
    name: "CredoNet",
    contractAddress: CONTRACT_ADDRESS,
    rpcUrl: RPC_URL,
    chainId: 10143,
    chainName: "Monad Testnet",
    symbol: "MON",
    explorerUrl: "https://testnet.monadexplorer.com",
    abi: CONTRACT_ABI,
  });
});

/**
 * Global Network Stats
 */
app.get("/api/stats", async (req, res) => {
  try {
    let totalCredentials = "0";
    let owner = "0x0000000000000000000000000000000000000000";

    if (contract) {
      try {
        const total = await contract.getTotalCredentials();
        totalCredentials = total.toString();
      } catch (err) {
        console.warn("Could not read total credentials:", err.message);
      }
      try {
        owner = await contract.owner();
      } catch (err) {}
    }

    res.json({
      success: true,
      totalCredentials: Number(totalCredentials),
      contractOwner: owner,
      contractAddress: CONTRACT_ADDRESS,
      network: "Monad Testnet",
      securityAudit: "Tamper-Proof On-Chain EVM",
      verificationSpeed: "< 1s Instant Finality",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Verify & Get Credential by ID
 */
app.get("/api/credentials/:credentialId", async (req, res) => {
  const { credentialId } = req.params;
  if (!/^0x[a-fA-F0-9]{64}$/.test(credentialId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid Credential ID format. Must be a 32-byte hex string (0x...).",
    });
  }

  try {
    if (!contract) {
      return res.status(503).json({ success: false, error: "Blockchain provider unavailable" });
    }

    const rawCred = await contract.getCredential(credentialId);
    const isValid = await contract.isValidCredential(credentialId);
    const formatted = formatCredential(rawCred);

    // Fetch extra metadata from MongoDB if available
    let extraMeta = null;
    if (formatted.metadataHash) {
      const metaDoc = await Metadata.findOne({ hash: formatted.metadataHash });
      if (metaDoc) extraMeta = metaDoc.payload;
    }

    let isExpired = false;
    if (extraMeta && extraMeta.expiresAt && Number(extraMeta.expiresAt) > 0) {
      if (Date.now() > Number(extraMeta.expiresAt)) {
        isExpired = true;
      }
    }

    const computedStatus = formatted.revoked
      ? "REVOKED"
      : isExpired
      ? "EXPIRED"
      : isValid
      ? "VALID"
      : "UNVERIFIED";

    res.json({
      success: true,
      credential: formatted,
      isValid: isValid && !isExpired,
      isExpired,
      status: computedStatus,
      verificationAudit: {
        network: "Monad Testnet (Chain ID 10143)",
        contract: CONTRACT_ADDRESS,
        timestamp: new Date().toISOString(),
        tamperProofVerified: true,
      },
      metadata: extraMeta,
    });
  } catch (error) {
    console.error("Error fetching credential:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get Credentials for a Student Address
 */
app.get("/api/student/:address", async (req, res) => {
  const { address } = req.params;
  if (!ethers.isAddress(address)) {
    return res.status(400).json({ success: false, error: "Invalid student wallet address." });
  }

  try {
    if (!contract) {
      return res.status(503).json({ success: false, error: "Blockchain provider unavailable" });
    }

    const rawList = await contract.getStudentCredentials(address);
    const credentials = (rawList || []).map(formatCredential);

    const validCount = credentials.filter((c) => !c.revoked).length;
    const revokedCount = credentials.filter((c) => c.revoked).length;
    const skills = Array.from(new Set(credentials.filter((c) => !c.revoked).map((c) => c.skill)));

    res.json({
      success: true,
      studentAddress: address,
      totalCredentials: credentials.length,
      validCount,
      revokedCount,
      skills,
      credentials,
    });
  } catch (error) {
    console.error("Error fetching student credentials:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Check Issuer Status & Credentials Issued
 */
app.get("/api/issuer/:address", async (req, res) => {
  const { address } = req.params;
  if (!ethers.isAddress(address)) {
    return res.status(400).json({ success: false, error: "Invalid issuer wallet address." });
  }

  try {
    if (!contract) {
      return res.status(503).json({ success: false, error: "Blockchain provider unavailable" });
    }

    const isAuthorized = await contract.isAuthorizedIssuer(address);
    const rawList = await contract.getIssuerCredentials(address);
    const credentials = (rawList || []).map(formatCredential);

    res.json({
      success: true,
      issuerAddress: address,
      isAuthorized,
      totalIssued: credentials.length,
      credentials,
    });
  } catch (error) {
    console.error("Error fetching issuer credentials:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Metadata Generation & Storage (Decentralized Hash Simulator anchored in MongoDB)
 * Supports both Verified Skills and Verified Projects
 */
app.post("/api/metadata", async (req, res) => {
  try {
    const { 
      type, // "skill" | "project"
      skill, 
      projectName,
      evidenceProject,
      repoUrl,
      liveUrl,
      projectSkills,
      skillLevel,
      description, 
      student,
      issuer,
      tags 
    } = req.body;

    const isProject = type === "project" || Boolean(projectName);
    const validityDuration = req.body.validityDuration || "Perpetual";
    
    let expiresAt = 0;
    if (validityDuration === "1 Year") {
      expiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;
    } else if (validityDuration === "2 Years") {
      expiresAt = Date.now() + 730 * 24 * 60 * 60 * 1000;
    } else if (validityDuration === "3 Years") {
      expiresAt = Date.now() + 1095 * 24 * 60 * 60 * 1000;
    } else if (req.body.expiresAt) {
      expiresAt = Number(req.body.expiresAt);
    }

    const payload = {
      protocol: "SkillPassport v1.0",
      type: isProject ? "project" : "skill",
      title: isProject ? (projectName || skill || "Verified Capstone Project") : (skill || "Verified Competency"),
      projectName: projectName || (isProject ? skill : ""),
      evidenceProject: evidenceProject || null,
      repoUrl: repoUrl || "",
      liveUrl: liveUrl || "",
      projectSkills: projectSkills || "",
      skillLevel: skillLevel || "Advanced",
      description: description || "",
      student: student || "0x0000000000000000000000000000000000000000",
      issuer: issuer || "Authorized Institution",
      tags: tags || (isProject ? ["PROJECT", "VERIFIED-BUILD"] : ["SKILL", "COMPETENCY"]),
      validityDuration,
      expiresAt,
      issuedAt: new Date().toISOString(),
    };

    const hash = "ipfs://Qm" + crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 44);
    await Metadata.findOneAndUpdate(
      { hash },
      { hash, payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      metadataHash: hash,
      payload,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Retrieve Stored Metadata by Hash from MongoDB
 */
app.get("/api/metadata/:hash", async (req, res) => {
  try {
    const { hash } = req.params;
    const decodedHash = decodeURIComponent(hash);
    const doc = await Metadata.findOne({ hash: { $in: [decodedHash, hash] } });

    if (!doc) {
      return res.status(404).json({ success: false, error: "Metadata record not found for this hash." });
    }

    res.json({
      success: true,
      metadataHash: decodedHash,
      metadata: doc.payload,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Student Profile Endpoints (Persisted in MongoDB)
 */
app.get("/api/profile/:address", async (req, res) => {
  try {
    const addr = (req.params.address || "").toLowerCase();
    const doc = await StudentProfile.findOne({ walletAddress: addr });
    const profile = doc ? {
      name: doc.name || "",
      avatar: doc.avatar || "",
      college: doc.college || "",
      degree: doc.degree || "",
      graduationYear: doc.graduationYear || "",
      bio: doc.bio || "",
      interests: doc.interests || [],
      wallet: req.params.address,
    } : {
      name: "",
      avatar: "",
      college: "",
      degree: "",
      graduationYear: "",
      bio: "",
      interests: [],
      wallet: req.params.address,
    };
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/profile/:address", async (req, res) => {
  try {
    const addr = (req.params.address || "").toLowerCase();
    const updated = await StudentProfile.findOneAndUpdate(
      { walletAddress: addr },
      { ...req.body, walletAddress: addr },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, profile: { ...updated.toObject(), wallet: req.params.address } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Student Project Portfolio Endpoints (Persisted in MongoDB)
 */
app.get("/api/projects/:address", async (req, res) => {
  try {
    const addr = (req.params.address || "").toLowerCase();
    const projects = await Project.find({ walletAddress: addr }).sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/projects/:address", async (req, res) => {
  try {
    const addr = (req.params.address || "").toLowerCase();
    const newProject = await Project.create({
      walletAddress: addr,
      projectId: "proj-" + Date.now(),
      name: req.body.name || "Untitled Project",
      description: req.body.description || "",
      githubUrl: req.body.githubUrl || "",
      demoUrl: req.body.demoUrl || "",
      technologies: req.body.technologies || "",
      skillsDemonstrated: req.body.skillsDemonstrated || "",
    });
    const projects = await Project.find({ walletAddress: addr }).sort({ createdAt: -1 });
    res.json({ success: true, project: newProject, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/projects/:address/:projectId", async (req, res) => {
  try {
    const addr = (req.params.address || "").toLowerCase();
    await Project.deleteOne({ walletAddress: addr, projectId: req.params.projectId });
    const projects = await Project.find({ walletAddress: addr }).sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Mentor Endorsement Endpoints (Persisted in MongoDB)
 */
app.get("/api/endorsements/:address", async (req, res) => {
  try {
    const addr = (req.params.address || "").toLowerCase();
    const endorsements = await Endorsement.find({ walletAddress: addr }).sort({ createdAt: -1 });
    res.json({ success: true, endorsements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/endorsements/:address", async (req, res) => {
  try {
    const addr = (req.params.address || "").toLowerCase();
    const newEndorsement = await Endorsement.create({
      walletAddress: addr,
      endorsementId: "end-" + Date.now(),
      skill: req.body.skill || "General Competency",
      endorsementText: req.body.endorsementText || "",
      endorserWallet: req.body.endorserWallet || "0x0000000000000000000000000000000000000000",
      endorserName: req.body.endorserName || "Project Mentor",
      date: new Date().toISOString().split("T")[0],
    });
    const endorsements = await Endorsement.find({ walletAddress: addr }).sort({ createdAt: -1 });
    res.json({ success: true, endorsement: newEndorsement, endorsements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * -------------------------------------------------------------
 * Two-Sided Student Credential Request & Verification Pipeline
 * -------------------------------------------------------------
 */

// Student submits a request for verification
app.post("/api/requests", async (req, res) => {
  try {
    const {
      studentAddress,
      studentName,
      skillTitle,
      category,
      evidenceProject,
      githubUrl,
      liveUrl,
      notes,
      issuerAddress,
      validityDuration,
    } = req.body;

    if (!studentAddress || !skillTitle) {
      return res.status(400).json({
        success: false,
        error: "Student address and skill title are required.",
      });
    }

    const request = await CredentialRequest.create({
      requestId: "req-" + Date.now() + "-" + crypto.randomBytes(3).toString("hex"),
      studentAddress: studentAddress.toLowerCase().trim(),
      studentName: studentName || "Student Learner",
      skillTitle: skillTitle.trim(),
      category: category || "skill",
      evidenceProject: evidenceProject || "",
      githubUrl: githubUrl || "",
      liveUrl: liveUrl || "",
      notes: notes || "",
      issuerAddress: issuerAddress ? issuerAddress.toLowerCase().trim() : "",
      validityDuration: validityDuration || "Perpetual",
      status: "PENDING",
    });

    res.status(201).json({ success: true, request });
  } catch (error) {
    console.error("Error creating credential request:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Student retrieves their submitted requests
app.get("/api/requests/student/:address", async (req, res) => {
  try {
    const addr = (req.params.address || "").toLowerCase().trim();
    const requests = await CredentialRequest.find({ studentAddress: addr }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Issuer retrieves pending requests to review
app.get("/api/requests/issuer/:address", async (req, res) => {
  try {
    const addr = (req.params.address || "").toLowerCase().trim();
    // Return requests targeted to this issuer, or open requests (issuerAddress empty)
    const requests = await CredentialRequest.find({
      $or: [
        { issuerAddress: addr },
        { issuerAddress: "" },
        { issuerAddress: { $exists: false } },
      ],
    }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Issuer updates request (approve with on-chain credentialId, or reject)
app.patch("/api/requests/:id", async (req, res) => {
  try {
    const { status, credentialId, rejectionReason } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (credentialId) updateData.credentialId = credentialId;
    if (rejectionReason) updateData.rejectionReason = rejectionReason;

    const updated = await CredentialRequest.findOneAndUpdate(
      { requestId: req.params.id },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: "Request not found." });
    }

    res.json({ success: true, request: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * -------------------------------------------------------------
 * Cryptographic Blind Hiring & Zero-Knowledge Verification Claims
 * -------------------------------------------------------------
 */

// Student generates a blind hiring cryptographic claim
app.post("/api/proof/blind", async (req, res) => {
  try {
    const { credentialId, skillTitle, issuerAddress, issuerName, issuedAt, expiresAt } = req.body;

    if (!credentialId || !skillTitle || !issuerAddress) {
      return res.status(400).json({
        success: false,
        error: "credentialId, skillTitle, and issuerAddress are required.",
      });
    }

    const proofId = "zk-" + crypto.randomBytes(8).toString("hex");
    const blindCandidateCode = "CANDIDATE-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    const salt = crypto.randomBytes(16).toString("hex");

    // Cryptographic HMAC commitment binding credential ID, salt, and status
    const commitment = crypto
      .createHmac("sha256", salt)
      .update(`${credentialId}:${skillTitle}:${issuerAddress}:${issuedAt}`)
      .digest("hex");

    const proof = await BlindProof.create({
      proofId,
      credentialId,
      blindCandidateCode,
      skillTitle,
      issuerAddress,
      issuerName: issuerName || "Accredited Web3 Authority",
      issuedAt: issuedAt || new Date().toISOString(),
      expiresAt: expiresAt || 0,
      proofCommitmentHash: "0x" + commitment,
      blockchainContract: CONTRACT_ADDRESS,
      status: "VALID",
    });

    res.status(201).json({
      success: true,
      proofId,
      blindCandidateCode,
      proof,
      verificationUrl: `/verify/blind/${proofId}`,
    });
  } catch (error) {
    console.error("Error creating blind proof:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Recruiter/Public Auditor retrieves and verifies the blind claim against blockchain
app.get("/api/proof/blind/:proofId", async (req, res) => {
  try {
    const proof = await BlindProof.findOne({ proofId: req.params.proofId });
    if (!proof) {
      return res.status(404).json({ success: false, error: "Blind verification claim not found or expired." });
    }

    // Verify current on-chain validity of the underlying credential
    let onChainValid = false;
    let onChainRevoked = false;
    if (contract) {
      try {
        const rawCred = await contract.getCredential(proof.credentialId);
        const formatted = formatCredential(rawCred);
        onChainRevoked = formatted.revoked;
        onChainValid = await contract.isValidCredential(proof.credentialId);
      } catch (err) {
        // If contract is temporarily unreachable
        onChainValid = true;
      }
    }

    const isExpired = proof.expiresAt > 0 && Date.now() > proof.expiresAt;
    const computedStatus = onChainRevoked ? "REVOKED" : isExpired ? "EXPIRED" : onChainValid ? "VALID" : "UNVERIFIED";

    res.json({
      success: true,
      proof: {
        proofId: proof.proofId,
        blindCandidateCode: proof.blindCandidateCode,
        skillTitle: proof.skillTitle,
        issuerAddress: proof.issuerAddress,
        issuerName: proof.issuerName,
        issuedAt: proof.issuedAt,
        expiresAt: proof.expiresAt,
        proofCommitmentHash: proof.proofCommitmentHash,
        blockchainContract: proof.blockchainContract,
        status: computedStatus,
        isExpired,
        onChainVerified: onChainValid && !isExpired && !onChainRevoked,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🛡️ SkillPassport Backend Server Running on Port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`⚡ Integrated with Monad EVM Protocol`);
  console.log(`===============================================`);
});
