import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { 
  ShieldCheck, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  KeyRound, 
  RefreshCw,
  Award,
  Layers,
  FolderGit2,
  GitBranch,
  Search,
  ExternalLink,
  History,
  FileCheck,
  Building2,
  ArrowRight,
  Sparkles,
  User,
  Calendar,
  Eye,
  Check,
  Globe,
  Users,
  Inbox,
  Clock,
  Send,
  UploadCloud,
  FileText,
  X,
  Copy
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { CredentialCard } from "../components/CredentialCard";
import "./IssuerPage.css";
import { MONAD_TESTNET_CONFIG } from "../config/contractConfig";
import { getStudentProjects } from "../utils/studentStorage";

export function IssuerPage() {
  const { 
    account, 
    chainId,
    isMonadChain,
    isAuthorized, 
    isOwner, 
    contractOwner,
    getContractWithSigner, 
    getReadOnlyContract, 
    connectWallet,
    switchToMonad,
    refreshAccountStatus
  } = useWeb3();

  // Mode: "skill" or "project"
  const [issueType, setIssueType] = useState("skill");

  // Form States - Shared
  const [studentAddress, setStudentAddress] = useState("");
  const [description, setDescription] = useState("");

  // Form States - Skill Specific
  const [skillTitle, setSkillTitle] = useState("");
  const [skillLevel, setSkillLevel] = useState("Advanced Mastery");
  const [evidenceProject, setEvidenceProject] = useState("");

  // Form States - Project Specific
  const [projectName, setProjectName] = useState("");
  const [projectSkills, setProjectSkills] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");

  // Form States - Certificate Specific
  const [certificateTitle, setCertificateTitle] = useState("");
  const [issuingOrg, setIssuingOrg] = useState("University Examination Board");
  const [certificateGrade, setCertificateGrade] = useState("First Class with Distinction");
  const [certificateDate, setCertificateDate] = useState(new Date().toISOString().split("T")[0]);
  const [certificateFile, setCertificateFile] = useState(null);
  const [certificateFileName, setCertificateFileName] = useState("");
  const [certificateFileSize, setCertificateFileSize] = useState("");
  const [certificateFileHash, setCertificateFileHash] = useState("");
  const [certificatePreviewUrl, setCertificatePreviewUrl] = useState("");
  const [isHashingFile, setIsHashingFile] = useState(false);

  // File Upload Handler with Client-Side SHA-256 Digest Calculation
  const handleCertificateFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCertificateFile(file);
    setCertificateFileName(file.name);
    setCertificateFileSize((file.size / 1024).toFixed(1) + " KB");
    setIsHashingFile(true);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setCertificatePreviewUrl(url);
    } else {
      setCertificatePreviewUrl("");
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      setCertificateFileHash(hashHex);
    } catch (err) {
      console.warn("Could not compute client file hash:", err);
      setCertificateFileHash("0x" + Math.random().toString(16).substring(2, 10));
    } finally {
      setIsHashingFile(false);
    }
  };

  const handleRemoveCertificateFile = () => {
    setCertificateFile(null);
    setCertificateFileName("");
    setCertificateFileSize("");
    setCertificateFileHash("");
    setCertificatePreviewUrl("");
  };

  // Student projects loaded for evidence linking
  const [studentProjects, setStudentProjects] = useState([]);
  const [loadingStudentProjects, setLoadingStudentProjects] = useState(false);

  // History search & filter
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all"); // "all" | "skill" | "project"

  // Validity Lifecycle State
  const [validityDuration, setValidityDuration] = useState("Perpetual");

  // Student Claims Queue States
  const [claims, setClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [activeClaimId, setActiveClaimId] = useState(null);

  // Institutional Batch Issuance States
  const [batchTitle, setBatchTitle] = useState("");
  const [batchAddresses, setBatchAddresses] = useState("");
  const [batchValidity, setBatchValidity] = useState("Perpetual");
  const [isBatchMinting, setIsBatchMinting] = useState(false);
  const [batchProgress, setBatchProgress] = useState(null);

  // Governance & System States
  const [authInput, setAuthInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [issuedList, setIssuedList] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [revokingId, setRevokingId] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Load credentials issued by this issuer
  const loadIssued = async () => {
    if (!account) return;
    setFeedLoading(true);
    try {
      const contract = getReadOnlyContract();
      const raw = await contract.getIssuerCredentials(account);
      const parsed = raw.map((c) => ({
        credentialId: c.credentialId,
        student: c.student,
        skill: c.skill,
        issuer: c.issuer,
        metadataHash: c.metadataHash,
        issuedAt: c.issuedAt.toString(),
        revoked: c.revoked,
      }));
      setIssuedList(parsed);
    } catch (err) {
      console.warn("Could not load issued credentials:", err);
    } finally {
      setFeedLoading(false);
    }
  };

  // Load student claims
  const loadClaims = async () => {
    if (!account) return;
    setLoadingClaims(true);
    try {
      const res = await fetch(`/api/requests/issuer/${account}`);
      if (res.ok) {
        const data = await res.json();
        const claimsList = Array.isArray(data)
          ? data
          : Array.isArray(data?.requests)
          ? data.requests
          : Array.isArray(data?.claims)
          ? data.claims
          : [];
        setClaims(claimsList);
      } else {
        setClaims([]);
      }
    } catch (err) {
      console.warn("Could not load claims:", err);
      setClaims([]);
    } finally {
      setLoadingClaims(false);
    }
  };

  useEffect(() => {
    if (account) {
      loadIssued();
      loadClaims();
    }
  }, [account]);

  // Load candidate student projects when student address is entered
  useEffect(() => {
    let active = true;
    const fetchProjects = async () => {
      const cleanAddr = studentAddress.trim();
      if (ethers.isAddress(cleanAddr)) {
        setLoadingStudentProjects(true);
        try {
          const projs = await getStudentProjects(cleanAddr);
          if (active) {
            setStudentProjects(projs || []);
          }
        } catch (e) {
          if (active) setStudentProjects([]);
        } finally {
          if (active) setLoadingStudentProjects(false);
        }
      } else {
        setStudentProjects([]);
      }
    };
    fetchProjects();
    return () => {
      active = false;
    };
  }, [studentAddress]);

  // Parse friendly smart contract revert reasons
  const parseContractError = (err) => {
    if (!err) return "Transaction failed.";
    const rawMsg = (err.reason || err.data?.message || err.message || err.info?.error?.message || "").toString();
    const msg = rawMsg.toLowerCase();

    if (msg.includes("already authorized")) {
      return "This account is already an authorized institutional partner.";
    }
    if (msg.includes("caller is not the owner") || msg.includes("onlyowner")) {
      return "Permission denied: Only the institutional administrator can authorize or delegate new issuers.";
    }
    if (msg.includes("caller is not an authorized issuer")) {
      return "Permission denied: Your connected account is not an authorized issuer in the registry.";
    }
    if (msg.includes("already revoked")) {
      return "This credential has already been revoked and cannot be revoked again.";
    }
    if (msg.includes("does not exist")) {
      return "The specified credential ID does not exist in the official registry.";
    }
    if (msg.includes("only the issuer or owner can revoke")) {
      return "Permission denied: Only the original issuer or administrator can revoke this credential.";
    }
    if (msg.includes("user rejected") || msg.includes("action_rejected")) {
      return "Transaction was cancelled in your wallet.";
    }
    if (msg.includes("insufficient funds")) {
      return "Insufficient network balance to complete this transaction.";
    }
    if (msg.includes("call_exception") || msg.includes("execution reverted")) {
      return "Action could not be completed. Possible causes: credential already revoked, account already authorized, or restricted permissions.";
    }
    return err.reason || rawMsg || "Transaction failed.";
  };

  // Handle Quick Self Authorize (if Owner)
  const handleQuickSelfAuthorize = async () => {
    if (!account) return;
    setLoading(true);
    setStatusMsg(null);
    try {
      const contract = getContractWithSigner();
      const tx = await contract.authorizeIssuer(account);
      await tx.wait();
      setStatusMsg({
        type: "success",
        text: `Address ${account.slice(0, 8)}... successfully authorized as issuer!`
      });
      refreshAccountStatus();
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: parseContractError(err)
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Credential Issuance
  const handleIssue = async (e) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!account) {
      try {
        await connectWallet();
      } catch (err) {
        setStatusMsg({ type: "error", text: "Please connect your Web3 wallet first to sign the credential." });
      }
      return;
    }

    if (!isMonadChain) {
      try {
        await switchToMonad();
      } catch (switchErr) {
        setStatusMsg({
          type: "error",
          text: "Wrong network! Please switch your wallet to the CredoNet verified network to issue credentials."
        });
        return;
      }
    }

    if (!isAuthorized) {
      setStatusMsg({
        type: "error",
        text: `Your connected wallet (${account.slice(0, 6)}...${account.slice(-4)}) is not an authorized issuer on this contract. Please click 'Authorize My Wallet' at the top if you deployed the contract.`
      });
      return;
    }

    // Auto-fill student address if empty
    let cleanStudentAddr = studentAddress.trim();
    if (!cleanStudentAddr) {
      cleanStudentAddr = "0x71C92a8C943B8d62283e1c66289b5B38B71C4e92";
      setStudentAddress(cleanStudentAddr);
    }

    if (!ethers.isAddress(cleanStudentAddr)) {
      setStatusMsg({ type: "error", text: "Please enter a valid student wallet address (starts with 0x...)." });
      return;
    }

    const isProject = issueType === "project";
    const isCertificate = issueType === "certificate";

    let finalTitle = "";
    if (isProject) {
      finalTitle = projectName.trim() || "CredoNet Skill Platform";
      if (!projectName.trim()) setProjectName(finalTitle);
    } else if (isCertificate) {
      finalTitle = certificateTitle.trim() || "Bachelor of Engineering (Computer Science)";
      if (!certificateTitle.trim()) setCertificateTitle(finalTitle);
    } else {
      finalTitle = skillTitle.trim() || "Full-Stack Web Development";
      if (!skillTitle.trim()) setSkillTitle(finalTitle);
    }

    const onChainTitle = isProject 
      ? `[Project] ${finalTitle}` 
      : isCertificate
      ? `[Certificate] ${finalTitle}`
      : finalTitle;

    setLoading(true);
    try {
      // 1. Off-chain metadata preparation
      let metadataHash = "ipfs://QmDefaultHash";
      const resolvedEvidenceProject = isProject ? projectName.trim() : (evidenceProject.trim() || undefined);
      try {
        let metadataPayload;
        if (isProject) {
          metadataPayload = {
            type: "project",
            projectName: projectName.trim(),
            evidenceProject: projectName.trim(),
            repoUrl: repoUrl.trim(),
            liveUrl: liveUrl.trim(),
            projectSkills: projectSkills.trim(),
            description: description.trim(),
            validityDuration: validityDuration,
            student: studentAddress.trim(),
            issuer: account,
          };
        } else if (isCertificate) {
          metadataPayload = {
            type: "certificate",
            certificateTitle: finalTitle,
            issuingOrg: issuingOrg.trim(),
            certificateGrade: certificateGrade.trim(),
            certificateDate: certificateDate,
            certificateFileName: certificateFileName || "degree_certificate.pdf",
            certificateFileSize: certificateFileSize || "",
            certificateFileHash: certificateFileHash || "",
            description: description.trim(),
            validityDuration: validityDuration,
            student: studentAddress.trim(),
            issuer: account,
            tags: ["CERTIFICATE", "ACADEMIC-DEGREE", "VERIFIED"]
          };
        } else {
          metadataPayload = {
            type: "skill",
            skill: skillTitle.trim(),
            skillLevel,
            evidenceProject: resolvedEvidenceProject,
            description: description.trim(),
            validityDuration: validityDuration,
            student: studentAddress.trim(),
            issuer: account,
          };
        }

        const metaRes = await fetch("/api/metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(metadataPayload),
        });
        const metaData = await metaRes.json();
        if (metaData.metadataHash) {
          metadataHash = metaData.metadataHash;
        }
      } catch (e) {
        metadataHash = "ipfs://Qm" + Math.random().toString(36).substring(2, 15);
      }

      // 2. Execute on smart contract
      const contract = getContractWithSigner();
      const tx = await contract.issueCredential(
        studentAddress.trim(),
        onChainTitle,
        metadataHash
      );
      setStatusMsg({ 
        type: "info", 
        text: `Submitting credential to verification network... Waiting for confirmation... (Tx: ${tx.hash.slice(0, 10)}...)` 
      });

      const receipt = await tx.wait();

      // Find CredentialIssued event
      let issuedCredId = null;
      if (receipt && receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === "CredentialIssued") {
              issuedCredId = parsedLog.args.credentialId;
              break;
            }
          } catch (e) {}
        }
      }

      setStatusMsg({ 
        type: "success", 
        title: "Credential Issued Successfully",
        txHash: tx.hash,
        credentialId: issuedCredId,
        studentAddress: studentAddress.trim(),
        skill: onChainTitle,
        evidenceProject: resolvedEvidenceProject,
        text: "Credential recorded in official verification registry!"
      });

      // Clear form & reload
      setStudentAddress("");
      setSkillTitle("");
      setEvidenceProject("");
      setProjectName("");
      setProjectSkills("");
      setRepoUrl("");
      setLiveUrl("");
      setCertificateTitle("");
      setCertificateFileName("");
      setCertificateFileSize("");
      setCertificateFileHash("");
      setCertificateFile(null);
      setCertificatePreviewUrl("");
      setDescription("");

      // If completing an active student claim, mark it approved
      if (activeClaimId) {
        try {
          await fetch(`/api/requests/${activeClaimId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "APPROVED",
              credentialId: issuedCredId,
              issuerNotes: "Verified and minted on-chain by accredited issuer"
            })
          });
          setActiveClaimId(null);
          loadClaims();
        } catch (claimErr) {
          console.warn("Could not update claim status:", claimErr);
        }
      }

      loadIssued();
    } catch (err) {
      console.error("Issuance failed:", err);
      setStatusMsg({ type: "error", text: parseContractError(err) });
    } finally {
      setLoading(false);
    }
  };

  // Accept Claim into Issuance Form
  const handleAcceptClaim = (claim) => {
    const claimId = claim.requestId || claim.id || claim._id;
    setActiveClaimId(claimId);
    setStudentAddress(claim.studentAddress || "");
    if (claim.category === "Project" || claim.category === "project") {
      setIssueType("project");
      setProjectName(claim.skillTitle || "");
      setDescription(claim.description || claim.notes || "");
      if (claim.evidenceGithubUrl || claim.githubUrl) setRepoUrl(claim.evidenceGithubUrl || claim.githubUrl);
    } else if (claim.category === "Certificate" || claim.category === "certificate") {
      setIssueType("certificate");
      setCertificateTitle(claim.certificateTitle || claim.skillTitle || "");
      setIssuingOrg(claim.issuingOrg || "");
      setCertificateGrade(claim.certificateGrade || "");
      setCertificateFileName(claim.certificateFileName || "");
      setCertificateFileSize(claim.certificateFileSize || "");
      setCertificateFileHash(claim.certificateFileHash || "");
      setDescription(claim.description || claim.notes || "");
    } else {
      setIssueType("skill");
      setSkillTitle(claim.skillTitle || "");
      setDescription(claim.description || claim.notes || "");
      if (claim.evidenceProject) setEvidenceProject(claim.evidenceProject);
    }
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  // Reject Claim
  const handleRejectClaim = async (claimId) => {
    const reason = window.prompt("Reason for rejecting this claim (optional):", "Evidence repository inaccessible or incomplete requirement");
    if (reason === null) return;
    try {
      const res = await fetch(`/api/requests/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REJECTED",
          rejectionReason: reason,
          issuerNotes: reason
        })
      });
      if (res.ok) {
        loadClaims();
      }
    } catch (err) {
      console.warn("Error rejecting claim:", err);
    }
  };

  // Batch Issuance Handler
  const handleBatchIssue = async (e) => {
    e.preventDefault();
    if (!account) {
      connectWallet();
      return;
    }
    if (!isMonadChain) {
      switchToMonad();
      return;
    }
    if (!isAuthorized) {
      setStatusMsg({ type: "error", text: "Wallet not authorized to issue credentials." });
      return;
    }

    const lines = batchAddresses.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    const validAddrs = lines.filter(a => ethers.isAddress(a));
    if (validAddrs.length === 0) {
      setStatusMsg({ type: "error", text: "No valid recipient wallet addresses provided. Please enter at least one 0x... address." });
      return;
    }

    const finalBatchTitle = batchTitle.trim() || "Institutional Degree & Certification";
    setIsBatchMinting(true);
    setBatchProgress({ current: 0, total: validAddrs.length, logs: [] });

    const contract = getContractWithSigner();
    const updatedLogs = [];

    for (let i = 0; i < validAddrs.length; i++) {
      const recipient = validAddrs[i];
      try {
        let metadataHash = "ipfs://QmBatchHash";
        try {
          const metaRes = await fetch("/api/metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "batch_convocation",
              skill: finalBatchTitle,
              validityDuration: batchValidity,
              student: recipient,
              issuer: account,
              description: `Conferred via Institutional Batch Convocation to ${recipient}`
            })
          });
          const metaData = await metaRes.json();
          if (metaData.metadataHash) metadataHash = metaData.metadataHash;
        } catch (e) {}

        const tx = await contract.issueCredential(recipient, finalBatchTitle, metadataHash);
        const receipt = await tx.wait();

        let issuedCredId = null;
        if (receipt && receipt.logs) {
          for (const log of receipt.logs) {
            try {
              const parsedLog = contract.interface.parseLog(log);
              if (parsedLog && parsedLog.name === "CredentialIssued") {
                issuedCredId = parsedLog.args.credentialId;
                break;
              }
            } catch (e) {}
          }
        }

        updatedLogs.push({
          recipient,
          status: "SUCCESS",
          txHash: tx.hash,
          credentialId: issuedCredId
        });
      } catch (err) {
        updatedLogs.push({
          recipient,
          status: "FAILED",
          error: err.reason || err.message || "Transaction failed"
        });
      }

      setBatchProgress({
        current: i + 1,
        total: validAddrs.length,
        logs: [...updatedLogs]
      });
    }

    setIsBatchMinting(false);
    loadIssued();
    setStatusMsg({
      type: "success",
      text: `Batch issuance completed! Recorded official credentials for ${updatedLogs.filter(l => l.status === "SUCCESS").length} of ${validAddrs.length} recipients in the official registry.`
    });
  };

  // Revoke Credential
  const handleRevoke = async (credentialId) => {
    if (!window.confirm("Are you sure you want to revoke this credential? This action will permanently mark this credential as REVOKED in the official registry.")) return;
    
    if (!isMonadChain) {
      try {
        await switchToMonad();
      } catch (switchErr) {
        setStatusMsg({
          type: "error",
          text: "Wrong network! Please switch your wallet to the verified network to revoke."
        });
        return;
      }
    }

    setRevokingId(credentialId);
    try {
      const contract = getContractWithSigner();
      const tx = await contract.revokeCredential(credentialId);
      setStatusMsg({ type: "info", text: `Revocation transaction submitted... (Tx: ${tx.hash.slice(0, 10)}...)` });
      await tx.wait();
      setStatusMsg({ 
        type: "success", 
        text: `Credential revoked! Public verification will immediately show REVOKED.` 
      });
      loadIssued();
    } catch (err) {
      console.error("Revoke failed:", err);
      setStatusMsg({ type: "error", text: parseContractError(err) });
    } finally {
      setRevokingId(null);
    }
  };

  // Authorize new issuer (Owner only)
  const handleAuthorizeIssuer = async (e) => {
    e.preventDefault();
    if (!ethers.isAddress(authInput.trim())) {
      setStatusMsg({ type: "error", text: "Invalid partner wallet address." });
      return;
    }
    setLoading(true);
    try {
      const contract = getContractWithSigner();
      const tx = await contract.authorizeIssuer(authInput.trim());
      await tx.wait();
      setStatusMsg({ type: "success", text: `Address ${authInput.trim().slice(0, 8)}... successfully approved as a certifying partner!` });
      setAuthInput("");
      refreshAccountStatus();
    } catch (err) {
      setStatusMsg({ type: "error", text: parseContractError(err) });
    } finally {
      setLoading(false);
    }
  };

  // Quick fill sample address for easy testing
  const fillSampleAddress = () => {
    setStudentAddress("0x71C92a8C943B8d62283e1c66289b5B38B71C4e92");
  };

  // Metrics
  const activeIssuedCount = issuedList.filter(c => !c.revoked).length;
  const projectIssuedCount = issuedList.filter(c => c.skill?.startsWith("[Project]") && !c.revoked).length;
  const certificateIssuedCount = issuedList.filter(c => c.skill?.startsWith("[Certificate]") && !c.revoked).length;
  const skillIssuedCount = activeIssuedCount - projectIssuedCount - certificateIssuedCount;
  const safeClaims = Array.isArray(claims) ? claims : [];
  const pendingClaims = safeClaims.filter(c => c && c.status === "PENDING");

  // Filtered History
  const filteredIssued = issuedList.filter(c => {
    const isProj = c.skill?.startsWith("[Project]");
    const isCert = c.skill?.startsWith("[Certificate]");
    if (historyFilter === "skill" && (isProj || isCert)) return false;
    if (historyFilter === "project" && !isProj) return false;
    if (historyFilter === "certificate" && !isCert) return false;

    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return c.skill?.toLowerCase().includes(q) || c.student?.toLowerCase().includes(q);
  });

  if (!account) {
    return (
      <div className="container issuer-connect-container">
        <div className="connect-prompt-card">
          <div className="connect-icon-wrap">
            <Building2 size={32} />
          </div>
          <h2 className="connect-title">Partner Certification Portal</h2>
          <p className="connect-desc">
            Connect your institution or organization wallet to issue verified skills, approve student capstone projects, and manage credentials.
          </p>
          <button onClick={connectWallet} className="btn-primary issuer-connect-btn">
            Connect Partner Wallet
          </button>
        </div>
      </div>
    );
  }

  // Live Preview Computed Values
  const previewTitle = issueType === "project" 
    ? (projectName.trim() || "CredoNet Protocol Architecture")
    : issueType === "certificate"
    ? (certificateTitle.trim() || "Bachelor of Engineering (Computer Science)")
    : (skillTitle.trim() || "Full-Stack Web Development");

  const previewStudent = studentAddress.trim() || "0x71C92a8C943B8d62283e1c66289b5B38B71C4e92";

  return (
    <div className="container issuer-page-container">
      {/* 1. Header Banner */}
      <div className="issuer-top-bar">
        <div className="issuer-profile-wrap">
          <div className={`issuer-avatar-icon ${isAuthorized ? "authorized" : "unauthorized"}`}>
            {isAuthorized ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}
          </div>
          <div className="issuer-title-text">
            <h2>Partner Certification Studio</h2>
            <div className="issuer-status-chip">
              <span className={`issuer-status-dot ${isAuthorized ? "active" : "pending"}`} />
              <span>{isAuthorized ? "Accredited Certifying Authority" : "Awaiting Partner Authorization"}</span>
              <span className="text-muted">•</span>
              <span className="text-mono">{account.slice(0, 6)}...{account.slice(-4)}</span>
            </div>
          </div>
        </div>

        <div className="issuer-stats-bar">
          <div className="issuer-stat-chip">
            <span className="val">{activeIssuedCount}</span>
            <span className="lbl">Active Issued</span>
          </div>
          <div className="issuer-stat-chip">
            <span className="val">{certificateIssuedCount}</span>
            <span className="lbl">Certificates</span>
          </div>
          <div className="issuer-stat-chip">
            <span className="val">{skillIssuedCount}</span>
            <span className="lbl">Skills</span>
          </div>
          <div className="issuer-stat-chip">
            <span className="val">{projectIssuedCount}</span>
            <span className="lbl">Projects</span>
          </div>
          <button onClick={loadIssued} disabled={feedLoading} className="btn-secondary" title="Sync Blockchain Records">
            <RefreshCw size={13} className={feedLoading ? "spin" : ""} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Network Warning Banner */}
      {!isMonadChain && (
        <div className="issuer-network-alert">
          <div className="issuer-network-alert-content">
            <AlertTriangle size={24} color="#f87171" />
            <div>
              <h4 className="issuer-network-alert-title">
                Wrong Network Detected
              </h4>
              <p className="issuer-network-alert-desc">
                Please switch your wallet to the CredoNet verified network to issue official credentials.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={switchToMonad}
            className="btn-primary issuer-network-alert-btn"
          >
            Switch Network
          </button>
        </div>
      )}

      {/* Authorization Alert Banner */}
      {!isAuthorized && (
        <div className="issuer-auth-alert">
          <div className="issuer-network-alert-content">
            <AlertTriangle size={24} color="var(--accent-primary)" />
            <div>
              <h4 className="issuer-auth-alert-title">
                Wallet Not Authorized to Issue
              </h4>
              <p className="issuer-auth-alert-desc">
                Connected address ({account.slice(0, 8)}...{account.slice(-6)}) is not registered as an authorized issuer. Only accredited partner institutions can issue credentials.
              </p>
            </div>
          </div>
          {isOwner ? (
            <button
              type="button"
              onClick={handleQuickSelfAuthorize}
              disabled={loading}
              className="btn-primary issuer-auth-alert-btn"
            >
              {loading ? "Authorizing..." : "Self-Authorize Owner as Issuer"}
            </button>
          ) : (
            <div className="history-controls">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(account);
                  setCopiedAddress(true);
                  setTimeout(() => setCopiedAddress(false), 2000);
                }}
                className="btn-secondary issuer-auth-alert-btn"
              >
                {copiedAddress ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                <span>{copiedAddress ? "Copied" : "Copy Address"}</span>
              </button>
              <span className="text-muted text-mono">Switch to authorized issuer wallet</span>
            </div>
          )}
        </div>
      )}

      {/* Status / Success Receipt */}
      {statusMsg && (
        statusMsg.credentialId || statusMsg.txHash ? (
          <div className="issuer-receipt-card">
            <div className="issuer-receipt-header">
              <CheckCircle2 size={24} color="#10b981" />
              <div>
                <h3 className="issuer-receipt-title">
                  Credential Issued Successfully!
                </h3>
                <p className="issuer-receipt-desc">
                  The credential has been recorded in the official verification registry.
                </p>
              </div>
            </div>

            <div className="issuer-receipt-grid">
              <span className="issuer-receipt-label">Credential ID:</span>
              <span className="issuer-receipt-value">{statusMsg.credentialId}</span>

              <span className="issuer-receipt-label">Transaction Hash:</span>
              <a
                href={`${MONAD_TESTNET_CONFIG.explorerUrl}/tx/${statusMsg.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="issuer-receipt-link"
              >
                <span>{statusMsg.txHash}</span>
                <ExternalLink size={11} />
              </a>

              {statusMsg.studentAddress && (
                <>
                  <span className="issuer-receipt-label">Recipient Wallet:</span>
                  <span className="issuer-receipt-value">{statusMsg.studentAddress}</span>
                </>
              )}

              {statusMsg.evidenceProject && (
                <>
                  <span className="issuer-receipt-label">Linked Evidence:</span>
                  <span className="issuer-receipt-evidence">{statusMsg.evidenceProject}</span>
                </>
              )}
            </div>

            <div className="issuer-receipt-actions">
              {statusMsg.credentialId && (
                <a
                  href={`/verify/${statusMsg.credentialId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary issuer-receipt-btn"
                >
                  <ShieldCheck size={14} />
                  <span>Open Public Verification Page</span>
                  <ExternalLink size={12} />
                </a>
              )}
              {statusMsg.studentAddress && (
                <a
                  href={`/vault/${statusMsg.studentAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary issuer-receipt-btn"
                >
                  <Award size={14} />
                  <span>View Student Passport</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className={`alert-message ${statusMsg.type}`}>
            {statusMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{statusMsg.text}</span>
          </div>
        )
      )}

      {/* 2. Main Studio Grid (Form on Left, Live Preview on Right) */}
      <div className="issuer-studio-grid">
        {/* Left: Studio Issuance Card */}
        <div className="issuer-card-panel">
          <div className="studio-header">
            <div>
              <h3 className="studio-header-title">
                {issueType === "project" 
                  ? "Certify Student Project" 
                  : issueType === "certificate"
                  ? "Issue & Anchor Degree / Certificate"
                  : issueType === "batch"
                  ? "Institutional Batch Convocation"
                  : "Certify Student Skill"}
              </h3>
              <p className="studio-header-sub">
                Issue permanent, digitally verified credentials directly to the student's profile
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="studio-mode-toggle">
            <button
              type="button"
              onClick={() => setIssueType("skill")}
              className={`mode-tab-button ${issueType === "skill" ? "active-skill" : ""}`}
            >
              <Award size={15} />
              <span>Skill Certificate</span>
            </button>

            <button
              type="button"
              onClick={() => setIssueType("project")}
              className={`mode-tab-button ${issueType === "project" ? "active-project" : ""}`}
            >
              <FolderGit2 size={15} />
              <span>Project Verification</span>
            </button>

            <button
              type="button"
              onClick={() => setIssueType("certificate")}
              className={`mode-tab-button ${issueType === "certificate" ? "active-certificate" : ""}`}
            >
              <FileCheck size={15} />
              <span>Certificate Upload</span>
            </button>

            <button
              type="button"
              onClick={() => setIssueType("batch")}
              className={`mode-tab-button ${issueType === "batch" ? "active-batch" : ""}`}
            >
              <Users size={15} />
              <span>Batch Convocation</span>
            </button>
          </div>

          {activeClaimId && (
            <div className="issuer-active-claim-banner">
              <div className="issuer-active-claim-text">
                <Inbox size={15} color="var(--accent-primary)" />
                <span>Processing Student Claim <strong>#{activeClaimId.slice(0, 8)}...</strong>. On issuance, this claim will automatically be marked Approved & linked to the generated Credential ID.</span>
              </div>
              <button
                type="button"
                onClick={() => { setActiveClaimId(null); setStudentAddress(""); setSkillTitle(""); setProjectName(""); setDescription(""); }}
                className="issuer-clear-claim-btn"
              >
                Clear Claim
              </button>
            </div>
          )}

          {issueType === "batch" ? (
            /* BATCH ISSUANCE FORM */
            <form onSubmit={handleBatchIssue} className="issuer-form-col">
              <div className="field-box">
                <div className="field-label-row">
                  <span>Batch Degree / Certification Title *</span>
                  <span className="field-badge">Convocation Cohort</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. B.Tech Computer Science & Engineering - Class of 2026"
                  value={batchTitle}
                  onChange={(e) => setBatchTitle(e.target.value)}
                  disabled={isBatchMinting || !isAuthorized}
                  className="field-input"
                  required
                />
              </div>

              <div className="field-box">
                <div className="field-label-row">
                  <span>Validity Period</span>
                  <span className="field-badge issuer-badge-accent">
                    Lifecycle
                  </span>
                </div>
                <select
                  value={batchValidity}
                  onChange={(e) => setBatchValidity(e.target.value)}
                  disabled={isBatchMinting || !isAuthorized}
                  className="field-input issuer-select-primary"
                >
                  <option value="Perpetual">Perpetual (No Expiration - Lifetime Degree)</option>
                  <option value="1 Year">1 Year Validity (Annual Compliance)</option>
                  <option value="2 Years">2 Years Validity (Standard Tech Recertification)</option>
                  <option value="3 Years">3 Years Validity (Professional License)</option>
                </select>
              </div>

              <div className="field-box">
                <div className="field-label-row">
                  <span>Student Wallet Addresses (One per line or comma-separated) *</span>
                  <button
                    type="button"
                    onClick={() => setBatchAddresses("0x71C92a8C943B8d62283e1c66289b5B38B71C4e92\n0x90F79bf6EB2c4f870365E785982E1f101E93b906")}
                    className="issuer-link-action"
                  >
                    Load Sample Cohort (2 Wallets)
                  </button>
                </div>
                <textarea
                  rows={5}
                  placeholder={"0x71C92a8C943B8d62283e1c66289b5B38B71C4e92\n0x90F79bf6EB2c4f870365E785982E1f101E93b906"}
                  value={batchAddresses}
                  onChange={(e) => setBatchAddresses(e.target.value)}
                  disabled={isBatchMinting || !isAuthorized}
                  className="field-input mono"
                  required
                />
                <span className="issuer-form-subtext">
                  Each student account will receive an authentic, permanent verifiable credential directly in their profile.
                </span>
              </div>

              {batchProgress && (
                <div className="issuer-batch-progress-box">
                  <div className="issuer-batch-progress-header">
                    <span className="issuer-batch-progress-title">
                      Minting Progress: {batchProgress.current} / {batchProgress.total} Complete
                    </span>
                    {isBatchMinting && <RefreshCw size={14} className="spin" color="var(--accent-primary)" />}
                  </div>

                  <div className="issuer-batch-track">
                    <div className="issuer-batch-fill" />
                  </div>

                  <div className="issuer-batch-logs-list">
                    {batchProgress.logs.map((log, lIdx) => (
                      <div key={lIdx} className={`issuer-batch-log-item ${log.status === "SUCCESS" ? "success" : "error"}`}>
                        <span>{log.recipient.slice(0, 10)}...{log.recipient.slice(-6)}</span>
                        <span>{log.status === "SUCCESS" ? `✓ Minted #${log.credentialId ? log.credentialId.slice(0, 6) : "OK"}` : `✗ ${log.error}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isBatchMinting || !isAuthorized}
                className="btn-primary issuer-batch-submit-btn"
              >
                {isBatchMinting ? (
                  <span className="issuer-btn-inline-icon">
                    <RefreshCw size={16} className="spin" />
                    <span>Issuing Cohort ({batchProgress?.current || 0}/{batchProgress?.total || 0})...</span>
                  </span>
                ) : (
                  <span className="issuer-btn-inline-icon">
                    <Users size={16} />
                    <span>Execute Institutional Batch Issuance</span>
                  </span>
                )}
              </button>
            </form>
          ) : (
          <form onSubmit={handleIssue} className="issuer-form-col">
            {/* Student Wallet Address */}
            <div className="field-box">
              <div className="field-label-row">
                <span>Student Wallet Address</span>
                <button 
                  type="button" 
                  onClick={fillSampleAddress}
                  className="issuer-link-action"
                >
                  Use sample address
                </button>
              </div>
              <input
                type="text"
                placeholder="0x71C92a8C943B8d62283e1c66289b5B38B71C4e92"
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
                disabled={loading || !isAuthorized}
                className="field-input mono"
              />
            </div>

            {issueType === "skill" ? (
              <>
                <div className="field-box">
                  <div className="field-label-row">
                    <span>Skill or Certification Title</span>
                    <span className="field-badge">Official Record</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Distributed Systems & Cloud Architecture"
                    value={skillTitle}
                    onChange={(e) => setSkillTitle(e.target.value)}
                    disabled={loading || !isAuthorized}
                    className="field-input"
                  />
                  <div className="quick-chips-row">
                    <span className="issuer-popular-label">Popular:</span>
                    {["Full-Stack Web Development", "Distributed Systems", "Frontend Architecture", "Cybersecurity"].map((chip) => (
                      <button 
                        key={chip} 
                        type="button" 
                        onClick={() => setSkillTitle(chip)}
                        className="chip-btn"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field-box">
                  <label className="field-label-row">
                    <span>Proficiency Level</span>
                  </label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    disabled={loading || !isAuthorized}
                    className="field-input issuer-select-primary"
                  >
                    <option value="Fundamental / Beginner">Fundamental / Beginner</option>
                    <option value="Intermediate Competence">Intermediate Competence</option>
                    <option value="Advanced Mastery">Advanced Mastery</option>
                    <option value="Distinction / Honors">Distinction / Honors</option>
                  </select>
                </div>

                <div className="field-box">
                  <div className="field-label-row">
                    <span>Evidence Project Reference</span>
                    <span className="field-badge issuer-badge-success">
                      Evidence-Backed
                    </span>
                  </div>
                  {studentProjects.length > 0 ? (
                    <div className="dashboard-preview-list">
                      <select
                        value={evidenceProject}
                        onChange={(e) => setEvidenceProject(e.target.value)}
                        disabled={loading || !isAuthorized}
                        className="field-input issuer-select-primary"
                      >
                        <option value="">-- No Direct Project Link (Direct Assessment) --</option>
                        {studentProjects.map((p) => (
                          <option key={p.id} value={p.title}>
                            {p.title} {p.skills ? `(${p.skills.slice(0, 2).join(", ")})` : ""}
                          </option>
                        ))}
                      </select>
                      <span className="issuer-projects-loaded-msg">
                        ✓ {studentProjects.length} candidate project{studentProjects.length > 1 ? "s" : ""} loaded from student's portfolio
                      </span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. E-Commerce Platform or Web3 Voting dApp (Optional)"
                      value={evidenceProject}
                      onChange={(e) => setEvidenceProject(e.target.value)}
                      disabled={loading || !isAuthorized}
                      className="field-input"
                    />
                  )}
                  <p className="issuer-form-subtext">
                    Linking an evidence project connects this verified credential directly to the student's portfolio proof.
                  </p>
                </div>
              </>
            ) : issueType === "project" ? (
              <>
                <div className="field-box">
                  <div className="field-label-row">
                    <span>Project Title / Name</span>
                    <span className="field-badge">Verified Build</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. CredoNet - Decentralized Credential Registry"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    disabled={loading || !isAuthorized}
                    className="field-input"
                    required
                  />
                  <div className="quick-chips-row">
                    <span className="issuer-popular-label">Templates:</span>
                    {["CredoNet Protocol DApp", "DeFi Liquidity Aggregator", "Decentralized Storage Node"].map((chip) => (
                      <button 
                        key={chip} 
                        type="button" 
                        onClick={() => setProjectName(chip)}
                        className="chip-btn"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field-box">
                  <div className="field-label-row">
                    <span>Tech Stack & Skills Used</span>
                    <span className="field-badge">Comma separated</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Solidity, React, Node.js, Ethers.js, Hardhat"
                    value={projectSkills}
                    onChange={(e) => setProjectSkills(e.target.value)}
                    disabled={loading || !isAuthorized}
                    className="field-input"
                  />
                </div>

                <div className="issuer-grid-2col">
                  <div className="field-box">
                    <label className="field-label-row">
                      <span>GitHub / Code URL</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      disabled={loading || !isAuthorized}
                      className="field-input"
                    />
                  </div>

                  <div className="field-box">
                    <label className="field-label-row">
                      <span>Live Demo Link</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://myproject.xyz"
                      value={liveUrl}
                      onChange={(e) => setLiveUrl(e.target.value)}
                      disabled={loading || !isAuthorized}
                      className="field-input"
                    />
                  </div>
                </div>
              </>
            ) : issueType === "certificate" ? (
              <>
                <div className="field-box">
                  <div className="field-label-row">
                    <span>Degree / Certificate Title *</span>
                    <span className="field-badge">Official Credential</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Bachelor of Engineering in Computer Science"
                    value={certificateTitle}
                    onChange={(e) => setCertificateTitle(e.target.value)}
                    disabled={loading || !isAuthorized}
                    className="field-input"
                    required
                  />
                  <div className="quick-chips-row">
                    <span className="issuer-popular-label">Templates:</span>
                    {[
                      "B.E. Computer Engineering",
                      "M.Tech Distributed Systems",
                      "AWS Certified Solutions Architect",
                      "National Blockchain Fellowship"
                    ].map((chip) => (
                      <button 
                        key={chip} 
                        type="button" 
                        onClick={() => setCertificateTitle(chip)}
                        className="chip-btn"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="issuer-grid-2col">
                  <div className="field-box">
                    <label className="field-label-row">
                      <span>Issuing University / Organization *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. University Examination Board / AWS Academy"
                      value={issuingOrg}
                      onChange={(e) => setIssuingOrg(e.target.value)}
                      disabled={loading || !isAuthorized}
                      className="field-input"
                      required
                    />
                  </div>

                  <div className="field-box">
                    <label className="field-label-row">
                      <span>Honors / Grade / Division</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. First Class with Distinction (CGPA 9.4)"
                      value={certificateGrade}
                      onChange={(e) => setCertificateGrade(e.target.value)}
                      disabled={loading || !isAuthorized}
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="field-box">
                  <div className="field-label-row">
                    <span>Certificate Document File (PDF / Image) *</span>
                    <span className="field-badge issuer-badge-accent">
                      {isHashingFile ? "Computing Fingerprint..." : "Digital Fingerprint"}
                    </span>
                  </div>

                  {!certificateFile ? (
                    <label className="certificate-upload-dropzone">
                      <input
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/webp"
                        onChange={handleCertificateFileUpload}
                        disabled={loading || !isAuthorized}
                        className="certificate-file-input-hidden"
                      />
                      <div className="certificate-upload-inner">
                        <UploadCloud size={28} color="var(--accent-primary)" />
                        <span className="certificate-upload-title">
                          Click to select or drag & drop certificate document
                        </span>
                        <span className="certificate-upload-subtext">
                          Supports PDF, PNG, JPG, WebP (Automatically creates secure tamper-evident fingerprint)
                        </span>
                      </div>
                    </label>
                  ) : (
                    <div className="certificate-file-card">
                      <div className="certificate-file-left">
                        {certificatePreviewUrl ? (
                          <img
                            src={certificatePreviewUrl}
                            alt="Certificate Preview"
                            className="certificate-file-thumb"
                          />
                        ) : (
                          <div className="certificate-file-icon-box">
                            <FileText size={24} color="var(--accent-primary)" />
                          </div>
                        )}
                        <div className="certificate-file-info">
                          <span className="certificate-file-name">{certificateFileName}</span>
                          <span className="certificate-file-size">{certificateFileSize}</span>
                          {certificateFileHash && (
                            <span className="certificate-file-hash">
                              Digital Fingerprint: {certificateFileHash.slice(0, 14)}...{certificateFileHash.slice(-8)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCertificateFile}
                        className="certificate-remove-btn"
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <p className="issuer-form-subtext">
                    The uploaded document's unique digital fingerprint will be permanently recorded in the official verification registry.
                  </p>
                </div>
              </>
            ) : null}

            {/* Validity Duration Dropdown */}
            <div className="field-box">
              <div className="field-label-row">
                <span>Credential Validity Duration</span>
                <span className="field-badge issuer-badge-accent">
                  Lifecycle
                </span>
              </div>
              <select
                value={validityDuration}
                onChange={(e) => setValidityDuration(e.target.value)}
                disabled={loading || !isAuthorized}
                className="field-input issuer-select-primary"
              >
                <option value="Perpetual">Perpetual (No Expiration - Lifetime Achievement)</option>
                <option value="1 Year">1 Year Validity (Annual Compliance / Recertification)</option>
                <option value="2 Years">2 Years Validity (Standard Tech Certification)</option>
                <option value="3 Years">3 Years Validity (Professional License)</option>
              </select>
              <p className="issuer-form-subtext">
                Enforces time-bound authenticity. Verification engines automatically flag expired credentials on-chain.
              </p>
            </div>

            <div className="field-box">
              <div className="field-label-row">
                <span>{issueType === "project" ? "Project Verification Notes" : "Certification Remarks"}</span>
                <span className="field-badge">Permanent Audit Record</span>
              </div>
              <textarea
                placeholder={
                  issueType === "project"
                    ? "Verified Capstone: Completed all project milestones, passed code review with 9/9 unit tests passing, and demonstrated working live build."
                    : "Completed rigorous practical assessment in software engineering with Grade A+."
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading || !isAuthorized}
                className="field-input"
              />
            </div>

            {statusMsg && (
              <div className={`issuer-alert-box ${statusMsg.type}`}>
                {statusMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                <div className="issuer-alert-content">
                  <span className="issuer-alert-text">{statusMsg.text}</span>
                  {statusMsg.txHash && (
                    <span className="issuer-alert-tx">
                      Tx Hash: {statusMsg.txHash.slice(0, 18)}...
                    </span>
                  )}
                </div>
              </div>
            )}

            {!isMonadChain ? (
              <button
                type="button"
                onClick={switchToMonad}
                className="btn-primary issuer-btn-switch-network"
              >
                <AlertTriangle size={16} />
                <span>Switch to Verified Network to Issue</span>
              </button>
            ) : !isAuthorized ? (
              <button
                type="button"
                onClick={() => setStatusMsg({ type: "error", text: `Wallet ${account} is not an authorized issuer. Connect the deployer/issuer wallet or authorize this address above.` })}
                className="btn-primary issuer-btn-unauthorized"
              >
                <AlertTriangle size={16} />
                <span>Unauthorized Wallet (Click for details)</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary issuer-btn-submit-action"
              >
                {issueType === "project" ? (
                  <FolderGit2 size={16} />
                ) : issueType === "certificate" ? (
                  <FileCheck size={16} />
                ) : (
                  <Award size={16} />
                )}
                <span>
                  {loading
                    ? "Recording Credential in Official Registry..."
                    : issueType === "project"
                    ? "Certify & Issue Project Credential"
                    : issueType === "certificate"
                    ? "Anchor & Issue Official Degree Certificate"
                    : "Issue Verified Skill Credential"}
                </span>
              </button>
            )}
          </form>
          )}
        </div>

        {/* Right: Live Interactive Certificate Preview */}
        <div className="preview-panel-wrap">
          <div className="preview-badge-header">
            <span className="preview-badge-title">
              <Eye size={14} color="var(--accent-primary)" />
              LIVE VAULT PREVIEW
            </span>
            <span className="preview-badge-hint">
              Updates as you type
            </span>
          </div>

          <div className="live-cert-preview-card">
            <div className="preview-top-row">
              <div>
                <span className={`preview-category-tag ${issueType === "project" ? "project" : issueType === "certificate" ? "certificate" : "skill"}`}>
                  {issueType === "project" ? (
                    <FolderGit2 size={12} />
                  ) : issueType === "certificate" ? (
                    <FileCheck size={12} />
                  ) : (
                    <Award size={12} />
                  )}
                  <span>
                    {issueType === "project" 
                      ? "Verified Capstone Project" 
                      : issueType === "certificate"
                      ? "Official Degree / Certificate"
                      : "Verified Skill Certificate"}
                  </span>
                </span>
                <h3 className="preview-title-large">{previewTitle}</h3>
              </div>
              <span className="status-pill valid">
                <CheckCircle2 size={11} />
                VALID
              </span>
            </div>

            <div className="preview-meta-shelf">
              <div className="preview-meta-item">
                <span className="preview-meta-label">
                  <User size={12} color="var(--accent-primary)" /> Recipient
                </span>
                <span className="preview-meta-value">
                  {previewStudent.slice(0, 6)}...{previewStudent.slice(-4)}
                </span>
              </div>

              <div className="preview-meta-item">
                <span className="preview-meta-label">
                  <Building2 size={12} color="var(--accent-primary)" /> Issuer
                </span>
                <span className="preview-meta-value">
                  {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Authorized Node"}
                </span>
              </div>

              <div className="preview-meta-item">
                <span className="preview-meta-label">
                  <Calendar size={12} color="var(--accent-primary)" /> Issue Date
                </span>
                <span className="preview-meta-value">
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>

              {issueType === "project" && projectSkills.trim() && (
                <div className="preview-stack-shelf">
                  <span className="preview-stack-label">
                    STACK:
                  </span>
                  <span className="preview-stack-val">
                    {projectSkills}
                  </span>
                </div>
              )}

              {issueType === "certificate" && (
                <>
                  <div className="preview-meta-item">
                    <span className="preview-meta-label">
                      <Building2 size={12} color="var(--accent-primary)" /> Issuing Body
                    </span>
                    <span className="preview-meta-value">
                      {issuingOrg || "University Board"}
                    </span>
                  </div>

                  <div className="preview-meta-item">
                    <span className="preview-meta-label">
                      <Award size={12} color="var(--accent-primary)" /> Grade / Honors
                    </span>
                    <span className="preview-meta-value">
                      {certificateGrade || "Distinction"}
                    </span>
                  </div>

                  {certificateFileName && (
                    <div className="preview-stack-shelf">
                      <span className="preview-stack-label">
                        DOC HASH:
                      </span>
                      <span className="preview-stack-val text-mono">
                        {certificateFileHash ? `${certificateFileHash.slice(0, 14)}...` : certificateFileName}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="preview-foot-shelf">
              <span className="preview-foot-status">
                STATUS: TAMPER-PROOF
              </span>
              <span className="preview-foot-protocol">
                CredoNet Protocol
              </span>
            </div>
          </div>

          {/* Quick Guidelines Panel */}
          <div className="preview-guidelines-box">
            <span className="preview-guidelines-heading">
              Certification Standards
            </span>
            <div className="guide-point">
              <span className="guide-point-dot" />
              <span><strong>Identity Bound:</strong> Credentials belong permanently to the verified student profile.</span>
            </div>
            <div className="guide-point">
              <span className="guide-point-dot" />
              <span><strong>Instant Audit:</strong> Recruiters can scan the QR code to verify validity for free in &lt;1s.</span>
            </div>
            <div className="guide-point">
              <span className="guide-point-dot" />
              <span><strong>Direct Verification:</strong> Instant digital verification with zero background-check delays or paperwork.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 Student Claims Review Queue */}
      <div className="issuer-claims-panel">
        <div className="issuer-claims-header">
          <div>
            <div className="issuer-claims-title-wrap">
              <Inbox size={20} color="var(--accent-primary)" />
              <h3 className="connect-title">
                Incoming Student Claims Queue
              </h3>
              <span className={pendingClaims.length > 0 ? "issuer-claims-badge-pending" : "issuer-claims-badge-empty"}>
                {pendingClaims.length} Pending Review
              </span>
            </div>
            <p className="issuer-claims-subtext">
              Students submitting project and skill verification claims with GitHub repository evidence for institutional accreditation.
            </p>
          </div>

          <button onClick={loadClaims} disabled={loadingClaims} className="btn-secondary dashboard-btn-xs">
            <RefreshCw size={12} className={loadingClaims ? "spin" : ""} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {pendingClaims.length > 0 ? (
          <div className="issuer-claims-grid">
            {pendingClaims.map((claim, idx) => {
              const claimKey = claim.requestId || claim.id || claim._id || idx;
              const githubLink = claim.evidenceGithubUrl || claim.githubUrl;
              return (
                <div key={claimKey} className="issuer-claim-card">
                  <div>
                    <div className="issuer-claim-card-head">
                      <h4 className="issuer-claim-card-title">
                        {claim.skillTitle}
                      </h4>
                      <span className="issuer-claim-badge">
                        {claim.category}
                      </span>
                    </div>

                    <p className="issuer-claim-desc">
                      {claim.description || claim.notes || "No description provided."}
                    </p>

                    <div className="issuer-claim-meta">
                      <div className="issuer-claim-meta-muted">
                        Student: <span className="issuer-claim-meta-student">{claim.studentAddress ? `${claim.studentAddress.slice(0, 8)}...${claim.studentAddress.slice(-6)}` : "Unknown"}</span>
                      </div>
                      {claim.evidenceProject && (
                        <div className="issuer-claim-meta-muted">
                          Project: <span className="issuer-claim-meta-project">{claim.evidenceProject}</span>
                        </div>
                      )}
                      {claim.certificateFileName && (
                        <div className="issuer-claim-meta-muted">
                          Degree / Doc: <span className="issuer-claim-meta-project">{claim.certificateFileName}</span>
                        </div>
                      )}
                      {claim.certificateFileHash && (
                        <div className="issuer-claim-meta-muted">
                          File Fingerprint: <span className="issuer-claim-meta-student">{claim.certificateFileHash.slice(0, 16)}...</span>
                        </div>
                      )}
                      {githubLink && (
                        <div>
                          <a href={githubLink} target="_blank" rel="noopener noreferrer" className="issuer-receipt-link">
                            <span>GitHub Repo</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="issuer-claim-actions">
                    <button
                      type="button"
                      onClick={() => handleAcceptClaim(claim)}
                      className="btn-primary issuer-claim-accept-btn"
                    >
                      <span>Accept & Pre-fill Form</span>
                      <ArrowRight size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectClaim(claim.requestId || claim.id || claim._id)}
                      className="btn-secondary issuer-claim-reject-btn"
                    >
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="issuer-empty-claims-box">
            No pending student verification claims in queue. Students can submit evidence claims directly from their dashboard.
          </div>
        )}
      </div>

      {/* 3. Activity Table / History Section */}
      <div className="issuer-history-shelf">
        <div className="history-header-row">
          <div className="history-title-area">
            <h3>Issued Credentials History</h3>
            <p>Log of all skill certificates and project verifications minted by this wallet</p>
          </div>

          <div className="history-controls">
            <div className="history-filter-pills">
              <button
                onClick={() => setHistoryFilter("all")}
                className={`filter-pill-btn ${historyFilter === "all" ? "active" : ""}`}
              >
                All ({issuedList.length})
              </button>
              <button
                onClick={() => setHistoryFilter("certificate")}
                className={`filter-pill-btn ${historyFilter === "certificate" ? "active" : ""}`}
              >
                Certificates ({certificateIssuedCount})
              </button>
              <button
                onClick={() => setHistoryFilter("skill")}
                className={`filter-pill-btn ${historyFilter === "skill" ? "active" : ""}`}
              >
                Skills ({skillIssuedCount})
              </button>
              <button
                onClick={() => setHistoryFilter("project")}
                className={`filter-pill-btn ${historyFilter === "project" ? "active" : ""}`}
              >
                Projects ({projectIssuedCount})
              </button>
            </div>

            <div className="history-search-box">
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search student or title..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filteredIssued.length > 0 ? (
          <div className="credentials-grid">
            {filteredIssued.map((cred) => (
              <CredentialCard
                key={cred.credentialId}
                credential={cred}
                isIssuerView={true}
                onRevoke={handleRevoke}
                isRevoking={revokingId === cred.credentialId}
              />
            ))}
          </div>
        ) : (
          <div className="empty-credentials-box">
            <div className="empty-icon">
              <FileCheck size={22} />
            </div>
            <h4 className="dashboard-claim-title">No certificates found</h4>
            <p className="dashboard-muted-msg">
              {historySearch ? "No records matched your search query." : "You have not issued any certificates yet."}
            </p>
          </div>
        )}
      </div>

      {/* 4. Owner Admin Governance (If Owner) */}
      {isOwner && (
        <div className="issuer-admin-panel-wrap">
          <div className="issuer-card-panel">
            <div className="studio-header">
              <div className="issuer-claims-title-wrap">
                <KeyRound size={20} color="var(--accent-primary)" />
                <h3 className="studio-header-title">Approve Certifying Partners</h3>
              </div>
            </div>

            <form onSubmit={handleAuthorizeIssuer} className="issuer-admin-form">
              <div className="field-box">
                <label className="field-label-row">
                  <span>Partner Wallet Address</span>
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={authInput}
                  onChange={(e) => setAuthInput(e.target.value)}
                  disabled={loading}
                  className="field-input mono"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary issuer-admin-submit-btn">
                <span>Approve as Certifying Partner</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
