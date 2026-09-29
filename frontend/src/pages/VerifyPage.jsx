import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  QrCode, 
  ExternalLink, 
  Calendar, 
  User, 
  ArrowLeft,
  Search,
  Database
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { CONTRACT_ADDRESS, MONAD_TESTNET_CONFIG } from "../config/contractConfig";
import { QRCodeModal } from "../components/QRCodeModal";
import "./VerifyPage.css";

export function VerifyPage() {
  const { credentialId } = useParams();
  const { getReadOnlyContract } = useWeb3();

  const [credential, setCredential] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);
  const [showQR, setShowQR] = useState(false);

  // Validate bytes32 format
  const isBytes32 = /^0x[a-fA-F0-9]{64}$/.test(credentialId || "");

  useEffect(() => {
    async function verify() {
      if (!isBytes32) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const contract = getReadOnlyContract();
        const [rawCred, validStatus] = await Promise.all([
          contract.getCredential(credentialId),
          contract.isValidCredential(credentialId),
        ]);

        setCredential({
          credentialId: rawCred.credentialId,
          student: rawCred.student,
          skill: rawCred.skill,
          issuer: rawCred.issuer,
          metadataHash: rawCred.metadataHash,
          issuedAt: rawCred.issuedAt.toString(),
          revoked: rawCred.revoked,
        });
        setIsValid(validStatus);
      } catch (err) {
        console.error("Verification query error:", err);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [credentialId, isBytes32, getReadOnlyContract]);

  const copyField = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formattedDate = credential
    ? new Date(Number(credential.issuedAt) * 1000).toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "medium",
      })
    : "";

  const pageUrl = window.location.href;

  if (!isBytes32) {
    return (
      <div className="container" style={{ padding: "60px 0" }}>
        <div className="connect-prompt-card">
          <XCircle size={40} color="#f43f5e" />
          <h3 className="connect-title">Invalid Credential Hash</h3>
          <p className="connect-desc">
            A valid credential ID must be a 32-byte hexadecimal string (66 characters starting with 0x...).
          </p>
          <Link to="/verify/search" className="btn-primary">
            <Search size={14} />
            <span>Search Another ID</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container verify-page">
      <div>
        <Link to="/verify/search" className="btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }}>
          <ArrowLeft size={13} />
          <span>Search Again</span>
        </Link>
      </div>

      <div className="verify-card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "var(--bg-surface)", border: "1px solid var(--border-medium)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
              <ShieldCheck size={26} className="spin" />
            </div>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-highlight)" }}>Validating Cryptographic Consensus</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                Reading state directly from EVM blockchain contract consensus (0xc6Bf...8e6f)...
              </p>
            </div>
            <div style={{ width: "240px", height: "4px", background: "var(--bg-surface-elevated)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ width: "100%", height: "100%", background: "var(--accent-primary)", animation: "skeleton-sweep 1.2s infinite" }} />
            </div>
          </div>
        ) : credential ? (
          <>
            {/* Header */}
            <div className="verify-header">
              <div className="verify-skill-wrap">
                <span className="trust-badge" style={{ width: "fit-content" }}>
                  <span className="trust-badge-dot" />
                  Blockchain Credential Audit
                </span>
                <h2 className="verify-skill-title">{credential.skill}</h2>
              </div>

              <div>
                {credential.revoked ? (
                  <span className="verify-status-badge revoked">
                    <XCircle size={16} />
                    <span>CRYPTOGRAPHICALLY REVOKED</span>
                  </span>
                ) : isValid ? (
                  <span className="verify-status-badge valid">
                    <CheckCircle2 size={16} />
                    <span>VERIFIED ON-CHAIN (VALID)</span>
                  </span>
                ) : (
                  <span className="verify-status-badge revoked">
                    <XCircle size={16} />
                    <span>UNVERIFIED / INVALID</span>
                  </span>
                )}
              </div>
            </div>

            {/* Audit Table */}
            <div className="audit-table">
              <div className="audit-row">
                <span className="audit-label">
                  <ShieldCheck size={14} color="#f26c36" /> Credential ID
                </span>
                <div className="audit-val-wrap">
                  <span className="audit-value">{credential.credentialId}</span>
                  <button onClick={() => copyField(credential.credentialId, "id")} className="btn-icon-copy">
                    {copiedField === "id" ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="audit-row">
                <span className="audit-label">
                  <User size={14} color="#f26c36" /> Student Address
                </span>
                <div className="audit-val-wrap">
                  <Link to={`/vault/${credential.student}`} className="audit-value" style={{ color: "var(--accent-primary)", textDecoration: "underline" }}>
                    {credential.student}
                  </Link>
                  <button onClick={() => copyField(credential.student, "student")} className="btn-icon-copy">
                    {copiedField === "student" ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="audit-row">
                <span className="audit-label">
                  <ShieldCheck size={14} color="#f26c36" /> Authorized Issuer
                </span>
                <div className="audit-val-wrap">
                  <span className="audit-value">{credential.issuer}</span>
                  <button onClick={() => copyField(credential.issuer, "issuer")} className="btn-icon-copy">
                    {copiedField === "issuer" ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="audit-row">
                <span className="audit-label">
                  <Calendar size={14} color="#f26c36" /> Issue Timestamp
                </span>
                <span className="audit-value">{formattedDate}</span>
              </div>

              <div className="audit-row">
                <span className="audit-label">
                  <Database size={14} color="#f26c36" /> Metadata Proof
                </span>
                <span className="audit-value">{credential.metadataHash}</span>
              </div>

              <div className="audit-row">
                <span className="audit-label">
                  <ShieldCheck size={14} color="#f26c36" /> Smart Contract
                </span>
                <a
                  href={`${MONAD_TESTNET_CONFIG.explorerUrl}/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="audit-value"
                  style={{ color: "var(--accent-primary)", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span>{CONTRACT_ADDRESS}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="verify-actions-row">
              <button onClick={() => setShowQR(true)} className="btn-secondary">
                <QrCode size={14} />
                <span>Verification QR</span>
              </button>

              <Link to={`/vault/${credential.student}`} className="btn-primary">
                <span>View Sovereign CredoVault</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <XCircle size={36} color="#f43f5e" style={{ margin: "0 auto 12px auto" }} />
            <h3 style={{ fontSize: "18px", color: "var(--text-highlight)" }}>Credential Not Found</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px" }}>
              No record was found on Monad EVM for this credential ID.
            </p>
          </div>
        )}
      </div>

      {showQR && (
        <QRCodeModal
          url={pageUrl}
          title={`Verify: ${credential?.skill}`}
          description="Point any smartphone camera to check mathematical validity on Monad."
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
