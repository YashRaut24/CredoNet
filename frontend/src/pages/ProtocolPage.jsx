import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  ArrowRight, 
  FileCheck2, 
  ExternalLink,
  Cpu,
  KeyRound,
  Binary
} from "lucide-react";
import "./ProtocolPage.css";

export function ProtocolPage() {
  const [copied, setCopied] = useState(false);
  const contractAddress = "0xc6BfB22D6B46346B113333b5513BDcD361488e6f";

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="protocol-page">
      {/* Hero Header */}
      <section className="protocol-hero">
        <div className="container">
          <div className="badge-pill">
            <ShieldCheck size={14} color="#10b981" />
            <span>Tamper-Proof Verification Standards</span>
          </div>
          <h1 className="protocol-title">
            The CredoNet <span className="highlight-text">Verification Protocol</span>
          </h1>
          <p className="protocol-subtitle">
            How CredoNet replaces unverified claims and fake paper certificates with instant digital certainty.
          </p>

          <div className="contract-strip-box">
            <span className="contract-label">Registry Contract:</span>
            <span className="contract-addr font-mono">{contractAddress}</span>
            <button onClick={handleCopy} className="btn-copy-contract">
              {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
              <span>{copied ? "Copied" : "Copy Address"}</span>
            </button>
            <span className="chain-tag">Verified Network</span>
          </div>
        </div>
      </section>

      {/* Comparison: Resumes vs CredoNet */}
      <section className="container comparison-section">
        <div className="section-header-center">
          <h2 className="section-title">Traditional Credentials vs. CredoNet Protocol</h2>
          <p className="section-subtitle">Why traditional resumes and PDFs fail in the modern engineering hiring market.</p>
        </div>

        <div className="comparison-grid">
          {/* Traditional */}
          <div className="comparison-card flawed">
            <div className="card-tag flawed">Legacy Methods</div>
            <h3 className="card-headline">Traditional Resumes & PDFs</h3>
            <ul className="comparison-list">
              <li>
                <XCircle size={15} color="#ef4444" className="icon-state" />
                <div>
                  <strong>Trivially Fabricated:</strong> Anyone can edit a PDF or add false technologies to a LinkedIn profile without verification.
                </div>
              </li>
              <li>
                <XCircle size={15} color="#ef4444" className="icon-state" />
                <div>
                  <strong>Slow & Expensive Audits:</strong> Employers spend days and hundreds of dollars on third-party background check agencies.
                </div>
              </li>
              <li>
                <XCircle size={15} color="#ef4444" className="icon-state" />
                <div>
                  <strong>No Revocation Control:</strong> When an institution revokes an award, physical certificates and PDFs remain in circulation.
                </div>
              </li>
              <li>
                <XCircle size={15} color="#ef4444" className="icon-state" />
                <div>
                  <strong>Centralized Database Fragility:</strong> If an academic database goes offline, verification records are lost.
                </div>
              </li>
            </ul>
          </div>

          {/* CredoNet */}
          <div className="comparison-card superior">
            <div className="card-tag superior">CredoNet Protocol</div>
            <h3 className="card-headline">CredoNet Digital Verification</h3>
            <ul className="comparison-list">
              <li>
                <CheckCircle2 size={15} color="#10b981" className="icon-state" />
                <div>
                  <strong>Official Institutional Signatures:</strong> Credentials are digitally certified by authorized universities and cannot be tampered with.
                </div>
              </li>
              <li>
                <CheckCircle2 size={15} color="#10b981" className="icon-state" />
                <div>
                  <strong>Instant Verification:</strong> Any recruiter can query the verification registry directly in seconds with zero fees and no accounts.
                </div>
              </li>
              <li>
                <CheckCircle2 size={15} color="#10b981" className="icon-state" />
                <div>
                  <strong>Real-Time Revocation Registry:</strong> Authorized institutions can flag revoked certificates instantly across the network.
                </div>
              </li>
              <li>
                <CheckCircle2 size={15} color="#10b981" className="icon-state" />
                <div>
                  <strong>Permanent Student Ownership:</strong> Students truly own their verifiable digital passport permanently.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Core Protocol Pillars */}
      <section className="container pillars-section">
        <div className="section-header-center">
          <h2 className="section-title">Core Verification Guarantees</h2>
          <p className="section-subtitle">Four foundational pillars powering CredoNet's verification engine.</p>
        </div>

        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon amber">
              <KeyRound size={22} />
            </div>
            <h4 className="pillar-title">Authorized Issuer Standards</h4>
            <p className="pillar-desc">
              Only verified educational institutions and accredited partner organizations can issue credentials, preventing fake certificates and degree mills.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon green">
              <Lock size={22} />
            </div>
            <h4 className="pillar-title">Permanent Identity Binding</h4>
            <p className="pillar-desc">
              Credentials are permanently bound to the student's verified profile. They cannot be sold, traded, or transferred to anyone else, guaranteeing true authenticity.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon blue">
              <Cpu size={22} />
            </div>
            <h4 className="pillar-title">Instant Verification Speed</h4>
            <p className="pillar-desc">
              Built for instantaneous speed, credential issuance and verification queries execute with instant real-time confirmation.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon purple">
              <FileCheck2 size={22} />
            </div>
            <h4 className="pillar-title">100% Free Public Verification</h4>
            <p className="pillar-desc">
              Anyone—recruiters, hiring managers, or admissions boards—can verify credentials instantly without needing a wallet, account, or paying any fees.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="container">
        <div className="protocol-cta-box">
          <h3>Try Verifying a Credential Now</h3>
          <p>Search any candidate address or Credential ID to view real-time verification status.</p>
          <div className="cta-action-row">
            <Link to="/verify/search" className="btn-primary">
              <span>Open Verifier Terminal</span>
              <ArrowRight size={15} />
            </Link>
            <Link to="/vault/0x71C92a8C943B8d62283e1c66289b5B38B71C4e92" className="btn-secondary">
              <span>Inspect Sample Passport</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
