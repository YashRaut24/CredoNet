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
  Send
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
        setClaims(data);
      }
    } catch (err) {
      console.warn("Could not load claims:", err);
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
        text: err.reason || err.message || "Failed to authorize address."
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
          text: "Wrong network! Please switch your wallet to the required EVM Testnet (Chain ID: 10143) to issue credentials."
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

    let finalTitle = "";
    if (isProject) {
      finalTitle = projectName.trim() || "CredoNet Protocol DApp";
      if (!projectName.trim()) setProjectName(finalTitle);
    } else {
      finalTitle = skillTitle.trim() || "Solidity & Smart Contracts";
      if (!skillTitle.trim()) setSkillTitle(finalTitle);
    }

    const onChainTitle = isProject ? `[Project] ${finalTitle}` : finalTitle;

    setLoading(true);
    try {
      // 1. Off-chain metadata preparation
      let metadataHash = "ipfs://QmDefaultHash";
      const resolvedEvidenceProject = isProject ? projectName.trim() : (evidenceProject.trim() || undefined);
      try {
        const metadataPayload = isProject
          ? {
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
            }
          : {
              type: "skill",
              skill: skillTitle.trim(),
              skillLevel,
              evidenceProject: resolvedEvidenceProject,
              description: description.trim(),
              validityDuration: validityDuration,
              student: studentAddress.trim(),
              issuer: account,
            };

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
        text: `Transaction submitted to Monad! Waiting for block confirmation... (Tx: ${tx.hash.slice(0, 10)}...)` 
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
        text: "Credential recorded on Monad blockchain!"
      });

      // Clear form & reload
      setStudentAddress("");
      setSkillTitle("");
      setEvidenceProject("");
      setProjectName("");
      setProjectSkills("");
      setRepoUrl("");
      setLiveUrl("");
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
      setStatusMsg({ type: "error", text: err.reason || err.message || "Failed to issue. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Accept Claim into Issuance Form
  const handleAcceptClaim = (claim) => {
    setActiveClaimId(claim.id);
    setStudentAddress(claim.studentAddress);
    if (claim.category === "Project") {
      setIssueType("project");
      setProjectName(claim.skillTitle);
      setDescription(claim.description || "");
      if (claim.evidenceGithubUrl) setRepoUrl(claim.evidenceGithubUrl);
    } else {
      setIssueType("skill");
      setSkillTitle(claim.skillTitle);
      setDescription(claim.description || "");
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
      text: `Batch convocation completed! Minted on-chain credentials for ${updatedLogs.filter(l => l.status === "SUCCESS").length} of ${validAddrs.length} recipients on Monad.`
    });
  };

  // Revoke Credential
  const handleRevoke = async (credentialId) => {
    if (!window.confirm("Are you sure you want to revoke this credential on Monad? This is an irreversible blockchain transaction.")) return;
    
    if (!isMonadChain) {
      try {
        await switchToMonad();
      } catch (switchErr) {
        setStatusMsg({
          type: "error",
          text: "Wrong network! Please switch your wallet to Monad Testnet (Chain ID: 10143) to revoke."
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
        text: `Credential revoked on Monad! Public verification will immediately show REVOKED.` 
      });
      loadIssued();
    } catch (err) {
      console.error("Revoke failed:", err);
      setStatusMsg({ type: "error", text: err.reason || err.message || "Failed to revoke credential." });
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
      setStatusMsg({ type: "error", text: err.reason || err.message || "Failed to approve partner." });
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
  const skillIssuedCount = activeIssuedCount - projectIssuedCount;

  // Filtered History
  const filteredIssued = issuedList.filter(c => {
    const isProj = c.skill?.startsWith("[Project]");
    if (historyFilter === "skill" && isProj) return false;
    if (historyFilter === "project" && !isProj) return false;

    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return c.skill?.toLowerCase().includes(q) || c.student?.toLowerCase().includes(q);
  });

  if (!account) {
    return (
      <div className="container" style={{ padding: "60px 0" }}>
        <div className="connect-prompt-card">
          <div className="connect-icon-wrap">
            <Building2 size={32} />
          </div>
          <h2 className="connect-title">Partner Certification Portal</h2>
          <p className="connect-desc">
            Connect your institution or organization wallet to issue verified skills, approve student capstone projects, and manage credentials.
          </p>
          <button onClick={connectWallet} className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: "14.5px" }}>
            Connect Partner Wallet
          </button>
        </div>
      </div>
    );
  }

  // Live Preview Computed Values
  const previewTitle = issueType === "project" 
    ? (projectName.trim() || "CredoNet Protocol Architecture")
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
              <span style={{ color: "var(--border-medium)" }}>•</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{account.slice(0, 6)}...{account.slice(-4)}</span>
            </div>
          </div>
        </div>

        <div className="issuer-stats-bar">
          <div className="issuer-stat-chip">
            <span className="val">{activeIssuedCount}</span>
            <span className="lbl">Active Issued</span>
          </div>
          <div className="issuer-stat-chip">
            <span className="val">{skillIssuedCount}</span>
            <span className="lbl">Skills</span>
          </div>
          <div className="issuer-stat-chip">
            <span className="val">{projectIssuedCount}</span>
            <span className="lbl">Projects</span>
          </div>
          <button onClick={loadIssued} disabled={feedLoading} className="btn-secondary" title="Sync Blockchain Records" style={{ height: "42px", padding: "0 14px" }}>
            <RefreshCw size={13} className={feedLoading ? "spin" : ""} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Network Warning Banner */}
      {!isMonadChain && (
        <div style={{
          margin: "18px 0",
          padding: "16px 20px",
          background: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.45)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertTriangle size={24} color="#f87171" />
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#f87171" }}>
                Wrong Network Detected (Chain ID: {chainId || "Unknown"})
              </h4>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
                SkillPassport is deployed on Monad Testnet (Chain ID: 10143). Transactions will fail unless your wallet is switched.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={switchToMonad}
            className="btn-primary"
            style={{ padding: "8px 18px", fontSize: "13px", background: "#ef4444" }}
          >
            Switch to Monad Testnet
          </button>
        </div>
      )}

      {/* Authorization Alert Banner */}
      {!isAuthorized && (
        <div style={{
          margin: "18px 0",
          padding: "16px 20px",
          background: "rgba(242, 108, 54, 0.1)",
          border: "1px solid rgba(242, 108, 54, 0.35)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertTriangle size={24} color="var(--accent-primary)" />
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--accent-primary)" }}>
                Wallet Not Authorized to Issue
              </h4>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Connected address ({account.slice(0, 8)}...{account.slice(-6)}) is not registered as an authorized issuer. Only accredited issuers or the contract owner can issue credentials on Monad.
              </p>
            </div>
          </div>
          {isOwner ? (
            <button
              type="button"
              onClick={handleQuickSelfAuthorize}
              disabled={loading}
              className="btn-primary"
              style={{ padding: "8px 16px", fontSize: "13px" }}
            >
              {loading ? "Authorizing..." : "Self-Authorize Owner as Issuer"}
            </button>
          ) : (
            <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              Switch to authorized issuer wallet
            </span>
          )}
        </div>
      )}

      {/* Status / Success Receipt */}
      {statusMsg && (
        statusMsg.credentialId || statusMsg.txHash ? (
          <div style={{
            margin: "20px 0",
            padding: "24px",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <CheckCircle2 size={24} color="#10b981" />
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#10b981" }}>
                  Credential Issued Successfully!
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  The credential has been cryptographically anchored on the Monad blockchain.
                </p>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "8px 16px",
              padding: "16px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-medium)",
              borderRadius: "var(--radius-md)",
              fontSize: "12.5px",
              fontFamily: "var(--font-mono)"
            }}>
              <span style={{ color: "var(--text-muted)" }}>Credential ID:</span>
              <span style={{ color: "var(--text-highlight)", wordBreak: "break-all" }}>{statusMsg.credentialId}</span>

              <span style={{ color: "var(--text-muted)" }}>Transaction Hash:</span>
              <a
                href={`${MONAD_TESTNET_CONFIG.explorerUrl}/tx/${statusMsg.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent-primary)", wordBreak: "break-all", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <span>{statusMsg.txHash}</span>
                <ExternalLink size={11} />
              </a>

              {statusMsg.studentAddress && (
                <>
                  <span style={{ color: "var(--text-muted)" }}>Recipient Wallet:</span>
                  <span style={{ color: "var(--text-highlight)" }}>{statusMsg.studentAddress}</span>
                </>
              )}

              {statusMsg.evidenceProject && (
                <>
                  <span style={{ color: "var(--text-muted)" }}>Linked Evidence:</span>
                  <span style={{ color: "#10b981", fontWeight: "600" }}>{statusMsg.evidenceProject}</span>
                </>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {statusMsg.credentialId && (
                <a
                  href={`/verify/${statusMsg.credentialId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ padding: "8px 16px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}
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
                  className="btn-secondary"
                  style={{ padding: "8px 16px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}
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
                {issueType === "project" ? "Certify Student Project" : "Certify Student Skill"}
              </h3>
              <p className="studio-header-sub">
                Issue permanent, cryptographically verified proof directly to the recipient's wallet
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
              onClick={() => setIssueType("batch")}
              className={`mode-tab-button ${issueType === "batch" ? "active-skill" : ""}`}
            >
              <Users size={15} />
              <span>Batch Convocation</span>
            </button>
          </div>

          {activeClaimId && (
            <div style={{
              margin: "12px 0 16px",
              padding: "12px 16px",
              background: "rgba(242, 108, 54, 0.12)",
              border: "1px solid rgba(242, 108, 54, 0.35)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "var(--text-highlight)" }}>
                <Inbox size={15} color="var(--accent-primary)" />
                <span>Processing Student Claim <strong>#{activeClaimId.slice(0, 8)}...</strong>. On issuance, this claim will automatically be marked Approved & linked to the generated Monad Credential ID.</span>
              </div>
              <button
                type="button"
                onClick={() => { setActiveClaimId(null); setStudentAddress(""); setSkillTitle(""); setProjectName(""); setDescription(""); }}
                style={{ background: "none", border: "none", color: "#f87171", fontSize: "11.5px", cursor: "pointer", textDecoration: "underline" }}
              >
                Clear Claim
              </button>
            </div>
          )}

          {issueType === "batch" ? (
            /* BATCH ISSUANCE FORM */
            <form onSubmit={handleBatchIssue} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
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
                  <span className="field-badge" style={{ background: "rgba(242, 108, 54, 0.12)", color: "var(--accent-primary)" }}>
                    Lifecycle
                  </span>
                </div>
                <select
                  value={batchValidity}
                  onChange={(e) => setBatchValidity(e.target.value)}
                  disabled={isBatchMinting || !isAuthorized}
                  className="field-input"
                  style={{ background: "var(--bg-primary)" }}
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
                    style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "11px", cursor: "pointer", textDecoration: "underline" }}
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
                <span style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Each student wallet will receive an independent, soulbound, verifiable credential on Monad.
                </span>
              </div>

              {batchProgress && (
                <div style={{
                  padding: "16px",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-medium)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-highlight)" }}>
                      Minting Progress: {batchProgress.current} / {batchProgress.total} Complete
                    </span>
                    {isBatchMinting && <RefreshCw size={14} className="spin" color="var(--accent-primary)" />}
                  </div>

                  <div style={{
                    width: "100%",
                    height: "6px",
                    background: "var(--bg-primary)",
                    borderRadius: "3px",
                    overflow: "hidden",
                    marginBottom: "10px"
                  }}>
                    <div style={{
                      width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                      height: "100%",
                      background: "var(--accent-primary)",
                      transition: "width 0.3s ease"
                    }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "140px", overflowY: "auto", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                    {batchProgress.logs.map((log, lIdx) => (
                      <div key={lIdx} style={{ display: "flex", justifyContent: "space-between", color: log.status === "SUCCESS" ? "#10b981" : "#ef4444" }}>
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
                className="btn-primary"
                style={{ padding: "14px", width: "100%", fontSize: "14.5px" }}
              >
                {isBatchMinting ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <RefreshCw size={16} className="spin" />
                    <span>Minting Cohort on Monad ({batchProgress?.current || 0}/{batchProgress?.total || 0})...</span>
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Users size={16} />
                    <span>Execute Institutional Batch Issuance on Monad</span>
                  </span>
                )}
              </button>
            </form>
          ) : (
          <form onSubmit={handleIssue} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Student Wallet Address */}
            <div className="field-box">
              <div className="field-label-row">
                <span>Student Wallet Address</span>
                <button 
                  type="button" 
                  onClick={fillSampleAddress}
                  style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "11px", cursor: "pointer", textDecoration: "underline" }}
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
                    placeholder="e.g. Smart Contract Security & Gas Optimization"
                    value={skillTitle}
                    onChange={(e) => setSkillTitle(e.target.value)}
                    disabled={loading || !isAuthorized}
                    className="field-input"
                  />
                  <div className="quick-chips-row">
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Popular:</span>
                    {["Solidity & Smart Contracts", "Distributed Systems", "Frontend Architecture", "Cybersecurity"].map((chip) => (
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
                    className="field-input"
                    style={{ background: "var(--bg-primary)" }}
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
                    <span className="field-badge" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.3)" }}>
                      Evidence-Backed
                    </span>
                  </div>
                  {studentProjects.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <select
                        value={evidenceProject}
                        onChange={(e) => setEvidenceProject(e.target.value)}
                        disabled={loading || !isAuthorized}
                        className="field-input"
                        style={{ background: "var(--bg-primary)" }}
                      >
                        <option value="">-- No Direct Project Link (Direct Assessment) --</option>
                        {studentProjects.map((p) => (
                          <option key={p.id} value={p.title}>
                            {p.title} {p.skills ? `(${p.skills.slice(0, 2).join(", ")})` : ""}
                          </option>
                        ))}
                      </select>
                      <span style={{ fontSize: "11.5px", color: "#10b981" }}>
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
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Linking an evidence project connects this verified credential directly to the student's portfolio proof.
                  </p>
                </div>
              </>
            ) : (
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
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Templates:</span>
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
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
            )}

            {/* Validity Duration Dropdown */}
            <div className="field-box">
              <div className="field-label-row">
                <span>Credential Validity Duration</span>
                <span className="field-badge" style={{ background: "rgba(242, 108, 54, 0.12)", color: "var(--accent-primary)" }}>
                  Lifecycle
                </span>
              </div>
              <select
                value={validityDuration}
                onChange={(e) => setValidityDuration(e.target.value)}
                disabled={loading || !isAuthorized}
                className="field-input"
                style={{ background: "var(--bg-primary)" }}
              >
                <option value="Perpetual">Perpetual (No Expiration - Lifetime Achievement)</option>
                <option value="1 Year">1 Year Validity (Annual Compliance / Recertification)</option>
                <option value="2 Years">2 Years Validity (Standard Tech Certification)</option>
                <option value="3 Years">3 Years Validity (Professional License)</option>
              </select>
              <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "4px" }}>
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
                    : "Completed rigorous practical assessment in smart contract engineering with Grade A+."
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading || !isAuthorized}
                className="field-input"
              />
            </div>

            {statusMsg && (
              <div 
                className={`alert-message ${statusMsg.type}`} 
                style={{ 
                  margin: "6px 0 12px", 
                  padding: "12px 16px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  background: statusMsg.type === "success" ? "rgba(16, 185, 129, 0.15)" : statusMsg.type === "info" ? "rgba(56, 189, 248, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  border: `1px solid ${statusMsg.type === "success" ? "rgba(16, 185, 129, 0.3)" : statusMsg.type === "info" ? "rgba(56, 189, 248, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                  color: statusMsg.type === "success" ? "#10b981" : statusMsg.type === "info" ? "#38bdf8" : "#ef4444"
                }}
              >
                {statusMsg.type === "success" ? <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: "2px" }} /> : <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px", lineHeight: "1.4" }}>
                  <span style={{ fontWeight: "600" }}>{statusMsg.text}</span>
                  {statusMsg.txHash && (
                    <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", opacity: 0.85 }}>
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
                className="btn-primary"
                style={{ padding: "14px", width: "100%", fontSize: "14px", marginTop: "6px", background: "#ef4444" }}
              >
                <AlertTriangle size={16} />
                <span>Switch to EVM Testnet (Chain ID 10143) to Issue</span>
              </button>
            ) : !isAuthorized ? (
              <button
                type="button"
                onClick={() => setStatusMsg({ type: "error", text: `Wallet ${account} is not an authorized issuer. Connect the deployer/issuer wallet or authorize this address above.` })}
                className="btn-primary"
                style={{ padding: "14px", width: "100%", fontSize: "14px", marginTop: "6px", opacity: 0.85, cursor: "pointer" }}
              >
                <AlertTriangle size={16} />
                <span>Unauthorized Wallet (Click for details)</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ padding: "14px", width: "100%", fontSize: "14px", marginTop: "6px" }}
              >
                {issueType === "project" ? <FolderGit2 size={16} /> : <Award size={16} />}
                <span>
                  {loading
                    ? "Anchoring Credential to Blockchain..."
                    : issueType === "project"
                    ? "Certify & Issue Project Credential"
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
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Updates as you type
            </span>
          </div>

          <div className="live-cert-preview-card">
            <div className="preview-top-row">
              <div>
                <span className={`preview-category-tag ${issueType === "project" ? "project" : "skill"}`}>
                  {issueType === "project" ? <FolderGit2 size={12} /> : <Award size={12} />}
                  <span>{issueType === "project" ? "Verified Capstone Project" : "Verified Skill Certificate"}</span>
                </span>
                <h3 className="preview-title-large">{previewTitle}</h3>
              </div>
              <span className="status-pill valid" style={{ padding: "3px 8px", fontSize: "10.5px" }}>
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
                <div style={{ marginTop: "4px", paddingTop: "6px", borderTop: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontSize: "10.5px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    STACK:
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                    {projectSkills}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                STATUS: TAMPER-PROOF
              </span>
              <span style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: "600" }}>
                CredoNet Protocol
              </span>
            </div>
          </div>

          {/* Quick Guidelines Panel */}
          <div className="preview-guidelines-box">
            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-highlight)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Certification Standards
            </span>
            <div className="guide-point">
              <span className="guide-point-dot" />
              <span><strong>Identity Bound:</strong> Certificates cannot be transferred or sold from the student's wallet.</span>
            </div>
            <div className="guide-point">
              <span className="guide-point-dot" />
              <span><strong>Instant Audit:</strong> Recruiters can scan the QR code to verify validity for free in &lt;1s.</span>
            </div>
            <div className="guide-point">
              <span className="guide-point-dot" />
              <span><strong>Zero Intermediaries:</strong> Direct mathematical proof with no agency fees or paperwork.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 Student Claims Review Queue */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-medium)",
        borderRadius: "var(--radius-xl)",
        padding: "24px 30px",
        display: "flex",
        flexDirection: "column",
        gap: "18px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Inbox size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-highlight)" }}>
                Incoming Student Claims Queue
              </h3>
              <span style={{
                padding: "2px 8px",
                background: claims.filter(c => c.status === "PENDING").length > 0 ? "rgba(245, 158, 11, 0.15)" : "var(--bg-secondary)",
                color: claims.filter(c => c.status === "PENDING").length > 0 ? "#f59e0b" : "var(--text-muted)",
                borderRadius: "10px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                fontWeight: "600"
              }}>
                {claims.filter(c => c.status === "PENDING").length} Pending Review
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Students submitting project and skill verification claims with GitHub repository evidence for institutional accreditation.
            </p>
          </div>

          <button onClick={loadClaims} disabled={loadingClaims} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
            <RefreshCw size={12} className={loadingClaims ? "spin" : ""} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {claims.filter(c => c.status === "PENDING").length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
            {claims.filter(c => c.status === "PENDING").map((claim) => (
              <div
                key={claim.id}
                style={{
                  padding: "16px 18px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-highlight)" }}>
                      {claim.skillTitle}
                    </h4>
                    <span style={{
                      fontSize: "10.5px",
                      fontFamily: "var(--font-mono)",
                      padding: "2px 6px",
                      background: "rgba(242, 108, 54, 0.1)",
                      color: "var(--accent-primary)",
                      borderRadius: "4px"
                    }}>
                      {claim.category}
                    </span>
                  </div>

                  <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: "1.4" }}>
                    {claim.description}
                  </p>

                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px" }}>
                    <div style={{ color: "var(--text-muted)" }}>
                      Student: <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-highlight)" }}>{claim.studentAddress.slice(0, 8)}...{claim.studentAddress.slice(-6)}</span>
                    </div>
                    {claim.evidenceProject && (
                      <div style={{ color: "var(--text-muted)" }}>
                        Project: <span style={{ color: "#38bdf8", fontWeight: "600" }}>{claim.evidenceProject}</span>
                      </div>
                    )}
                    {claim.evidenceGithubUrl && (
                      <div>
                        <a href={claim.evidenceGithubUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <span>GitHub Repo</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", paddingTop: "10px", borderTop: "1px solid var(--border-subtle)" }}>
                  <button
                    type="button"
                    onClick={() => handleAcceptClaim(claim)}
                    className="btn-primary"
                    style={{ flex: 1, padding: "6px 12px", fontSize: "12px" }}
                  >
                    <span>Accept & Pre-fill Form</span>
                    <ArrowRight size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectClaim(claim.id)}
                    className="btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "12px", color: "#f87171" }}
                  >
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: "20px",
            textAlign: "center",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-muted)",
            fontSize: "13px"
          }}>
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
            <h4 style={{ fontSize: "15px", fontWeight: "600" }}>No certificates found</h4>
            <p style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
              {historySearch ? "No records matched your search query." : "You have not issued any certificates yet."}
            </p>
          </div>
        )}
      </div>

      {/* 4. Owner Admin Governance (If Owner) */}
      {isOwner && (
        <div style={{ maxWidth: "600px", marginTop: "12px" }}>
          <div className="issuer-card-panel">
            <div className="studio-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <KeyRound size={20} color="var(--accent-primary)" />
                <h3 className="studio-header-title">Approve Certifying Partners</h3>
              </div>
            </div>

            <form onSubmit={handleAuthorizeIssuer} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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
              <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "12px" }}>
                <span>Approve as Certifying Partner</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
