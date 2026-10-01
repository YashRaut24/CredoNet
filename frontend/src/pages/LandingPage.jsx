import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Award, 
  Search, 
  ArrowRight, 
  Lock, 
  Zap, 
  CheckCircle2, 
  QrCode, 
  FileCheck, 
  Building2, 
  GraduationCap, 
  Sparkles, 
  RefreshCw, 
  ExternalLink, 
  Code2, 
  Compass, 
  CheckCircle, 
  Binary, 
  Cpu, 
  Layers,
  FolderGit2,
  LogIn 
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { CredoVaultCard } from "../components/CredoVaultCard";
import "./LandingPage.css";

export function LandingPage() {
  const navigate = useNavigate();
  const { account, connectWallet, isConnecting } = useWeb3();

  const [vaultAddress, setVaultAddress] = useState("");
  const [verifyId, setVerifyId] = useState("");
  const [searchingVault, setSearchingVault] = useState(false);
  const [searchingVerify, setSearchingVerify] = useState(false);

  const handleVaultSearch = (e) => {
    e.preventDefault();
    if (vaultAddress.trim()) {
      setSearchingVault(true);
      setTimeout(() => {
        navigate(`/vault/${vaultAddress.trim()}`);
      }, 300);
    }
  };

  const handleVerifySearch = (e) => {
    e.preventDefault();
    if (verifyId.trim()) {
      setSearchingVerify(true);
      setTimeout(() => {
        navigate(`/verify/${verifyId.trim()}`);
      }, 300);
    }
  };

  const sampleVaults = [
    {
      role: "Blockchain & Smart Contract Engineer",
      candidate: "Rahul S. (Sem 7)",
      address: "0x71C92a8C943B8d62283e1c66289b5B38B71C4e92",
      credsCount: 3,
      tags: ["CredoNet Capstone", "Distributed Systems", "Solidity Core"],
      badge: "VERIFIED BUILDER"
    },
    {
      role: "Smart Contract Security Auditor",
      candidate: "Elena K.",
      address: "0x3F8a90Bc18A24e9271C92a8C943B8d62283e1c66",
      credsCount: 4,
      tags: ["Solidity Core", "EVM Bytecode", "DeFi Security"],
      badge: "SECURITY SPECIALIST"
    },
    {
      role: "Full-Stack Web3 DApp Architect",
      candidate: "Marcus V.",
      address: "0x9B3f18A24e9271C92a8C943B8d62283e1c663F8a",
      credsCount: 3,
      tags: ["React & Node", "Ethers.js v6", "IPFS Storage"],
      badge: "FULL-STACK BUILDER"
    }
  ];

  return (
    <div className="landing-page container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-tagline">
            <span className="hero-tagline-dot">•</span>
            <span>CRYPTOGRAPHIC CREDENTIAL PROTOCOL</span>
          </div>

          <h1 className="hero-title">
            Own your achievements. <span className="editorial-italic">Verify your credentials.</span>
          </h1>

          <p className="hero-description">
            One portable passport for your verified skills, projects and achievements. Trusted issuers issue credentials to your wallet, and employers independently verify them directly on-chain.
          </p>

          <div className="hero-actions">
            <Link to="/signup" className="btn-primary">
              <span>Create Verifiable Passport</span>
              <ArrowRight size={15} />
            </Link>

            <Link to="/login" className="btn-secondary">
              <LogIn size={14} />
              <span>Sign In</span>
            </Link>

            <Link to="/vault/0x71C92a8C943B8d62283e1c66289b5B38B71C4e92" className="btn-secondary">
              <Award size={14} />
              <span>View Sample Passport</span>
            </Link>
          </div>

          <div className="hero-trust-row">
            <div className="trust-pill">
              <CheckCircle size={14} color="#f26c36" />
              <span>Student Ownership</span>
            </div>
            <div className="trust-pill">
              <Lock size={14} color="#f26c36" />
              <span>Tamper-Proof Blockchain Proof</span>
            </div>
            <div className="trust-pill">
              <Zap size={14} color="#f26c36" />
              <span>Sub-Second Verification</span>
            </div>
            <div className="trust-pill">
              <QrCode size={14} color="#f26c36" />
              <span>Portable QR Sharing</span>
            </div>
          </div>
        </div>

        {/* Right Interactive CredoVault Card */}
        <div className="hero-widget">
          <CredoVaultCard />
        </div>
      </section>

      {/* 3 Dedicated Persona Portals */}
      <section className="user-value-section" style={{ margin: "50px 0" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--accent-primary)", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            THREE DEDICATED PORTALS
          </span>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-highlight)", marginTop: "6px" }}>
            Experience CredoNet By Your Role
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", maxWidth: "600px", margin: "8px auto 0 auto" }}>
            Whether you are a student building proof of work, an accredited institution certifying talent, or an employer auditing credentials.
          </p>
        </div>

        <div className="triad-grid">
          {/* Persona 1: Student */}
          <div className="triad-card" style={{ borderTop: "3px solid var(--accent-primary)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="triad-icon-wrap" style={{ background: "rgba(242, 108, 54, 0.15)", color: "var(--accent-primary)" }}>
                  <Award size={22} />
                </div>
                <span style={{ fontSize: "10.5px", fontFamily: "var(--font-mono)", color: "var(--accent-primary)", fontWeight: "700", textTransform: "uppercase", background: "rgba(242, 108, 54, 0.1)", padding: "3px 8px", borderRadius: "var(--radius-sm)" }}>
                  STUDENT / TALENT
                </span>
              </div>
              <h3 className="triad-title" style={{ marginTop: "14px", fontSize: "18px" }}>Student Career Vault</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", marginTop: "8px" }}>
                Own your portable career passport. Add project evidence with GitHub links, collect verified credentials from authorized issuers, and unlock achievements.
              </p>
              <ul style={{ margin: "14px 0", paddingLeft: "18px", fontSize: "12.5px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>Self-custody profile & portfolio projects</li>
                <li>Evidence-linked skill verification</li>
                <li>Real milestones & mentor endorsements</li>
                <li>Shareable public link & QR code</li>
              </ul>
            </div>
            <Link to="/signup" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "13px", marginTop: "12px" }}>
              <span>Get Started as Student</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Persona 2: Issuer */}
          <div className="triad-card" style={{ borderTop: "3px solid #38bdf8", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="triad-icon-wrap" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>
                  <Building2 size={22} />
                </div>
                <span style={{ fontSize: "10.5px", fontFamily: "var(--font-mono)", color: "#38bdf8", fontWeight: "700", textTransform: "uppercase", background: "rgba(56, 189, 248, 0.1)", padding: "3px 8px", borderRadius: "var(--radius-sm)" }}>
                  ACCREDITED ISSUER
                </span>
              </div>
              <h3 className="triad-title" style={{ marginTop: "14px", fontSize: "18px" }}>Issuer Certification Portal</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", marginTop: "8px" }}>
                For universities, bootcamps, and hackathons. Review student project submissions, certify verified competencies, and anchor proof directly on-chain.
              </p>
              <ul style={{ margin: "14px 0", paddingLeft: "18px", fontSize: "12.5px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>Review student portfolio evidence</li>
                <li>Link capstone projects to verified skills</li>
                <li>Permanent decentralized on-chain issuance</li>
                <li>On-chain cryptographic revocation</li>
              </ul>
            </div>
            <Link to="/signup" className="btn-secondary" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "13px", marginTop: "12px", borderColor: "rgba(56, 189, 248, 0.4)", color: "#38bdf8" }}>
              <span>Register as Certifying Issuer</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Persona 3: Employer */}
          <div className="triad-card" style={{ borderTop: "3px solid #10b981", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="triad-icon-wrap" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                  <ShieldCheck size={22} />
                </div>
                <span style={{ fontSize: "10.5px", fontFamily: "var(--font-mono)", color: "#10b981", fontWeight: "700", textTransform: "uppercase", background: "rgba(16, 185, 129, 0.1)", padding: "3px 8px", borderRadius: "var(--radius-sm)" }}>
                  EMPLOYER / AUDITOR
                </span>
              </div>
              <h3 className="triad-title" style={{ marginTop: "14px", fontSize: "18px" }}>Employer Verification Hub</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", marginTop: "8px" }}>
                Zero-gas, zero-wallet verification. Scan candidate QR codes, inspect underlying GitHub repositories, and verify active validity directly from blockchain RPC.
              </p>
              <ul style={{ margin: "14px 0", paddingLeft: "18px", fontSize: "12.5px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>Zero gas fees & no wallet needed</li>
                <li>Inspect code behind claimed skills</li>
                <li>Sub-second cryptographic verification</li>
                <li>Instant detection of revoked credentials</li>
              </ul>
            </div>
            <Link to="/signup" className="btn-secondary" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "13px", marginTop: "12px", borderColor: "rgba(16, 185, 129, 0.4)", color: "#10b981" }}>
              <span>Register as Verified Employer</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Problem & Solution Strip */}
      <section className="problem-solution-section" style={{
        padding: "32px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-medium)",
        borderRadius: "var(--radius-lg)",
        margin: "30px 0"
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          <div>
            <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#f87171", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              THE REAL PROBLEM
            </span>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginTop: "8px", color: "var(--text-highlight)" }}>
              Proof Scattered Across Certificates & Portals
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.6", marginTop: "10px" }}>
              Students collect achievements from universities, bootcamps, certification providers, hackathons and other organizations. Today, this proof is scattered across PDF certificates, emails, portals, and project links. When applying for jobs, students repeatedly submit unverified claims, and employers struggle to verify issuer identity, issue date, and revocation status.
            </p>
          </div>
          <div>
            <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#10b981", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              THE SKILLPASSPORT SOLUTION
            </span>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginTop: "8px", color: "var(--text-highlight)" }}>
              Portable Wallet-Based Passport on Monad
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.6", marginTop: "10px" }}>
              SkillPassport gives students a portable wallet-based achievement passport. Trusted issuers issue credentials to the student's wallet on Monad. Blockchain provides tamper-evident proof that an authorized issuer issued a particular credential to the student's wallet and that it has not been revoked.
            </p>
          </div>
        </div>
      </section>

      {/* How the Flow Works (The 4 Stages) */}
      <section className="passport-flow-section">
        <div className="section-meta-wrap">
          <span className="section-label">CORE PRODUCT FLOW</span>
          <h2 className="section-title">
            How SkillPassport Works on Monad
          </h2>
          <p className="section-desc">
            A tamper-evident pipeline connecting student wallets, recognized issuers, and public verification.
          </p>
        </div>

        <div className="flow-steps-grid">
          <div className="flow-step-card">
            <div className="flow-step-header">
              <span className="flow-step-num">01</span>
              <div className="flow-step-icon">
                <Building2 size={18} />
              </div>
            </div>
            <h3 className="flow-step-title">Issuer Issues Credential</h3>
            <p className="flow-step-desc">
              Authorized issuer connects wallet, inputs student wallet address & achievement, and records the credential on Monad.
            </p>
          </div>

          <div className="flow-step-card">
            <div className="flow-step-header">
              <span className="flow-step-num">02</span>
              <div className="flow-step-icon">
                <Award size={18} />
              </div>
            </div>
            <h3 className="flow-step-title">Student Owns Passport</h3>
            <p className="flow-step-desc">
              The credential becomes part of the student's portable SkillPassport bound to their self-custody wallet.
            </p>
          </div>

          <div className="flow-step-card">
            <div className="flow-step-header">
              <span className="flow-step-num">03</span>
              <div className="flow-step-icon">
                <QrCode size={18} />
              </div>
            </div>
            <h3 className="flow-step-title">Share Passport / QR</h3>
            <p className="flow-step-desc">
              Student shares their public passport link or generates a QR code for recruiters and employers to scan.
            </p>
          </div>

          <div className="flow-step-card">
            <div className="flow-step-header">
              <span className="flow-step-num">04</span>
              <div className="flow-step-icon">
                <ShieldCheck size={18} />
              </div>
            </div>
            <h3 className="flow-step-title">Public Monad Verification</h3>
            <p className="flow-step-desc">
              Employer verifies credential directly against Monad smart contract without needing a wallet: VALID or REVOKED.
            </p>
          </div>
        </div>
      </section>

      {/* Live Sample Vaults Showcase */}
      <section className="sample-passports-section">
        <div className="section-meta-wrap">
          <span className="section-label">Live Demonstration</span>
          <h2 className="section-title">
            Inspect Sample CredoVaults
          </h2>
          <p className="section-desc">
            Explore authentic digital CredoVaults anchored on the EVM blockchain. Click any sample to inspect its live credential vault.
          </p>
        </div>

        <div className="sample-passports-grid">
          {sampleVaults.map((v, idx) => (
            <div key={idx} className="sample-passport-card">
              <div className="sample-card-top">
                <span className="sample-badge">{v.badge}</span>
                <span className="sample-stamps-pill">
                  <FileCheck size={12} />
                  <span>{v.credsCount} Verified Badges</span>
                </span>
              </div>

              <h3 className="sample-role">{v.role}</h3>
              <p className="sample-candidate">{v.candidate}</p>

              <div className="sample-address-box">
                <span className="sample-address-label">VAULT ID:</span>
                <span className="sample-address-code">{v.address.slice(0, 8)}...{v.address.slice(-6)}</span>
              </div>

              <div className="sample-tags-row">
                {v.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="sample-tag">{tag}</span>
                ))}
              </div>

              <Link to={`/vault/${v.address}`} className="btn-sample-inspect">
                <span>Inspect CredoVault</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Credential Taxonomy */}
      <section className="categories-section">
        <div className="section-meta-wrap">
          <span className="section-label">Credential Catalog</span>
          <h2 className="section-title">
            Multi-Disciplinary Verifiable Credentials
          </h2>
          <p className="section-desc">
            From university degrees to technical proficiencies, CredoNet accommodates all forms of verified human achievement.
          </p>
        </div>

        <div className="categories-grid">
          <div className="category-card">
            <div className="category-icon-box">
              <GraduationCap size={22} />
            </div>
            <h3 className="category-title">Academic Degrees</h3>
            <p className="category-desc">
              Bachelor of Engineering, Master of Science, diplomas, and official transcripts signed with institutional authority keys.
            </p>
            <div className="category-examples">
              <span>B.E. Computer Eng</span>
              <span>Capstone Project</span>
              <span>Verified GPA</span>
            </div>
          </div>

          <div className="category-card">
            <div className="category-icon-box">
              <Code2 size={22} />
            </div>
            <h3 className="category-title">Engineering Mastery</h3>
            <p className="category-desc">
              Verified skills in Web Development, Python, Smart Contracts, Distributed Systems, and Modern Frameworks.
            </p>
            <div className="category-examples">
              <span>Solidity Core</span>
              <span>EVM Architecture</span>
              <span>React & Node</span>
            </div>
          </div>

          <div className="category-card">
            <div className="category-icon-box">
              <ShieldCheck size={22} />
            </div>
            <h3 className="category-title">Security & Auditing</h3>
            <p className="category-desc">
              Formal verification protocols, smart contract audit certifications, cryptography proficiencies, and vulnerability research.
            </p>
            <div className="category-examples">
              <span>Smart Contract Audit</span>
              <span>Cryptography</span>
              <span>Zero-Knowledge</span>
            </div>
          </div>

          <div className="category-card">
            <div className="category-icon-box">
              <Award size={22} />
            </div>
            <h3 className="category-title">Honors & Competitions</h3>
            <p className="category-desc">
              Hackathon recognitions, certified mentor endorsements, open-source maintainer credentials, and industry awards.
            </p>
            <div className="category-examples">
              <span>Verified Builder</span>
              <span>Open Source</span>
              <span>Sem 7 Project</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Triad (Students, Universities, Employers) */}
      <section className="triad-section">
        <div className="section-meta-wrap">
          <span className="section-label">Ecosystem Alignment</span>
          <h2 className="section-title">
            Built for Engineers, Accredited Issuers, and Global Employers
          </h2>
        </div>

        <div className="triad-grid">
          <div className="triad-card">
            <div className="triad-icon-wrap">
              <Award size={22} />
            </div>
            <h3 className="triad-title">For Engineers & Students</h3>
            <ul className="triad-list">
              <li>
                <CheckCircle2 size={14} color="#f26c36" />
                <span>100% self-custody in your personal Web3 wallet.</span>
              </li>
              <li>
                <CheckCircle2 size={14} color="#f26c36" />
                <span>Never lose credentials if an academy closes its doors.</span>
              </li>
              <li>
                <CheckCircle2 size={14} color="#f26c36" />
                <span>One verifiable Vault link & QR key for your entire career.</span>
              </li>
            </ul>
          </div>

          <div className="triad-card">
            <div className="triad-icon-wrap">
              <Building2 size={22} />
            </div>
            <h3 className="triad-title">For Universities & Issuers</h3>
            <ul className="triad-list">
              <li>
                <CheckCircle2 size={14} color="#f26c36" />
                <span>Role-Based Access Control (RBAC) smart contracts.</span>
              </li>
              <li>
                <CheckCircle2 size={14} color="#f26c36" />
                <span>Completely eliminate counterfeit degree printing.</span>
              </li>
              <li>
                <CheckCircle2 size={14} color="#f26c36" />
                <span>Automated on-chain issuance with transparent revocation.</span>
              </li>
            </ul>
          </div>

          <div className="triad-card">
            <div className="triad-icon-wrap">
              <Search size={22} />
            </div>
            <h3 className="triad-title">For Employers & Recruiters</h3>
            <ul className="triad-list">
              <li>
                <CheckCircle2 size={14} color="#f26c36" />
                <span>Zero-fraud guarantee through cryptographic consensus.</span>
              </li>
              <li>
                <CheckCircle2 size={14} color="#f26c36" />
                <span>Sub-second instant background checks without agency fees.</span>
              </li>
              <li>
                <CheckCircle2 size={14} color="#f26c36" />
                <span>Verify real, authentic skills instead of unverified resumes.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Direct Search Tool */}
      <section className="search-section">
        <div className="search-panels-grid">
          {/* Vault Lookup */}
          <div className="search-box">
            <div className="search-box-header">
              <div className="search-box-icon">
                <Award size={18} />
              </div>
              <div>
                <h4 className="search-box-title">Inspect Sovereign CredoVault</h4>
                <p className="search-box-sub">Enter any candidate wallet address to view their credential vault</p>
              </div>
            </div>

            <form onSubmit={handleVaultSearch} className="search-form">
              <input
                type="text"
                placeholder="Candidate wallet address (0x...)"
                value={vaultAddress}
                onChange={(e) => setVaultAddress(e.target.value)}
                className="search-input"
                required
              />
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ padding: "8px 18px", whiteSpace: "nowrap" }}
                disabled={searchingVault}
              >
                {searchingVault ? (
                  <>
                    <RefreshCw size={13} className="spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Search size={14} />
                    <span>Inspect</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Credential Hash Verification */}
          <div className="search-box">
            <div className="search-box-header">
              <div className="search-box-icon">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="search-box-title">Verify Credential Hash</h4>
                <p className="search-box-sub">Verify a specific credential hash against EVM blockchain consensus</p>
              </div>
            </div>

            <form onSubmit={handleVerifySearch} className="search-form">
              <input
                type="text"
                placeholder="Credential Hash ID (0x...)"
                value={verifyId}
                onChange={(e) => setVerifyId(e.target.value)}
                className="search-input"
                required
              />
              <button 
                type="submit" 
                className="btn-secondary" 
                style={{ padding: "8px 18px", whiteSpace: "nowrap" }}
                disabled={searchingVerify}
              >
                {searchingVerify ? (
                  <>
                    <RefreshCw size={13} className="spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={14} />
                    <span>Verify</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
