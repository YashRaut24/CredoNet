import React from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Award, 
  Building2, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  FileCheck, 
  QrCode, 
  Lock, 
  Share2, 
  FolderGit2,
  Users
} from "lucide-react";
import "./HowItWorksPage.css";

export function HowItWorksPage() {
  return (
    <div className="how-it-works-page">
      {/* Hero Header */}
      <section className="how-hero">
        <div className="container">
          <div className="badge-pill">
            <Cpu size={14} color="#f26c36" />
            <span>Architecture & Workflow</span>
          </div>
          <h1 className="how-title">
            How <span className="highlight-text">CredoNet</span> Works
          </h1>
          <p className="how-subtitle">
            A tamper-proof digital network connecting students, accredited institutions, and employers to eliminate resume fraud permanently.
          </p>
        </div>
      </section>

      {/* 3-Step Core Protocol Pipeline */}
      <section className="container pipeline-section">
        <div className="section-header-center">
          <h2 className="section-title">The Three-Step Trust Architecture</h2>
          <p className="section-subtitle">How credentials move securely from institution to student to employer.</p>
        </div>

        <div className="pipeline-grid">
          {/* Step 1 */}
          <div className="pipeline-card">
            <div className="pipeline-step-badge">01</div>
            <div className="pipeline-icon amber">
              <Building2 size={24} />
            </div>
            <span className="pipeline-role">Accredited Issuer</span>
            <h3 className="pipeline-title">Official Digital Issuance</h3>
            <p className="pipeline-desc">
              Universities, bootcamps, and hackathons verify student project completion or exam results. Authorized institutions certify digital credentials directly to the student's verified profile.
            </p>
            <ul className="pipeline-list">
              <li><CheckCircle2 size={13} color="#10b981" /> Signed with authorized institutional digital signature</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Permanent tamper-proof timestamp & verification ID</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Standardized skill metadata & category tags</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="pipeline-card">
            <div className="pipeline-step-badge">02</div>
            <div className="pipeline-icon blue">
              <Award size={24} />
            </div>
            <span className="pipeline-role">Student / Talent</span>
            <h3 className="pipeline-title">Permanent Student Ownership</h3>
            <p className="pipeline-desc">
              Students own their credential passport permanently. They can link GitHub code repositories, add project evidence, and generate public tamper-evident portfolio links or QR codes for resumes and LinkedIn.
            </p>
            <ul className="pipeline-list">
              <li><CheckCircle2 size={13} color="#10b981" /> Permanent independent profile ownership</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Direct GitHub repository & evidence mapping</li>
              <li><CheckCircle2 size={13} color="#10b981" /> 1-Click shareable public URL & QR code</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="pipeline-card">
            <div className="pipeline-step-badge">03</div>
            <div className="pipeline-icon green">
              <Briefcase size={24} />
            </div>
            <span className="pipeline-role">Employer / Recruiter</span>
            <h3 className="pipeline-title">Instant Digital Verification</h3>
            <p className="pipeline-desc">
              Employers audit candidate claims with complete confidence. By entering the candidate's address or scanning a QR code, verifiers confirm validity directly—no third-party delays, no manual background checks.
            </p>
            <ul className="pipeline-list">
              <li><CheckCircle2 size={13} color="#10b981" /> Instant verification response</li>
              <li><CheckCircle2 size={13} color="#10b981" /> Real-time active and revocation status check</li>
              <li><CheckCircle2 size={13} color="#10b981" /> 100% free with zero fees required</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Persona Walkthrough Section */}
      <section className="container personas-breakdown">
        <div className="section-header-center">
          <h2 className="section-title">Designed for Three Distinct Roles</h2>
          <p className="section-subtitle">Each participant has a dedicated interface tailored to their specific needs.</p>
        </div>

        <div className="personas-cards-grid">
          {/* Student Persona */}
          <div className="persona-detail-card student">
            <div className="persona-card-top">
              <span className="persona-badge-tag student">Student Experience</span>
              <h3 className="persona-heading">The Digital Career Passport</h3>
            </div>
            <p className="persona-body">
              Students build a living record of their capabilities. Instead of easily forged PDF certificates or unverified resumes, every credential in your CredoNet passport is officially verified and digitally certified by recognized organizations.
            </p>
            <div className="persona-features-box">
              <div className="p-feat"><FolderGit2 size={15} color="#f26c36" /> Showcase project repositories alongside certificates</div>
              <div className="p-feat"><Share2 size={15} color="#f26c36" /> Public link (/vault/0x...) viewable by any hiring manager</div>
              <div className="p-feat"><QrCode size={15} color="#f26c36" /> Printable QR code for physical resumes & portfolios</div>
            </div>
            <Link to="/signup" className="btn-persona-action student">
              <span>Create Student Passport</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Issuer Persona */}
          <div className="persona-detail-card issuer">
            <div className="persona-card-top">
              <span className="persona-badge-tag issuer">Issuer Experience</span>
              <h3 className="persona-heading">The Accredited Authority Studio</h3>
            </div>
            <p className="persona-body">
              Universities, bootcamps, and certifying authorities issue tamper-proof certificates that outlast centralized institutional databases. Issuers retain full revocation authority if credentials are ever disputed or expired.
            </p>
            <div className="persona-features-box">
              <div className="p-feat"><Lock size={15} color="#38bdf8" /> Authorized institutional access guards issuance rights</div>
              <div className="p-feat"><FileCheck size={15} color="#38bdf8" /> Immutable credential ledger & recipient registry</div>
              <div className="p-feat"><ShieldCheck size={15} color="#38bdf8" /> Tamper-evident official revocation controls</div>
            </div>
            <Link to="/signup" className="btn-persona-action issuer">
              <span>Register as Certifying Issuer</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Employer Persona */}
          <div className="persona-detail-card employer">
            <div className="persona-card-top">
              <span className="persona-badge-tag employer">Employer Experience</span>
              <h3 className="persona-heading">The Instant Verification Portal</h3>
            </div>
            <p className="persona-body">
              Recruiters and hiring managers eliminate days of manual background checks and reference phone calls. Search pre-verified engineers by verified competencies and audit credentials directly against the official registry.
            </p>
            <div className="persona-features-box">
              <div className="p-feat"><ShieldCheck size={15} color="#c084fc" /> 100% protection against fraudulent resumes</div>
              <div className="p-feat"><Users size={15} color="#c084fc" /> Browse pre-verified talent by skills (React, Node, Python)</div>
              <div className="p-feat"><Cpu size={15} color="#c084fc" /> Instant verification response with zero fees or accounts needed</div>
            </div>
            <Link to="/signup" className="btn-persona-action employer">
              <span>Register as Verified Employer</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="container cta-section">
        <div className="cta-banner-box">
          <h2 className="cta-banner-title">Ready to Experience True Credential Verification?</h2>
          <p className="cta-banner-text">
            Join the verified skill credential network trusted by students, universities, and employers.
          </p>
          <div className="cta-banner-btns">
            <Link to="/signup" className="btn-primary">
              <span>Get Started Free</span>
              <ArrowRight size={15} />
            </Link>
            <Link to="/login" className="btn-secondary">
              <span>Sign In with Demo Persona</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
