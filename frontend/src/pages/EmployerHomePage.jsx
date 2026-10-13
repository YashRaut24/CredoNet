import React, { useState, useEffect } from "react";
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

  const [directoryFilter, setDirectoryFilter] = useState("all");
  const [filterText, setFilterText] = useState("");
  const [realCandidates, setRealCandidates] = useState([]);

  useEffect(() => {
    async function loadCandidates() {
      try {
        const res = await fetch("/api/candidates");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.candidates) && data.candidates.length > 0) {
            setRealCandidates(data.candidates);
          }
        }
      } catch (e) {
        console.warn("Could not load candidate directory:", e);
      }
    }
    loadCandidates();
  }, []);

  const sampleProfiles = [
    {
      name: "Alex John",
      address: "0x71C92a8C943B8d62283e1c66289b5B38B71C4e92",
      role: "Distributed Systems & Full Stack Engineer",
      skills: ["React.js", "Node.js", "System Architecture", "Full Stack Development"],
      verifiedCount: 2,
    },
    {
      name: "XYZ Certified Candidate",
      address: "0x21626cDb67f0114D0F6a7dBC1140B7C0A9101864",
      role: "Mobile & Web Application Engineer",
      skills: ["Android Developer", "JavaScript", "API Integration", "Kotlin"],
      verifiedCount: 2,
    },
    {
      name: "Priya Sharma",
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      role: "Backend & Cloud Systems Architect",
      skills: ["Go", "Node.js", "System Optimization", "PostgreSQL"],
      verifiedCount: 3,
    },
    {
      name: "Marcus Vance",
      address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      role: "Cloud Security & Infrastructure Specialist",
      skills: ["Cloud Security", "API Security", "Rust", "DevOps & CI/CD"],
      verifiedCount: 4,
    }
  ];

  const allCandidates = [
    ...realCandidates,
    ...sampleProfiles.filter((sample) =>
      !realCandidates.some((real) =>
        (real.address && sample.address && real.address.toLowerCase() === sample.address.toLowerCase()) ||
        (real.name && sample.name && real.name.toLowerCase() === sample.name.toLowerCase())
      )
    )
  ];

  const filteredCandidates = allCandidates.filter((c) => {
    const matchesFilter =
      directoryFilter === "all" ||
      (directoryFilter === "certificate"
        ? Boolean(
            (c.role && (c.role.toLowerCase().includes("degree") || c.role.toLowerCase().includes("b.e") || c.role.toLowerCase().includes("engineer"))) ||
            c.skills.some((s) => s.toLowerCase().includes("cert") || s.toLowerCase().includes("degree"))
          )
        : c.skills.some((s) => s.toLowerCase().includes(directoryFilter.toLowerCase())));
    const matchesText =
      !filterText.trim() ||
      c.name.toLowerCase().includes(filterText.toLowerCase()) ||
      c.role.toLowerCase().includes(filterText.toLowerCase()) ||
      (c.address && c.address.toLowerCase().includes(filterText.toLowerCase())) ||
      c.skills.some((s) => s.toLowerCase().includes(filterText.toLowerCase()));
    return matchesFilter && matchesText;
  });

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
              <span>100% Verified Credentials</span>
            </span>
          </div>

          <h1 className="employer-hero-title">
            <span className="employer-org-title">{user?.organization || user?.name || "Tech Employer"}</span>
            <span className="employer-subheading"> Hiring Portal</span>
          </h1>

          <p className="employer-hero-subtitle">
            Eliminate resume fraud completely. Hire top engineering talent with credentials certified and signed by accredited universities and technical institutions.
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
            <span>Official Verification Guarantee</span>
          </div>
          <p className="guarantee-card-text">
            Traditional resumes rely on unverified claims. CredoNet credentials cannot be fabricated, forged, or edited by candidates. Every skill carries an official institutional digital signature.
          </p>
          <div className="guarantee-specs">
            <div className="spec-item">
              <span className="spec-dot" />
              <span>Tamper-proof digital institutional signatures</span>
            </div>
            <div className="spec-item">
              <span className="spec-dot" />
              <span>Instant verification against the official institutional registry</span>
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
            <span className="stat-label">Instant Verification Speed</span>
          </div>
        </div>
      </section>

      {/* Employer Actions */}
      <section className="employer-features-section">
        <h2 className="section-title">Employer Verification & Discovery Tools</h2>
        <p className="section-desc">Streamline your hiring workflow with instant, reliable credential verification.</p>

        <div className="features-grid">
          {/* Card 1: Verifier Search */}
          <div className="feature-card highlight">
            <div className="feature-card-header">
              <div className="feature-icon-badge purple">
                <FileSearch size={22} />
              </div>
              <span className="feature-status-tag">Audit Tool</span>
            </div>
            <h3 className="feature-card-title">Instant Candidate Verifier</h3>
            <p className="feature-card-desc">
              Lookup any candidate by address or Credential ID. CredoNet checks the tamper-proof registry directly to verify authenticity and revocation status.
            </p>
            <ul className="feature-points">
              <li><CheckCircle2 size={13} color="#10b981" /> Instant validity check</li>
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
              Search engineering candidates filtered by certified skills (React, Node, Distributed Systems, Python). View verified project code repositories and issuer citations.
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
            <h3 className="feature-card-title">Tamper-Proof Trust Architecture</h3>
            <p className="feature-card-desc">
              CredoNet operates on an official tamper-proof verification registry. This official registry ensures no single entity can alter academic credentials or certifications after issuance.
            </p>
            <ul className="feature-points">
              <li><CheckCircle2 size={13} color="#10b981" /> Tamper-proof institutional verification</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Exportable background audit dossiers</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Zero reliance on easily forged paper certificates</li>
            </ul>
            <Link to="/verify/0x71c92a8c943b8d62283e1c66289b5b38b71c4e92-1" className="btn-feature-cta secondary">
              <span>View Sample Audit Report</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Verified Candidates Pipeline & Talent Directory */}
      <section id="talent-directory" className="featured-candidates-section">
        <div className="section-header-row">
          <div>
            <h3 className="section-title">
              <Users size={22} color="#e36128" />
              <span>Pre-Verified Engineering Talent Directory</span>
            </h3>
            <p className="section-desc">
              Browse engineering candidates with verified credentials certified in the official registry.
            </p>
          </div>

          <div>
            <span className="section-counter-tag">
              Showing {filteredCandidates.length} of {allCandidates.length} Candidates
            </span>
          </div>
        </div>

        {/* Directory Controls: Search & Skill Filter Pills */}
        <div className="directory-controls-box">
          <div className="directory-search-row">
            <div className="directory-search-input-wrap">
              <Search size={15} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Filter by candidate name, skill, or wallet address..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="directory-search-input"
              />
              {filterText && (
                <button
                  type="button"
                  onClick={() => setFilterText("")}
                  className="directory-search-clear"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="directory-filter-row">
            <span className="directory-filter-label">Skill Filter:</span>
            {["all", "certificate", "React.js", "Android Developer", "Node.js", "Cloud Security", "Backend"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setDirectoryFilter(cat)}
                className={`directory-pill-btn ${directoryFilter === cat ? "active" : ""}`}
              >
                {cat === "all" ? "All Skills" : cat === "certificate" ? "Degrees & Certificates" : cat}
              </button>
            ))}
          </div>
        </div>

        {filteredCandidates.length > 0 ? (
          <div className="candidates-grid">
            {filteredCandidates.map((candidate, idx) => (
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
                  <div>
                    <Link to={candidate.address ? `/vault/${candidate.address}` : "/vault/0x71C92a8C943B8d62283e1c66289b5B38B71C4e92"} className="btn-view-candidate">
                      <span>View Passport</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="directory-empty-state">
            <p className="directory-empty-text">No candidate matches your current filter.</p>
            <button
              onClick={() => { setDirectoryFilter("all"); setFilterText(""); }}
              className="btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
