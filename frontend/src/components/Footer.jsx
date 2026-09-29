import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { MONAD_TESTNET_CONFIG } from "../config/contractConfig";
import "./Footer.css";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={18} color="#f26c36" />
            <span className="footer-brand-title">CredoNet<span style={{ color: "#f26c36" }}>.</span></span>
          </div>
          <p className="footer-brand-desc">
            Decentralized sovereign skill credential & academic ledger anchored on EVM blockchain smart contracts.
          </p>
        </div>

        <ul className="footer-links">
          <li>
            <Link to="/" className="footer-link">Explore</Link>
          </li>
          <li>
            <Link to="/dashboard" className="footer-link">My Vault</Link>
          </li>
          <li>
            <Link to="/issuer" className="footer-link">Issuer Portal</Link>
          </li>
          <li>
            <Link to="/verify/search" className="footer-link">Verify</Link>
          </li>
          <li>
            <a
              href={MONAD_TESTNET_CONFIG.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <span>EVM Explorer</span>
              <ExternalLink size={11} />
            </a>
          </li>
        </ul>
      </div>

      <div className="container footer-bottom">
        <p>© 2026 CredoNet. Verifiable Skill & Academic Credential Ledger powered by EVM Smart Contracts.</p>
      </div>
    </footer>
  );
}
