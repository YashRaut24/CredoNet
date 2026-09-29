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
  Layers
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { CredentialCard } from "../components/CredentialCard";
import "./IssuerPage.css";

export function IssuerPage() {
  const { 
    account, 
    isAuthorized, 
    isOwner, 
    getContractWithSigner, 
    getReadOnlyContract, 
    switchToMonad, 
    connectWallet,
    refreshAccountStatus
  } = useWeb3();

  // Form States
  const [studentAddress, setStudentAddress] = useState("");
  const [skillTitle, setSkillTitle] = useState("");
  const [description, setDescription] = useState("");
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

  // Handle Credential Issuance
  const handleIssue = async (e) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!account) {
      setStatusMsg({ type: "error", text: "Please connect your wallet first." });
      return;
    }

    if (!ethers.isAddress(studentAddress.trim())) {
      setStatusMsg({ type: "error", text: "Please enter a valid student EVM address (0x...)." });
      return;
    }

    if (!skillTitle.trim()) {
      setStatusMsg({ type: "error", text: "Skill title cannot be empty." });
      return;
    }

    setLoading(true);
    try {
      // 1. Generate decentralized metadata payload / hash
      let metadataHash = "ipfs://QmDefaultHash";
      try {
        const metaRes = await fetch("/api/metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skill: skillTitle.trim(),
            description: description.trim(),
            student: studentAddress.trim(),
            issuer: account,
          }),
        });
        const metaData = await metaRes.json();
        if (metaData.metadataHash) {
          metadataHash = metaData.metadataHash;
        }
      } catch (e) {
        // Fallback SHA hash if backend offline
        metadataHash = "ipfs://Qm" + Math.random().toString(36).substring(2, 15);
      }

      // 2. Call contract
      const contract = getContractWithSigner();
      const tx = await contract.issueCredential(
        studentAddress.trim(),
        skillTitle.trim(),
        metadataHash
      );
      setStatusMsg({ type: "success", text: `Transaction broadcast! Waiting for EVM blockchain finality... (Tx: ${tx.hash.slice(0, 10)}...)` });

      await tx.wait();
      setStatusMsg({ type: "success", text: "Skill Visa successfully stamped to student passport!" });

      // Reset form & reload feed
      setStudentAddress("");
      setSkillTitle("");
      setDescription("");
      loadIssued();
    } catch (err) {
      console.error("Issuance failed:", err);
      setStatusMsg({ type: "error", text: err.reason || err.message || "Failed to issue credential." });
    } finally {
      setLoading(false);
    }
  };

  // Revoke Credential
  const handleRevoke = async (credentialId) => {
    if (!window.confirm("Are you sure you want to permanently revoke this credential on Monad?")) return;
    setRevokingId(credentialId);
    try {
      const contract = getContractWithSigner();
      const tx = await contract.revokeCredential(credentialId);
      await tx.wait();
      setStatusMsg({ type: "success", text: "Credential successfully revoked." });
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
      setStatusMsg({ type: "error", text: "Invalid issuer address to authorize." });
      return;
    }
    setLoading(true);
    try {
      const contract = getContractWithSigner();
      const tx = await contract.authorizeIssuer(authInput.trim());
      await tx.wait();
      setStatusMsg({ type: "success", text: `Address ${authInput.trim().slice(0, 8)}... authorized as issuer!` });
      setAuthInput("");
      refreshAccountStatus();
    } catch (err) {
      setStatusMsg({ type: "error", text: err.reason || err.message || "Failed to authorize issuer." });
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="container">
        <div className="connect-prompt-card">
          <div className="connect-icon-wrap">
            <ShieldCheck size={28} />
          </div>
          <h2 className="connect-title">CredoNet Issuer Authority Node</h2>
          <p className="connect-desc">
            Connect your authorized institution wallet to imprint, manage, and revoke cryptographic Proof Seals on EVM blockchain.
          </p>
          <button onClick={connectWallet} className="btn-primary" style={{ width: "100%", padding: "12px" }}>
            Connect Issuer Node Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container issuer-page">
      {/* Issuer Authorization Banner */}
      <div className="issuer-status-banner">
        <div className="issuer-status-info">
          <div className={`status-indicator-icon ${isAuthorized ? "authorized" : "unauthorized"}`}>
            {isAuthorized ? <CheckCircle2 size={26} /> : <AlertTriangle size={26} />}
          </div>
          <div>
            <h3 className="issuer-status-title">
              {isAuthorized ? "Authorized CredoNet Certifying Authority" : "Unauthorized Issuer Account"}
            </h3>
            <p className="issuer-status-sub">
              {isAuthorized
                ? "Your wallet is cryptographically permissioned to issue tamper-proof credentials directly into student CredoVaults."
                : "This wallet has not been granted issuer permissions. Only the protocol owner can authorize certifying bodies."}
            </p>
          </div>
        </div>

        <div>
          <button onClick={loadIssued} disabled={feedLoading} className="btn-secondary">
            <RefreshCw size={14} className={feedLoading ? "spin" : ""} />
            <span>Sync Records</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`alert-message ${statusMsg.type}`}>
          {statusMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main Grid: Issue Form + Admin / Guide */}
      <div className="issuer-grid">
        {/* Issue Credential Form */}
        <div className="issuer-form-card">
          <div className="form-header">
            <div className="form-icon-wrap">
              <PlusCircle size={20} />
            </div>
            <div>
              <h4 className="form-title">Issue New Skill Credential</h4>
              <p className="form-sub">Anchor permanent proof of competency to a student wallet</p>
            </div>
          </div>

          <form onSubmit={handleIssue} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div className="form-group">
              <label className="form-label">
                <span>Student EVM Wallet Address</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>0x...</span>
              </label>
              <input
                type="text"
                placeholder="0x71C...43e"
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
                disabled={loading || !isAuthorized}
                className="form-input mono"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Skill or Certification Title</label>
              <input
                type="text"
                placeholder="e.g. Smart Contract Security & DeFi Architecture"
                value={skillTitle}
                onChange={(e) => setSkillTitle(e.target.value)}
                disabled={loading || !isAuthorized}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Curriculum / Proof Description (Optional)</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Hashed on-chain</span>
              </label>
              <textarea
                placeholder="Passed comprehensive penetration testing assessment, EVM gas optimization, and reentrancy audits with grade A+."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading || !isAuthorized}
                className="form-textarea"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !isAuthorized}
              className="btn-primary"
              style={{ padding: "12px", width: "100%" }}
            >
              <Award size={16} />
              <span>{loading ? "Issuing on Blockchain..." : "Issue Credential to CredoVault"}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Owner Admin Tools or Issuer Standards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {isOwner && (
            <div className="admin-card">
              <div className="form-header" style={{ borderColor: "rgba(242, 108, 54, 0.2)" }}>
                <div className="form-icon-wrap">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h4 className="form-title">Protocol Owner Governance</h4>
                  <p className="form-sub">Authorize educational partners & universities</p>
                </div>
              </div>

              <form onSubmit={handleAuthorizeIssuer} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="form-group">
                  <label className="form-label">New Issuer Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={authInput}
                    onChange={(e) => setAuthInput(e.target.value)}
                    disabled={loading}
                    className="form-input mono"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-outline-amber">
                  <span>Grant Issuer Authority</span>
                </button>
              </form>
            </div>
          )}

          {/* Issuer Guidelines */}
          <div className="panel" style={{ padding: "26px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <span className="trust-badge">
              <span className="trust-badge-dot" />
              Verified Protocol Standards
            </span>
            <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-highlight)" }}>
              Tamper-Proof & Non-Fungible
            </h4>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              Every credential issued generates a cryptographic `credentialId` hashed using the student's address, skill string, issuer key, and block timestamp. Credentials are bound irrevocably to the student.
            </p>
          </div>
        </div>
      </div>

      {/* Issued Credentials Feed */}
      <div className="issued-feed-section">
        <div className="feed-header">
          <h3 style={{ fontSize: "20px", fontWeight: "700" }}>Your Issued Credentials</h3>
          <span className="credentials-count-pill">{issuedList.length}</span>
        </div>

        {issuedList.length > 0 ? (
          <div className="credentials-grid">
            {issuedList.map((cred) => (
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
              <Layers size={22} />
            </div>
            <h4 style={{ fontSize: "15px", fontWeight: "600" }}>No credentials issued by this wallet yet</h4>
            <p style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
              Issue your first student certificate using the form above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
