import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const RoleContext = createContext(null);

export const PERSONAS = {
  STUDENT: "student",
  ISSUER: "issuer",
  EMPLOYER: "employer",
};

export function RoleProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("credonet_user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("credonet_token") || null;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem("credonet_active_role") || null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Validate session with backend on initial load if token exists
  useEffect(() => {
    if (token) {
      fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
            setCurrentRole(data.user.role);
            localStorage.setItem("credonet_user", JSON.stringify(data.user));
            localStorage.setItem("credonet_active_role", data.user.role);
          } else {
            // Invalid token
            logout();
          }
        })
        .catch(() => {
          // If server is temporarily unreachable, preserve offline user session
        });
    }
  }, []);

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Login failed");
      }

      setToken(data.token);
      setUser(data.user);
      setCurrentRole(data.user.role);
      localStorage.setItem("credonet_token", data.token);
      localStorage.setItem("credonet_user", JSON.stringify(data.user));
      localStorage.setItem("credonet_active_role", data.user.role);

      // Redirect to persona home page
      navigate("/");
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (formData) => {
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Registration failed");
      }

      setToken(data.token);
      setUser(data.user);
      setCurrentRole(data.user.role);
      localStorage.setItem("credonet_token", data.token);
      localStorage.setItem("credonet_user", JSON.stringify(data.user));
      localStorage.setItem("credonet_active_role", data.user.role);

      // Redirect to persona home page
      navigate("/");
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCurrentRole(null);
    localStorage.removeItem("credonet_token");
    localStorage.removeItem("credonet_user");
    localStorage.removeItem("credonet_active_role");
    navigate("/");
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Quick switch role (demo mode or persona testing)
  const loginAs = (role) => {
    setCurrentRole(role);
    localStorage.setItem("credonet_active_role", role);
    setIsAuthModalOpen(false);
    if (role === PERSONAS.STUDENT) navigate("/dashboard");
    else if (role === PERSONAS.ISSUER) navigate("/issuer");
    else if (role === PERSONAS.EMPLOYER) navigate("/employer");
  };

  const value = {
    user,
    token,
    currentRole: user?.role || currentRole,
    PERSONAS,
    isAuthenticated: Boolean(user || currentRole),
    isStudent: (user?.role || currentRole) === PERSONAS.STUDENT,
    isIssuer: (user?.role || currentRole) === PERSONAS.ISSUER,
    isEmployer: (user?.role || currentRole) === PERSONAS.EMPLOYER,
    isGuest: !user && !currentRole,
    authLoading,
    login,
    signup,
    logout,
    loginAs,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
