import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { InitialLoader } from "./components/InitialLoader";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { IssuerPage } from "./pages/IssuerPage";
import { PassportPage } from "./pages/PassportPage";
import { VerifyPage } from "./pages/VerifyPage";
import { VerifySearchPage } from "./pages/VerifySearchPage";
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
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/issuer" element={<IssuerPage />} />
          <Route path="/vault/:address" element={<PassportPage />} />
          <Route path="/passport/:address" element={<PassportPage />} />
          <Route path="/verify/:credentialId" element={<VerifyPage />} />
          <Route path="/verify/search" element={<VerifySearchPage />} />
          {/* Fallback route */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
