import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowRight, LogIn, Lock } from "lucide-react";
import { useRole } from "../context/RoleContext";

export function ProtectedRoute({ children, allowedRoles }) {
  const { currentRole, user, openAuthModal, PERSONAS } = useRole();

  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  const isAllowed = allowedRoles.includes(currentRole);

  if (!isAllowed) {
    const requiredName = allowedRoles
      .map((r) => (r === PERSONAS.ISSUER ? "Issuer (Admin)" : r === PERSONAS.STUDENT ? "Student" : "Employer"))
      .join(" or ");

    const currentName = currentRole
      ? currentRole === PERSONAS.ISSUER
        ? "Issuer (Admin)"
        : currentRole === PERSONAS.STUDENT
        ? "Student"
        : "Employer"
      : "Guest (Not Signed In)";

    return (
      <div className="container" style={{ padding: "80px 20px", display: "flex", justifyContent: "center" }}>
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-medium)",
          borderRadius: "var(--radius-xl)",
          padding: "40px",
          maxWidth: "540px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.5)"
        }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "var(--radius-lg)",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#f87171"
          }}>
            <ShieldAlert size={28} />
          </div>

          <div>
            <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "#f87171", fontWeight: "700", textTransform: "uppercase" }}>
              ROLE RESTRICTION
            </span>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-highlight)", marginTop: "4px" }}>
              {requiredName} Access Required
            </h2>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.5", marginTop: "8px" }}>
              This portal is reserved for <strong>{requiredName}</strong> accounts. You are currently browsing as <strong>{currentName}</strong>.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "8px" }}>
            <Link to="/login" className="btn-primary" style={{ flex: 1, justifyContent: "center", padding: "12px" }}>
              <LogIn size={15} />
              <span>Sign In as {requiredName}</span>
            </Link>

            <Link to="/" className="btn-secondary" style={{ flex: 1, justifyContent: "center", padding: "12px" }}>
              <span>Return Home</span>
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--text-muted)" }}>
            <Lock size={12} />
            <span>Strict MERN role-based authorization prevents unauthorized persona switching.</span>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
