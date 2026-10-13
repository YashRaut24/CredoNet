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
  ArrowLeft,
  User,
  FolderGit2,
  GitBranch,
  MessageSquare,
  Sparkles
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
  const [filterType, setFilterType] = useState("all");

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
  const certCreds = validCreds.filter(
    (c) => c.skill?.startsWith("[Certificate]") || c.skill?.toLowerCase().startsWith("certificate:")
  );
  const projectCreds = validCreds.filter(
    (c) => c.skill?.startsWith("[Project]") || c.skill?.toLowerCase().startsWith("project:")
  );
  const skillCreds = validCreds.filter(
    (c) => !c.skill?.startsWith("[Certificate]") && !c.skill?.startsWith("[Project]") && !c.skill?.toLowerCase().startsWith("certificate:") && !c.skill?.toLowerCase().startsWith("project:")
  );

  const displayedCreds = credentials.filter((c) => {
    const isCert = c.skill?.startsWith("[Certificate]") || c.skill?.toLowerCase().startsWith("certificate:");
    const isProj = c.skill?.startsWith("[Project]") || c.skill?.toLowerCase().startsWith("project:");
    if (filterType === "skills") return !isCert && !isProj;
    if (filterType === "projects") return isProj;
    if (filterType === "certificates") return isCert;
    return true;
  });

  const achievements = calculateAchievements({ credentials, projects, endorsements });
  const evidenceSkillMap = buildEvidenceSkillMap({ credentials, projects, endorsements });
  const verifiedSkills = evidenceSkillMap.filter(s => s.isVerified);
  const pageUrl = window.location.href;

  if (!isValidAddress) {
    return (
      <div className="container passport-empty-container">
        <div className="connect-prompt-card">
          <XCircle size={40} color="#f43f5e" />
          <h3 className="connect-title">Invalid Wallet Address</h3>
          <p className="connect-desc">
            The requested address or ID "{address}" is not a valid account format.
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
        <Link to="/" className="btn-secondary passport-back-btn">
          <ArrowLeft size={13} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* 1. PROFILE HEADER */}
      <div className="passport-hero-card">
        <div className="passport-identity-wrap">
          <div className="passport-avatar-shield">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Profile" className="passport-avatar-img" />
            ) : (
              <User size={32} />
            )}
          </div>
          <div className="passport-hero-info">
            <span className="trust-badge">
              <span className="trust-badge-dot" />
              Verified SkillPassport • Official Registry
            </span>
            <h2 className="passport-title">{profile?.name || "Student Career Passport"}</h2>
            
            <div className="passport-meta-tags">
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
              {certCreds.length > 0 && (
                <>
                  <span>•</span>
                  <span className="passport-cert-highlight">
                    ✓ {certCreds.length} Official Degree / Certificate{certCreds.length > 1 ? "s" : ""}
                  </span>
                </>
              )}
            </div>

            <div className="passport-address-chip">
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

        <div className="passport-actions-group">
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
        <div className="passport-about-card">
          <h4 className="passport-about-title">About</h4>
          <p className="passport-about-desc">
            {profile.bio}
          </p>
          {profile?.interests?.length > 0 && (
            <div className="passport-links-chips">
              {profile.interests.map((int, i) => (
                <span key={i} className="passport-link-pill">
                  {int}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trust Notice */}
      <div className="passport-guarantee-banner">
        <strong>Employer Verification Guarantee:</strong> Official credentials shown in this passport are digitally certified by authorized institutions and verified directly against the tamper-proof registry. Students cannot self-verify skills or projects.
      </div>

      {/* 3. VERIFIED SKILLS SECTION */}
      <div className="skills-cloud-card">
        <div className="passport-skills-header-row">
          <span className="skills-cloud-header">Verified Skills (Issuer-Certified)</span>
          <span className="passport-count-badge">{verifiedSkills.length} Verified</span>
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
          <p className="passport-empty-msg">
            No verified skills certified yet for this profile.
          </p>
        )}
      </div>

      {/* 4. PROJECTS PORTFOLIO */}
      {projects.length > 0 && (
        <div className="passport-section">
          <div className="passport-section-header">
            <h3 className="passport-section-title">
              <FolderGit2 size={18} color="var(--accent-primary)" />
              <span>Project Evidence Portfolio</span>
            </h3>
            <span className="passport-section-count">{projects.length} Documented Builds</span>
          </div>

          <div className="passport-projects-grid">
            {projects.map((p) => (
              <div key={p.id} className="passport-project-card">
                <div>
                  <div className="passport-project-top">
                    <h4 className="passport-project-title">{p.name}</h4>
                    <span className="app-badge-tag">
                      PORTFOLIO EVIDENCE
                    </span>
                  </div>

                  <p className="passport-project-desc">
                    {p.description}
                  </p>

                  {p.technologies && (
                    <div className="passport-tech-wrap">
                      <span className="passport-tech-stack-label">TECHNOLOGIES:</span>
                      <div className="passport-tech-chips">
                        {p.technologies.split(",").map((tech, tIdx) => (
                          <span key={tIdx} className="passport-tech-tag">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="passport-project-links">
                  {p.githubUrl && (
                    <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary passport-link-sm">
                      <GitBranch size={11} />
                      <span>Code Repository</span>
                      <ExternalLink size={9} />
                    </a>
                  )}
                  {p.demoUrl && (
                    <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary passport-link-sm">
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
      <div className="passport-section">
        <div className="passport-section-header">
          <div>
            <h3 className="passport-section-title">Official Verified Credentials</h3>
            <p className="app-section-desc">
              Independently verifiable against the official registry without needing an account.
            </p>
          </div>
          <span className="app-badge-tag">{validCreds.length} Authentic & Active</span>
        </div>

        <div className="passport-filter-shelf">
          {[
            { id: "all", label: `All (${credentials.length})` },
            { id: "skills", label: `Skills (${skillCreds.length})` },
            { id: "projects", label: `Projects (${projectCreds.length})` },
            { id: "certificates", label: `Degrees & Certificates (${certCreds.length})` },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id)}
              className={`passport-filter-pill ${filterType === f.id ? "active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="credentials-grid">
            {[1, 2].map((n) => (
              <div key={n} className="credential-card passport-cred-skeleton">
                <div className="skeleton-box skeleton-title" />
                <div className="skeleton-box skeleton-line-1" />
                <div className="skeleton-box skeleton-line-2" />
              </div>
            ))}
          </div>
        ) : displayedCreds.length > 0 ? (
          <div className="credentials-grid">
            {displayedCreds.map((cred) => (
              <CredentialCard key={cred.credentialId} credential={cred} />
            ))}
          </div>
        ) : (
          <div className="empty-credentials-box">
            <ShieldCheck size={28} color="var(--accent-primary)" />
            <h4>No credentials found for this filter</h4>
            <p className="passport-empty-msg">
              This profile has no credentials matching the selected filter in the verified registry.
            </p>
          </div>
        )}
      </div>

      {/* 6. ACHIEVEMENTS */}
      {achievements.filter(a => a.unlocked).length > 0 && (
        <div className="passport-section">
          <h3 className="passport-section-title">
            <Sparkles size={18} color="var(--accent-primary)" />
            <span>Unlocked Career Achievements</span>
          </h3>

          <div className="passport-achievements-grid">
            {achievements.filter(a => a.unlocked).map((ach) => (
              <div key={ach.id} className="passport-achievement-card">
                <span className="passport-achievement-icon">{ach.icon}</span>
                <div>
                  <h4 className="passport-achievement-title">{ach.title}</h4>
                  <p className="passport-achievement-desc">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. MENTOR ENDORSEMENTS */}
      {endorsements.length > 0 && (
        <div className="passport-section">
          <h3 className="passport-section-title">
            <MessageSquare size={18} color="var(--accent-primary)" />
            <span>Mentor Endorsements</span>
          </h3>

          <div className="passport-endorsements-list">
            {endorsements.map((end) => (
              <div key={end.id} className="passport-endorsement-card">
                <div className="passport-endorsement-top">
                  <span className="passport-endorsement-skill">
                    ENDORSED: {end.skill}
                  </span>
                  <span className="passport-endorsement-date">{end.date}</span>
                </div>
                <p className="passport-endorsement-quote">
                  "{end.endorsementText}"
                </p>
                <div className="passport-endorsement-footer">
                  <span>— {end.endorserName}</span>
                  <span className="passport-endorsement-signer">
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
          description={`Scan to inspect verified skills, projects, and authentic credentials issued to ${address.slice(0, 6)}...${address.slice(-4)}.`}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
