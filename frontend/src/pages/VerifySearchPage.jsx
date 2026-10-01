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

    const raw = searchInput.trim();
    if (!raw) {
      setError("Please enter a valid wallet address or credential ID.");
      return;
    }

    // Extract address if user pasted full URL (e.g. /vault/0x...)
    const addressMatch = raw.match(/0x[a-fA-F0-9]{40}/);
    const credMatch = raw.match(/0x[a-fA-F0-9]{64}/);

    if (searchMode === "passport") {
      if (addressMatch) {
        navigate(`/vault/${addressMatch[0]}`);
      } else if (ethers.isAddress(raw)) {
        navigate(`/vault/${raw}`);
      } else {
        setError("Invalid student wallet address. Must be a 20-byte address (starts with 0x...).");
      }
    } else {
      if (credMatch) {
        navigate(`/verify/${credMatch[0]}`);
      } else if (/^0x[a-fA-F0-9]{64}$/.test(raw)) {
        navigate(`/verify/${raw}`);
      } else {
        setError("Invalid Credential ID. Must be a 32-byte hexadecimal hash (66 characters starting with 0x...).");
      }
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
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center", marginTop: "6px" }}>
          {[
            "100% Free & Zero Gas",
            "No Wallet or Account Needed",
            "Sub-Second Monad Finality",
            "Cryptographic Proof Against Fraud"
          ].map((pill) => (
            <div key={pill} style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-medium)",
              borderRadius: "var(--radius-full)",
              fontSize: "12px",
              color: "var(--text-secondary)"
            }}>
              <Check size={12} color="#10b981" />
              <span>{pill}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Search Panel */}
      <div className="search-card-main">
        {/* Mode Selector Tabs */}
        <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border-medium)", paddingBottom: "14px" }}>
          <button
            type="button"
            onClick={() => { setSearchMode("passport"); setError(""); }}
            className={`btn-secondary ${searchMode === "passport" ? "active" : ""}`}
            style={{
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: "600",
              borderColor: searchMode === "passport" ? "var(--accent-primary)" : "var(--border-medium)",
              background: searchMode === "passport" ? "rgba(242, 108, 54, 0.12)" : "transparent",
              color: searchMode === "passport" ? "var(--text-highlight)" : "var(--text-secondary)"
            }}
          >
            <User size={15} />
            <span>Audit Candidate Passport</span>
          </button>

          <button
            type="button"
            onClick={() => { setSearchMode("credential"); setError(""); }}
            className={`btn-secondary ${searchMode === "credential" ? "active" : ""}`}
            style={{
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: "600",
              borderColor: searchMode === "credential" ? "var(--accent-primary)" : "var(--border-medium)",
              background: searchMode === "credential" ? "rgba(242, 108, 54, 0.12)" : "transparent",
              color: searchMode === "credential" ? "var(--text-highlight)" : "var(--text-secondary)"
            }}
          >
            <ShieldCheck size={15} />
            <span>Verify Specific Credential ID</span>
          </button>
        </div>

        <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <label style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>
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
              className="search-input mono"
              style={{ padding: "14px 16px", fontSize: "13px" }}
            />
            <button type="submit" className="btn-primary" style={{ padding: "14px 28px", whiteSpace: "nowrap" }}>
              <Search size={16} />
              <span>{searchMode === "passport" ? "Audit Passport" : "Verify on Monad"}</span>
            </button>
          </div>

          {error && (
            <p style={{ fontSize: "12.5px", color: "var(--danger)", paddingLeft: "4px" }}>
              {error}
            </p>
          )}
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "var(--text-muted)" }}>
          <Lock size={12} color="#f26c36" />
          <span>Queries execute directly against the public Monad Testnet EVM consensus node at zero cost.</span>
        </div>
      </div>

      {/* Recruiter Quick Sample Audits */}
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-highlight)" }}>
            Quick Recruiter Audits (Try with Sample Candidates)
          </h3>
          <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Click any candidate below to audit their full evidence-backed SkillPassport:
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "18px" }}>
          {sampleCandidates.map((cand) => (
            <div
              key={cand.address}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-medium)",
                borderRadius: "var(--radius-lg)",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "14px"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "var(--radius-md)",
                      background: "rgba(242, 108, 54, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-primary)",
                      fontWeight: "700"
                    }}>
                      {cand.name.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-highlight)" }}>{cand.name}</h4>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{cand.role}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: "10.5px", fontFamily: "var(--font-mono)", color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "3px 8px", borderRadius: "var(--radius-sm)" }}>
                    {cand.badge}
                  </span>
                </div>

                <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {cand.skills.map((s) => (
                    <span key={s} style={{ fontSize: "11px", background: "var(--bg-primary)", padding: "2px 8px", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
                      ✓ {s}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: "10px", fontSize: "11.5px", color: "var(--text-muted)" }}>
                  <span>Portfolio: </span>
                  <span style={{ color: "var(--text-secondary)" }}>{cand.projects.join(" • ")}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <Link
                  to={`/vault/${cand.address}`}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: "center", padding: "8px", fontSize: "12.5px" }}
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
