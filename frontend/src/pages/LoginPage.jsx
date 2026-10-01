import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Award, Building2, Briefcase, Check } from "lucide-react";
import { useRole, PERSONAS } from "../context/RoleContext";
import "./LoginPage.css";

export function LoginPage() {
  const { login, authLoading, currentRole } = useRole();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || "Invalid credentials.");
    }
  };

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="container auth-page-container">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-card-header">
          <div className="auth-brand-icon">
            <ShieldCheck size={26} color="#f26c36" />
          </div>
          <h1 className="auth-title">Welcome to CredoNet</h1>
          <p className="auth-subtitle">
            Sign in to access your role-authorized workspace
          </p>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Email Address</label>
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

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="btn-primary auth-submit-btn"
          >
            <span>{authLoading ? "Signing In..." : "Sign In to Workspace"}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Demo Fast-Login Helper for Evaluators & Users */}
        <div className="auth-demo-section">
          <span className="auth-demo-label">1-Click Demo Accounts (By Persona):</span>
          <div className="auth-demo-grid">
            <button
              type="button"
              onClick={() => fillDemoAccount("student@credonet.xyz", "password123")}
              className="demo-account-pill student"
            >
              <Award size={13} />
              <span>🎓 Student (Alex John)</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount("issuer@credonet.xyz", "password123")}
              className="demo-account-pill issuer"
            >
              <Building2 size={13} />
              <span>🏛️ Issuer (XYZ Academy)</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount("recruiter@techcorp.com", "password123")}
              className="demo-account-pill employer"
            >
              <Briefcase size={13} />
              <span>💼 Recruiter (TechCorp)</span>
            </button>
          </div>
        </div>

        {/* Footer switch to Signup */}
        <div className="auth-card-footer">
          <p>
            Don't have an account yet?{" "}
            <Link to="/signup" className="auth-link">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
