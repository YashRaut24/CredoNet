import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Award, 
  Copy, 
  Check, 
  QrCode, 
  ExternalLink, 
  Search, 
  RefreshCw, 
  Layers, 
  ShieldCheck,
  PlusCircle,
  FolderGit2,
  GitBranch,
  User,
  GraduationCap,
  Sparkles,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  MessageSquare,
  Lock,
  ArrowRight,
  Code2
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { CredentialCard } from "../components/CredentialCard";
import { QRCodeModal } from "../components/QRCodeModal";
import { 
  getStudentProfile, 
  saveStudentProfile, 
  getStudentProjects, 
  addStudentProject, 
  deleteStudentProject,
  getStudentEndorsements,
  addStudentEndorsement,
  calculateAchievements,
  buildEvidenceSkillMap
} from "../utils/studentStorage";
import "./DashboardPage.css";

export function DashboardPage() {
  const { account, getReadOnlyContract, connectWallet, isConnecting } = useWeb3();

  // Core Blockchain States
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Tab State: "overview" | "skills" | "projects" | "credentials" | "achievements" | "endorsements"
  const [activeTab, setActiveTab] = useState("overview");

  // Off-chain Student Data States
  const [profile, setProfile] = useState({
    name: "",
    avatar: "",
    college: "",
    degree: "",
    graduationYear: "",
    bio: "",
    interests: [],
  });
  const [projects, setProjects] = useState([]);
  const [endorsements, setEndorsements] = useState([]);

  // Modal / Form States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(profile);

  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    githubUrl: "",
    demoUrl: "",
    technologies: "",
    skillsDemonstrated: "",
  });

  const [isAddingEndorsement, setIsAddingEndorsement] = useState(false);
  const [endorsementForm, setEndorsementForm] = useState({
    skill: "",
    endorsementText: "",
    endorserName: "",
    endorserWallet: "",
  });

  // Load on-chain credentials
  const loadCredentials = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const contract = getReadOnlyContract();
      const raw = await contract.getStudentCredentials(account);
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
    } catch (err) {
      console.error("Error loading credentials:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load off-chain student data
  const loadOffChainData = async () => {
    if (!account) return;
    try {
      const [prof, projs, ends] = await Promise.all([
        getStudentProfile(account),
        getStudentProjects(account),
        getStudentEndorsements(account),
      ]);
      setProfile(prof);
      setProfileForm(prof);
      setProjects(projs);
      setEndorsements(ends);
    } catch (e) {
      console.warn("Error loading student data:", e);
    }
  };

  useEffect(() => {
    if (account) {
      loadCredentials();
      loadOffChainData();
    }
  }, [account]);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handlers for Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!account) return;
    const updated = await saveStudentProfile(account, profileForm);
    setProfile(updated);
    setIsEditingProfile(false);
  };

  // Handlers for Projects
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!account || !projectForm.name.trim()) return;
    const created = await addStudentProject(account, projectForm);
    if (created) {
      setProjects([created, ...projects]);
      setProjectForm({
        name: "",
        description: "",
        githubUrl: "",
        demoUrl: "",
        technologies: "",
        skillsDemonstrated: "",
      });
      setIsAddingProject(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!account || !window.confirm("Remove this project from your portfolio?")) return;
    await deleteStudentProject(account, id);
    setProjects(projects.filter(p => p.id !== id));
  };

  // Handlers for Endorsement
  const handleAddEndorsement = async (e) => {
    e.preventDefault();
    if (!account || !endorsementForm.skill.trim()) return;
    const created = await addStudentEndorsement(account, endorsementForm);
    if (created) {
      setEndorsements([created, ...endorsements]);
      setEndorsementForm({
        skill: "",
        endorsementText: "",
        endorserName: "",
        endorserWallet: "",
      });
      setIsAddingEndorsement(false);
    }
  };

  // Derived calculations
  const validCreds = credentials.filter((c) => !c.revoked);
  const achievements = calculateAchievements({ credentials, projects, endorsements });
  const evidenceSkillMap = buildEvidenceSkillMap({ credentials, projects, endorsements });
  const verifiedSkillsCount = evidenceSkillMap.filter(s => s.isVerified).length;

  if (!account) {
    return (
      <div className="container" style={{ padding: "60px 0" }}>
        <div className="connect-prompt-card">
          <div className="connect-icon-wrap">
            <Award size={32} />
          </div>
          <h2 className="connect-title">Connect Student Wallet</h2>
          <p className="connect-desc">
            Connect your Web3 wallet to manage your career identity, project portfolio, verified skills, and Monad credentials.
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="btn-primary"
            style={{ width: "100%", padding: "14px", fontSize: "14.5px" }}
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container dashboard-page">
      {/* 1. Profile Hero Card */}
      <div className="profile-banner">
        <div className="profile-identity">
          <div className="profile-avatar" style={{ overflow: "hidden" }}>
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <User size={30} />
            )}
          </div>
          <div className="profile-info">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-highlight)" }}>
                {profile.name || "Student Passport Holder"}
              </h2>
              <button
                onClick={() => {
                  setProfileForm(profile);
                  setIsEditingProfile(true);
                }}
                className="btn-secondary"
                style={{ padding: "4px 8px", fontSize: "11px" }}
                title="Edit Profile"
              >
                <Edit3 size={11} />
                <span>Edit Profile</span>
              </button>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", fontSize: "13px", color: "var(--text-secondary)" }}>
              {profile.degree && <span>{profile.degree}</span>}
              {profile.college && (
                <>
                  <span>•</span>
                  <span>{profile.college}</span>
                </>
              )}
              {profile.graduationYear && (
                <>
                  <span>•</span>
                  <span>Class of {profile.graduationYear}</span>
                </>
              )}
            </div>

            {profile.bio && (
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "4px", maxWidth: "600px", lineHeight: "1.4" }}>
                {profile.bio}
              </p>
            )}

            <div className="profile-address-row" style={{ marginTop: "4px" }}>
              <span className="profile-address-text">
                Wallet: {account.slice(0, 6)}...{account.slice(-4)}
              </span>
              <button onClick={copyAddress} className="btn-icon-copy" title="Copy Wallet Address">
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={() => setShowQR(true)} className="btn-secondary">
            <QrCode size={14} />
            <span>Generate QR</span>
          </button>

          <Link to={`/vault/${account}`} className="btn-outline-amber">
            <span>Public Passport View</span>
            <ExternalLink size={13} />
          </Link>

          <button onClick={loadCredentials} disabled={loading} className="btn-secondary" title="Sync Blockchain Records">
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-box-label">Verified Skills</span>
          <span className="stat-box-value">{verifiedSkillsCount}</span>
          <span className="stat-box-sub" style={{ color: "var(--success)" }}>✓ On-Chain Certified</span>
        </div>

        <div className="stat-box">
          <span className="stat-box-label">Active Credentials</span>
          <span className="stat-box-value">{validCreds.length}</span>
          <span className="stat-box-sub" style={{ color: "var(--accent-primary)" }}>Valid on Monad</span>
        </div>

        <div className="stat-box">
          <span className="stat-box-label">Projects Added</span>
          <span className="stat-box-value">{projects.length}</span>
          <span className="stat-box-sub" style={{ color: "#38bdf8" }}>Portfolio Evidence</span>
        </div>

        <div className="stat-box">
          <span className="stat-box-label">Achievements</span>
          <span className="stat-box-value">{achievements.filter(a => a.unlocked).length}</span>
          <span className="stat-box-sub" style={{ color: "#eab308" }}>Unlocked</span>
        </div>
      </div>

      {/* 3. Logical Rules & Security Notice */}
      <div style={{
        padding: "14px 18px",
        background: "rgba(242, 108, 54, 0.08)",
        border: "1px solid rgba(242, 108, 54, 0.25)",
        borderRadius: "var(--radius-md)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldCheck size={18} color="var(--accent-primary)" />
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            <strong>Authenticity Model:</strong> You can document projects and profile evidence, but <em>skills and credentials are only verified when cryptographically issued by an authorized institution on Monad</em>. Students cannot self-verify.
          </span>
        </div>
      </div>

      {/* 4. Navigation Sub-Tabs */}
      <div style={{ display: "flex", gap: "10px", margin: "10px 0", flexWrap: "wrap", borderBottom: "1px solid var(--border-medium)", paddingBottom: "14px" }}>
        {[
          { id: "overview", label: "Overview", count: null },
          { id: "skills", label: "Skills & Evidence", count: evidenceSkillMap.length },
          { id: "projects", label: "Projects Portfolio", count: projects.length },
          { id: "credentials", label: "Monad Credentials", count: credentials.length },
          { id: "achievements", label: "Achievements", count: achievements.filter(a => a.unlocked).length },
          { id: "endorsements", label: "Mentor Endorsements", count: endorsements.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn-secondary ${activeTab === tab.id ? "active" : ""}`}
            style={{
              padding: "8px 16px",
              fontSize: "12.5px",
              fontWeight: "600",
              borderColor: activeTab === tab.id ? "var(--accent-primary)" : "var(--border-medium)",
              background: activeTab === tab.id ? "rgba(242, 108, 54, 0.12)" : "transparent",
              color: activeTab === tab.id ? "var(--text-highlight)" : "var(--text-secondary)"
            }}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span style={{
                marginLeft: "6px",
                padding: "1px 6px",
                background: "var(--bg-surface)",
                borderRadius: "10px",
                fontSize: "11px",
                fontFamily: "var(--font-mono)"
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 5. TAB: OVERVIEW */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* Verified Skills Summary */}
          <div style={{
            padding: "20px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-medium)",
            borderRadius: "var(--radius-md)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={16} color="var(--accent-primary)" />
                <span>Verified Skills (Issuer-Certified)</span>
              </h3>
              <button onClick={() => setActiveTab("skills")} className="btn-secondary" style={{ padding: "4px 10px", fontSize: "11.5px" }}>
                <span>View Full Evidence Map</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {evidenceSkillMap.filter(s => s.isVerified).length > 0 ? (
                evidenceSkillMap.filter(s => s.isVerified).map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "12.5px",
                      fontWeight: "600",
                      color: "#10b981"
                    }}
                  >
                    <span>✓</span>
                    <span>{s.name}</span>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  No skills have been verified by an authorized issuer yet. Request an authorized issuer to certify your achievements.
                </p>
              )}
            </div>
          </div>

          {/* Recent Projects & Recent Credentials */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Projects Box */}
            <div style={{ padding: "20px", background: "var(--bg-surface)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FolderGit2 size={16} color="#38bdf8" />
                  <span>Project Portfolio Evidence</span>
                </h3>
                <button onClick={() => setIsAddingProject(true)} className="btn-secondary" style={{ padding: "4px 8px", fontSize: "11.5px" }}>
                  <PlusCircle size={12} />
                  <span>Add</span>
                </button>
              </div>

              {projects.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {projects.slice(0, 3).map((p) => (
                    <div key={p.id} style={{ padding: "10px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--text-highlight)" }}>{p.name}</span>
                        <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>EVIDENCE</span>
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", lineClamp: 2 }}>{p.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No projects added yet. Click Add to document your project evidence.</p>
              )}
            </div>

            {/* Credentials Box */}
            <div style={{ padding: "20px", background: "var(--bg-surface)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldCheck size={16} color="var(--accent-primary)" />
                  <span>Recent Monad Credentials</span>
                </h3>
                <button onClick={() => setActiveTab("credentials")} className="btn-secondary" style={{ padding: "4px 8px", fontSize: "11.5px" }}>
                  <span>View All ({credentials.length})</span>
                </button>
              </div>

              {credentials.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {credentials.slice(0, 3).map((c) => (
                    <div key={c.credentialId} style={{ padding: "10px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--text-highlight)", display: "block" }}>{c.skill}</span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Issuer: {c.issuer.slice(0, 6)}...{c.issuer.slice(-4)}</span>
                      </div>
                      <span className={`status-pill ${c.revoked ? "revoked" : "valid"}`} style={{ fontSize: "11px", padding: "2px 8px" }}>
                        {c.revoked ? "✕ REVOKED" : "✓ VALID"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No credentials recorded on Monad blockchain yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB: SKILLS & EVIDENCE */}
      {activeTab === "skills" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-highlight)" }}>
                Evidence-Based Skill Directory
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Each skill connects demonstrated project evidence, mentor endorsements, and official blockchain certifications.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
            {evidenceSkillMap.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: "18px 22px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Code2 size={18} color="var(--accent-primary)" />
                    <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-highlight)" }}>
                      {item.name}
                    </h4>
                  </div>
                  <div>
                    {item.isVerified ? (
                      <span className="verify-status-badge valid" style={{ padding: "4px 10px", fontSize: "11.5px" }}>
                        <CheckCircle2 size={13} />
                        <span>✓ VERIFIED BY RECOGNIZED ISSUER</span>
                      </span>
                    ) : (
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "4px 10px",
                        background: "rgba(56, 189, 248, 0.08)",
                        border: "1px solid rgba(56, 189, 248, 0.25)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "11px",
                        fontFamily: "var(--font-mono)",
                        color: "#38bdf8"
                      }}>
                        <FolderGit2 size={12} />
                        <span>PORTFOLIO EVIDENCE (UNVERIFIED)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Evidence Details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "4px" }}>
                  {/* Associated Projects */}
                  <div style={{ padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                      DEMONSTRATED IN PROJECTS ({item.projects.length})
                    </span>
                    {item.projects.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {item.projects.map((p) => (
                          <span key={p.id} style={{ fontSize: "12.5px", color: "#38bdf8", fontWeight: "500" }}>
                            • {p.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>None linked yet</span>
                    )}
                  </div>

                  {/* Associated Credentials & Endorsements */}
                  <div style={{ padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                      BLOCKCHAIN CREDENTIALS & ENDORSEMENTS
                    </span>
                    {item.credentials.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {item.credentials.map((c) => (
                          <span key={c.credentialId} style={{ fontSize: "12.5px", color: "#10b981", fontWeight: "500" }}>
                            ✓ Credential #{c.credentialId.slice(0, 8)}... (Issuer: {c.issuer.slice(0, 6)}...)
                          </span>
                        ))}
                      </div>
                    ) : item.endorsements.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {item.endorsements.map((end) => (
                          <span key={end.id} style={{ fontSize: "12.5px", color: "#eab308" }}>
                            🤝 Endorsed by {end.endorserName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Awaiting issuer certification on Monad</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB: PROJECTS PORTFOLIO */}
      {activeTab === "projects" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-highlight)" }}>
                Project Portfolio
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Add your technical builds as evidence. Issuers can verify skills linked to these projects.
              </p>
            </div>
            <button onClick={() => setIsAddingProject(true)} className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }}>
              <PlusCircle size={14} />
              <span>Add New Project</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            {projects.map((proj) => (
              <div key={proj.id} style={{
                padding: "20px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "14px"
              }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-highlight)" }}>{proj.name}</h4>
                    <span style={{
                      fontSize: "10px",
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

                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "8px", lineHeight: "1.5" }}>
                    {proj.description}
                  </p>

                  {proj.technologies && (
                    <div style={{ marginTop: "12px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>TECH STACK:</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                        {proj.technologies.split(",").map((tech, tIdx) => (
                          <span key={tIdx} style={{ fontSize: "11px", fontFamily: "var(--font-mono)", padding: "2px 6px", background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", borderRadius: "3px" }}>
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {proj.skillsDemonstrated && (
                    <div style={{ marginTop: "8px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>DEMONSTRATED SKILLS:</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                        {proj.skillsDemonstrated.split(",").map((sk, sIdx) => (
                          <span key={sIdx} style={{ fontSize: "11px", color: "var(--accent-primary)", padding: "2px 6px", background: "rgba(242, 108, 54, 0.08)", borderRadius: "3px" }}>
                            • {sk.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: "4px 10px", fontSize: "11.5px" }}>
                        <GitBranch size={12} />
                        <span>Code</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                    {proj.demoUrl && (
                      <a href={proj.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: "4px 10px", fontSize: "11.5px" }}>
                        <span>Demo</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <button onClick={() => handleDeleteProject(proj.id)} className="btn-secondary" style={{ padding: "4px 8px", color: "#f87171" }} title="Delete Project">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB: CREDENTIALS */}
      {activeTab === "credentials" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700" }}>On-Chain Monad Credentials</h3>
            <span className="credentials-count-pill">{credentials.length} Issued</span>
          </div>

          {credentials.length > 0 ? (
            <div className="credentials-grid">
              {credentials.map((cred) => (
                <CredentialCard key={cred.credentialId} credential={cred} />
              ))}
            </div>
          ) : (
            <div className="empty-credentials-box">
              <ShieldCheck size={28} color="var(--accent-primary)" />
              <h4>No credentials issued to this wallet yet</h4>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Request an authorized university, bootcamp, or mentor to issue credentials to your wallet address.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 9. TAB: ACHIEVEMENTS */}
      {activeTab === "achievements" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-highlight)" }}>
              Career Milestones & Achievements
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Achievements are automatically calculated from actual verifiable on-chain credentials and documented projects.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {achievements.map((ach) => (
              <div
                key={ach.id}
                style={{
                  padding: "18px",
                  background: ach.unlocked ? "rgba(16, 185, 129, 0.04)" : "var(--bg-surface)",
                  border: ach.unlocked ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  opacity: ach.unlocked ? 1 : 0.65
                }}
              >
                <div style={{
                  fontSize: "24px",
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-md)",
                  background: ach.unlocked ? "rgba(16, 185, 129, 0.15)" : "var(--bg-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {ach.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-highlight)" }}>{ach.title}</h4>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      fontFamily: "var(--font-mono)",
                      color: ach.unlocked ? "#10b981" : "var(--text-muted)"
                    }}>
                      {ach.unlocked ? "✓ UNLOCKED" : "LOCKED"}
                    </span>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    {ach.description}
                  </p>
                  <div style={{ marginTop: "8px", fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                    Rule: {ach.requirement} ({ach.current})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. TAB: MENTOR ENDORSEMENTS */}
      {activeTab === "endorsements" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-highlight)" }}>
                Mentor Endorsements
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Testimonials from project mentors, instructors, and lead engineers. Distinct from institutional credentials.
              </p>
            </div>
            <button onClick={() => setIsAddingEndorsement(true)} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }}>
              <PlusCircle size={14} />
              <span>Add Mentor Testimonial</span>
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {endorsements.length > 0 ? (
              endorsements.map((end) => (
                <div
                  key={end.id}
                  style={{
                    padding: "18px 22px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--accent-primary)", fontWeight: "700" }}>
                      ENDORSED SKILL: {end.skill}
                    </span>
                    <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{end.date}</span>
                  </div>
                  <p style={{ fontSize: "13.5px", color: "var(--text-highlight)", fontStyle: "italic", lineHeight: "1.5" }}>
                    "{end.endorsementText}"
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <span>— {end.endorserName}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
                      Signer: {end.endorserWallet.slice(0, 6)}...{end.endorserWallet.slice(-4)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No mentor endorsements recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL: EDIT PROFILE */}
      {isEditingProfile && (
        <div className="modal-overlay" onClick={() => setIsEditingProfile(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px", padding: "24px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>Edit Student Profile</h3>
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="e.g. Alex John"
                  className="field-input"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>College / Institution</label>
                <input
                  type="text"
                  value={profileForm.college}
                  onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
                  placeholder="e.g. Sardar Patel Institute of Technology"
                  className="field-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Degree / Program</label>
                  <input
                    type="text"
                    value={profileForm.degree}
                    onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
                    placeholder="e.g. B.E. Computer Engineering"
                    className="field-input"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Graduation Year</label>
                  <input
                    type="text"
                    value={profileForm.graduationYear}
                    onChange={(e) => setProfileForm({ ...profileForm, graduationYear: e.target.value })}
                    placeholder="e.g. 2027"
                    className="field-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Short Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Tell employers about your technical passion..."
                  className="field-input"
                  rows={3}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Avatar Photo URL</label>
                <input
                  type="url"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="field-input"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" onClick={() => setIsEditingProfile(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROJECT */}
      {isAddingProject && (
        <div className="modal-overlay" onClick={() => setIsAddingProject(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px", padding: "24px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "6px" }}>Add Project Evidence</h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Add a technical project as portfolio evidence for recruiters and authorized issuers to review.
            </p>
            <form onSubmit={handleAddProject} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Project Name *</label>
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="e.g. E-Commerce Platform"
                  className="field-input"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Project Description</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="What does the project do, and what problem does it solve?"
                  className="field-input"
                  rows={3}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Technologies Used</label>
                  <input
                    type="text"
                    value={projectForm.technologies}
                    onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                    placeholder="e.g. React, Node.js, MongoDB"
                    className="field-input"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Skills Demonstrated</label>
                  <input
                    type="text"
                    value={projectForm.skillsDemonstrated}
                    onChange={(e) => setProjectForm({ ...projectForm, skillsDemonstrated: e.target.value })}
                    placeholder="e.g. React, REST APIs, MongoDB"
                    className="field-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>GitHub Repository URL</label>
                  <input
                    type="url"
                    value={projectForm.githubUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="field-input"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Live Demo URL</label>
                  <input
                    type="url"
                    value={projectForm.demoUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })}
                    placeholder="https://myproject.xyz"
                    className="field-input"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" onClick={() => setIsAddingProject(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Project Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ENDORSEMENT */}
      {isAddingEndorsement && (
        <div className="modal-overlay" onClick={() => setIsAddingEndorsement(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px", padding: "24px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "6px" }}>Add Mentor Endorsement</h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Record a testimonial endorsement from a project mentor, instructor, or senior peer.
            </p>
            <form onSubmit={handleAddEndorsement} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Endorsed Skill / Competency *</label>
                <input
                  type="text"
                  value={endorsementForm.skill}
                  onChange={(e) => setEndorsementForm({ ...endorsementForm, skill: e.target.value })}
                  placeholder="e.g. React Frontend Architecture"
                  className="field-input"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Mentor Testimonial *</label>
                <textarea
                  value={endorsementForm.endorsementText}
                  onChange={(e) => setEndorsementForm({ ...endorsementForm, endorsementText: e.target.value })}
                  placeholder="Describe your collaboration and assessment of the student's skill..."
                  className="field-input"
                  rows={3}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Mentor Name & Role</label>
                  <input
                    type="text"
                    value={endorsementForm.endorserName}
                    onChange={(e) => setEndorsementForm({ ...endorsementForm, endorserName: e.target.value })}
                    placeholder="e.g. Prof. Sharma (Project Mentor)"
                    className="field-input"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Mentor Wallet Address</label>
                  <input
                    type="text"
                    value={endorsementForm.endorserWallet}
                    onChange={(e) => setEndorsementForm({ ...endorsementForm, endorserWallet: e.target.value })}
                    placeholder="0x..."
                    className="field-input mono"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" onClick={() => setIsAddingEndorsement(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Endorsement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {showQR && (
        <QRCodeModal
          url={`${window.location.origin}/vault/${account}`}
          title="Share Student Passport"
          description={`Scan to inspect verified skills, projects, and Monad credentials bound to ${account.slice(0, 6)}...${account.slice(-4)}.`}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
