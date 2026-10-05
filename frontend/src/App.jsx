import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { InitialLoader } from "./components/InitialLoader";
import { LandingPage } from "./pages/LandingPage";
import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { IssuerPage } from "./pages/IssuerPage";
import { PassportPage } from "./pages/PassportPage";
import { VerifyPage } from "./pages/VerifyPage";
import { VerifySearchPage } from "./pages/VerifySearchPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { ProtocolPage } from "./pages/ProtocolPage";
import { BlindVerifyPage } from "./pages/BlindVerifyPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthRoleModal } from "./components/AuthRoleModal";
import "./App.css";

export function App() {
  const [initialLoading, setInitialLoading] = useState(() => {
    // Run initial security handshake animation on first load
    return !sessionStorage.getItem("credonet_initialized");
  });

  const handleInitialComplete = () => {
    sessionStorage.setItem("credonet_initialized", "true");
    setInitialLoading(false);
  };

  return (
    <div className="app-layout">
      {initialLoading && <InitialLoader onComplete={handleInitialComplete} />}
      <Navbar />
      <AuthRoleModal />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/protocol" element={<ProtocolPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Student Protected Portal */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Issuer Protected Portal */}
          <Route
            path="/issuer"
            element={
              <ProtectedRoute allowedRoles={["issuer"]}>
                <IssuerPage />
              </ProtectedRoute>
            }
          />

          {/* Employer Protected Portal */}
          <Route
            path="/employer"
            element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <VerifySearchPage />
              </ProtectedRoute>
            }
          />

          {/* Public Verification Routes (Open to all recruiters & public) */}
          <Route path="/vault/:address" element={<PassportPage />} />
          <Route path="/passport/:address" element={<PassportPage />} />
          <Route path="/verify/:credentialId" element={<VerifyPage />} />
          <Route path="/verify/blind/:proofId" element={<BlindVerifyPage />} />
          <Route path="/verify/search" element={<VerifySearchPage />} />

          {/* Fallback route */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
