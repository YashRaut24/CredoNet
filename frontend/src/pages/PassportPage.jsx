import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ethers } from "ethers";
import { 
  Award, 
  ShieldCheck, 
  Copy, 
  Check, 
  QrCode, 
  ExternalLink, 
  CheckCircle2, 
  XCircle,
  Layers,
  ArrowLeft,
  User,
  FolderGit2,
  GitBranch,
  Search,
  MessageSquare,
  Sparkles,
  Code2
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { CredentialCard } from "../components/CredentialCard";
import { QRCodeModal } from "../components/QRCodeModal";
import { 
  getStudentProfile, 
  getStudentProjects, 
  getStudentEndorsements,
  calculateAchievements,
  buildEvidenceSkillMap
} from "../utils/studentStorage";
import "./PassportPage.css";

export function PassportPage() {
  const { address } = useParams();
  const { getReadOnlyContract } = useWeb3();

  const [credentials, setCredentials] = useState([]);
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [endorsements, setEndorsements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const isValidAddress = ethers.isAddress(address || "");

  useEffect(() => {
    async function fetchPassportData() {
      if (!isValidAddress) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // 1. Fetch on-chain credentials
        const contract = getReadOnlyContract();
        const raw = await contract.getStudentCredentials(address);
        const parsed = raw.map((c) => ({
          credentialId: c.credentialId,
          student: c.student,
          skill: c.skill,
          issuer: c.issuer,
          metadataHash: c.metadataHash,
          issuedAt: c.issuedAt.toString(),
          revoked: c.revoked,
        }));
        setCredentials(parsed);

        // 2. Fetch off-chain student portfolio & profile
        const [prof, projs, ends] = await Promise.all([
          getStudentProfile(address),
          getStudentProjects(address),
          getStudentEndorsements(address),
        ]);
        setProfile(prof);
        setProjects(projs);
        setEndorsements(ends);
      } catch (err) {
        console.error("Error loading passport credentials:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPassportData();
  }, [address, isValidAddress, getReadOnlyContract]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const validCreds = credentials.filter((c) => !c.revoked);
  const achievements = calculateAchievements({ credentials, projects, endorsements });
  const evidenceSkillMap = buildEvidenceSkillMap({ credentials, projects, endorsements });
  const verifiedSkills = evidenceSkillMap.filter(s => s.isVerified);
  const pageUrl = window.location.href;

  if (!isValidAddress) {
    return (
      <div className="container" style={{ padding: "60px 0" }}>
        <div className="connect-prompt-card">
          <XCircle size={40} color="#f43f5e" />
          <h3 className="connect-title">Invalid Wallet Address</h3>
          <p className="connect-desc">
            The requested address "{address}" is not a valid 42-character EVM hexadecimal address.
          </p>
          <Link to="/" className="btn-secondary">
            <ArrowLeft size={14} />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container passport-page">
      {/* Back button */}
      <div>
        <Link to="/" className="btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }}>
          <ArrowLeft size={13} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* 1. PROFILE HEADER */}
      <div className="passport-hero-card">
        <div className="passport-identity-wrap">
          <div className="passport-avatar-shield" style={{ overflow: "hidden" }}>
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <User size={32} />
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span className="trust-badge" style={{ width: "fit-content" }}>
              <span className="trust-badge-dot" />
              Verified SkillPassport • Monad Testnet
            </span>
            <h2 className="passport-title">{profile?.name || "Student Career Passport"}</h2>
            
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", fontSize: "13px", color: "var(--text-secondary)" }}>
              {profile?.degree && <span>{profile.degree}</span>}
              {profile?.college && (
                <>
                  <span>•</span>
                  <span>{profile.college}</span>
                </>
              )}
              {profile?.graduationYear && (
                <>
                  <span>•</span>
                  <span>Class of {profile.graduationYear}</span>
                </>
              )}
            </div>

            <div className="passport-address-chip" style={{ marginTop: "4px" }}>
              <span>WALLET: {address}</span>
              <button onClick={() => {
                navigator.clipboard.writeText(address);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }} className="btn-icon-copy" title="Copy Wallet Address">
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={copyAddress} className="btn-secondary">
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? "Link Copied!" : "Share Passport"}</span>
          </button>
          <button onClick={() => setShowQR(true)} className="btn-primary">
            <QrCode size={15} />
            <span>Generate QR</span>
          </button>
        </div>
      </div>

      {/* 2. ABOUT SECTION */}
      {profile?.bio && (
        <div style={{
          padding: "18px 24px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-medium)",
          borderRadius: "var(--radius-md)"
        }}>
          <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-highlight)", marginBottom: "6px" }}>About</h4>
          <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            {profile.bio}
          </p>
          {profile?.interests?.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px" }}>
              {profile.interests.map((int, i) => (
                <span key={i} style={{ fontSize: "11px", padding: "3px 8px", background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", borderRadius: "12px", color: "var(--text-muted)" }}>
                  {int}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trust Notice */}
      <div style={{
        padding: "12px 18px",
        background: "rgba(242, 108, 54, 0.08)",
        border: "1px solid rgba(242, 108, 54, 0.25)",
        borderRadius: "var(--radius-md)",
        fontSize: "12.5px",
        color: "var(--text-secondary)"
      }}>
        <strong style={{ color: "var(--text-highlight)" }}>Employer Verification Guarantee:</strong> Official credentials shown in this passport are cryptographically signed by authorized issuers and verified directly against Monad smart contracts. Students cannot self-verify skills or projects.
      </div>

      {/* 3. VERIFIED SKILLS SECTION */}
      <div className="skills-cloud-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span className="skills-cloud-header" style={{ marginBottom: 0 }}>Verified Skills (Issuer-Certified)</span>
          <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "600" }}>{verifiedSkills.length} Verified</span>
        </div>

        {verifiedSkills.length > 0 ? (
          <div className="skills-chips-row">
            {verifiedSkills.map((item, idx) => (
              <div key={idx} className="skill-chip">
                <CheckCircle2 size={13} color="#10b981" />
                <span>{item.name} ✓</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            No verified skills certified on Monad yet for this wallet.
          </p>
        )}
      </div>

      {/* 4. PROJECTS PORTFOLIO */}
      {projects.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <FolderGit2 size={18} color="#38bdf8" />
              <span>Project Evidence Portfolio</span>
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{projects.length} Documented Builds</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {projects.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: "18px 22px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-highlight)" }}>{p.name}</h4>
                    <span style={{
                      fontSize: "9.5px",
                      fontFamily: "var(--font-mono)",
                      padding: "2px 6px",
                      background: "rgba(56, 189, 248, 0.1)",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      borderRadius: "4px",
                      color: "#38bdf8",
                      whiteSpace: "nowrap"
                    }}>
                      PORTFOLIO EVIDENCE
                    </span>
                  </div>

                  <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: "1.5" }}>
                    {p.description}
                  </p>

                  {p.technologies && (
                    <div style={{ marginTop: "10px" }}>
                      <span style={{ fontSize: "10.5px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>TECHNOLOGIES:</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {p.technologies.split(",").map((tech, tIdx) => (
                          <span key={tIdx} style={{ fontSize: "10.5px", fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--bg-secondary)", borderRadius: "3px" }}>
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px", paddingTop: "10px", borderTop: "1px solid var(--border-subtle)" }}>
                  {p.githubUrl && (
                    <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: "4px 8px", fontSize: "11px" }}>
                      <GitBranch size={11} />
                      <span>Code Repository</span>
                      <ExternalLink size={9} />
                    </a>
                  )}
                  {p.demoUrl && (
                    <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: "4px 8px", fontSize: "11px" }}>
                      <span>Live Build</span>
                      <ExternalLink size={9} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ON-CHAIN CREDENTIALS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "700" }}>On-Chain Monad Credentials</h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Independently verifiable against Monad smart contract without needing a wallet.
            </p>
          </div>
          <span className="credentials-count-pill">{validCreds.length} Valid on Monad</span>
        </div>

        {loading ? (
          <div className="credentials-grid">
            {[1, 2].map((n) => (
              <div key={n} className="credential-card" style={{ minHeight: "180px", opacity: 0.6 }}>
                <div className="skeleton-box" style={{ width: "60%", height: "18px", marginBottom: "12px" }} />
                <div className="skeleton-box" style={{ width: "100%", height: "14px", marginBottom: "8px" }} />
                <div className="skeleton-box" style={{ width: "80%", height: "14px" }} />
              </div>
            ))}
          </div>
        ) : credentials.length > 0 ? (
          <div className="credentials-grid">
            {credentials.map((cred) => (
              <CredentialCard key={cred.credentialId} credential={cred} />
            ))}
          </div>
        ) : (
          <div className="empty-credentials-box">
            <ShieldCheck size={28} color="var(--accent-primary)" />
            <h4>No credentials issued to this wallet</h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              This wallet has not yet received verified credentials on Monad blockchain.
            </p>
          </div>
        )}
      </div>

      {/* 6. ACHIEVEMENTS */}
      {achievements.filter(a => a.unlocked).length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} color="#eab308" />
            <span>Unlocked Career Achievements</span>
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {achievements.filter(a => a.unlocked).map((ach) => (
              <div
                key={ach.id}
                style={{
                  padding: "16px 20px",
                  background: "rgba(16, 185, 129, 0.05)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}
              >
                <span style={{ fontSize: "24px" }}>{ach.icon}</span>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-highlight)" }}>{ach.title}</h4>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. MENTOR ENDORSEMENTS */}
      {endorsements.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={18} color="var(--accent-primary)" />
            <span>Mentor Endorsements</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {endorsements.map((end) => (
              <div
                key={end.id}
                style={{
                  padding: "16px 20px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "var(--accent-primary)", fontWeight: "700" }}>
                    ENDORSED: {end.skill}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{end.date}</span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-highlight)", fontStyle: "italic", lineHeight: "1.5" }}>
                  "{end.endorsementText}"
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "11.5px", color: "var(--text-secondary)" }}>
                  <span>— {end.endorserName}</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                    Signer: {end.endorserWallet.slice(0, 6)}...{end.endorserWallet.slice(-4)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {showQR && (
        <QRCodeModal
          url={pageUrl}
          title={`SkillPassport: ${profile?.name || address.slice(0, 6)}`}
          description={`Scan to inspect verified skills, projects, and Monad credentials bound to ${address.slice(0, 6)}...${address.slice(-4)} on Monad blockchain.`}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
