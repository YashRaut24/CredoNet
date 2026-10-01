import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Award, 
  Building2, 
  Check, 
  Zap, 
  Users, 
  FileCheck, 
  FileSearch,
  Lock
} from "lucide-react";
import { useRole } from "../context/RoleContext";
import "./EmployerHomePage.css";

export function EmployerHomePage() {
  const { user } = useRole();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setSearchError("Please enter a wallet address or Credential ID");
      return;
    }

    if (query.startsWith("0x") && query.length === 42) {
      // Wallet address
      navigate(`/vault/${query}`);
    } else {
      // Credential ID
      navigate(`/verify/${query}`);
    }
  };

  const sampleProfiles = [
    {
      name: "Alex John",
      address: "0x71C92a8C943B8d62283e1c66289b5B38B71C4e92",
      role: "Distributed Systems & Solidity Engineer",
      skills: ["Solidity", "Smart Contract Security", "React.js", "Full Stack Development"],
      verifiedCount: 2,
    },
    {
      name: "Priya Sharma",
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      role: "Backend & Web3 Architect",
      skills: ["Go", "Node.js", "EVM Optimization", "PostgreSQL"],
      verifiedCount: 3,
    },
    {
      name: "Marcus Vance",
      address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      role: "Zero-Knowledge & Cryptography Specialist",
      skills: ["Circom", "ZK-SNARKs", "Rust", "Ethereum L1/L2"],
      verifiedCount: 4,
    }
  ];

  return (
    <div className="employer-home-container">
      {/* Employer Hero Banner */}
      <section className="employer-hero-banner">
        <div className="employer-hero-content">
          <div className="employer-badge-row">
            <span className="employer-role-tag">
              <Briefcase size={14} />
              <span>Verified Talent Acquisition Hub</span>
            </span>
            <span className="employer-verified-pill">
              <ShieldCheck size={13} color="#10b981" />
              <span>100% Cryptographic Verification</span>
            </span>
          </div>

          <h1 className="employer-hero-title">
            <span className="employer-org-title">{user?.organization || user?.name || "Tech Employer"}</span>
            <span className="employer-subheading"> Hiring Portal</span>
          </h1>

          <p className="employer-hero-subtitle">
            Eliminate resume fraud completely. Hire top engineering talent with on-chain credentials cryptographically signed by accredited universities, academies, and technical institutions.
          </p>

          {/* Quick Verifier Search Input */}
          <form onSubmit={handleQuickSearch} className="quick-search-form">
            <div className="quick-search-box">
              <Search size={18} color="#a855f7" className="quick-search-icon" />
              <input
                type="text"
                placeholder="Enter Candidate Wallet Address (0x...) or Credential ID"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchError("");
                }}
                className="quick-search-input"
              />
              <button type="submit" className="btn-verify-now">
                <span>Audit Candidate</span>
                <ArrowRight size={14} />
              </button>
            </div>
            {searchError && <p className="search-err-msg">{searchError}</p>}
          </form>
        </div>

        {/* Guarantee Card */}
        <div className="employer-guarantee-card">
          <div className="guarantee-card-header">
            <Lock size={18} color="#a855f7" />
            <span>Cryptographic Verification Guarantee</span>
          </div>
          <p className="guarantee-card-text">
            Traditional resumes rely on unverified claims. CredoNet credentials cannot be fabricated, forged, or edited by students. Every skill is signed with an authorized institution's private key.
          </p>
          <div className="guarantee-specs">
            <div className="spec-item">
              <span className="spec-dot" />
              <span>Tamper-evident ECDSA signature validation</span>
            </div>
            <div className="spec-item">
              <span className="spec-dot" />
              <span>Real-time revocation check against decentralized consensus</span>
            </div>
            <div className="spec-item">
              <span className="spec-dot" />
              <span>Direct GitHub repo proof matching verified skills</span>
            </div>
          </div>
          <Link to="/employer" className="btn-explore-talent">
            <Users size={14} />
            <span>Open Talent Directory</span>
          </Link>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="employer-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap purple">
            <Users size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-number">120+</span>
            <span className="stat-label">Pre-Verified Candidates</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap blue">
            <Building2 size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-number">18</span>
            <span className="stat-label">Accredited Partner Issuers</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap green">
            <ShieldCheck size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-number">0%</span>
            <span className="stat-label">Resume Fabrication Rate</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap amber">
            <Zap size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-number">&lt; 500ms</span>
            <span className="stat-label">Monad Verification Latency</span>
          </div>
        </div>
      </section>

      {/* Employer Actions */}
      <section className="employer-features-section">
        <h2 className="section-title">Employer Verification & Discovery Tools</h2>
        <p className="section-desc">Streamline your hiring workflow with mathematical certainty.</p>

        <div className="features-grid">
          {/* Card 1: Verifier Search */}
          <div className="feature-card highlight">
            <div className="feature-card-header">
              <div className="feature-icon-badge purple">
                <FileSearch size={22} />
              </div>
              <span className="feature-status-tag">Audit Tool</span>
            </div>
            <h3 className="feature-card-title">Cryptographic Candidate Verifier</h3>
            <p className="feature-card-desc">
              Lookup any candidate by wallet address or Credential ID. CredoNet pulls raw on-chain state directly from Monad smart contracts to verify authenticity and revocation status.
            </p>
            <ul className="feature-points">
              <li><CheckCircle2 size={13} color="#10b981" /> Instant cryptographic validity check</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Verified issuer identity & issue date</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Revocation status confirmation</li>
            </ul>
            <Link to="/verify/search" className="btn-feature-cta primary">
              <span>Open Verifier Terminal</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Card 2: Talent Directory */}
          <div className="feature-card">
            <div className="feature-card-header">
              <div className="feature-icon-badge blue">
                <Users size={22} />
              </div>
              <span className="feature-status-tag">Directory</span>
            </div>
            <h3 className="feature-card-title">Pre-Verified Talent Pipeline</h3>
            <p className="feature-card-desc">
              Search engineering candidates filtered by certified skills (Solidity, Distributed Systems, Rust, Web3). View verified project code repositories and issuer citations.
            </p>
            <ul className="feature-points">
              <li><CheckCircle2 size={13} color="#10b981" /> Filter by skill taxonomy & tech stack</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Direct links to student public vaults</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Verified GitHub project evidence</li>
            </ul>
            <Link to="/employer" className="btn-feature-cta secondary">
              <span>Browse Talent Directory</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Card 3: Enterprise Verification Specs */}
          <div className="feature-card">
            <div className="feature-card-header">
              <div className="feature-icon-badge green">
                <FileCheck size={22} />
              </div>
              <span className="feature-status-tag">Architecture</span>
            </div>
            <h3 className="feature-card-title">Monad EVM Trust Architecture</h3>
            <p className="feature-card-desc">
              CredoNet runs on Monad EVM contract <code>0xc6BfB22D6B46346B113333b5513BDcD361488e6f</code>. Smart contract state ensures no single entity can tamper with academic credentials.
            </p>
            <ul className="feature-points">
              <li><CheckCircle2 size={13} color="#10b981" /> Decentralized consensus on Monad</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Exportable cryptographic audit logs</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Zero reliance on PDF certificates</li>
            </ul>
            <Link to="/verify/0x71c92a8c943b8d62283e1c66289b5b38b71c4e92-1" className="btn-feature-cta secondary">
              <span>View Sample Audit Report</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Verified Candidates Preview */}
      <section className="featured-candidates-section">
        <div className="section-header-row">
          <div>
            <h3 className="section-title" style={{ fontSize: "20px" }}>Featured Pre-Verified Engineers</h3>
            <p className="section-desc" style={{ marginBottom: 0 }}>Candidates with active on-chain credentials verified on Monad Testnet.</p>
          </div>
          <Link to="/employer" className="btn-link-all">
            <span>View All in Directory</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="candidates-grid">
          {sampleProfiles.map((candidate, idx) => (
            <div key={idx} className="candidate-preview-card">
              <div className="candidate-card-top">
                <div className="candidate-avatar">
                  {candidate.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="candidate-info">
                  <h4 className="candidate-name">{candidate.name}</h4>
                  <span className="candidate-role">{candidate.role}</span>
                </div>
              </div>

              <div className="candidate-skills-wrap">
                {candidate.skills.map((s, sIdx) => (
                  <span key={sIdx} className="candidate-skill-tag">{s}</span>
                ))}
              </div>

              <div className="candidate-card-bottom">
                <span className="verified-badge">
                  <ShieldCheck size={12} color="#10b981" />
                  <span>{candidate.verifiedCount} Verified Credentials</span>
                </span>
                <Link to={`/vault/${candidate.address}`} className="btn-view-candidate">
                  <span>View Passport</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
