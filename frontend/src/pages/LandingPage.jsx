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
  Layers 
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
      role: "B.E. Computer Engineering Graduate",
      candidate: "Rahul S. (Sem 7)",
      address: "0x71C92a8C943B8d62283e1c66289b5B38B71C4e92",
      credsCount: 3,
      tags: ["B.E. Degree", "Distributed Systems", "Data Structures"],
      badge: "ACADEMIC HONORS"
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
            <span>SOVEREIGN CREDENTIAL NETWORK • EVM SMART CONTRACTS</span>
          </div>

          <h1 className="hero-title">
            Your Sovereign <span className="editorial-italic">CredoVault</span> on Blockchain.
          </h1>

          <p className="hero-description">
            CredoNet provides an unalterable, self-custodied <strong>CredoVault</strong> for your verified competencies, engineering diplomas, and academic degrees. Cryptographically anchored with tamper-proof signatures directly on EVM smart contracts.
          </p>

          <div className="hero-actions">
            {account ? (
              <Link to="/dashboard" className="btn-primary">
                <span>Access My Vault</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <button onClick={connectWallet} disabled={isConnecting} className="btn-primary">
                <span>{isConnecting ? "Connecting..." : "Connect Wallet to Open Vault"}</span>
                <ArrowRight size={15} />
              </button>
            )}

            <Link to="/verify/search" className="btn-secondary">
              <Search size={14} />
              <span>Verify a Credential</span>
            </Link>

            <Link to="/issuer" className="btn-secondary">
              <Building2 size={14} />
              <span>Issuer Portal</span>
            </Link>
          </div>

          <div className="hero-trust-row">
            <div className="trust-pill">
              <CheckCircle size={14} color="#f26c36" />
              <span>100% Self-Custody</span>
            </div>
            <div className="trust-pill">
              <Lock size={14} color="#f26c36" />
              <span>Keccak-256 Hashes</span>
            </div>
            <div className="trust-pill">
              <Zap size={14} color="#f26c36" />
              <span>Sub-Second Reads</span>
            </div>
            <div className="trust-pill">
              <QrCode size={14} color="#f26c36" />
              <span>Instant QR Verification</span>
            </div>
          </div>
        </div>

        {/* Right Interactive CredoVault Card */}
        <div className="hero-widget">
          <CredoVaultCard />
        </div>
      </section>

      {/* Trust & Security Strip */}
      <div className="trust-strip">
        <div className="trust-strip-item">
          <GraduationCap size={18} color="#f26c36" />
          <span>Accredited Academic Degrees</span>
        </div>
        <div className="trust-strip-item">
          <ShieldCheck size={18} color="#f26c36" />
          <span>Non-Falsifiable Credentials</span>
        </div>
        <div className="trust-strip-item">
          <Lock size={18} color="#f26c36" />
          <span>Sovereign Key-Bound Storage</span>
        </div>
        <div className="trust-strip-item">
          <Building2 size={18} color="#f26c36" />
          <span>Authorized Multi-Sig Authorities</span>
        </div>
      </div>

      {/* How the CredoVault Works (The 4 Stages) */}
      <section className="passport-flow-section">
        <div className="section-meta-wrap">
          <span className="section-label">System Architecture</span>
          <h2 className="section-title">
            How Your CredoVault Operates
          </h2>
          <p className="section-desc">
            A deterministic, zero-fraud workflow connecting students, certifying authorities, and global recruiters on an unalterable blockchain ledger.
          </p>
        </div>

        <div className="flow-steps-grid">
          <div className="flow-step-card">
            <div className="flow-step-header">
              <span className="flow-step-num">01</span>
              <div className="flow-step-icon">
                <Lock size={18} />
              </div>
            </div>
            <h3 className="flow-step-title">Vault Initialization</h3>
            <p className="flow-step-desc">
              Connect your Web3 self-custody wallet (MetaMask / Rabby). Your unique sovereign CredoVault address is initialized on-chain without centralized passwords.
            </p>
          </div>

          <div className="flow-step-card">
            <div className="flow-step-header">
              <span className="flow-step-num">02</span>
              <div className="flow-step-icon">
                <Building2 size={18} />
              </div>
            </div>
            <h3 className="flow-step-title">Authorized Issuance</h3>
            <p className="flow-step-desc">
              Accredited universities, colleges, and training academies issue verifiable skill credentials directly into your CredoVault using role-authorized smart contract calls.
            </p>
          </div>

          <div className="flow-step-card">
            <div className="flow-step-header">
              <span className="flow-step-num">03</span>
              <div className="flow-step-icon">
                <ShieldCheck size={18} />
              </div>
            </div>
            <h3 className="flow-step-title">Cryptographic Anchoring</h3>
            <p className="flow-step-desc">
              Each credential generates an immutable <code>keccak256</code> state hash bound to block timestamps and issuer keys, permanently preventing counterfeit records.
            </p>
          </div>

          <div className="flow-step-card">
            <div className="flow-step-header">
              <span className="flow-step-num">04</span>
              <div className="flow-step-icon">
                <QrCode size={18} />
              </div>
            </div>
            <h3 className="flow-step-title">Instant Verification</h3>
            <p className="flow-step-desc">
              Recruiters, hiring teams, and institutions scan your Vault QR code or inspect your public link for instant mathematical proof of authenticity in &lt;1s.
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
              Hands-on competencies in Solidity, smart contracts, distributed consensus, frontend frameworks, and cloud architecture.
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
                <span>Verify actual competencies instead of embellished PDFs.</span>
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
