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
  AlertTriangle
} from "lucide-react";
import { QRCodeModal } from "./QRCodeModal";
import "./CredentialCard.css";

export function CredentialCard({ 
  credential, 
  isIssuerView = false, 
  onRevoke, 
  isRevoking = false 
}) {
  const [showQR, setShowQR] = useState(false);

  const formattedDate = new Date(Number(credential.issuedAt) * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const verifyUrl = `${window.location.origin}/verify/${credential.credentialId}`;

  return (
    <>
      <div className="credential-card">
        {/* Top Info */}
        <div className="card-top">
          <div>
            <span className="card-category">Verified Skill Credential</span>
            <h3 className="card-skill-title">{credential.skill}</h3>
          </div>
          <div>
            {credential.revoked ? (
              <span className="status-pill revoked">
                <XCircle size={12} />
                REVOKED
              </span>
            ) : (
              <span className="status-pill valid">
                <CheckCircle2 size={12} />
                VALID
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

          <div className="card-row">
            <span className="card-label">
              <Calendar size={13} color="#f26c36" /> Issued
            </span>
            <span className="card-value">{formattedDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="card-actions">
          <div style={{ display: "flex", gap: "8px" }}>
            <Link to={`/verify/${credential.credentialId}`} className="btn-card-action btn-verify-link">
              <span>Inspect</span>
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
            >
              <AlertTriangle size={12} />
              <span>{isRevoking ? "Revoking..." : "Revoke"}</span>
            </button>
          )}
        </div>
      </div>

      {showQR && (
        <QRCodeModal
          url={verifyUrl}
          title={`Verify: ${credential.skill}`}
          description={`Cryptographic proof for ${credential.student.slice(0, 6)}...${credential.student.slice(-4)} issued on Monad EVM.`}
          onClose={() => setShowQR(false)}
        />
      )}
    </>
  );
}
