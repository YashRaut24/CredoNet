import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  QrCode, 
  ExternalLink, 
  Copy, 
  Check, 
  Lock, 
  FileCheck, 
  Cpu, 
  Binary,
  Layers,
  Sparkles
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import "./CredoVaultCard.css";

export function CredoVaultCard() {
  const { account } = useWeb3();
  const [activeTab, setActiveTab] = useState("credentials"); // "credentials" | "proof" | "qr"
  const [copied, setCopied] = useState(false);

  const displayAddress = account || "0x71C92a8C943B8d62283e1c66289b5B38B71C4e92";

  const copyAddress = () => {
    navigator.clipboard.writeText(displayAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleCredentials = [
    {
      id: "cred-1",
      skill: "Solidity Core & EVM Architecture",
      issuer: "Web3 Engineering Council",
      tag: "SMART CONTRACTS",
      status: "AUTHENTIC",
      date: "Aug 2026",
      icon: Cpu,
      color: "#f26c36"
    },
    {
      id: "cred-2",
      skill: "B.E. Computer Engineering (Sem 7)",
      issuer: "Autonomous Technical Institute",
      tag: "ACADEMIC DEGREE",
      status: "VERIFIED",
      date: "Sep 2026",
      icon: Award,
      color: "#e36128"
    },
    {
      id: "cred-3",
      skill: "Distributed Consensus & Cryptography",
      issuer: "Consensus Architecture Lab",
      tag: "SPECIALIZATION",
      status: "ON-CHAIN",
      date: "Jul 2026",
      icon: Lock,
      color: "#d95822"
    }
  ];

  return (
    <div className="credo-vault-card">
      {/* Top Protocol Status Bar */}
      <div className="vault-status-bar">
        <div className="vault-protocol-tag">
          <ShieldCheck size={15} />
          <span>CREDONET SOVEREIGN VAULT</span>
        </div>
        <div className="vault-serial-tag">
          <span>VAULT ID: {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}</span>
        </div>
      </div>

      {/* Main Vault Plate Header */}
      <div className="vault-plate-header">
        <div className="vault-sigil-zone">
          <div className="vault-sigil-frame">
            <Award size={30} />
          </div>
          <div className="vault-state-pill">
            <span className="vault-state-dot" />
            <span>TAMPER-PROOF</span>
          </div>
        </div>

        <div className="vault-meta-zone">
          <div className="vault-origin-row">
            <span className="vault-sub-label">VAULT OWNER</span>
            <h3 className="vault-holder-title">
              {account ? "CONNECTED SCHOLAR WALLET" : "ALEXANDER M. • VERIFIED GRADUATE"}
            </h3>
          </div>

          <div className="vault-metrics-grid">
            <div>
              <span className="vault-sub-label">SECURITY CLASS</span>
              <span className="vault-val-text">SOVEREIGN SELF-CUSTODY</span>
            </div>
            <div>
              <span className="vault-sub-label">BLOCKCHAIN NETWORK</span>
              <span className="vault-val-text">EVM / MONAD TESTNET</span>
            </div>
            <div>
              <span className="vault-sub-label">HASH INTEGRITY</span>
              <span className="vault-val-text">KECCAK-256 SIGNED</span>
            </div>
            <div>
              <span className="vault-sub-label">VAULT CAPACITY</span>
              <span className="vault-val-text">PERPETUAL ON-CHAIN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Vault Navigation */}
      <div className="vault-tab-strip">
        <button 
          className={`vault-tab-btn ${activeTab === "credentials" ? "active" : ""}`}
          onClick={() => setActiveTab("credentials")}
        >
          <FileCheck size={13} />
          <span>Credentials ({sampleCredentials.length})</span>
        </button>
        <button 
          className={`vault-tab-btn ${activeTab === "proof" ? "active" : ""}`}
          onClick={() => setActiveTab("proof")}
        >
          <Layers size={13} />
          <span>Cryptographic Proof</span>
        </button>
        <button 
          className={`vault-tab-btn ${activeTab === "qr" ? "active" : ""}`}
          onClick={() => setActiveTab("qr")}
        >
          <QrCode size={13} />
          <span>Recruiter QR</span>
        </button>
      </div>

      {/* Tab 1: Credentials Shelf */}
      {activeTab === "credentials" && (
        <div className="vault-shelf">
          {sampleCredentials.map((cred) => {
            const Icon = cred.icon;
            return (
              <div key={cred.id} className="vault-item">
                <div className="item-sigil-box" style={{ borderColor: `${cred.color}40`, color: cred.color }}>
                  <Icon size={17} />
                </div>
                <div className="item-details">
                  <div className="item-top-row">
                    <span className="item-skill-name">{cred.skill}</span>
                    <span className="item-status-tag">{cred.status}</span>
                  </div>
                  <div className="item-meta-row">
                    <span>{cred.issuer}</span>
                    <span className="vault-dot">•</span>
                    <span>{cred.date}</span>
                    <span className="vault-dot">•</span>
                    <span className="item-tag-code">{cred.tag}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Cryptographic Proof */}
      {activeTab === "proof" && (
        <div className="vault-shelf">
          <div className="vault-data-block">
            <span className="data-title">Sovereign Vault Public Address</span>
            <span className="data-code-val">{displayAddress}</span>
            <button onClick={copyAddress} className="btn-copy-small" title="Copy Address">
              {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
            </button>
          </div>
          <div className="vault-data-block">
            <span className="data-title">CredoNet Smart Contract</span>
            <span className="data-code-val">0xc6BfB22D6B46346B113333b5513BDcD361488e6f</span>
          </div>
          <div className="vault-data-block">
            <span className="data-title">Mathematical Validity Guarantee</span>
            <span className="data-plain-val">
              Credentials are authenticated via ECDSA signatures and keccak256 hashes permanently stored in EVM state.
            </span>
          </div>
        </div>
      )}

      {/* Tab 3: Recruiter QR */}
      {activeTab === "qr" && (
        <div className="vault-qr-shelf">
          <div className="vault-qr-frame">
            <QrCode size={68} color="#f26c36" />
            <span className="qr-frame-label">Vault Verification Key</span>
          </div>
          <div className="vault-qr-info">
            <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-highlight)", marginBottom: "4px" }}>
              Instant Recruiter Verification
            </h4>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              Employers scan this sovereign QR code to mathematically verify all anchored credentials directly against EVM state in &lt;1 second.
            </p>
          </div>
        </div>
      )}

      {/* Bottom Holographic Seal Plate */}
      <div className="vault-seal-footer">
        <div className="holographic-seal-badge">
          <span className="seal-badge-heading">★ ANCHORED ON CREDONET LEDGER ★</span>
          <span className="seal-badge-sub">VERIFIABLE CREDENTIAL SYSTEM</span>
        </div>
        <Link to={account ? "/dashboard" : "/verify/search"} className="vault-action-link">
          <span>{account ? "Access My Vault" : "Verify a Credential"}</span>
          <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
}
