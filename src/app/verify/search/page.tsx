"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Search } from "lucide-react";

export default function VerifySearchPage() {
  const router = useRouter();
  const [credentialId, setCredentialId] = useState("");
  const [error, setError] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = credentialId.trim();
    if (!trimmed) {
      setError("Please enter a credential ID.");
      return;
    }

    router.push(`/verify/${trimmed}`);
  };

  return (
    <div className="max-w-lg mx-auto py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="p-3 rounded-xl bg-[#161826] text-indigo-400 border border-[#262a3f] w-fit mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Public Verification</h1>
        <p className="text-xs text-zinc-400">
          Verify skill credentials, certificates, and achievements on-chain.
        </p>
      </div>

      <div className="aesthetic-panel p-6 rounded-2xl space-y-4">
        <form onSubmit={handleSearch} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">
              Credential ID (32-byte hash)
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              className="aesthetic-input w-full px-3.5 py-2.5 rounded-lg text-xs font-mono text-zinc-200 placeholder:font-sans placeholder:text-zinc-500"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm flex items-center justify-center gap-2 text-xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Verify Credential</span>
          </button>
        </form>

        <div className="p-3.5 rounded-lg bg-[#0c0d14] border border-[#1b1e2e] text-xs text-zinc-400 space-y-1">
          <p className="font-medium text-zinc-300">Direct Verification:</p>
          <p>
            When an issuer mints a skill credential, a unique cryptographic hash is recorded on-chain. Anyone can verify validity, issuer origin, and timestamp in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
