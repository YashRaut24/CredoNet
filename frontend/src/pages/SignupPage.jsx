import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  Building2, 
  Wallet, 
  ArrowRight, 
  AlertCircle, 
  Award, 
  Briefcase,
  CheckCircle2
} from "lucide-react";
import { useRole, PERSONAS } from "../context/RoleContext";
import "./SignupPage.css";

export function SignupPage() {
  const { signup, authLoading } = useRole();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(PERSONAS.STUDENT);
  const [organization, setOrganization] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      organization: organization.trim(),
      walletAddress: walletAddress.trim(),
    };

    const res = await signup(payload);
    if (!res.success) {
      setError(res.error || "Signup failed.");
    }
  };

  return (
    <div className="container auth-page-container">
      <div className="auth-card signup-card">
        {/* Header */}
        <div className="auth-card-header">
          <div className="auth-brand-icon">
            <ShieldCheck size={26} color="#f26c36" />
          </div>
          <h1 className="auth-title">Create CredoNet Account</h1>
          <p className="auth-subtitle">
            Register your role-based identity to access your tailored portal
          </p>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Persona Role Selection */}
          <div className="auth-field">
            <label>Select Your Persona / Role <span style={{ color: "var(--accent-primary)" }}>*</span></label>
            <div className="signup-role-grid">
              <div 
                className={`signup-role-option ${role === PERSONAS.STUDENT ? "selected student" : ""}`}
                onClick={() => setRole(PERSONAS.STUDENT)}
              >
                <Award size={18} />
                <span className="role-opt-title">Student</span>
                <span className="role-opt-sub">Career Passport</span>
              </div>

              <div 
                className={`signup-role-option ${role === PERSONAS.ISSUER ? "selected issuer" : ""}`}
                onClick={() => setRole(PERSONAS.ISSUER)}
              >
                <Building2 size={18} />
                <span className="role-opt-title">Issuer (Admin)</span>
                <span className="role-opt-sub">Certify on Monad</span>
              </div>

              <div 
                className={`signup-role-option ${role === PERSONAS.EMPLOYER ? "selected employer" : ""}`}
                onClick={() => setRole(PERSONAS.EMPLOYER)}
              >
                <Briefcase size={18} />
                <span className="role-opt-title">Employer</span>
                <span className="role-opt-sub">Audit & Verify</span>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="auth-field">
            <label>Full Name <span style={{ color: "var(--accent-primary)" }}>*</span></label>
            <div className="auth-input-wrap">
              <User size={16} className="auth-input-icon" />
              <input
                type="text"
                placeholder={role === PERSONAS.EMPLOYER ? "e.g. Sarah Jenkins (Talent Lead)" : "e.g. Alex John"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="auth-input"
              />
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label>Email Address <span style={{ color: "var(--accent-primary)" }}>*</span></label>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label>Password (min 6 characters) <span style={{ color: "var(--accent-primary)" }}>*</span></label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="auth-input"
              />
            </div>
          </div>

          {/* Organization / College */}
          <div className="auth-field">
            <label>
              {role === PERSONAS.STUDENT ? "University / College Name" : role === PERSONAS.ISSUER ? "Institution / Certifying Body" : "Company / Organization"}
            </label>
            <div className="auth-input-wrap">
              <Building2 size={16} className="auth-input-icon" />
              <input
                type="text"
                placeholder={role === PERSONAS.STUDENT ? "e.g. XYZ Institute of Technology" : role === PERSONAS.ISSUER ? "e.g. XYZ Web3 Academy" : "e.g. TechCorp Ventures"}
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="auth-input"
              />
            </div>
          </div>

          {/* Wallet Address (Optional) */}
          {role !== PERSONAS.EMPLOYER && (
            <div className="auth-field">
              <label>EVM Wallet Address (Optional)</label>
              <div className="auth-input-wrap">
                <Wallet size={16} className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="auth-input mono"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="btn-primary auth-submit-btn"
          >
            <span>{authLoading ? "Creating Account..." : `Register as ${role === PERSONAS.STUDENT ? "Student" : role === PERSONAS.ISSUER ? "Issuer" : "Employer"}`}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Footer switch to Login */}
        <div className="auth-card-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
