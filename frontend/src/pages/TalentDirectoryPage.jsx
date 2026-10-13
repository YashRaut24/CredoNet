import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Award, 
  FolderGit2, 
  Copy, 
  Check, 
  Filter, 
  ArrowUpDown, 
  Sparkles, 
  Building2,
  GitBranch,
  Lock,
  ArrowRight
} from "lucide-react";
import { useRole } from "../context/RoleContext";
import "./TalentDirectoryPage.css";

export function TalentDirectoryPage() {
  const { user } = useRole();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minVerified, setMinVerified] = useState("all");
  const [sortBy, setSortBy] = useState("credentials");
  const [copiedAddress, setCopiedAddress] = useState(null);
  const [realCandidates, setRealCandidates] = useState([]);
  const [loadingReal, setLoadingReal] = useState(false);

  // Load live candidates from MongoDB & blockchain
  useEffect(() => {
    async function fetchCandidates() {
      setLoadingReal(true);
      try {
        const res = await fetch("/api/candidates");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.candidates) && data.candidates.length > 0) {
            setRealCandidates(data.candidates);
          }
        }
      } catch (err) {
        console.warn("Could not load real candidates from backend:", err);
      } finally {
        setLoadingReal(false);
      }
    }
    fetchCandidates();
  }, []);

  // Curated Baseline Candidates
  const baseSampleProfiles = [
    {
      id: "cand-1",
      name: "Alex John",
      address: "0x71C92a8C943B8d62283e1c66289b5B38B71C4e92",
      college: "Sardar Patel Institute of Technology",
      degree: "B.E. Computer Engineering (2027)",
      role: "Full-Stack & Distributed Systems Engineer",
      bio: "Focuses on Solidity smart contracts, EVM consensus optimization, and sovereign decentralized credential ledgers.",
      skills: ["Solidity & Smart Contracts", "Distributed Systems", "React.js", "Full Stack Development", "Cryptography"],
      evidenceProject: "CredoNet Sovereign Protocol",
      githubUrl: "https://github.com/alexjohn/credonet",
      verifiedCount: 2,
      issuer: "XYZ Web3 Academy & Partner Universities"
    },
    {
      id: "cand-2",
      name: "XYZ Certified Candidate",
      address: "0x21626cDb67f0114D0F6a7dBC1140B7C0A9101864",
      college: "XYZ Web3 Academy",
      degree: "Advanced Blockchain & Mobile Certification",
      role: "EVM Mobile & Smart Contract Engineer",
      bio: "Expertise in Web3 mobile dApps, Android integration with EVM JSON-RPC nodes, and gas-efficient Solidity state architecture.",
      skills: ["Android Developer", "Solidity & Smart Contracts", "EVM Consensus", "Web3 Architecture"],
      evidenceProject: "CredoNet Mobile Vault Client",
      githubUrl: "https://github.com/xyz-academy/evm-android",
      verifiedCount: 2,
      issuer: "XYZ Web3 Academy"
    },
    {
      id: "cand-3",
      name: "Priya Sharma",
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      college: "Indian Institute of Technology (IIT)",
      degree: "B.Tech Computer Science (2026)",
      role: "Backend & Web3 Distributed Systems Architect",
      bio: "High-throughput backend systems engineer benchmarking EVM JSON-RPC node consensus latency and real-time state indexing.",
      skills: ["Go", "Node.js", "EVM Optimization", "PostgreSQL", "Distributed Systems"],
      evidenceProject: "Monad Consensus Latency Benchmark",
      githubUrl: "https://github.com/priyasharma/monad-benchmark",
      verifiedCount: 3,
      issuer: "IIT Cryptography Lab"
    },
    {
      id: "cand-4",
      name: "Marcus Vance",
      address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      college: "Stanford Blockchain Research Center",
      degree: "M.S. Applied Cryptography",
      role: "Zero-Knowledge & Cryptography Specialist",
      bio: "Researching zero-knowledge proofs, Circom circuit verification, and bias-free blind hiring commitments.",
      skills: ["Circom", "ZK-SNARKs", "Rust", "Ethereum L1/L2", "Zero-Knowledge"],
      evidenceProject: "ZK Blind Hiring Commitment Verifier",
      githubUrl: "https://github.com/marcusvance/zk-credentials",
      verifiedCount: 4,
      issuer: "Stanford Blockchain Initiative"
    },
    {
      id: "cand-5",
      name: "Elena Kostas",
      address: "0x3F8a90Bc18A24e9271C92a8C943B8d62283e1c66",
      college: "MIT Cryptoeconomics Lab",
      degree: "B.S. Cyber Security & Distributed Computing",
      role: "Smart Contract Security Auditor",
      bio: "Specializing in reentrancy vulnerability mitigation, EVM bytecode inspection, and formal smart contract verification.",
      skills: ["Smart Contract Security", "Solidity & Smart Contracts", "EVM Bytecode", "DeFi Security"],
      evidenceProject: "Reentrancy Vulnerability Scanner",
      githubUrl: "https://github.com/elenak/reentrancy-scanner",
      verifiedCount: 3,
      issuer: "MIT Web3 Security Group"
    }
  ];

  // Merge live database/blockchain candidates with baseline profiles
  const candidateDirectory = [
    ...realCandidates,
    ...baseSampleProfiles.filter((sample) => 
      !realCandidates.some((real) => 
        (real.address && sample.address && real.address.toLowerCase() === sample.address.toLowerCase()) ||
        (real.name && sample.name && real.name.toLowerCase() === sample.name.toLowerCase())
      )
    )
  ];

  const handleCopy = (address) => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Filter & Sort Logic
  const filteredCandidates = candidateDirectory
    .filter((candidate) => {
      // 1. Category Filter
      const matchesCategory =
        selectedCategory === "all" ||
        candidate.skills.some((s) => s.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        candidate.role.toLowerCase().includes(selectedCategory.toLowerCase());

      // 2. Minimum Verified Count Filter
      const matchesMin =
        minVerified === "all" || candidate.verifiedCount >= parseInt(minVerified, 10);

      // 3. Search Query Filter
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        candidate.name.toLowerCase().includes(q) ||
        candidate.role.toLowerCase().includes(q) ||
        candidate.college.toLowerCase().includes(q) ||
        candidate.address.toLowerCase().includes(q) ||
        candidate.skills.some((s) => s.toLowerCase().includes(q));

      return matchesCategory && matchesMin && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "credentials") {
        return b.verifiedCount - a.verifiedCount;
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  return (
    <div className="talent-directory-container">
      {/* 1. Header Banner */}
      <section className="talent-header-card">
        <div className="talent-header-top">
          <span className="talent-badge-tag">
            <Users size={13} />
            <span>Talent Acquisition Directory</span>
          </span>
          <span className="talent-verified-tag">
            <ShieldCheck size={13} />
            <span>100% On-Chain Verified Credentials</span>
          </span>
        </div>

        <div className="talent-title-area">
          <h1>Pre-Verified Engineering Talent Directory</h1>
          <p>
            Source verified engineering candidates with cryptographic credentials anchored on EVM smart contracts. 
            Every listed skill is mathematically backed by authorized institutional signatures.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="talent-stats-strip">
          <div className="talent-stat-box">
            <div className="talent-stat-icon">
              <Users size={20} />
            </div>
            <div>
              <div className="talent-stat-num">{candidateDirectory.length} Candidates</div>
              <div className="talent-stat-lbl">In Current Pipeline</div>
            </div>
          </div>

          <div className="talent-stat-box">
            <div className="talent-stat-icon green">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="talent-stat-num">14+ Badges</div>
              <div className="talent-stat-lbl">Cryptographically Audited</div>
            </div>
          </div>

          <div className="talent-stat-box">
            <div className="talent-stat-icon blue">
              <Building2 size={20} />
            </div>
            <div>
              <div className="talent-stat-num">5 Accredited Labs</div>
              <div className="talent-stat-lbl">Issuing Certifications</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Control & Search Shelf */}
      <section className="talent-control-shelf">
        <div className="talent-search-row">
          <div className="talent-search-input-wrap">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search talent by name, role, university, skill, or wallet address (0x...)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="talent-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="talent-clear-btn"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter: Min Verified */}
          <select
            value={minVerified}
            onChange={(e) => setMinVerified(e.target.value)}
            className="talent-select-control"
          >
            <option value="all">All Credential Counts</option>
            <option value="2">At least 2 Verified</option>
            <option value="3">At least 3 Verified</option>
            <option value="4">4+ Verified Badges</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="talent-select-control"
          >
            <option value="credentials">Sort: Most Credentials</option>
            <option value="name">Sort: Candidate Name</option>
          </select>
        </div>

        {/* Skill Category Filter Pills */}
        <div className="talent-categories-row">
          <span className="talent-category-label">Specialization:</span>
          {[
            { id: "all", label: "All Engineers" },
            { id: "solidity", label: "Solidity & Smart Contracts" },
            { id: "android", label: "Android & Mobile" },
            { id: "security", label: "Security & Auditing" },
            { id: "distributed", label: "Distributed Systems" },
            { id: "zero-knowledge", label: "Zero-Knowledge" },
            { id: "full stack", label: "Full Stack Web3" }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`talent-cat-pill ${selectedCategory === cat.id ? "active" : ""}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Candidate Directory Grid */}
      <section>
        <div className="talent-section-header">
          <h2 className="talent-section-title">
            Verified Candidates ({filteredCandidates.length})
          </h2>
          <span className="talent-section-sub">
            Zero-Gas Public Verification Available
          </span>
        </div>

        {filteredCandidates.length > 0 ? (
          <div className="talent-cards-grid">
            {filteredCandidates.map((candidate) => (
              <div key={candidate.id} className="talent-candidate-card">
                <div>
                  {/* Top: Avatar, Name & Degree */}
                  <div className="talent-card-header">
                    <div className="talent-card-avatar">
                      {candidate.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="talent-card-title-col">
                      <h3 className="talent-card-name">{candidate.name}</h3>
                      <span className="talent-card-college">{candidate.college}</span>
                      <span className="talent-card-role">{candidate.role}</span>
                    </div>
                  </div>

                  <p className="talent-card-bio">{candidate.bio}</p>

                  {/* Skills Cloud */}
                  <div className="talent-skills-container">
                    <div className="talent-skills-heading">
                      <span>On-Chain Verified Skills</span>
                      <span className="talent-skills-certified-tag">✓ Certified</span>
                    </div>
                    <div className="talent-skills-wrap">
                      {candidate.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="talent-skill-chip">
                          <CheckCircle2 size={11} color="#10b981" />
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Project Evidence */}
                  {candidate.evidenceProject && (
                    <div className="talent-evidence-row">
                      <FolderGit2 size={13} color="#e36128" />
                      <span className="talent-evidence-text">Build: <strong className="talent-evidence-build">{candidate.evidenceProject}</strong></span>
                      {candidate.githubUrl && (
                        <a
                          href={candidate.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="talent-repo-link"
                        >
                          <span>Repo</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer & Action Buttons */}
                <div className="talent-card-footer">
                  <div className="talent-card-badge-row">
                    <span className="talent-onchain-count">
                      <ShieldCheck size={13} />
                      <span>{candidate.verifiedCount} On-Chain Credentials</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => candidate.address && handleCopy(candidate.address)}
                      className="talent-wallet-chip"
                      title="Click to copy wallet address"
                    >
                      <span>
                        {candidate.address && candidate.address.length >= 10
                          ? `${candidate.address.slice(0, 6)}...${candidate.address.slice(-4)}`
                          : candidate.address || "0x..."}
                      </span>
                      {copiedAddress === candidate.address ? <Check size={11} color="#10b981" /> : <Copy size={11} />}
                    </button>
                  </div>

                  <div className="talent-card-action-btns">
                    <Link to={candidate.address ? `/vault/${candidate.address}` : "/vault/0x71C92a8C943B8d62283e1c66289b5B38B71C4e92"} className="btn-talent-passport">
                      <span>View Sovereign Passport</span>
                      <ExternalLink size={12} />
                    </Link>
                    <Link to="/verify/search" className="btn-talent-audit" title="Audit this candidate on the verification terminal">
                      <ShieldCheck size={13} />
                      <span>Audit</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="talent-empty-state">
            <Users size={32} color="var(--text-muted)" />
            <h3 className="talent-empty-title">No candidates found matching your criteria</h3>
            <p className="talent-empty-desc">
              Try adjusting your search terms or selecting "All Engineers" to view all pre-verified profiles.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setMinVerified("all");
              }}
              className="btn-secondary"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
