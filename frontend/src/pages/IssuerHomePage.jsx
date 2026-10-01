import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertTriangle, 
  FileCheck2, 
  Ban, 
  Layers, 
  Users, 
  KeyRound,
  FileSignature
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { useRole } from "../context/RoleContext";
import "./IssuerHomePage.css";

export function IssuerHomePage() {
  const { user } = useRole();
  const { account, isAuthorized, isOwner, getReadOnlyContract, connectWallet, isConnecting } = useWeb3();

  const [issuedCreds, setIssuedCreds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadIssuerStats() {
      if (!account) return;
      try {
        setLoading(true);
        const contract = getReadOnlyContract();
        const parsed = (raw || []).map((c) => ({
          credentialId: c?.credentialId || "",
          recipient: c?.recipient || "",
          title: c?.title || "",
          category: c?.category || "",
          skills: c?.skills || "",
          issueDate: c?.issueDate ? Number(c.issueDate) : 0,
          isRevoked: Boolean(c?.isRevoked),
        }));
        setIssuedCreds(parsed);
      } catch (err) {
        console.error("Failed to load issuer stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadIssuerStats();
  }, [account]);

  const activeCount = issuedCreds.filter((c) => !c?.isRevoked).length;
  const revokedCount = issuedCreds.filter((c) => c?.isRevoked).length;
  const uniqueStudents = new Set(
    issuedCreds
      .filter((c) => c && c.recipient && typeof c.recipient === "string")
      .map((c) => c.recipient.toLowerCase())
  ).size;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="issuer-home-container">
      {/* Issuer Hero Banner */}
      <section className="issuer-hero-banner">
        <div className="issuer-hero-content">
          <div className="issuer-badge-row">
            <span className="issuer-role-tag">
              <Building2 size={14} />
              <span>Accredited Certifying Authority</span>
            </span>
            {isAuthorized ? (
              <span className="issuer-authorized-pill verified">
                <ShieldCheck size={13} color="#10b981" />
                <span>Authorized Certifying Issuer</span>
              </span>
            ) : account ? (
              <span className="issuer-authorized-pill warning">
                <AlertTriangle size={13} color="#f59e0b" />
                <span>Wallet Connected (Not yet Contract Authorized)</span>
              </span>
            ) : (
              <span className="issuer-authorized-pill neutral">
                <KeyRound size={13} />
                <span>Connect Wallet to Issue</span>
              </span>
            )}
          </div>

          <h1 className="issuer-hero-title">
            <span className="issuer-org-title">{user?.organization || user?.name || "Institution"}</span>
            <span className="issuer-subheading"> Credential Studio</span>
          </h1>

          <p className="issuer-hero-subtitle">
            Accredited issuance terminal for universities, bootcamps, and certifying bodies. Mint tamper-evident credentials directly to recipient wallets with permanent cryptographic provenance.
          </p>

          <div className="issuer-meta-strip">
            <div className="meta-strip-item">
              <span className="meta-label">Authority Admin:</span>
              <span className="meta-val">{user?.name} ({user?.email})</span>
            </div>
            <div className="meta-strip-item">
              <span className="meta-label">Contract Address:</span>
              <span className="meta-val font-mono">0xc6Bf...8e6f</span>
              <button onClick={() => handleCopy("0xc6BfB22D6B46346B113333b5513BDcD361488e6f")} className="strip-copy-btn">
                {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              </button>
            </div>
            <div className="meta-strip-item">
              <span className="meta-label">Consensus:</span>
              <span className="meta-val network-dot-wrap">
                <span className="active-dot" /> EVM Testnet (10143)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Launch Panel */}
        <div className="issuer-launch-card">
          <div className="launch-card-header">
            <FileSignature size={18} color="#38bdf8" />
            <span>Issuance Quick Action</span>
          </div>
          <p className="launch-card-text">
            Ready to mint verified degrees, course badges, or skill certificates? Enter the student's Monad wallet address to anchor credentials on-chain.
          </p>
          <div className="launch-card-cta">
            <Link to="/issuer" className="btn-launch-studio">
              <span>Open Issuance Terminal</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          {!account && (
            <button onClick={connectWallet} disabled={isConnecting} className="btn-connect-issuer">
              <span>{isConnecting ? "Connecting..." : "Connect Authority Wallet"}</span>
            </button>
          )}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="issuer-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap blue">
            <Award size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-number">{issuedCreds.length}</span>
            <span className="stat-label">Total Anchored Credentials</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap green">
            <Users size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-number">{uniqueStudents}</span>
            <span className="stat-label">Certified Students</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap amber">
            <FileCheck2 size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-number">{activeCount}</span>
            <span className="stat-label">Active Valid Credentials</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap red">
            <Ban size={20} />
          </div>
          <div className="stat-details">
            <span className="stat-number">{revokedCount}</span>
            <span className="stat-label">Revocations Enforced</span>
          </div>
        </div>
      </section>

      {/* Feature Modules */}
      <section className="issuer-features-section">
        <h2 className="section-title">Certifying Authority Operations</h2>
        <p className="section-desc">Manage the lifecycle of cryptographic skill credentials issued by your organization.</p>

        <div className="features-grid">
          {/* Card 1: Issue Credentials */}
          <div className="feature-card highlight">
            <div className="feature-card-header">
              <div className="feature-icon-badge blue">
                <FileSignature size={22} />
              </div>
              <span className="feature-status-tag">Primary</span>
            </div>
            <h3 className="feature-card-title">Issue New Credential</h3>
            <p className="feature-card-desc">
              Anchor a skill certificate, diploma, or project completion directly onto Monad EVM. Input student wallet address, credential title, category, and comma-separated skills.
            </p>
            <ul className="feature-points">
              <li><CheckCircle2 size={13} color="#10b981" /> Instant ECDSA cryptographic signature</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Direct assignment to student's Monad wallet</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Permanent immutable audit timestamp</li>
            </ul>
            <Link to="/issuer" className="btn-feature-cta primary">
              <span>Go to Issue Form</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Card 2: Registry & Audit */}
          <div className="feature-card">
            <div className="feature-card-header">
              <div className="feature-icon-badge green">
                <FileCheck2 size={22} />
              </div>
              <span className="feature-status-tag">Registry</span>
            </div>
            <h3 className="feature-card-title">Credential Registry & Audit</h3>
            <p className="feature-card-desc">
              Access your institutional ledger of all issued credentials. Verify recipient wallet addresses, review skill taxonomy, and verify raw transaction receipts.
            </p>
            <ul className="feature-points">
              <li><CheckCircle2 size={13} color="#10b981" /> Filter by recipient wallet or date</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Inspect on-chain data schemas</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Publicly verifiable by global employers</li>
            </ul>
            <Link to="/issuer" className="btn-feature-cta secondary">
              <span>View Credential Ledger</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Card 3: Revocation Management */}
          <div className="feature-card">
            <div className="feature-card-header">
              <div className="feature-icon-badge red">
                <Ban size={22} />
              </div>
              <span className="feature-status-tag">Compliance</span>
            </div>
            <h3 className="feature-card-title">Revocation & Integrity Control</h3>
            <p className="feature-card-desc">
              Only authorized issuers hold the cryptographic power to revoke their own credentials. Revocations flag instantly on all employer verifiers and public vaults.
            </p>
            <ul className="feature-points">
              <li><CheckCircle2 size={13} color="#10b981" /> Protects institutional reputation</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Instant propagation across Monad</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Complete tamper-evident audit trail</li>
            </ul>
            <Link to="/issuer" className="btn-feature-cta secondary">
              <span>Manage Revocations</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
