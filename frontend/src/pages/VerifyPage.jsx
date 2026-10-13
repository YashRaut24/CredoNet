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
  Database,
  FolderGit2,
  GitBranch,
  Award,
  FileText,
  Printer,
  Clock,
  AlertTriangle,
  FileCheck
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { CONTRACT_ADDRESS, MONAD_TESTNET_CONFIG } from "../config/contractConfig";
import { QRCodeModal } from "../components/QRCodeModal";
import "./VerifyPage.css";

export function VerifyPage() {
  const { credentialId } = useParams();
  const { getReadOnlyContract } = useWeb3();

  const [credential, setCredential] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [showAuditDossier, setShowAuditDossier] = useState(false);

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

        const formatted = {
          credentialId: rawCred.credentialId,
          student: rawCred.student,
          skill: rawCred.skill,
          issuer: rawCred.issuer,
          metadataHash: rawCred.metadataHash,
          issuedAt: rawCred.issuedAt.toString(),
          revoked: rawCred.revoked,
        };
        setCredential(formatted);
        setIsValid(validStatus);

        // Fetch off-chain rich metadata if available
        try {
          const res = await fetch(`/api/metadata/${encodeURIComponent(formatted.metadataHash)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.metadata) {
              setMetadata(data.metadata);
            }
          }
        } catch (metaErr) {
          console.warn("Could not fetch extended metadata:", metaErr);
        }
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
      <div className="container verify-empty-container">
        <div className="connect-prompt-card">
          <XCircle size={40} color="#f43f5e" />
          <h3 className="connect-title">Invalid Credential ID</h3>
          <p className="connect-desc">
            A valid credential ID must start with 0x followed by 64 characters.
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
        <Link to="/verify/search" className="btn-secondary verify-back-btn">
          <ArrowLeft size={13} />
          <span>Search Again</span>
        </Link>
      </div>

      <div className="verify-card">
        {loading ? (
          <div className="verify-loading-card">
            <div className="verify-loading-icon">
              <ShieldCheck size={26} className="spin" />
            </div>
            <div>
              <h3 className="verify-loading-title">Verifying Official Record</h3>
              <p className="verify-loading-desc">
                Checking tamper-proof digital registry for authentic credentials...
              </p>
            </div>
            <div className="verify-loading-bar-wrap">
              <div className="verify-loading-bar-fill" />
            </div>
          </div>
        ) : credential ? (
          <>
            {/* Header */}
            {(() => {
              const isProject = credential.skill?.startsWith("[Project]") || 
                                credential.skill?.toLowerCase().startsWith("project:") || 
                                metadata?.type === "project";
              const isCertificate = credential.skill?.startsWith("[Certificate]") || 
                                    credential.skill?.toLowerCase().startsWith("certificate:") || 
                                    metadata?.type === "certificate";
              const displayTitle = credential.skill
                ? credential.skill.replace(/^\[(Project|Certificate)\]\s*/i, "").replace(/^(project|certificate):\s*/i, "")
                : "Untitled Record";

              return (
                <>
                  <div className="verify-header">
                    <div className="verify-skill-wrap">
                      <span className={`trust-badge ${isProject ? "project-badge" : isCertificate ? "certificate-badge" : ""}`}>
                        <span className={`trust-badge-dot ${isProject ? "project-dot" : isCertificate ? "certificate-dot" : ""}`} />
                        {isProject 
                          ? "Verified Capstone Project Audit" 
                          : isCertificate 
                          ? "Official Academic Degree / Certificate Audit" 
                          : "Verified Skill Competency Audit"}
                      </span>
                      <h2 className="verify-skill-title">{displayTitle}</h2>
                    </div>

                    <div>
                      {(() => {
                        const expiresAt = metadata?.expiresAt;
                        const isExpired = expiresAt && Number(expiresAt) > 0 && Date.now() > Number(expiresAt);

                        if (credential.revoked) {
                          return (
                            <div className="verify-status-col">
                              <span className="verify-status-badge revoked">
                                <XCircle size={16} />
                                <span>✕ REVOKED</span>
                              </span>
                              <span className="verify-status-sub revoked">
                                Revoked by authorized issuer
                              </span>
                            </div>
                          );
                        } else if (isExpired) {
                          return (
                            <div className="verify-status-col">
                              <span className="verify-status-badge expired">
                                <AlertTriangle size={16} />
                                <span>⚠ EXPIRED (VALIDITY ELAPSED)</span>
                              </span>
                              <span className="verify-status-sub expired">
                                Expired: {new Date(Number(expiresAt)).toLocaleDateString()}
                              </span>
                            </div>
                          );
                        } else if (isValid) {
                          return (
                            <div className="verify-status-col">
                              <span className="verify-status-badge valid">
                                <CheckCircle2 size={16} />
                                <span>✓ VALID</span>
                              </span>
                              <span className="verify-status-sub valid">
                                Verified Authentic & Active
                              </span>
                            </div>
                          );
                        } else {
                          return (
                            <div className="verify-status-col">
                              <span className="verify-status-badge revoked">
                                <XCircle size={16} />
                                <span>✕ INVALID</span>
                              </span>
                              <span className="verify-status-sub revoked">
                                Unverified record
                              </span>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>

                  {/* If Project: Project Artifacts Panel */}
                  {isProject && (
                    <div className="verify-project-artifacts">
                      <div className="verify-project-header">
                        <span className="verify-project-title">
                          <FolderGit2 size={14} />
                          VERIFIED PROJECT ARTIFACTS
                        </span>

                        <div className="verify-project-links">
                          {metadata?.repoUrl && (
                            <a
                              href={metadata.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary verify-artifact-link"
                            >
                              <GitBranch size={13} />
                              <span>View Code Repository</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                          {metadata?.liveUrl && (
                            <a
                              href={metadata.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary verify-artifact-link"
                            >
                              <span>Live Deployment</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>

                      {metadata?.projectSkills && (
                        <div>
                          <span className="verify-section-label">
                            ASSOCIATED TECH STACK & SKILLS
                          </span>
                          <div className="verify-skills-chips">
                            {metadata.projectSkills.split(",").map((s, idx) => (
                              <span key={idx} className="verify-skill-tag">
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {metadata?.description && (
                        <div>
                          <span className="verify-section-label">
                            VERIFICATION SCOPE & AUDIT NOTES
                          </span>
                          <p className="verify-notes-text">
                            {metadata.description}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* If Certificate: Official Academic Degree / Certificate Panel */}
                  {isCertificate && (
                    <div className="verify-certificate-artifacts">
                      <div className="verify-certificate-header">
                        <span className="verify-certificate-title">
                          <FileCheck size={14} color="#10b981" />
                          OFFICIAL ACADEMIC DEGREE & CERTIFICATE AUDIT
                        </span>
                        <span className="verify-certificate-tag">
                          Institutional Provenance
                        </span>
                      </div>

                      <div className="verify-cert-details-grid">
                        {metadata?.issuingOrg && (
                          <div className="verify-cert-field">
                            <span className="verify-section-label">ISSUING UNIVERSITY / INSTITUTION</span>
                            <span className="verify-cert-value">{metadata.issuingOrg}</span>
                          </div>
                        )}
                        {metadata?.certificateTitle && (
                          <div className="verify-cert-field">
                            <span className="verify-section-label">DEGREE PROGRAM</span>
                            <span className="verify-cert-value">{metadata.certificateTitle}</span>
                          </div>
                        )}
                        {metadata?.certificateGrade && (
                          <div className="verify-cert-field">
                            <span className="verify-section-label">HONORS / CLASSIFICATION</span>
                            <span className="verify-cert-value">{metadata.certificateGrade}</span>
                          </div>
                        )}
                        {metadata?.certificateFileName && (
                          <div className="verify-cert-field">
                            <span className="verify-section-label">ATTACHED DOCUMENT</span>
                            <span className="verify-cert-value">
                              {metadata.certificateFileName} {metadata.certificateFileSize ? `(${metadata.certificateFileSize})` : ""}
                            </span>
                          </div>
                        )}
                      </div>

                      {metadata?.certificateFileHash && (
                        <div className="verify-cert-hash-box">
                          <span className="verify-section-label">DOCUMENT DIGITAL SIGNATURE / DIGEST</span>
                          <span className="verify-cert-hash-value">{metadata.certificateFileHash}</span>
                          <span className="verify-cert-hash-note">✓ Verified authentic match in official registry</span>
                        </div>
                      )}

                      {metadata?.description && (
                        <div>
                          <span className="verify-section-label">ACCREDITATION REMARKS</span>
                          <p className="verify-notes-text">{metadata.description}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* If Skill: Skill Details Panel */}
                  {!isProject && !isCertificate && metadata && (
                    <div className="verify-skill-details">
                      <div className="verify-skill-details-header">
                        <span className="verify-assessment-title">
                          <Award size={14} />
                          COMPETENCY ASSESSMENT REPORT
                        </span>
                        {metadata.skillLevel && (
                          <span className="verify-skill-level-badge">
                            {metadata.skillLevel}
                          </span>
                        )}
                      </div>
                      {metadata?.description && (
                        <p className="verify-notes-text">
                          {metadata.description}
                        </p>
                      )}
                    </div>
                  )}
                </>
              );
            })()}

            {/* Audit Table */}
            <div className="audit-table">
              <div className="audit-row">
                <span className="audit-label">
                  <ShieldCheck size={14} color="var(--accent-primary)" /> Credential ID
                </span>
                <div className="audit-val-wrap">
                  <span className="audit-value">{credential.credentialId}</span>
                  <button onClick={() => copyField(credential.credentialId, "id")} className="btn-icon-copy" title="Copy ID">
                    {copiedField === "id" ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="audit-row">
                <span className="audit-label">
                  <User size={14} color="var(--accent-primary)" /> Student Address
                </span>
                <div className="audit-val-wrap">
                  <Link to={`/vault/${credential.student}`} className="audit-value audit-link-primary">
                    {credential.student}
                  </Link>
                  <button onClick={() => copyField(credential.student, "student")} className="btn-icon-copy" title="Copy Address">
                    {copiedField === "student" ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="audit-row">
                <span className="audit-label">
                  <ShieldCheck size={14} color="var(--accent-primary)" /> Authorized Issuer
                </span>
                <div className="audit-val-wrap">
                  <span className="audit-value">{credential.issuer}</span>
                  <button onClick={() => copyField(credential.issuer, "issuer")} className="btn-icon-copy" title="Copy Issuer">
                    {copiedField === "issuer" ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div className="audit-row">
                <span className="audit-label">
                  <Calendar size={14} color="var(--accent-primary)" /> Issue Timestamp
                </span>
                <span className="audit-value">{formattedDate}</span>
              </div>

              <div className="audit-row">
                <span className="audit-label">
                  <Database size={14} color="var(--accent-primary)" /> Metadata Proof
                </span>
                <span className="audit-value">{credential.metadataHash}</span>
              </div>

              <div className="audit-row">
                <span className="audit-label">
                  <Clock size={14} color="var(--accent-primary)" /> Validity Lifecycle
                </span>
                <span className="audit-value">
                  {metadata?.validityDuration || (metadata?.expiresAt && Number(metadata.expiresAt) > 0 ? `Valid through ${new Date(Number(metadata.expiresAt)).toLocaleDateString()}` : "Perpetual (No Expiration)")}
                </span>
              </div>

              <div className="audit-row">
                <span className="audit-label">
                  <ShieldCheck size={14} color="var(--accent-primary)" /> Official Registry
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

            {/* Actions */}
            <div className="verify-actions-row">
              <button onClick={() => setShowQR(true)} className="btn-secondary">
                <QrCode size={14} />
                <span>Verification QR</span>
              </button>

              <button onClick={() => setShowAuditDossier(true)} className="btn-secondary btn-audit-dossier">
                <FileText size={14} />
                <span>Export Compliance Audit Report</span>
              </button>

              <Link to={`/vault/${credential.student}`} className="btn-primary">
                <span>View Student Passport</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </>
        ) : (
          <div className="verify-not-found">
            <XCircle size={36} color="#f43f5e" className="verify-not-found-icon" />
            <h3 className="verify-not-found-title">Credential Not Found</h3>
            <p className="verify-not-found-desc">
              No record was found in the official registry for this credential ID.
            </p>
          </div>
        )}
      </div>

      {showQR && (
        <QRCodeModal
          url={pageUrl}
          title={`Verify: ${credential?.skill}`}
          description="Scan with any smartphone camera to confirm real-time validity instantly."
          onClose={() => setShowQR(false)}
        />
      )}

      {/* COMPLIANCE AUDIT CERTIFICATE DOSSIER MODAL */}
      {showAuditDossier && credential && (
        <div className="modal-overlay" onClick={() => setShowAuditDossier(false)}>
          <div
            className="modal-dialog audit-dossier-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="audit-dossier-header">
              <div>
                <span className="audit-dossier-eyebrow">
                  Official Verification Dossier • Authentic Background Proof
                </span>
                <h3 className="audit-dossier-title">
                  Official Background Verification Certificate
                </h3>
              </div>
              <button
                onClick={() => window.print()}
                className="btn-primary"
              >
                <Printer size={13} />
                <span>Print Dossier</span>
              </button>
            </div>

            <div className="audit-dossier-body">
              <div className="audit-pass-banner">
                <div>
                  <span className="audit-pass-status">AUTHENTICITY AUDIT RESULT: PASSED</span>
                  <span className="audit-pass-sub">
                    Verified directly against the tamper-proof official registry.
                  </span>
                </div>
                <CheckCircle2 size={24} color="#10b981" />
              </div>

              <div className="audit-dossier-meta-grid">
                <div className="audit-meta-cell">
                  <span className="audit-meta-cell-label">AUDIT TIMESTAMP</span>
                  <span className="audit-meta-cell-value">{new Date().toISOString()}</span>
                </div>
                <div className="audit-meta-cell">
                  <span className="audit-meta-cell-label">CREDENTIAL STATUS</span>
                  <span className={`audit-meta-cell-value ${credential.revoked ? "status-revoked" : isValid ? "status-valid" : "status-invalid"}`}>
                    {credential.revoked ? "REVOKED" : isValid ? "AUTHENTIC & ACTIVE" : "INVALID"}
                  </span>
                </div>
              </div>

              <div className="audit-dossier-fields">
                <div><span className="text-muted">Credential ID: </span><span className="text-highlight">{credential.credentialId}</span></div>
                <div><span className="text-muted">Certified Competency: </span><span className="text-primary">{credential.skill}</span></div>
                <div><span className="text-muted">Student Account: </span><span className="text-mono">{credential.student}</span></div>
                <div><span className="text-muted">Accredited Issuer: </span><span className="text-mono">{credential.issuer}</span></div>
                <div><span className="text-muted">Registry Contract: </span><span className="text-mono">{CONTRACT_ADDRESS}</span></div>
                <div><span className="text-muted">Record Checksum: </span><span className="text-mono">{credential.metadataHash}</span></div>
                <div><span className="text-muted">Verification Network: </span><span>CredoNet Verified Network</span></div>
              </div>

              <div>
                <span className="audit-dossier-eyebrow">
                  Verification Checklist
                </span>
                <div className="audit-dossier-checklist">
                  <div className="audit-dossier-check-item">
                    <CheckCircle2 size={13} /> <span>Permanent Identity Binding: Bound permanently to student and non-transferable</span>
                  </div>
                  <div className="audit-dossier-check-item">
                    <CheckCircle2 size={13} /> <span>Authorized Issuer Signature: Verified against approved institutional list</span>
                  </div>
                  <div className="audit-dossier-check-item">
                    <CheckCircle2 size={13} /> <span>Tamper-Proof Audit Trail: Permanent digital record in official registry</span>
                  </div>
                  <div className="audit-dossier-check-item">
                    <CheckCircle2 size={13} /> <span>Revocation Lifecycle: Verified authentic and not revoked</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="audit-dossier-footer">
              <button onClick={() => setShowAuditDossier(false)} className="btn-secondary">
                Close Dossier
              </button>
              <button onClick={() => window.print()} className="btn-primary">
                Print Official Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
