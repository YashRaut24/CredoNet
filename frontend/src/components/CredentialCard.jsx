import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  User, 
  Calendar, 
  QrCode, 
  ExternalLink,
  AlertTriangle,
  FolderGit2,
  Award,
  Info
} from "lucide-react";
import { QRCodeModal } from "./QRCodeModal";
import { CredentialDetailModal } from "./CredentialDetailModal";
import "./CredentialCard.css";

export function CredentialCard({ 
  credential, 
  isIssuerView = false, 
  onRevoke, 
  isRevoking = false 
}) {
  const [showQR, setShowQR] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const isProject = credential.skill?.startsWith("[Project]") || 
                    credential.skill?.toLowerCase().startsWith("project:") ||
                    credential.metadata?.type === "project";

  const displayTitle = credential.skill
    ? credential.skill.replace(/^\[Project\]\s*/i, "").replace(/^project:\s*/i, "")
    : "Untitled Credential";

  const formattedDate = new Date(Number(credential.issuedAt) * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const verifyUrl = `${window.location.origin}/verify/${credential.credentialId}`;
  const evidenceName = credential.evidenceProject || credential.metadata?.evidenceProject;

  return (
    <>
      <div className="credential-card">
        {/* Top Info */}
        <div className="card-top">
          <div className="card-top-info">
            <span className={`card-category ${isProject ? "category-project" : "category-skill"}`} style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              {isProject ? <FolderGit2 size={12} color="#38bdf8" /> : <Award size={12} color="#f26c36" />}
              <span>{isProject ? "Verified Capstone Project" : "Verified Skill Credential"}</span>
            </span>
            <h3 className="card-skill-title">{displayTitle}</h3>
          </div>
          <div className="card-top-status">
            {credential.revoked ? (
              <span className="status-pill revoked" title="Credential has been revoked">
                <XCircle size={12} />
                <span>REVOKED</span>
              </span>
            ) : (
              <span className="status-pill valid" title="Credential is cryptographically valid">
                <CheckCircle2 size={12} />
                <span>VALID</span>
              </span>
            )}
          </div>
        </div>

        {/* Details List */}
        <div className="card-details">
          <div className="card-row">
            <span className="card-label">
              <User size={13} color="#f26c36" /> Student
            </span>
            <span className="card-value">
              {credential.student.slice(0, 6)}...{credential.student.slice(-4)}
            </span>
          </div>

          <div className="card-row">
            <span className="card-label">
              <ShieldCheck size={13} color="#f26c36" /> Issuer
            </span>
            <span className="card-value">
              {credential.issuer.slice(0, 6)}...{credential.issuer.slice(-4)}
            </span>
          </div>

          {evidenceName && (
            <div className="card-row">
              <span className="card-label">
                <FolderGit2 size={13} color="#38bdf8" /> Evidence
              </span>
              <span className="card-value" style={{ color: "#38bdf8", fontWeight: "600" }}>
                {evidenceName}
              </span>
            </div>
          )}

          <div className="card-row">
            <span className="card-label">
              <Calendar size={13} color="#f26c36" /> Issued
            </span>
            <span className="card-value">{formattedDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="card-actions">
          <div className="card-action-group">
            <button
              onClick={() => setShowDetail(true)}
              className="btn-card-action btn-detail-action"
              title="View full cryptographic details"
            >
              <Info size={12} />
              <span>Details</span>
            </button>

            <Link to={`/verify/${credential.credentialId}`} className="btn-card-action btn-verify-link">
              <span>Verify</span>
              <ExternalLink size={12} />
            </Link>

            <button
              onClick={() => setShowQR(true)}
              className="btn-card-action btn-qr-action"
              title="Share QR Code"
            >
              <QrCode size={13} />
              <span>QR</span>
            </button>
          </div>

          {isIssuerView && !credential.revoked && onRevoke && (
            <button
              onClick={() => onRevoke(credential.credentialId)}
              disabled={isRevoking}
              className="btn-card-action btn-revoke"
              title="Revoke credential on-chain"
            >
              <AlertTriangle size={12} />
              <span>{isRevoking ? "Revoking..." : "Revoke"}</span>
            </button>
          )}
        </div>
      </div>

      {showDetail && (
        <CredentialDetailModal
          credential={credential}
          onClose={() => setShowDetail(false)}
        />
      )}

      {showQR && (
        <QRCodeModal
          url={verifyUrl}
          title={`Verify: ${credential.skill}`}
          description={`Cryptographic proof for ${credential.student.slice(0, 6)}...${credential.student.slice(-4)} verified on-chain via CredoNet.`}
          onClose={() => setShowQR(false)}
        />
      )}
    </>
  );
}
