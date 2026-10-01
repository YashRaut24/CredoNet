import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Award, 
  ArrowRight, 
  ExternalLink, 
  Copy, 
  Check, 
  QrCode, 
  FolderGit2, 
  ShieldCheck, 
  Sparkles, 
  Code2, 
  User, 
  GraduationCap, 
  Lock, 
  CheckCircle2,
  Share2
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { useRole } from "../context/RoleContext";
import { getStudentProfile, getStudentProjects, calculateAchievements } from "../utils/studentStorage";
import { QRCodeModal } from "../components/QRCodeModal";
import "./StudentHomePage.css";

export function StudentHomePage() {
  const { user } = useRole();
  const { account, getReadOnlyContract, connectWallet, isConnecting } = useWeb3();

  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const activeWallet = account || user?.walletAddress || "0x71C92a8C943B8d62283e1c66289b5B38B71C4e92";
  const publicUrl = `${window.location.origin}/vault/${activeWallet}`;

  const profile = getStudentProfile();
  const projects = getStudentProjects();
  const achievements = calculateAchievements(credentials, projects);

  useEffect(() => {
    async function fetchCreds() {
      if (!account) return;
      try {
        setLoading(true);
        const contract = getReadOnlyContract();
        const raw = await contract.getStudentCredentials(account);
        const parsed = (raw || []).map((c) => ({
          credentialId: c?.credentialId || "",
          recipient: c?.recipient || "",
          issuer: c?.issuer || "",
          title: c?.title || "",
          category: c?.category || "",
          skills: c?.skills || "",
          issueDate: c?.issueDate ? Number(c.issueDate) : 0,
          isRevoked: Boolean(c?.isRevoked),
        }));
        setCredentials(parsed.filter((c) => !c.isRevoked));
      } catch (err) {
        console.error("Failed to load on-chain credentials:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCreds();
  }, [account]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="student-home-container">
      {/* Student Welcome Banner */}
      <section className="student-hero-banner">
        <div className="student-hero-content">
          <div className="student-badge-row">
            <span className="student-role-tag">
              <GraduationCap size={14} />
              <span>Student Achievement Hub</span>
            </span>
            <span className="student-verified-pill">
              <ShieldCheck size={13} color="#10b981" />
              <span>Verifiable Passport Active</span>
            </span>
          </div>

          <h1 className="student-hero-title">
            Welcome back, <span className="student-highlight-name">{user?.name || "Student"}</span>
          </h1>

          <p className="student-hero-subtitle">
            {user?.organization ? `${user.organization} • ` : ""}
            Your portable, tamper-evident career skill passport. Collect official credentials, showcase verified projects, and share proof with employers.
          </p>

          <div className="student-wallet-strip">
            <div className="wallet-strip-item">
              <span className="strip-label">Wallet Address:</span>
              <span className="strip-value font-mono">
                {account ? `${account.slice(0, 8)}...${account.slice(-6)}` : (user?.walletAddress ? `${user.walletAddress.slice(0, 8)}...` : "Not connected")}
              </span>
              {account && (
                <button onClick={() => handleCopy(account)} className="strip-copy-btn" title="Copy Wallet">
                  {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                </button>
              )}
            </div>
            <div className="wallet-strip-item">
              <span className="strip-label">Contract:</span>
              <span className="strip-value font-mono">0xc6Bf...8e6f</span>
            </div>
            <div className="wallet-strip-item">
              <span className="strip-label">Network:</span>
              <span className="strip-value network-dot-wrap">
                <span className="active-dot" /> EVM Testnet (10143)
              </span>
            </div>
          </div>
        </div>

        {/* Public Link Card */}
        <div className="student-hero-card">
          <div className="hero-card-header">
            <Share2 size={16} color="#f26c36" />
            <span>Public Shareable Passport</span>
          </div>
          <p className="hero-card-text">
            Recruiters and employers can view and verify all your credentials without needing to sign in.
          </p>
          <div className="public-url-box">
            <input type="text" readOnly value={publicUrl} className="public-url-input" />
            <button onClick={() => handleCopy(publicUrl)} className="btn-copy-url">
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <div className="hero-card-actions">
            <Link to={`/vault/${activeWallet}`} className="btn-view-vault">
              <ExternalLink size={13} />
              <span>Preview Public View</span>
            </Link>
            <button onClick={() => setShowQR(true)} className="btn-qr-pill">
              <QrCode size={13} />
              <span>QR Code</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Metric Cards */}
      <section className="student-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap amber">
            <Award size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-number">{credentials.length}</span>
            <span className="stat-label">On-Chain Credentials</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap blue">
            <FolderGit2 size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-number">{projects.length}</span>
            <span className="stat-label">Showcased Projects</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap purple">
            <Sparkles size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-number">{achievements.length}</span>
            <span className="stat-label">Unlocked Achievements</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap green">
            <ShieldCheck size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-number">100%</span>
            <span className="stat-label">Cryptographic Validity</span>
          </div>
        </div>
      </section>

      {/* Core Student Action Hub */}
      <section className="student-features-section">
        <h2 className="section-title">Your Student Workspace</h2>
        <p className="section-desc">Manage your verifiable achievements, portfolio evidence, and credentials.</p>

        <div className="features-grid">
          {/* Card 1: My Passport */}
          <div className="feature-card highlight">
            <div className="feature-card-header">
              <div className="feature-icon-badge amber">
                <GraduationCap size={22} />
              </div>
              <span className="feature-status-tag">Primary</span>
            </div>
            <h3 className="feature-card-title">My Career Passport</h3>
            <p className="feature-card-desc">
              Manage your verified credentials, add projects with GitHub and live demo links, customize your academic bio, and build your cryptographic portfolio.
            </p>
            <ul className="feature-points">
              <li><CheckCircle2 size={13} color="#10b981" /> Link GitHub repositories & technology stacks</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Map projects directly to verified skills</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Customize academic profile & career bio</li>
            </ul>
            <Link to="/dashboard" className="btn-feature-cta primary">
              <span>Open Passport Studio</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Card 2: Public Vault */}
          <div className="feature-card">
            <div className="feature-card-header">
              <div className="feature-icon-badge blue">
                <Share2 size={22} />
              </div>
              <span className="feature-status-tag">Shareable</span>
            </div>
            <h3 className="feature-card-title">Public Candidate Vault</h3>
            <p className="feature-card-desc">
              Your public tamper-evident link designed for resumes, LinkedIn profiles, and job applications. Recruiters can verify your skills directly on-chain.
            </p>
            <ul className="feature-points">
              <li><CheckCircle2 size={13} color="#10b981" /> 1-Click public verification for recruiters</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Tamper-evident proof signed by issuers</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Downloadable QR Code for paper resumes</li>
            </ul>
            <Link to={`/vault/${activeWallet}`} className="btn-feature-cta secondary">
              <span>View Public Vault</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Card 3: Credential Request Guide */}
          <div className="feature-card">
            <div className="feature-card-header">
              <div className="feature-icon-badge green">
                <Award size={22} />
              </div>
              <span className="feature-status-tag">Issuance Info</span>
            </div>
            <h3 className="feature-card-title">How to Get Certified</h3>
            <p className="feature-card-desc">
              Official credentials can only be issued by accredited institutions (universities, bootcamps, certification bodies). Students cannot self-certify skills.
            </p>
            <ul className="feature-points">
              <li><CheckCircle2 size={13} color="#10b981" /> Provide your wallet address to your university/issuer</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Issuer signs & anchors the credential on-chain</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Instantly appears in your passport</li>
            </ul>
            <button 
              onClick={() => handleCopy(account || user?.walletAddress || "")} 
              className="btn-feature-cta secondary"
              disabled={!account && !user?.walletAddress}
            >
              <span>{copied ? "Wallet Copied!" : "Copy Wallet to Request Credential"}</span>
              <Copy size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* QR Code Modal */}
      {showQR && (
        <QRCodeModal
          url={publicUrl}
          title={`${user?.name || "Student"}'s Public Passport`}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
