import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Calendar, 
  User, 
  Building2, 
  Database, 
  X, 
  FolderGit2,
  FileCheck
} from "lucide-react";
import { MONAD_TESTNET_CONFIG, CONTRACT_ADDRESS } from "../config/contractConfig";
import "./CredentialDetailModal.css";

export function CredentialDetailModal({ credential, onClose }) {
  const [copiedField, setCopiedField] = useState(null);

  if (!credential) return null;

  const copyField = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formattedDate = new Date(Number(credential.issuedAt) * 1000).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  const isProject = credential.skill?.startsWith("[Project]") || credential.skill?.toLowerCase().startsWith("project:");
  const displayTitle = credential.skill
    ? credential.skill.replace(/^\[Project\]\s*/i, "").replace(/^project:\s*/i, "")
    : "Credential";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog credential-detail-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="modal-icon-wrap">
              <ShieldCheck size={20} color="var(--accent-primary)" />
            </div>
            <div>
              <span className="modal-tag">Official Monad EVM Credential</span>
              <h3 className="modal-title">{displayTitle}</h3>
            </div>
          </div>
          <button onClick={onClose} className="btn-close-modal" title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Status Strip */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-surface)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {credential.revoked ? (
              <span className="verify-status-badge revoked" style={{ padding: "4px 10px", fontSize: "12px" }}>
                <XCircle size={14} />
                <span>✕ REVOKED</span>
              </span>
            ) : (
              <span className="verify-status-badge valid" style={{ padding: "4px 10px", fontSize: "12px" }}>
                <CheckCircle2 size={14} />
                <span>✓ VALID ON MONAD</span>
              </span>
            )}
          </div>
          <span style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
            Anchor: Monad Testnet (10143)
          </span>
        </div>

        {/* Details Table */}
        <div className="modal-body-scroll">
          {/* Linked Evidence (if present) */}
          {credential.evidenceProject && (
            <div style={{
              margin: "14px 24px 6px 24px",
              padding: "12px 16px",
              background: "rgba(56, 189, 248, 0.08)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <FolderGit2 size={18} color="#38bdf8" />
              <div>
                <span style={{ fontSize: "10.5px", fontFamily: "var(--font-mono)", color: "#38bdf8", fontWeight: "700", textTransform: "uppercase" }}>
                  LINKED PORTFOLIO EVIDENCE
                </span>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-highlight)", marginTop: "2px" }}>
                  {credential.evidenceProject}
                </p>
              </div>
            </div>
          )}

          <div className="audit-table" style={{ margin: "14px 24px 24px 24px" }}>
            <div className="audit-row">
              <span className="audit-label">
                <FileCheck size={14} color="#f26c36" /> Credential ID
              </span>
              <div className="audit-val-wrap">
                <span className="audit-value">{credential.credentialId}</span>
                <button onClick={() => copyField(credential.credentialId, "id")} className="btn-icon-copy" title="Copy">
                  {copiedField === "id" ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <div className="audit-row">
              <span className="audit-label">
                <User size={14} color="#f26c36" /> Student Wallet
              </span>
              <div className="audit-val-wrap">
                <span className="audit-value">{credential.student}</span>
                <button onClick={() => copyField(credential.student, "student")} className="btn-icon-copy" title="Copy">
                  {copiedField === "student" ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <div className="audit-row">
              <span className="audit-label">
                <Building2 size={14} color="#f26c36" /> Authorized Issuer
              </span>
              <div className="audit-val-wrap">
                <span className="audit-value">{credential.issuer}</span>
                <button onClick={() => copyField(credential.issuer, "issuer")} className="btn-icon-copy" title="Copy">
                  {copiedField === "issuer" ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <div className="audit-row">
              <span className="audit-label">
                <Calendar size={14} color="#f26c36" /> Issued Timestamp
              </span>
              <span className="audit-value">{formattedDate}</span>
            </div>

            <div className="audit-row">
              <span className="audit-label">
                <Database size={14} color="#f26c36" /> Metadata Reference
              </span>
              <span className="audit-value">{credential.metadataHash || "ipfs://QmDefaultHash"}</span>
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
                style={{ color: "var(--accent-primary)", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <span>{CONTRACT_ADDRESS}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions" style={{ padding: "16px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          <Link
            to={`/verify/${credential.credentialId}`}
            className="btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <ShieldCheck size={14} />
            <span>Verify on Monad</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
