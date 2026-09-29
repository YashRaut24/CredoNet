import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Search, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import "./VerifySearchPage.css";

export function VerifySearchPage() {
  const navigate = useNavigate();
  const [credentialId, setCredentialId] = useState("");
  const [error, setError] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    setError("");

    const cleanId = credentialId.trim();
    if (!cleanId) {
      setError("Please enter a Credential ID.");
      return;
    }

    if (!/^0x[a-fA-F0-9]{64}$/.test(cleanId)) {
      setError("Credential ID must be a 32-byte hexadecimal hash (66 characters starting with 0x...).");
      return;
    }

    navigate(`/verify/${cleanId}`);
  };

  return (
    <div className="container verify-search-page">
      <div className="search-hero">
        <div className="search-icon-big">
          <ShieldCheck size={30} />
        </div>
        <span className="trust-badge">
          <span className="trust-badge-dot" />
          Blockchain EVM Verification
        </span>
        <h1 className="search-page-title">Direct Credential Verification</h1>
        <p className="search-page-desc">
          Enter any cryptographic Credential ID to inspect mathematical proof of validity, issuer identity, and unalterable block timestamp directly on the EVM blockchain ledger.
        </p>
      </div>

      <div className="search-card-main">
        <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="search-input-group">
            <input
              type="text"
              placeholder="0x9b4f2c8a71d0e3a45..."
              value={credentialId}
              onChange={(e) => {
                setCredentialId(e.target.value);
                setError("");
              }}
              className="search-input mono"
              style={{ padding: "14px 16px", fontSize: "13.5px" }}
            />
            <button type="submit" className="btn-primary" style={{ padding: "14px 28px", whiteSpace: "nowrap" }}>
              <Search size={16} />
              <span>Audit Now</span>
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
          <span>All audits execute zero-cost cryptographic view queries directly against the EVM blockchain ledger (Monad Testnet).</span>
        </div>
      </div>
    </div>
  );
}
