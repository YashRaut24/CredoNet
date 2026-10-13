import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  User, 
  Award, 
  ExternalLink,
  Briefcase,
  Zap,
  Check
} from "lucide-react";
import { ethers } from "ethers";
import "./VerifySearchPage.css";

export function VerifySearchPage() {
  const navigate = useNavigate();
  // Search Mode: "passport" (Student Address) | "credential" (Credential ID)
  const [searchMode, setSearchMode] = useState("passport");
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    setError("");

    let raw = searchInput.trim().replace(/['"]/g, "");
    if (!raw) {
      setError("Please enter a valid wallet address or credential ID.");
      return;
    }

    // Auto-prepend 0x if user pasted 64 hex characters
    if (!raw.startsWith("0x") && /^[a-fA-F0-9]{64}$/.test(raw)) {
      raw = "0x" + raw;
    }

    // Extract address or 32-byte hash even if full URL was pasted
    const addressMatch = raw.match(/0x[a-fA-F0-9]{40}/i);
    const credMatch = raw.match(/0x[a-fA-F0-9]{64}/i);

    if (searchMode === "credential") {
      if (credMatch) {
        navigate(`/verify/${credMatch[0]}`);
        return;
      }
      if (addressMatch) {
        // User pasted an address into credential mode -> smartly route to passport
        navigate(`/vault/${addressMatch[0]}`);
        return;
      }
      setError("Invalid Credential ID. A Credential ID is a 32-byte on-chain state hash (starts with 0x followed by 64 hex characters). Note: A wallet private key is NOT a credential ID.");
    } else {
      if (addressMatch) {
        navigate(`/vault/${addressMatch[0]}`);
        return;
      }
      if (credMatch) {
        // User pasted a credential ID into passport mode -> smartly route to verify
        navigate(`/verify/${credMatch[0]}`);
        return;
      }
      setError("Invalid student wallet address. Must be a 20-byte address (starts with 0x...).");
    }
  };

  const sampleCandidates = [
    {
      name: "Alex John",
      role: "Computer Engineering Student",
      address: "0x71C92a8C943B8d62283e1c66289b5B38B71C4e92",
      badge: "VERIFIED BUILDER",
      skills: ["React Development", "Solidity Core", "Node.js"],
      projects: ["E-Commerce Platform", "CredoNet Protocol DApp"],
    },
    {
      name: "Elena K.",
      role: "Smart Contract Security Auditor",
      address: "0x3F8a90Bc18A24e9271C92a8C943B8d62283e1c66",
      badge: "SECURITY AUDITOR",
      skills: ["Solidity Security", "EVM Bytecode", "DeFi Security"],
      projects: ["Reentrancy Vulnerability Scanner", "Gas Optimization Suite"],
    },
  ];

  return (
    <div className="container verify-search-page">
      {/* Recruiter & Employer Header */}
      <div className="search-hero">
        <div className="search-icon-big">
          <Briefcase size={28} />
        </div>
        <span className="trust-badge">
          <span className="trust-badge-dot" />
          EMPLOYER & RECRUITER VERIFICATION PORTAL
        </span>
        <h1 className="search-page-title">
          Audit Candidate Passports & Credentials
        </h1>
        <p className="search-page-desc">
          Independently verify student skills, inspect linked project code, and confirm real-time on-chain validity on the Monad blockchain. Zero gas, no crypto wallet, and no account required.
        </p>

        {/* 4 Trust Highlights */}
        <div className="trust-highlights-row">
          {[
            "100% Free & Zero Gas",
            "No Wallet or Account Needed",
            "Sub-Second Monad Finality",
            "Cryptographic Proof Against Fraud"
          ].map((pill) => (
            <div key={pill} className="trust-highlight-chip">
              <Check size={12} color="#10b981" />
              <span>{pill}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Search Panel */}
      <div className="search-card-main">
        {/* Mode Selector Tabs */}
        <div className="search-mode-tabs">
          <button
            type="button"
            onClick={() => { setSearchMode("passport"); setError(""); }}
            className={`search-mode-btn ${searchMode === "passport" ? "active" : ""}`}
          >
            <User size={15} />
            <span>Audit Candidate Passport</span>
          </button>

          <button
            type="button"
            onClick={() => { setSearchMode("credential"); setError(""); }}
            className={`search-mode-btn ${searchMode === "credential" ? "active" : ""}`}
          >
            <ShieldCheck size={15} />
            <span>Verify Specific Credential ID</span>
          </button>
        </div>

        <form onSubmit={handleSearch} className="search-form-wrap">
          <label className="search-input-label">
            {searchMode === "passport"
              ? "Enter Candidate Wallet Address or Passport URL:"
              : "Enter 32-Byte Cryptographic Credential ID:"}
          </label>

          <div className="search-input-group">
            <input
              type="text"
              placeholder={
                searchMode === "passport"
                  ? "e.g. 0x71C92a8C943B8d62283e1c66289b5B38B71C4e92 or pasted passport URL"
                  : "e.g. 0x9b4f2c8a71d0e3a45c6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c"
              }
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setError("");
              }}
              className="search-input-field mono"
            />
            <button type="submit" className="btn-primary search-submit-btn">
              <Search size={16} />
              <span>{searchMode === "passport" ? "Audit Passport" : "Verify on Monad"}</span>
            </button>
          </div>

          {error && (
            <p className="search-error-msg">
              {error}
            </p>
          )}
        </form>

        <div className="search-footer-note">
          <Lock size={12} color="#e36128" />
          <span>Queries execute directly against the public Monad Testnet EVM consensus node at zero cost.</span>
        </div>
      </div>

      {/* Recruiter Quick Sample Audits */}
      <div className="sample-audits-section">
        <div className="sample-audits-header">
          <h3 className="sample-audits-title">
            Quick Recruiter Audits (Try with Sample Candidates)
          </h3>
          <p className="sample-audits-desc">
            Click any candidate below to audit their full evidence-backed SkillPassport:
          </p>
        </div>

        <div className="sample-audits-grid">
          {sampleCandidates.map((cand) => (
            <div
              key={cand.address}
              className="sample-audit-card"
            >
              <div>
                <div className="sample-audit-top">
                  <div className="sample-audit-profile">
                    <div className="sample-audit-avatar">
                      {cand.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="sample-audit-name">{cand.name}</h4>
                      <p className="sample-audit-role">{cand.role}</p>
                    </div>
                  </div>
                  <span className="sample-audit-badge">
                    {cand.badge}
                  </span>
                </div>

                <div className="sample-audit-skills">
                  {cand.skills.map((s) => (
                    <span key={s} className="sample-audit-skill-pill">
                      ✓ {s}
                    </span>
                  ))}
                </div>

                <div className="sample-audit-portfolio">
                  <span>Portfolio: </span>
                  <span className="sample-audit-portfolio-text">{cand.projects.join(" • ")}</span>
                </div>
              </div>

              <div>
                <Link
                  to={`/vault/${cand.address}`}
                  className="btn-primary btn-sample-audit"
                >
                  <Briefcase size={13} />
                  <span>Audit Candidate Passport</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
