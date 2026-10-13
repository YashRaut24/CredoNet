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
  const isCertificate = credential.skill?.startsWith("[Certificate]") || credential.skill?.toLowerCase().startsWith("certificate:");
  const displayTitle = credential.skill
    ? credential.skill.replace(/^\[(Project|Certificate)\]\s*/i, "").replace(/^(project|certificate):\s*/i, "")
    : "Credential";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog credential-detail-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className={`modal-icon-wrap ${isCertificate ? "certificate-icon-wrap" : ""}`}>
              {isCertificate ? (
                <FileCheck size={20} color="#10b981" />
              ) : (
                <ShieldCheck size={20} color="var(--accent-primary)" />
              )}
            </div>
            <div>
              <span className={`modal-tag ${isCertificate ? "certificate-tag" : ""}`}>
                {isCertificate ? "Official Academic Degree / Certificate" : "Official Verified Credential"}
              </span>
              <h3 className="modal-title">{displayTitle}</h3>
            </div>
          </div>
          <button onClick={onClose} className="btn-close-modal" title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Status Strip */}
        <div className="modal-status-strip">
          <div className="modal-status-strip-left">
            {credential.revoked ? (
              <span className="verify-status-badge revoked">
                <XCircle size={14} />
                <span>✕ REVOKED</span>
              </span>
            ) : (
              <span className="verify-status-badge valid">
                <CheckCircle2 size={14} />
                <span>✓ AUTHENTIC & ACTIVE</span>
              </span>
            )}
          </div>
          <span className="modal-anchor-hint">
            Network: Verified Registry
          </span>
        </div>

        {/* Details Table */}
        <div className="modal-body-scroll">
          {/* Linked Evidence (if present) */}
          {credential.evidenceProject && (
            <div className="modal-evidence-box">
              <FolderGit2 size={18} color="var(--accent-primary)" />
              <div>
                <span className="modal-evidence-tag">
                  LINKED PORTFOLIO EVIDENCE
                </span>
                <p className="modal-evidence-title">
                  {credential.evidenceProject}
                </p>
              </div>
            </div>
          )}

          {/* Linked Degree Document (if certificate) */}
          {isCertificate && (
            <div className="modal-evidence-box certificate-modal-evidence-box">
              <FileCheck size={18} color="#10b981" />
              <div>
                <span className="modal-evidence-tag certificate-evidence-tag">
                  ACCREDITED DEGREE / CERTIFICATE ARTIFACT
                </span>
                <p className="modal-evidence-title">
                  {credential.certificateFileName || displayTitle}
                </p>
                {credential.certificateFileHash && (
                  <span className="modal-evidence-hash">
                    Digital Fingerprint: {credential.certificateFileHash}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="audit-table modal-audit-table">
            <div className="audit-row">
              <span className="audit-label">
                <FileCheck size={14} color="var(--accent-primary)" /> Credential ID
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
                <User size={14} color="var(--accent-primary)" /> Student Wallet
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
                <Building2 size={14} color="var(--accent-primary)" /> Authorized Issuer
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
                <Calendar size={14} color="var(--accent-primary)" /> Issued Timestamp
              </span>
              <span className="audit-value">{formattedDate}</span>
            </div>

            <div className="audit-row">
              <span className="audit-label">
                <Database size={14} color="var(--accent-primary)" /> Metadata Reference
              </span>
              <span className="audit-value">{credential.metadataHash || "ipfs://QmDefaultHash"}</span>
            </div>

            <div className="audit-row">
              <span className="audit-label">
                <ShieldCheck size={14} color="var(--accent-primary)" /> Official Registry Contract
              </span>
              <a
                href={`${MONAD_TESTNET_CONFIG.explorerUrl}/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="audit-value audit-link-external"
              >
                <span>{CONTRACT_ADDRESS}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions-bar">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          <Link
            to={`/verify/${credential.credentialId}`}
            className="btn-primary modal-verify-btn"
          >
            <ShieldCheck size={14} />
            <span>Verify Credential</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
