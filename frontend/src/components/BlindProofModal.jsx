import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Sparkles, 
  EyeOff, 
  Fingerprint,
  CheckCircle2
} from "lucide-react";
import "./BlindProofModal.css";

export function BlindProofModal({ credential, onClose }) {
  const [loading, setLoading] = useState(false);
  const [proofData, setProofData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const generateBlindProof = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/proof/blind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentialId: credential.credentialId,
          skillTitle: credential.skill,
          issuerAddress: credential.issuer,
          issuerName: credential.metadata?.issuer || "Accredited Web3 Authority",
          issuedAt: new Date(Number(credential.issuedAt) * 1000).toISOString(),
          expiresAt: credential.metadata?.expiresAt || 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProofData(data);
      } else {
        setError(data.error || "Failed to generate blind proof.");
      }
    } catch (err) {
      setError(err.message || "Network error generating blind proof.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!proofData) return;
    const url = `${window.location.origin}/verify/blind/${proofData.proofId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="blind-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="blind-modal-header">
          <div className="blind-header-left">
            <div className="blind-icon-badge">
              <EyeOff size={18} color="#e36128" />
            </div>
            <div>
              <h3 className="blind-modal-title">Zero-Knowledge Blind Hiring Proof</h3>
              <p className="blind-modal-sub">Bias-Free Cryptographic Verification</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-modal-close" title="Close">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="blind-modal-body">
          <div className="blind-explain-box">
            <div className="blind-explain-icon">
              <Lock size={15} color="#10b981" />
            </div>
            <p>
              <strong>What is Blind Proof?</strong> Employers can verify your certified skill on the blockchain without seeing your real name, gender, or wallet history. This ensures 100% merit-based, bias-free technical screening.
            </p>
          </div>

          <div className="blind-cred-summary">
            <div className="blind-summary-row">
              <span className="summary-label">Certified Skill</span>
              <span className="summary-val highlight">{credential.skill}</span>
            </div>
            <div className="blind-summary-row">
              <span className="summary-label">Issuing Authority</span>
              <span className="summary-val mono">
                {credential.issuer ? `${credential.issuer.slice(0, 6)}...${credential.issuer.slice(-4)}` : "Verified Issuer"}
              </span>
            </div>
            <div className="blind-summary-row">
              <span className="summary-label">Blockchain Anchor</span>
              <span className="summary-val mono">
                {credential.credentialId.slice(0, 10)}...{credential.credentialId.slice(-8)}
              </span>
            </div>
          </div>

          {error && <div className="blind-error-box">{error}</div>}

          {!proofData ? (
            <div className="blind-action-cta">
              <p className="blind-cta-desc">
                Generate a cryptographic HMAC SHA-256 commitment binding your credential on-chain to an anonymous candidate code.
              </p>
              <button
                onClick={generateBlindProof}
                disabled={loading}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "12px", gap: "8px" }}
              >
                {loading ? (
                  <>
                    <Fingerprint size={16} className="spin" />
                    <span>Generating Cryptographic Proof...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate Blind Hiring Proof</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="blind-result-box">
              <div className="blind-success-badge">
                <CheckCircle2 size={16} color="#10b981" />
                <span>Cryptographic Proof Generated Successfully</span>
              </div>

              <div className="blind-fields-list">
                <div className="blind-field-item">
                  <span className="field-name">Anonymous Candidate ID:</span>
                  <span className="field-val badge-accent">{proofData.blindCandidateCode}</span>
                </div>

                <div className="blind-field-item">
                  <span className="field-name">Cryptographic Commitment:</span>
                  <span className="field-val mono-hash">{proofData.proof.proofCommitmentHash.slice(0, 24)}...</span>
                </div>

                <div className="blind-field-item">
                  <span className="field-name">Public Verification Link:</span>
                  <div className="blind-url-input-wrap">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/verify/blind/${proofData.proofId}`}
                      className="blind-url-input"
                    />
                    <button onClick={copyLink} className="btn-copy-action" title="Copy Link">
                      {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="blind-footer-actions">
                <a
                  href={`/verify/blind/${proofData.proofId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "12.5px" }}
                >
                  <span>Open Blind Recruiter Dossier</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
