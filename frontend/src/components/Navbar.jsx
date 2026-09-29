import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, Award, LogOut, CheckCircle, ExternalLink } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import "./Navbar.css";

export function Navbar() {
  const { account, chainId, isAuthorized, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const location = useLocation();

  const isCurrent = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Brand */}
        <Link to="/" className="brand">
          <div className="brand-icon-wrap">
            <ShieldCheck size={18} />
          </div>
          <span>CredoNet<span className="brand-dot">.</span></span>
        </Link>

        {/* Navigation Links */}
        <ul className="nav-links">
          <li>
            <Link to="/" className={`nav-link ${isCurrent("/") ? "active" : ""}`}>
              Explore
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className={`nav-link ${isCurrent("/dashboard") ? "active" : ""}`}>
              My Vault
            </Link>
          </li>
          <li>
            <Link to="/issuer" className={`nav-link ${isCurrent("/issuer") ? "active" : ""}`}>
              Issuer Portal
            </Link>
          </li>
          <li>
            <Link to="/verify/search" className={`nav-link ${isCurrent("/verify") ? "active" : ""}`}>
              Verify
            </Link>
          </li>
        </ul>

        {/* Right Actions */}
        <div className="nav-actions">
          {account ? (
            <>
              <div className="network-badge">
                <span className="network-dot" />
                <span>Monad {chainId === 10143 ? "Testnet" : chainId || "EVM"}</span>
              </div>

              {isAuthorized && (
                <div className="issuer-tag">
                  <CheckCircle size={11} />
                  <span>Issuer</span>
                </div>
              )}

              <div className="wallet-badge">
                <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
              </div>

              <button
                onClick={disconnectWallet}
                className="btn-secondary"
                style={{ padding: "6px 10px", height: "34px" }}
                title="Disconnect Wallet"
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="btn-primary"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
