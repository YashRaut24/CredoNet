import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, Award, LogOut, CheckCircle, AlertTriangle, LogIn, User, Building2, Briefcase } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { useRole, PERSONAS } from "../context/RoleContext";
import "./Navbar.css";

export function Navbar() {
  const { account, chainId, isMonadChain, isAuthorized, isOwner, connectWallet, disconnectWallet, switchToMonad, isConnecting } = useWeb3();
  const { user, currentRole, logout } = useRole();
  const location = useLocation();

  const handleLogout = () => {
    disconnectWallet();
    logout();
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Brand */}
        <Link to="/" className="brand">
          <div className="brand-icon-wrap">
            <ShieldCheck size={18} />
          </div>
          <span style={{ fontSize: "19px", fontWeight: "800", letterSpacing: "-0.02em" }}>
            CredoNet<span className="brand-dot">.</span>
          </span>
        </Link>

        {/* Navigation Links - Persona Aware */}
        <ul className="nav-links">
          <li>
            <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
              Home
            </Link>
          </li>

          {user && (currentRole === PERSONAS.STUDENT || user.role === PERSONAS.STUDENT) && (
            <>
              <li>
                <Link to="/dashboard" className={`nav-link ${location.pathname.startsWith("/dashboard") ? "active" : ""}`}>
                  My Passport
                </Link>
              </li>
              <li>
                <Link to={account ? `/vault/${account}` : (user?.walletAddress ? `/vault/${user.walletAddress}` : "/vault/0x71C92a8C943B8d62283e1c66289b5B38B71C4e92")} className={`nav-link ${location.pathname.startsWith("/vault") ? "active" : ""}`}>
                  Public Passport
                </Link>
              </li>
            </>
          )}

          {user && (currentRole === PERSONAS.ISSUER || user.role === PERSONAS.ISSUER) && (
            <>
              <li>
                <Link to="/issuer" className={`nav-link ${location.pathname.startsWith("/issuer") ? "active" : ""}`}>
                  Issuer Studio
                </Link>
              </li>
            </>
          )}

          {user && (currentRole === PERSONAS.EMPLOYER || user.role === PERSONAS.EMPLOYER) && (
            <>
              <li>
                <Link to="/employer" className={`nav-link ${location.pathname === "/employer" ? "active" : ""}`}>
                  Talent Directory
                </Link>
              </li>
              <li>
                <Link to="/verify/search" className={`nav-link ${location.pathname.startsWith("/verify") ? "active" : ""}`}>
                  Verify Candidate
                </Link>
              </li>
            </>
          )}

          {!user && (
            <>
              <li>
                <Link to="/how-it-works" className={`nav-link ${location.pathname === "/how-it-works" ? "active" : ""}`}>
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/protocol" className={`nav-link ${location.pathname === "/protocol" ? "active" : ""}`}>
                  Verification Protocol
                </Link>
              </li>
              <li>
                <Link to="/verify/search" className={`nav-link ${location.pathname.startsWith("/verify") ? "active" : ""}`}>
                  Public Verifier
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Right Actions */}
        <div className="nav-actions">
          {/* Authenticated User / Role Pill */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div 
                className={`persona-nav-pill ${currentRole}`}
                title={`Logged in as ${user.name} (${user.role})`}
              >
                {currentRole === PERSONAS.STUDENT && <User size={13} />}
                {currentRole === PERSONAS.ISSUER && <Building2 size={13} />}
                {currentRole === PERSONAS.EMPLOYER && <Briefcase size={13} />}
                <span>{user.name.split(" ")[0]}</span>
                <span className="persona-switch-hint">{currentRole}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ padding: "6px 10px", height: "34px" }}
                title="Log Out"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Link
                to="/login"
                className="btn-secondary"
                style={{ padding: "6px 12px", height: "34px", fontSize: "12px", gap: "6px" }}
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </Link>

              <Link
                to="/signup"
                className="btn-primary"
                style={{ padding: "6px 14px", height: "34px", fontSize: "12px" }}
              >
                <span>Sign Up</span>
              </Link>
            </div>
          )}

          {/* Web3 Wallet Actions (Only For Authenticated Students & Issuers) */}
          {user && (currentRole === PERSONAS.STUDENT || currentRole === PERSONAS.ISSUER) && (
            account ? (
              <>
                {isMonadChain ? (
                  <div className="network-badge">
                    <span className="network-dot" />
                    <span>EVM Testnet (10143)</span>
                  </div>
                ) : (
                  <button
                    onClick={switchToMonad}
                    className="btn-switch-monad"
                    title="Your wallet is on the wrong network. Click to switch to the supported EVM Testnet."
                  >
                    <AlertTriangle size={13} />
                    <span>Switch Network</span>
                  </button>
                )}

                {isAuthorized && (
                  <div className="issuer-tag" title="Authorized Issuer on SkillPassport Contract">
                    <CheckCircle size={11} />
                    <span>Issuer ✓</span>
                  </div>
                )}

                <div className="wallet-badge" title={account}>
                  <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
                </div>

                <button
                  onClick={disconnectWallet}
                  className="btn-secondary"
                  style={{ padding: "6px 10px", height: "34px" }}
                  title="Disconnect Web3 Wallet"
                >
                  <LogOut size={13} />
                </button>
              </>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn-primary"
                style={{ padding: "7px 14px", height: "34px", fontSize: "12.5px" }}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
