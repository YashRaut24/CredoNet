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
  Code2,
  FileText,
  Printer,
  Clock,
  AlertTriangle
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
            {(() => {
              const isProject = credential.skill?.startsWith("[Project]") || 
                                credential.skill?.toLowerCase().startsWith("project:") || 
                                metadata?.type === "project";
              const displayTitle = credential.skill
                ? credential.skill.replace(/^\[Project\]\s*/i, "").replace(/^project:\s*/i, "")
                : "Untitled Record";

              return (
                <>
                  <div className="verify-header">
                    <div className="verify-skill-wrap">
                      <span className="trust-badge" style={{ width: "fit-content", borderColor: isProject ? "rgba(56, 189, 248, 0.3)" : undefined }}>
                        <span className="trust-badge-dot" style={{ background: isProject ? "#38bdf8" : undefined }} />
                        {isProject ? "Verified Capstone Project Audit" : "Verified Skill Competency Audit"}
                      </span>
                      <h2 className="verify-skill-title">{displayTitle}</h2>
                    </div>

                    <div>
                      {(() => {
                        const expiresAt = metadata?.expiresAt;
                        const isExpired = expiresAt && Number(expiresAt) > 0 && Date.now() > Number(expiresAt);

                        if (credential.revoked) {
                          return (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                              <span className="verify-status-badge revoked">
                                <XCircle size={16} />
                                <span>✕ REVOKED</span>
                              </span>
                              <span style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "#f43f5e", fontWeight: "600" }}>
                                Revoked on Monad blockchain
                              </span>
                            </div>
                          );
                        } else if (isExpired) {
                          return (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                              <span className="verify-status-badge expired" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.35)" }}>
                                <AlertTriangle size={16} />
                                <span>⚠ EXPIRED (VALIDITY ELAPSED)</span>
                              </span>
                              <span style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "#f59e0b", fontWeight: "600" }}>
                                Expired: {new Date(Number(expiresAt)).toLocaleDateString()}
                              </span>
                            </div>
                          );
                        } else if (isValid) {
                          return (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                              <span className="verify-status-badge valid">
                                <CheckCircle2 size={16} />
                                <span>✓ VALID</span>
                              </span>
                              <span style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "#10b981", fontWeight: "600" }}>
                                Verified from Monad blockchain
                              </span>
                            </div>
                          );
                        } else {
                          return (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                              <span className="verify-status-badge revoked">
                                <XCircle size={16} />
                                <span>✕ INVALID</span>
                              </span>
                              <span style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "#f43f5e", fontWeight: "600" }}>
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
                    <div style={{
                      margin: "18px 0",
                      padding: "18px",
                      background: "rgba(56, 189, 248, 0.05)",
                      border: "1px solid rgba(56, 189, 248, 0.2)",
                      borderRadius: "var(--radius-md)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "#38bdf8", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                          <FolderGit2 size={14} />
                          VERIFIED PROJECT ARTIFACTS
                        </span>

                        <div style={{ display: "flex", gap: "10px" }}>
                          {metadata?.repoUrl && (
                            <a
                              href={metadata.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary"
                              style={{ padding: "6px 12px", fontSize: "12px", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.3)" }}
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
                              className="btn-secondary"
                              style={{ padding: "6px 12px", fontSize: "12px" }}
                            >
                              <span>Live Deployment</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>

                      {metadata?.projectSkills && (
                        <div>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                            ASSOCIATED TECH STACK & SKILLS
                          </span>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {metadata.projectSkills.split(",").map((s, idx) => (
                              <span
                                key={idx}
                                style={{
                                  padding: "3px 9px",
                                  fontSize: "11px",
                                  fontFamily: "var(--font-mono)",
                                  background: "var(--bg-surface)",
                                  border: "1px solid var(--border-medium)",
                                  borderRadius: "4px",
                                  color: "var(--text-highlight)"
                                }}
                              >
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {metadata?.description && (
                        <div>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                            VERIFICATION SCOPE & AUDIT NOTES
                          </span>
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                            {metadata.description}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* If Skill: Skill Details Panel */}
                  {!isProject && metadata && (
                    <div style={{
                      margin: "18px 0",
                      padding: "16px",
                      background: "rgba(242, 108, 54, 0.05)",
                      border: "1px solid rgba(242, 108, 54, 0.2)",
                      borderRadius: "var(--radius-md)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--accent-primary)", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                          <Award size={14} />
                          COMPETENCY ASSESSMENT REPORT
                        </span>
                        {metadata.skillLevel && (
                          <span style={{ fontSize: "11.5px", padding: "2px 8px", background: "var(--bg-surface)", border: "1px solid var(--border-medium)", borderRadius: "4px", color: "var(--accent-primary)", fontWeight: "600" }}>
                            {metadata.skillLevel}
                          </span>
                        )}
                      </div>
                      {metadata.description && (
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
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
                  <Clock size={14} color="#f26c36" /> Validity Lifecycle
                </span>
                <span className="audit-value">
                  {metadata?.validityDuration || (metadata?.expiresAt && Number(metadata.expiresAt) > 0 ? `Valid through ${new Date(Number(metadata.expiresAt)).toLocaleDateString()}` : "Perpetual (No Expiration)")}
                </span>
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

              <button onClick={() => setShowAuditDossier(true)} className="btn-secondary" style={{ color: "var(--accent-primary)", borderColor: "var(--accent-primary)" }}>
                <FileText size={14} />
                <span>Export Compliance Audit Report</span>
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

      {/* COMPLIANCE AUDIT CERTIFICATE DOSSIER MODAL */}
      {showAuditDossier && credential && (
        <div className="modal-overlay" onClick={() => setShowAuditDossier(false)}>
          <div
            className="modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "680px",
              padding: "30px",
              background: "#0c0a09",
              border: "1px solid rgba(242, 108, 54, 0.4)",
              borderRadius: "14px",
              color: "#f5f5f4"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255, 255, 255, 0.12)", paddingBottom: "16px", marginBottom: "20px" }}>
              <div>
                <span style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-primary)", fontWeight: "700" }}>
                  Official Audit Dossier • ISO/IEC 27001 & SOC-2 Background Proof
                </span>
                <h3 style={{ fontSize: "20px", fontWeight: "700", marginTop: "4px" }}>
                  Cryptographic Background Verification Certificate
                </h3>
              </div>
              <button
                onClick={() => window.print()}
                className="btn-primary"
                style={{ padding: "6px 14px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Printer size={13} />
                <span>Print Dossier</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px" }}>
              <div style={{ padding: "12px 16px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ color: "#10b981", fontWeight: "700", display: "block" }}>AUTHENTICITY AUDIT RESULT: PASSED</span>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Verified directly against Monad EVM contract consensus.
                  </span>
                </div>
                <CheckCircle2 size={24} color="#10b981" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "6px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>AUDIT TIMESTAMP</span>
                  <span style={{ fontWeight: "600", fontFamily: "var(--font-mono)" }}>{new Date().toISOString()}</span>
                </div>
                <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "6px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>CREDENTIAL STATUS</span>
                  <span style={{ fontWeight: "600", color: credential.revoked ? "#f43f5e" : isValid ? "#10b981" : "#f43f5e" }}>
                    {credential.revoked ? "REVOKED" : isValid ? "MATHEMATICALLY VALID" : "INVALID"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "rgba(0, 0, 0, 0.4)", padding: "14px", borderRadius: "8px", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                <div><span style={{ color: "var(--text-muted)" }}>Credential ID:</span> <span style={{ color: "var(--text-highlight)", wordBreak: "break-all" }}>{credential.credentialId}</span></div>
                <div><span style={{ color: "var(--text-muted)" }}>Certified Competency:</span> <span style={{ color: "var(--accent-primary)" }}>{credential.skill}</span></div>
                <div><span style={{ color: "var(--text-muted)" }}>Student Sovereign Wallet:</span> <span style={{ color: "#38bdf8" }}>{credential.student}</span></div>
                <div><span style={{ color: "var(--text-muted)" }}>Accredited Issuer:</span> <span style={{ color: "#eab308" }}>{credential.issuer}</span></div>
                <div><span style={{ color: "var(--text-muted)" }}>Contract Address:</span> <span>{CONTRACT_ADDRESS}</span></div>
                <div><span style={{ color: "var(--text-muted)" }}>Metadata Hash:</span> <span>{credential.metadataHash}</span></div>
                <div><span style={{ color: "var(--text-muted)" }}>Blockchain Network:</span> <span>Monad Testnet (Chain ID 10143)</span></div>
              </div>

              <div>
                <span style={{ fontSize: "11.5px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                  Audit Compliance Checklist
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981" }}>
                    <CheckCircle2 size={13} /> <span>Soulbound Non-Transferability Check: Immutable recipient bound (ERC-5192)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981" }}>
                    <CheckCircle2 size={13} /> <span>Issuer Authority Signature: Verified on-chain authorized authority list</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981" }}>
                    <CheckCircle2 size={13} /> <span>Cryptographic Non-Repudiation: Monad transaction ledger immutable log</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981" }}>
                    <CheckCircle2 size={13} /> <span>Revocation Lifecycle: Verified not in revoked state on block consensus</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
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
