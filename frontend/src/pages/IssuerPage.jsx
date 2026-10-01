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
  Globe
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

  useEffect(() => {
    if (account) {
      loadIssued();
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
              student: studentAddress.trim(),
              issuer: account,
            }
          : {
              type: "skill",
              skill: skillTitle.trim(),
              skillLevel,
              evidenceProject: resolvedEvidenceProject,
              description: description.trim(),
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
      loadIssued();
    } catch (err) {
      console.error("Issuance failed:", err);
      setStatusMsg({ type: "error", text: err.reason || err.message || "Failed to issue. Please try again." });
    } finally {
      setLoading(false);
    }
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
          </div>

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
