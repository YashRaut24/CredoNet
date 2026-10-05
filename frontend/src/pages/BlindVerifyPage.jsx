import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Check, 
  Fingerprint, 
  Building2, 
  Calendar, 
  Cpu, 
  Sparkles,
  ArrowRight,
  UserCheck
} from "lucide-react";
import "./BlindVerifyPage.css";

export function BlindVerifyPage() {
  const { proofId } = useParams();
  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    async function fetchProof() {
      setLoading(true);
      try {
        const res = await fetch(`/api/proof/blind/${proofId}`);
        const data = await res.json();
        if (data.success) {
          setProof(data.proof);
        } else {
          setError(data.error || "Blind verification claim not found.");
        }
      } catch (err) {
        setError(err.message || "Failed to load verification claim.");
      } finally {
        setLoading(false);
      }
    }
    if (proofId) {
      fetchProof();
    }
  }, [proofId]);

  const copyProof = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="container blind-page-wrap">
        <div className="blind-loading-box">
          <Fingerprint size={36} className="spin" color="#e36128" />
          <h3>Verifying Zero-Knowledge Commitment...</h3>
          <p>Auditing cryptographic proof against Monad EVM blockchain consensus</p>
        </div>
      </div>
    );
  }

  if (error || !proof) {
    return (
      <div className="container blind-page-wrap">
        <div className="blind-error-card">
          <AlertTriangle size={36} color="#f43f5e" />
          <h2>Proof Verification Failed</h2>
          <p>{error || "The requested blind proof claim does not exist or has expired."}</p>
          <Link to="/verify/search" className="btn-secondary" style={{ marginTop: "14px" }}>
            Return to Public Verifier
          </Link>
        </div>
      </div>
    );
  }

  const isValid = proof.status === "VALID";
  const isRevoked = proof.status === "REVOKED";
  const isExpired = proof.status === "EXPIRED";

  const formattedDate = new Date(proof.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="container blind-page-wrap">
      {/* Top Banner */}
      <div className="blind-hero">
        <div className="blind-tagline">
          <Lock size={13} color="#10b981" />
          <span>CRYPTOGRAPHIC BLIND HIRING DOSSIER</span>
        </div>
        <h1 className="blind-title">Zero-Bias Skill Verification</h1>
        <p className="blind-desc">
          This candidate has submitted a cryptographic proof verifying that they hold an authentic, unrevoked credential on the blockchain. Personal identifying details are hidden to guarantee fair, bias-free screening.
        </p>
      </div>

      {/* Main Dossier Card */}
      <div className="blind-dossier-card">
        {/* Verification Status Banner */}
        <div className={`blind-status-banner ${isValid ? "status-valid" : isRevoked ? "status-revoked" : "status-expired"}`}>
          <div className="status-banner-left">
            {isValid ? (
              <CheckCircle2 size={24} color="#10b981" />
            ) : isRevoked ? (
              <XCircle size={24} color="#f43f5e" />
            ) : (
              <AlertTriangle size={24} color="#f59e0b" />
            )}
            <div>
              <h3 className="status-heading">
                {isValid ? "AUTHENTIC BLOCKCHAIN CREDENTIAL VERIFIED" : isRevoked ? "CREDENTIAL REVOKED ON-CHAIN" : "CERTIFICATION EXPIRED"}
              </h3>
              <p className="status-sub">
                {isValid 
                  ? "Tamper-proof smart contract integrity verified with zero fraud detection."
                  : isRevoked
                  ? "This credential was revoked by the issuing authority."
                  : "This certification has reached its expiration date and requires re-certification."}
              </p>
            </div>
          </div>
          <div className="status-pill-wrap">
            <span className={`status-pill ${isValid ? "valid" : isRevoked ? "revoked" : "expired"}`}>
              {proof.status}
            </span>
          </div>
        </div>

        {/* Dossier Body */}
        <div className="dossier-body">
          {/* Candidate Code Box */}
          <div className="candidate-code-box">
            <div className="code-box-left">
              <span className="code-label">ANONYMOUS APPLICANT IDENTIFIER</span>
              <h2 className="code-val">{proof.blindCandidateCode}</h2>
              <span className="code-hint">Identity blinded for initial technical evaluation</span>
            </div>
            <div className="code-box-right">
              <span className="certified-badge">
                <ShieldCheck size={14} /> Verified Holder
              </span>
            </div>
          </div>

          {/* Core Verified Data Grid */}
          <div className="dossier-grid">
            <div className="dossier-item">
              <span className="dossier-label">Certified Competency / Skill</span>
              <span className="dossier-value highlight">{proof.skillTitle}</span>
            </div>

            <div className="dossier-item">
              <span className="dossier-label">Accredited Issuing Authority</span>
              <span className="dossier-value">{proof.issuerName}</span>
              <span className="dossier-mono">{proof.issuerAddress}</span>
            </div>

            <div className="dossier-item">
              <span className="dossier-label">Issue Date</span>
              <span className="dossier-value">{formattedDate}</span>
            </div>

            <div className="dossier-item">
              <span className="dossier-label">Blockchain Consensus Layer</span>
              <span className="dossier-value">Monad EVM Testnet (Chain ID 10143)</span>
              <span className="dossier-mono">Contract: {proof.blockchainContract}</span>
            </div>
          </div>

          {/* Cryptographic Commitment Proof Box */}
          <div className="commitment-box">
            <div className="commitment-header">
              <Fingerprint size={15} color="#e36128" />
              <span>CRYPTOGRAPHIC HMAC SHA-256 ZERO-KNOWLEDGE COMMITMENT</span>
            </div>
            <p className="commitment-text">
              The candidate proved possession of the underlying private credential signature without publishing their raw wallet address or personal name.
            </p>
            <div className="commitment-hash-wrap">
              <span className="hash-code">{proof.proofCommitmentHash}</span>
              <button onClick={copyProof} className="btn-copy-small" title="Copy Proof URL">
                {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Recruiter Evaluation Actions */}
          <div className="recruiter-action-card">
            {accepted ? (
              <div className="recruiter-accepted-box">
                <UserCheck size={20} color="#10b981" />
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#10b981" }}>
                    Candidate Fast-Tracked to Technical Interview!
                  </h4>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Candidate ID {proof.blindCandidateCode} was confirmed for verified competency in "{proof.skillTitle}".
                  </p>
                </div>
              </div>
            ) : (
              <div className="recruiter-prompt">
                <div>
                  <h4 style={{ fontSize: "14.5px", fontWeight: "700", color: "var(--text-highlight)" }}>
                    Ready to proceed with this candidate?
                  </h4>
                  <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Verified on-chain credentials eliminate the need for preliminary resume background checks.
                  </p>
                </div>
                <button
                  onClick={() => setAccepted(true)}
                  className="btn-primary"
                  style={{ padding: "9px 18px", fontSize: "13px", gap: "6px" }}
                >
                  <Sparkles size={14} />
                  <span>Fast-Track to Interview</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
