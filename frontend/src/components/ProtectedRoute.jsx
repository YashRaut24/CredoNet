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
      <div className="container protected-route-container">
        <div className="protected-route-card">
          <div className="protected-route-icon">
            <ShieldAlert size={28} />
          </div>

          <div>
            <span className="protected-route-tag">
              ROLE RESTRICTION
            </span>
            <h2 className="protected-route-title">
              {requiredName} Access Required
            </h2>
            <p className="protected-route-desc">
              This portal is reserved for <strong>{requiredName}</strong> accounts. You are currently browsing as <strong>{currentName}</strong>.
            </p>
          </div>

          <div className="protected-route-actions">
            <Link to="/login" className="btn-primary">
              <LogIn size={15} />
              <span>Sign In as {requiredName}</span>
            </Link>

            <Link to="/" className="btn-secondary">
              <span>Return Home</span>
            </Link>
          </div>

          <div className="protected-route-footer">
            <Lock size={12} />
            <span>Strict role-based authorization prevents unauthorized persona switching.</span>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
