import React, { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import "./InitialLoader.css";

export function InitialLoader({ onComplete }) {
  const [progress, setProgress] = useState(15);
  const [step, setStep] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(45);
      setStep(1);
    }, 400);

    const t2 = setTimeout(() => {
      setProgress(80);
      setStep(2);
    }, 900);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStep(3);
    }, 1400);

    const t4 = setTimeout(() => {
      setFading(true);
    }, 1750);

    const t5 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  const steps = [
    "Connecting to Blockchain EVM Consensus Node...",
    "Auditing Solidity Smart Contract Bytecode (0xc6Bf...8e6f)...",
    "Validating Cryptographic Ledger Signatures...",
    "Zero-Fraud Blockchain Protocol Initialized.",
  ];

  return (
    <div className={`initial-loader-overlay ${fading ? "fade-out" : ""}`}>
      <div className="loader-box">
        <div className="loader-scanner-line" />

        <div className="loader-icon-container">
          <ShieldCheck size={32} />
        </div>

        <h2 className="loader-brand">CredoNet<span>.</span></h2>
        <p className="loader-subtitle">Decentralized Sovereign Credential Vault</p>

        <div className="loader-terminal">
          {steps.map((text, idx) => (
            <div key={idx} className="loader-terminal-line" style={{ opacity: idx <= step ? 1 : 0.35 }}>
              <span className={`terminal-dot ${idx < step ? "done" : ""}`} />
              <span>{text}</span>
            </div>
          ))}
        </div>

        <div className="loader-progress-track">
          <div className="loader-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="loader-progress-text">
          <span>SECURITY VERIFICATION</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
