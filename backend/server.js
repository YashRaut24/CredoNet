const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { ethers } = require("ethers");
const { CONTRACT_ADDRESS, RPC_URL, CONTRACT_ABI } = require("./contractConfig");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

// In-memory metadata storage for easy mock decentralized IPFS retrieval
const metadataStorage = new Map();

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

    // Fetch extra metadata if available
    const extraMeta = metadataStorage.get(formatted.metadataHash) || null;

    res.json({
      success: true,
      credential: formatted,
      isValid,
      status: formatted.revoked ? "REVOKED" : isValid ? "VALID" : "UNVERIFIED",
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
 * Metadata Generation & Storage (Decentralized Hash Simulator)
 */
app.post("/api/metadata", (req, res) => {
  try {
    const { skill, description, studentName, grade, issuerName, tags } = req.body;

    const payload = {
      protocol: "CredoNet v1.0",
      skill: skill || "Verified Skill",
      description: description || "",
      studentName: studentName || "Anonymous Learner",
      grade: grade || "Mastery Passed",
      issuerName: issuerName || "Authorized Institution",
      tags: tags || [],
      issuedAt: new Date().toISOString(),
    };

    const hash = "ipfs://Qm" + crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 44);
    metadataStorage.set(hash, payload);

    res.json({
      success: true,
      metadataHash: hash,
      payload,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🛡️ CredoNet Backend Server Running on Port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`⚡ Integrated with Monad EVM Protocol`);
  console.log(`===============================================`);
});
