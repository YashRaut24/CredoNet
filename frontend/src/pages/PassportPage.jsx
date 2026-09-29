import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ethers } from "ethers";
import { 
  Award, 
  ShieldCheck, 
  Copy, 
  Check, 
  QrCode, 
  ExternalLink, 
  CheckCircle2, 
  XCircle,
  Layers,
  ArrowLeft
} from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { CredentialCard } from "../components/CredentialCard";
import { QRCodeModal } from "../components/QRCodeModal";
import "./PassportPage.css";

export function PassportPage() {
  const { address } = useParams();
  const { getReadOnlyContract } = useWeb3();

  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const isValidAddress = ethers.isAddress(address || "");

  useEffect(() => {
    async function fetchPassport() {
      if (!isValidAddress) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const contract = getReadOnlyContract();
        const raw = await contract.getStudentCredentials(address);
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
        console.error("Error loading passport credentials:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPassport();
  }, [address, isValidAddress, getReadOnlyContract]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const validCreds = credentials.filter((c) => !c.revoked);
  const uniqueSkills = Array.from(new Set(validCreds.map((c) => c.skill)));
  const pageUrl = window.location.href;

  if (!isValidAddress) {
    return (
      <div className="container" style={{ padding: "60px 0" }}>
        <div className="connect-prompt-card">
          <XCircle size={40} color="#f43f5e" />
          <h3 className="connect-title">Invalid Wallet Address</h3>
          <p className="connect-desc">
            The requested address "{address}" is not a valid 42-character EVM hexadecimal string.
          </p>
          <Link to="/" className="btn-secondary">
            <ArrowLeft size={14} />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container passport-page">
      {/* Back button */}
      <div>
        <Link to="/" className="btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }}>
          <ArrowLeft size={13} />
          <span>Back</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="passport-hero-card">
        <div className="passport-identity-wrap">
          <div className="passport-avatar-shield">
            <ShieldCheck size={32} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span className="trust-badge" style={{ width: "fit-content" }}>
              <span className="trust-badge-dot" />
              Sovereign CredoVault
            </span>
            <h2 className="passport-title">Verified CredoVault</h2>
            <div className="passport-address-chip">
              <span>VAULT ID: {address}</span>
              <button onClick={copyAddress} className="btn-icon-copy" title="Copy Address">
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setShowQR(true)} className="btn-primary">
            <QrCode size={15} />
            <span>Vault QR</span>
          </button>
        </div>
      </div>

      {/* Skills Cloud */}
      {uniqueSkills.length > 0 && (
        <div className="skills-cloud-card">
          <span className="skills-cloud-header">Demonstrated & Verified Competencies</span>
          <div className="skills-chips-row">
            {uniqueSkills.map((skill, idx) => (
              <div key={idx} className="skill-chip">
                <CheckCircle2 size={13} color="#10b981" />
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credential Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "700" }}>Verified Credentials Ledger</h3>
          <span className="credentials-count-pill">{validCreds.length} Valid Badges</span>
        </div>

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
        ) : credentials.length > 0 ? (
          <div className="credentials-grid">
            {credentials.map((cred) => (
              <CredentialCard key={cred.credentialId} credential={cred} />
            ))}
          </div>
        ) : (
          <div className="empty-credentials-box">
            <div className="empty-icon">
              <Layers size={22} />
            </div>
            <h4 style={{ fontSize: "16px", fontWeight: "600" }}>No credentials found for this address</h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              This wallet has not yet received verified credentials on EVM blockchain.
            </p>
          </div>
        )}
      </div>

      {showQR && (
        <QRCodeModal
          url={pageUrl}
          title="Sovereign CredoVault"
          description={`Scan to inspect all verified credentials bound to ${address.slice(0, 6)}...${address.slice(-4)} on EVM blockchain.`}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
