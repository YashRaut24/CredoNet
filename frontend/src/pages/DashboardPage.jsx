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
  PlusCircle
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { CredentialCard } from "../components/CredentialCard";
import { QRCodeModal } from "../components/QRCodeModal";
import "./DashboardPage.css";

export function DashboardPage() {
  const { account, getReadOnlyContract, connectWallet, isConnecting } = useWeb3();

  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [showQR, setShowQR] = useState(false);

  // Load credentials from Monad smart contract
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

  useEffect(() => {
    if (account) {
      loadCredentials();
    }
  }, [account]);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const vaultUrl = account ? `${window.location.origin}/vault/${account}` : "";

  // Calculations
  const validCreds = credentials.filter((c) => !c.revoked);
  const uniqueSkills = new Set(validCreds.map((c) => c.skill.toLowerCase().trim())).size;

  const filteredCredentials = credentials.filter((c) =>
    c.skill.toLowerCase().includes(filterText.toLowerCase()) ||
    c.issuer.toLowerCase().includes(filterText.toLowerCase())
  );

  if (!account) {
    return (
      <div className="container">
        <div className="connect-prompt-card">
          <div className="connect-icon-wrap">
            <Award size={28} />
          </div>
          <h2 className="connect-title">Connect Your Sovereign Wallet</h2>
          <p className="connect-desc">
            Connect your Web3 wallet to access your sovereign CredoVault, verified skills, and consensus records on EVM blockchain.
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="btn-primary"
            style={{ width: "100%", padding: "12px" }}
          >
            {isConnecting ? "Connecting..." : "Connect MetaMask"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container dashboard-page">
      {/* Profile Banner */}
      <div className="profile-banner">
        <div className="profile-identity">
          <div className="profile-avatar">
            <Award size={28} />
          </div>
          <div className="profile-info">
            <span className="profile-tag">Sovereign CredoVault</span>
            <div className="profile-address-row">
              <span className="profile-address-text">
                VAULT ID: {account.slice(0, 6)}...{account.slice(-4)}
              </span>
              <button onClick={copyAddress} className="btn-icon-copy" title="Copy Vault Address">
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={() => setShowQR(true)} className="btn-secondary">
            <QrCode size={14} />
            <span>Vault QR</span>
          </button>

          <Link to={`/vault/${account}`} className="btn-outline-amber">
            <span>Public Vault</span>
            <ExternalLink size={13} />
          </Link>

          <button onClick={loadCredentials} disabled={loading} className="btn-secondary" title="Sync with EVM Ledger">
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-box-label">Verified Credentials</span>
          <span className="stat-box-value">{credentials.length}</span>
          <span className="stat-box-sub">Anchored on EVM</span>
        </div>

        <div className="stat-box">
          <span className="stat-box-label">Active Validations</span>
          <span className="stat-box-value">{validCreds.length}</span>
          <span className="stat-box-sub" style={{ color: "var(--success)" }}>Tamper-Proof</span>
        </div>

        <div className="stat-box">
          <span className="stat-box-label">Verified Competencies</span>
          <span className="stat-box-value">{uniqueSkills}</span>
          <span className="stat-box-sub">Unique Skills</span>
        </div>

        <div className="stat-box">
          <span className="stat-box-label">Consensus Proof</span>
          <span className="stat-box-value">100%</span>
          <span className="stat-box-sub">Keccak-256 Ledger</span>
        </div>
      </div>

      {/* Credentials Header & Filter */}
      <div className="credentials-section-header">
        <div className="credentials-title-wrap">
          <h3 style={{ fontSize: "20px", fontWeight: "700" }}>Verified Credentials Vault</h3>
          <span className="credentials-count-pill">{filteredCredentials.length}</span>
        </div>

        <div className="filter-input-wrap">
          <Search size={15} />
          <input
            type="text"
            placeholder="Filter by skill or issuer..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="filter-input"
          />
        </div>
      </div>

      {/* Credentials List */}
      {loading ? (
        <div className="credentials-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="credential-card" style={{ minHeight: "180px", opacity: 0.6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                <div className="skeleton-box" style={{ width: "45%", height: "14px" }} />
                <div className="skeleton-box" style={{ width: "25%", height: "20px", borderRadius: "10px" }} />
              </div>
              <div className="skeleton-box" style={{ width: "75%", height: "22px", marginBottom: "20px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className="skeleton-box" style={{ width: "100%", height: "14px" }} />
                <div className="skeleton-box" style={{ width: "90%", height: "14px" }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCredentials.length > 0 ? (
        <div className="credentials-grid">
          {filteredCredentials.map((cred) => (
            <CredentialCard key={cred.credentialId} credential={cred} />
          ))}
        </div>
      ) : (
        <div className="empty-credentials-box">
          <div className="empty-icon">
            <Layers size={22} />
          </div>
          <h4 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-highlight)" }}>
            {filterText ? "No matching credentials found" : "No Credentials Issued Yet"}
          </h4>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "420px" }}>
            Share your sovereign CredoVault address with an authorized university, college, or certifying authority to receive your first verified on-chain credential.
          </p>
          <button onClick={copyAddress} className="btn-secondary" style={{ marginTop: "6px" }}>
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? "Vault ID Copied!" : "Copy Vault Address"}</span>
          </button>
        </div>
      )}

      {showQR && (
        <QRCodeModal
          url={vaultUrl}
          title="Sovereign CredoVault"
          description={`Scan to inspect all verified credentials bound to ${account.slice(0, 6)}...${account.slice(-4)} on EVM blockchain.`}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
