import React from "react";
import { 
  X, 
  Award, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Lock,
  User
} from "lucide-react";
import { useRole, PERSONAS } from "../context/RoleContext";
import { useWeb3 } from "../context/Web3Context";
import "./AuthRoleModal.css";

export function AuthRoleModal() {
  const { currentRole, loginAs, closeAuthModal, isAuthModalOpen } = useRole();
  const { account, connectWallet } = useWeb3();

  if (!isAuthModalOpen) return null;

  const handleSelectRole = (role) => {
    loginAs(role);
    if ((role === PERSONAS.STUDENT || role === PERSONAS.ISSUER) && !account) {
      // Prompt wallet connection if not connected
      connectWallet();
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal}>
      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="auth-modal-header">
          <div>
            <span className="auth-modal-tag">ROLE-BASED PORTALS</span>
            <h2 className="auth-modal-title">Sign In / Select Your Persona</h2>
            <p className="auth-modal-desc">
              Select your role to access dedicated tools and permissions. You can switch personas at any time.
            </p>
          </div>
          <button className="auth-modal-close" onClick={closeAuthModal} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* 3 Persona Cards */}
        <div className="auth-persona-grid">
          {/* Card 1: Student */}
          <div 
            className={`auth-persona-card student ${currentRole === PERSONAS.STUDENT ? "active-role" : ""}`}
            onClick={() => handleSelectRole(PERSONAS.STUDENT)}
          >
            <div className="persona-card-top">
              <div className="persona-icon-wrap student">
                <Award size={24} />
              </div>
              <span className="persona-badge student">STUDENT / TALENT</span>
            </div>

            <h3 className="persona-name">Student Career Vault</h3>
            <p className="persona-bio">
              Build your self-custody portfolio. Add GitHub repos and project proofs, collect verified credentials from authorized issuers, and export your QR passport.
            </p>

            <ul className="persona-features">
              <li><CheckCircle2 size={13} color="var(--accent-primary)" /> <span>Add GitHub repos & project proof</span></li>
              <li><CheckCircle2 size={13} color="var(--accent-primary)" /> <span>Collect verified skills on Monad</span></li>
              <li><CheckCircle2 size={13} color="var(--accent-primary)" /> <span>Unlock real milestone achievements</span></li>
            </ul>

            <button 
              type="button" 
              className="btn-primary persona-cta"
            >
              <span>{currentRole === PERSONAS.STUDENT ? "Active: Student Vault" : "Enter as Student"}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 2: Issuer */}
          <div 
            className={`auth-persona-card issuer ${currentRole === PERSONAS.ISSUER ? "active-role" : ""}`}
            onClick={() => handleSelectRole(PERSONAS.ISSUER)}
          >
            <div className="persona-card-top">
              <div className="persona-icon-wrap issuer">
                <Building2 size={24} />
              </div>
              <span className="persona-badge issuer">ACCREDITED ISSUER</span>
            </div>

            <h3 className="persona-name">Issuer Certification Studio</h3>
            <p className="persona-bio">
              For universities, hackathons, and bootcamps. Review submitted student project evidence, link project proofs, and anchor credentials with revocation control.
            </p>

            <ul className="persona-features">
              <li><CheckCircle2 size={13} color="#38bdf8" /> <span>Review student project submissions</span></li>
              <li><CheckCircle2 size={13} color="#38bdf8" /> <span>Issue credentials directly on Monad</span></li>
              <li><CheckCircle2 size={13} color="#38bdf8" /> <span>Full on-chain revocation management</span></li>
            </ul>

            <button 
              type="button" 
              className="btn-secondary persona-cta issuer-btn"
            >
              <span>{currentRole === PERSONAS.ISSUER ? "Active: Issuer Studio" : "Enter as Issuer"}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 3: Employer */}
          <div 
            className={`auth-persona-card employer ${currentRole === PERSONAS.EMPLOYER ? "active-role" : ""}`}
            onClick={() => handleSelectRole(PERSONAS.EMPLOYER)}
          >
            <div className="persona-card-top">
              <div className="persona-icon-wrap employer">
                <Briefcase size={24} />
              </div>
              <span className="persona-badge employer">EMPLOYER / AUDITOR</span>
            </div>

            <h3 className="persona-name">Employer Verification Hub</h3>
            <p className="persona-bio">
              For hiring managers and recruiters. Scan candidate QR passports, audit verified skills against underlying GitHub code, and check validity with 0 gas and no wallet.
            </p>

            <ul className="persona-features">
              <li><CheckCircle2 size={13} color="#10b981" /> <span>No crypto wallet or gas fee needed</span></li>
              <li><CheckCircle2 size={13} color="#10b981" /> <span>Audit candidate passports & GitHub repos</span></li>
              <li><CheckCircle2 size={13} color="#10b981" /> <span>Instant Monad validation (VALID/REVOKED)</span></li>
            </ul>

            <button 
              type="button" 
              className="btn-secondary persona-cta employer-btn"
            >
              <span>{currentRole === PERSONAS.EMPLOYER ? "Active: Employer Hub" : "Enter as Employer"}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="auth-modal-footer">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Lock size={14} color="#f26c36" />
            <span>Cryptographic integrity powered by Monad Testnet EVM. Personal data remains strictly off-chain.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
