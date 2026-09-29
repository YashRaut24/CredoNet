import React from "react";
import "./MarketRadar.css";

export function MarketRadar() {
  return (
    <div className="radar-card">
      {/* Top Meta */}
      <div className="radar-header">
        <span className="radar-label">Market Signals</span>
        <div className="radar-stat-badge">
          <span className="radar-stat-tag">High Demand</span>
          <span className="radar-stat-growth">+38% Growth</span>
          <span className="radar-stat-skills">Solidity & Rust</span>
        </div>
      </div>

      {/* Orbit & Scanning Core */}
      <div className="radar-arena">
        <div className="radar-sweep" />
        <div className="radar-ring radar-ring-1" />
        <div className="radar-ring radar-ring-2" />
        <div className="radar-ring radar-ring-3" />

        <div className="radar-core">
          <span className="core-tag">CredoNet</span>
          <span className="core-sub">Active Trust<br />Engine</span>
        </div>
      </div>

      {/* Bottom Readiness & Tag */}
      <div className="radar-footer">
        <div className="readiness-box">
          <span className="readiness-label">Cryptographic Proof</span>
          <div className="readiness-bars">
            <div className="readiness-bar" />
            <div className="readiness-bar" />
            <div className="readiness-bar" />
            <div className="readiness-bar" />
            <div className="readiness-bar" />
          </div>
          <span className="readiness-value">99.8% On-Chain Validity</span>
        </div>

        <span className="radar-sub-label">EVM Blockchain Ledger</span>
      </div>
    </div>
  );
}
