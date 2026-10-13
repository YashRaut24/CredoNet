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
  Code2,
  Send,
  Inbox
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { CredentialCard } from "../components/CredentialCard";
import { QRCodeModal } from "../components/QRCodeModal";
import { RequestCredentialModal } from "../components/RequestCredentialModal";
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

  // Tab State: "overview" | "skills" | "projects" | "credentials" | "requests" | "achievements" | "endorsements"
  const [activeTab, setActiveTab] = useState("overview");

  // Requests state
  const [requests, setRequests] = useState([]);
  const [isRequestingCredential, setIsRequestingCredential] = useState(false);

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

  // Load student verification requests
  const loadStudentRequests = async () => {
    if (!account) return;
    try {
      const res = await fetch(`/api/requests/student/${account}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.requests)
          ? data.requests
          : Array.isArray(data?.claims)
          ? data.claims
          : [];
        setRequests(list);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.warn("Could not load student requests:", err);
      setRequests([]);
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
      await loadStudentRequests();
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
      <div className="container dashboard-connect-container">
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
            className="btn-primary dashboard-connect-btn"
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
          <div className="profile-avatar dashboard-profile-avatar-wrap">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" className="dashboard-profile-avatar-img" />
            ) : (
              <User size={30} />
            )}
          </div>
          <div className="profile-info">
            <div className="dashboard-profile-header-row">
              <h2 className="dashboard-profile-title">
                {profile.name || "Student Passport Holder"}
              </h2>
              <button
                onClick={() => {
                  setProfileForm(profile);
                  setIsEditingProfile(true);
                }}
                className="btn-secondary dashboard-btn-xs"
                title="Edit Profile"
              >
                <Edit3 size={11} />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="dashboard-meta-row">
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
              <p className="dashboard-bio">
                {profile.bio}
              </p>
            )}

            <div className="profile-address-row dashboard-address-row">
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
          <button onClick={() => setIsRequestingCredential(true)} className="btn-primary dashboard-request-claim-btn">
            <Send size={13} />
            <span>Request Credential</span>
          </button>

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
          <span className="stat-box-sub stat-sub-success">✓ On-Chain Certified</span>
        </div>

        <div className="stat-box">
          <span className="stat-box-label">Active Credentials</span>
          <span className="stat-box-value">{validCreds.length}</span>
          <span className="stat-box-sub stat-sub-accent">Valid on Monad</span>
        </div>

        <div className="stat-box">
          <span className="stat-box-label">Projects Added</span>
          <span className="stat-box-value">{projects.length}</span>
          <span className="stat-box-sub stat-sub-info">Portfolio Evidence</span>
        </div>

        <div className="stat-box">
          <span className="stat-box-label">Achievements</span>
          <span className="stat-box-value">{achievements.filter(a => a.unlocked).length}</span>
          <span className="stat-box-sub stat-sub-warning">Unlocked</span>
        </div>
      </div>

      {/* 3. Logical Rules & Security Notice */}
      <div className="dashboard-authenticity-banner">
        <div className="dashboard-authenticity-content">
          <ShieldCheck size={18} color="var(--accent-primary)" />
          <span className="dashboard-authenticity-text">
            <strong>Authenticity Model:</strong> You can document projects and profile evidence, but <em>skills and credentials are only verified when cryptographically issued by an authorized institution on Monad</em>. Students cannot self-verify.
          </span>
        </div>
      </div>

      {/* 4. Navigation Sub-Tabs */}
      <div className="dashboard-tabs-nav">
        {[
          { id: "overview", label: "Overview", count: null },
          { id: "skills", label: "Skills & Evidence", count: evidenceSkillMap.length },
          { id: "projects", label: "Projects Portfolio", count: projects.length },
          { id: "credentials", label: "Monad Credentials", count: credentials.length },
          { id: "requests", label: "Verification Claims", count: requests.length },
          { id: "achievements", label: "Achievements", count: achievements.filter(a => a.unlocked).length },
          { id: "endorsements", label: "Mentor Endorsements", count: endorsements.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`dashboard-tab-pill ${activeTab === tab.id ? "active" : ""}`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className="dashboard-tab-pill-badge">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 5. TAB: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="dashboard-tab-content-col-lg">
          {/* Verified Skills Summary */}
          <div className="dashboard-section-card">
            <div className="dashboard-card-head">
              <h3 className="dashboard-card-heading">
                <Award size={16} color="var(--accent-primary)" />
                <span>Verified Skills (Issuer-Certified)</span>
              </h3>
              <button onClick={() => setActiveTab("skills")} className="btn-secondary dashboard-btn-xs">
                <span>View Full Evidence Map</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="dashboard-skills-badges-wrap">
              {evidenceSkillMap.filter(s => s.isVerified).length > 0 ? (
                evidenceSkillMap.filter(s => s.isVerified).map((s, idx) => (
                  <div key={idx} className="dashboard-badge-certified">
                    <span>✓</span>
                    <span>{s.name}</span>
                  </div>
                ))
              ) : (
                <p className="dashboard-muted-msg">
                  No skills have been verified by an authorized issuer yet. Request an authorized issuer to certify your achievements.
                </p>
              )}
            </div>
          </div>

          {/* Recent Projects & Recent Credentials */}
          <div className="dashboard-grid-2col">
            {/* Projects Box */}
            <div className="dashboard-section-card">
              <div className="dashboard-card-head">
                <h3 className="dashboard-card-heading">
                  <FolderGit2 size={16} color="#38bdf8" />
                  <span>Project Portfolio Evidence</span>
                </h3>
                <button onClick={() => setIsAddingProject(true)} className="btn-secondary dashboard-btn-xs">
                  <PlusCircle size={12} />
                  <span>Add</span>
                </button>
              </div>

              {projects.length > 0 ? (
                <div className="dashboard-preview-list">
                  {projects.slice(0, 3).map((p) => (
                    <div key={p.id} className="dashboard-preview-item">
                      <div className="dashboard-preview-item-row">
                        <span className="dashboard-preview-item-title">{p.name}</span>
                        <span className="dashboard-preview-item-sub">EVIDENCE</span>
                      </div>
                      <p className="dashboard-preview-item-desc">{p.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="dashboard-muted-msg">No projects added yet. Click Add to document your project evidence.</p>
              )}
            </div>

            {/* Credentials Box */}
            <div className="dashboard-section-card">
              <div className="dashboard-card-head">
                <h3 className="dashboard-card-heading">
                  <ShieldCheck size={16} color="var(--accent-primary)" />
                  <span>Recent Monad Credentials</span>
                </h3>
                <button onClick={() => setActiveTab("credentials")} className="btn-secondary dashboard-btn-xs">
                  <span>View All ({credentials.length})</span>
                </button>
              </div>

              {credentials.length > 0 ? (
                <div className="dashboard-preview-list">
                  {credentials.slice(0, 3).map((c) => (
                    <div key={c.credentialId} className="dashboard-cred-item">
                      <div>
                        <span className="dashboard-cred-name">{c.skill}</span>
                        <span className="dashboard-cred-issuer">Issuer: {c.issuer.slice(0, 6)}...{c.issuer.slice(-4)}</span>
                      </div>
                      <span className={`status-pill ${c.revoked ? "revoked" : "valid"}`}>
                        {c.revoked ? "✕ REVOKED" : "✓ VALID"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="dashboard-muted-msg">No credentials recorded on Monad blockchain yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB: SKILLS & EVIDENCE */}
      {activeTab === "skills" && (
        <div className="dashboard-tab-content-col">
          <div className="credentials-section-header">
            <div>
              <h3 className="connect-title">
                Evidence-Based Skill Directory
              </h3>
              <p className="connect-desc">
                Each skill connects demonstrated project evidence, mentor endorsements, and official blockchain certifications.
              </p>
            </div>
          </div>

          <div className="dashboard-skill-dir-grid">
            {evidenceSkillMap.map((item, idx) => (
              <div key={idx} className="dashboard-skill-dir-card">
                <div className="dashboard-skill-dir-card-top">
                  <div className="dashboard-skill-title-wrap">
                    <Code2 size={18} color="var(--accent-primary)" />
                    <h4 className="dashboard-skill-dir-title">
                      {item.name}
                    </h4>
                  </div>
                  <div>
                    {item.isVerified ? (
                      <span className="verify-status-badge valid">
                        <CheckCircle2 size={13} />
                        <span>✓ VERIFIED BY RECOGNIZED ISSUER</span>
                      </span>
                    ) : (
                      <span className="dashboard-skill-tag-portfolio">
                        <FolderGit2 size={12} />
                        <span>PORTFOLIO EVIDENCE (UNVERIFIED)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Evidence Details */}
                <div className="dashboard-skill-evidence-grid">
                  {/* Associated Projects */}
                  <div className="dashboard-skill-box">
                    <span className="dashboard-skill-box-label">
                      DEMONSTRATED IN PROJECTS ({item.projects.length})
                    </span>
                    {item.projects.length > 0 ? (
                      <div className="dashboard-skill-box-list">
                        {item.projects.map((p) => (
                          <span key={p.id} className="dashboard-project-link-sky">
                            • {p.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="dashboard-muted-msg">None linked yet</span>
                    )}
                  </div>

                  {/* Associated Credentials & Endorsements */}
                  <div className="dashboard-skill-box">
                    <span className="dashboard-skill-box-label">
                      BLOCKCHAIN CREDENTIALS & ENDORSEMENTS
                    </span>
                    {item.credentials.length > 0 ? (
                      <div className="dashboard-skill-box-list">
                        {item.credentials.map((c) => (
                          <span key={c.credentialId} className="dashboard-cred-link-green">
                            ✓ Credential #{c.credentialId.slice(0, 8)}... (Issuer: {c.issuer.slice(0, 6)}...)
                          </span>
                        ))}
                      </div>
                    ) : item.endorsements.length > 0 ? (
                      <div className="dashboard-skill-box-list">
                        {item.endorsements.map((end) => (
                          <span key={end.id} className="dashboard-endorse-yellow">
                            🤝 Endorsed by {end.endorserName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="dashboard-muted-msg">Awaiting issuer certification on Monad</span>
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
        <div className="dashboard-tab-content-col">
          <div className="credentials-section-header">
            <div>
              <h3 className="connect-title">
                Project Portfolio
              </h3>
              <p className="connect-desc">
                Add your technical builds as evidence. Issuers can verify skills linked to these projects.
              </p>
            </div>
            <button onClick={() => setIsAddingProject(true)} className="btn-primary dashboard-request-claim-btn">
              <PlusCircle size={14} />
              <span>Add New Project</span>
            </button>
          </div>

          <div className="dashboard-projects-grid">
            {projects.map((proj) => (
              <div key={proj.id} className="dashboard-project-card">
                <div>
                  <div className="dashboard-project-card-top">
                    <h4 className="dashboard-project-title">{proj.name}</h4>
                    <span className="dashboard-project-badge">
                      PORTFOLIO EVIDENCE
                    </span>
                  </div>

                  <p className="dashboard-project-desc">
                    {proj.description}
                  </p>

                  {proj.technologies && (
                    <div className="dashboard-chips-group">
                      <span className="dashboard-chips-label">TECH STACK:</span>
                      <div className="dashboard-project-chips-wrap">
                        {proj.technologies.split(",").map((tech, tIdx) => (
                          <span key={tIdx} className="dashboard-tech-chip">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {proj.skillsDemonstrated && (
                    <div className="dashboard-chips-group">
                      <span className="dashboard-chips-label">DEMONSTRATED SKILLS:</span>
                      <div className="dashboard-project-chips-wrap">
                        {proj.skillsDemonstrated.split(",").map((sk, sIdx) => (
                          <span key={sIdx} className="dashboard-skill-chip">
                            • {sk.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="dashboard-project-footer">
                  <div className="dashboard-project-links">
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary dashboard-btn-xs">
                        <GitBranch size={12} />
                        <span>Code</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                    {proj.demoUrl && (
                      <a href={proj.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary dashboard-btn-xs">
                        <span>Demo</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <button onClick={() => handleDeleteProject(proj.id)} className="btn-secondary dashboard-btn-xs" title="Delete Project">
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
        <div className="dashboard-tab-content-col">
          <div className="credentials-section-header">
            <h3 className="connect-title">On-Chain Monad Credentials</h3>
            <span className="credentials-count-pill">{credentials.length} Issued</span>
          </div>

          {credentials.length > 0 ? (
            <div className="credentials-grid">
              {credentials.map((cred) => (
                <CredentialCard key={cred.credentialId} credential={cred} allowBlind={true} />
              ))}
            </div>
          ) : (
            <div className="empty-credentials-box">
              <ShieldCheck size={28} color="var(--accent-primary)" />
              <h4>No credentials issued to this wallet yet</h4>
              <p className="dashboard-muted-msg">
                Request an authorized university, bootcamp, or mentor to issue credentials to your wallet address.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 8b. TAB: VERIFICATION CLAIMS & REQUESTS */}
      {activeTab === "requests" && (
        <div className="dashboard-tab-content-col">
          <div className="credentials-section-header">
            <div>
              <h3 className="connect-title">
                Student Verification Claims & Requests
              </h3>
              <p className="connect-desc">
                Submit proof of project completion or skill mastery to authorized institutional issuers for on-chain certification.
              </p>
            </div>
            <button onClick={() => setIsRequestingCredential(true)} className="btn-primary dashboard-request-claim-btn">
              <PlusCircle size={14} />
              <span>Submit New Claim</span>
            </button>
          </div>

          {requests.length > 0 ? (
            <div className="dashboard-preview-list">
              {requests.map((req) => (
                <div key={req.id} className="dashboard-claim-card">
                  <div className="dashboard-claim-header">
                    <div>
                      <div className="dashboard-claim-title-wrap">
                        <h4 className="dashboard-claim-title">
                          {req.skillTitle}
                        </h4>
                        <span className="dashboard-claim-cat-tag">
                          {req.category}
                        </span>
                      </div>
                      <p className="dashboard-claim-desc">
                        {req.description}
                      </p>
                    </div>

                    <div>
                      {req.status === "PENDING" && (
                        <span className="dashboard-claim-status-pending">
                          <Inbox size={12} />
                          <span>PENDING ISSUER REVIEW</span>
                        </span>
                      )}
                      {req.status === "APPROVED" && (
                        <span className="dashboard-claim-status-approved">
                          <CheckCircle2 size={12} />
                          <span>APPROVED & MINTED</span>
                        </span>
                      )}
                      {req.status === "REJECTED" && (
                        <span className="dashboard-claim-status-rejected">
                          <XCircle size={12} />
                          <span>REJECTED</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Evidence & Issuer Details */}
                  <div className="dashboard-claim-details-grid">
                    {req.evidenceProject && (
                      <div>
                        <span className="dashboard-detail-label">EVIDENCE PROJECT:</span>
                        <span className="dashboard-project-link-sky">{req.evidenceProject}</span>
                      </div>
                    )}
                    {req.evidenceGithubUrl && (
                      <div>
                        <span className="dashboard-detail-label">GITHUB REPOSITORY:</span>
                        <a href={req.evidenceGithubUrl} target="_blank" rel="noopener noreferrer" className="dashboard-cred-link-green">
                          <span>{req.evidenceGithubUrl.replace("https://github.com/", "")}</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    )}
                    <div>
                      <span className="dashboard-detail-label">TARGETED ISSUER:</span>
                      <span className="dashboard-detail-mono">
                        {req.issuerAddress.slice(0, 8)}...{req.issuerAddress.slice(-6)}
                      </span>
                    </div>
                    {req.credentialId && (
                      <div>
                        <span className="dashboard-detail-label">ON-CHAIN CREDENTIAL:</span>
                        <Link to={`/verify/${req.credentialId}`} className="dashboard-cred-link-green">
                          <span>View #{req.credentialId.slice(0, 8)}...</span>
                          <ExternalLink size={11} />
                        </Link>
                      </div>
                    )}
                  </div>

                  {req.issuerNotes && (
                    <div className="dashboard-claim-notes">
                      Issuer Notes: "{req.issuerNotes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-credentials-box">
              <Inbox size={30} color="var(--accent-primary)" />
              <h4>No verification claims submitted yet</h4>
              <p className="dashboard-muted-msg">
                Built an awesome project or finished a course? Submit a verification claim with your GitHub proof to an authorized issuer for blockchain certification.
              </p>
              <button onClick={() => setIsRequestingCredential(true)} className="btn-primary dashboard-request-claim-btn">
                <Send size={13} />
                <span>Submit Verification Claim</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 9. TAB: ACHIEVEMENTS */}
      {activeTab === "achievements" && (
        <div className="dashboard-tab-content-col">
          <div>
            <h3 className="connect-title">
              Career Milestones & Achievements
            </h3>
            <p className="connect-desc">
              Achievements are automatically calculated from actual verifiable on-chain credentials and documented projects.
            </p>
          </div>

          <div className="dashboard-achievements-grid">
            {achievements.map((ach) => (
              <div key={ach.id} className={`dashboard-achievement-card ${ach.unlocked ? "unlocked" : ""}`}>
                <div className={`dashboard-achievement-icon-wrap ${ach.unlocked ? "unlocked" : ""}`}>
                  {ach.icon}
                </div>
                <div className="dashboard-achievement-body">
                  <div className="dashboard-achievement-header">
                    <h4 className="dashboard-achievement-title">{ach.title}</h4>
                    <span className={`dashboard-achievement-tag ${ach.unlocked ? "unlocked" : ""}`}>
                      {ach.unlocked ? "✓ UNLOCKED" : "LOCKED"}
                    </span>
                  </div>
                  <p className="dashboard-achievement-desc">
                    {ach.description}
                  </p>
                  <div className="dashboard-achievement-rule">
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
        <div className="dashboard-tab-content-col">
          <div className="credentials-section-header">
            <div>
              <h3 className="connect-title">
                Mentor Endorsements
              </h3>
              <p className="connect-desc">
                Testimonials from project mentors, instructors, and lead engineers. Distinct from institutional credentials.
              </p>
            </div>
            <button onClick={() => setIsAddingEndorsement(true)} className="btn-secondary dashboard-request-claim-btn">
              <PlusCircle size={14} />
              <span>Add Mentor Testimonial</span>
            </button>
          </div>

          <div className="dashboard-endorsements-list">
            {endorsements.length > 0 ? (
              endorsements.map((end) => (
                <div key={end.id} className="dashboard-endorsement-card">
                  <div className="dashboard-endorsement-header">
                    <span className="dashboard-endorsement-skill">
                      ENDORSED SKILL: {end.skill}
                    </span>
                    <span className="dashboard-endorsement-date">{end.date}</span>
                  </div>
                  <p className="dashboard-endorsement-quote">
                    "{end.endorsementText}"
                  </p>
                  <div className="dashboard-endorsement-footer">
                    <span>— {end.endorserName}</span>
                    <span className="dashboard-signer-mono">
                      Signer: {end.endorserWallet.slice(0, 6)}...{end.endorserWallet.slice(-4)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="dashboard-muted-msg">No mentor endorsements recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL: EDIT PROFILE */}
      {isEditingProfile && (
        <div className="modal-overlay" onClick={() => setIsEditingProfile(false)}>
          <div className="modal-dialog dashboard-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="dashboard-modal-title">Edit Student Profile</h3>
            <form onSubmit={handleSaveProfile} className="dashboard-form-col">
              <div>
                <label className="dashboard-label">Full Name</label>
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
                <label className="dashboard-label">College / Institution</label>
                <input
                  type="text"
                  value={profileForm.college}
                  onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
                  placeholder="e.g. Sardar Patel Institute of Technology"
                  className="field-input"
                />
              </div>

              <div className="dashboard-form-2col">
                <div>
                  <label className="dashboard-label">Degree / Program</label>
                  <input
                    type="text"
                    value={profileForm.degree}
                    onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
                    placeholder="e.g. B.E. Computer Engineering"
                    className="field-input"
                  />
                </div>
                <div>
                  <label className="dashboard-label">Graduation Year</label>
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
                <label className="dashboard-label">Short Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Tell employers about your technical passion..."
                  className="field-input"
                  rows={3}
                />
              </div>

              <div>
                <label className="dashboard-label">Avatar Photo URL</label>
                <input
                  type="url"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="field-input"
                />
              </div>

              <div className="dashboard-form-actions">
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
          <div className="modal-dialog dashboard-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="dashboard-modal-title">Add Project Evidence</h3>
            <p className="dashboard-modal-sub">
              Add a technical project as portfolio evidence for recruiters and authorized issuers to review.
            </p>
            <form onSubmit={handleAddProject} className="dashboard-form-col">
              <div>
                <label className="dashboard-label">Project Name *</label>
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
                <label className="dashboard-label">Project Description</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="What does the project do, and what problem does it solve?"
                  className="field-input"
                  rows={3}
                />
              </div>

              <div className="dashboard-form-2col">
                <div>
                  <label className="dashboard-label">Technologies Used</label>
                  <input
                    type="text"
                    value={projectForm.technologies}
                    onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                    placeholder="e.g. React, Node.js, MongoDB"
                    className="field-input"
                  />
                </div>
                <div>
                  <label className="dashboard-label">Skills Demonstrated</label>
                  <input
                    type="text"
                    value={projectForm.skillsDemonstrated}
                    onChange={(e) => setProjectForm({ ...projectForm, skillsDemonstrated: e.target.value })}
                    placeholder="e.g. React, REST APIs, MongoDB"
                    className="field-input"
                  />
                </div>
              </div>

              <div className="dashboard-form-2col">
                <div>
                  <label className="dashboard-label">GitHub Repository URL</label>
                  <input
                    type="url"
                    value={projectForm.githubUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="field-input"
                  />
                </div>
                <div>
                  <label className="dashboard-label">Live Demo URL</label>
                  <input
                    type="url"
                    value={projectForm.demoUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })}
                    placeholder="https://myproject.xyz"
                    className="field-input"
                  />
                </div>
              </div>

              <div className="dashboard-form-actions">
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
          <div className="modal-dialog dashboard-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="dashboard-modal-title">Add Mentor Endorsement</h3>
            <p className="dashboard-modal-sub">
              Record a testimonial endorsement from a project mentor, instructor, or senior peer.
            </p>
            <form onSubmit={handleAddEndorsement} className="dashboard-form-col">
              <div>
                <label className="dashboard-label">Endorsed Skill / Competency *</label>
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
                <label className="dashboard-label">Mentor Testimonial *</label>
                <textarea
                  value={endorsementForm.endorsementText}
                  onChange={(e) => setEndorsementForm({ ...endorsementForm, endorsementText: e.target.value })}
                  placeholder="Describe your collaboration and assessment of the student's skill..."
                  className="field-input"
                  rows={3}
                  required
                />
              </div>

              <div className="dashboard-form-2col">
                <div>
                  <label className="dashboard-label">Mentor Name & Role</label>
                  <input
                    type="text"
                    value={endorsementForm.endorserName}
                    onChange={(e) => setEndorsementForm({ ...endorsementForm, endorserName: e.target.value })}
                    placeholder="e.g. Prof. Sharma (Project Mentor)"
                    className="field-input"
                  />
                </div>
                <div>
                  <label className="dashboard-label">Mentor Wallet Address</label>
                  <input
                    type="text"
                    value={endorsementForm.endorserWallet}
                    onChange={(e) => setEndorsementForm({ ...endorsementForm, endorserWallet: e.target.value })}
                    placeholder="0x..."
                    className="field-input mono"
                  />
                </div>
              </div>

              <div className="dashboard-form-actions">
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

      {/* REQUEST CREDENTIAL MODAL */}
      {isRequestingCredential && (
        <RequestCredentialModal
          isOpen={isRequestingCredential}
          onClose={() => setIsRequestingCredential(false)}
          studentAddress={account}
          onRequestSubmitted={() => {
            loadStudentRequests();
            setActiveTab("requests");
          }}
        />
      )}
    </div>
  );
}
