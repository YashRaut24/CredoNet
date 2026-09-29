"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { 
  ShieldCheck, 
  Award, 
  Search, 
  ArrowRight, 
  Zap, 
  CheckCircle, 
  Lock,
  QrCode
} from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";

export default function HomePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [passportSearchAddress, setPassportSearchAddress] = useState("");
  const [verifySearchId, setVerifySearchId] = useState("");

  const handlePassportSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (passportSearchAddress.trim()) {
      router.push(`/passport/${passportSearchAddress.trim()}`);
    }
  };

  const handleVerifySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifySearchId.trim()) {
      router.push(`/verify/${verifySearchId.trim()}`);
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161826] border border-[#262a3f] text-xs font-medium text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span>Decentralized Credential Protocol</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Own your skills. <br />
            <span className="text-zinc-400">
              Verify your achievements.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto font-normal leading-relaxed">
            Tamper-proof, portable, and verifiable skill credentials issued and stored directly on-chain.
          </p>
        </div>

        {/* Hero Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {isConnected ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm"
            >
              <Award className="w-4 h-4" />
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>
          ) : (
            <WalletConnect />
          )}

          {isConnected && address && (
            <Link
              href={`/passport/${address}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-zinc-200 bg-[#141624] border border-[#23283c] hover:bg-[#1a1d30] transition-colors"
            >
              <QrCode className="w-4 h-4 text-zinc-400" />
              <span>View Passport</span>
            </Link>
          )}

          <Link
            href="/issuer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-zinc-300 bg-[#121420] border border-[#212538] hover:text-white hover:bg-[#181b2b] transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <span>Issuer Portal</span>
          </Link>
        </div>
      </section>

      {/* Quick Lookup Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
        {/* Passport Search */}
        <div className="aesthetic-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#191c2c] text-indigo-400 border border-[#272b42]">
              <Award className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-100">Student Passport Lookup</h3>
              <p className="text-xs text-zinc-400">View public verifiable profile by address</p>
            </div>
          </div>
          <form onSubmit={handlePassportSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Student wallet address (0x...)"
              value={passportSearchAddress}
              onChange={(e) => setPassportSearchAddress(e.target.value)}
              className="aesthetic-input flex-1 px-3.5 py-2 rounded-lg text-xs font-mono text-zinc-200 placeholder:font-sans placeholder:text-zinc-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>View</span>
            </button>
          </form>
        </div>

        {/* Credential Verification Search */}
        <div className="aesthetic-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#191c2c] text-indigo-400 border border-[#272b42]">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-100">Credential Verification</h3>
              <p className="text-xs text-zinc-400">Direct on-chain status verification</p>
            </div>
          </div>
          <form onSubmit={handleVerifySearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Credential ID (0x...)"
              value={verifySearchId}
              onChange={(e) => setVerifySearchId(e.target.value)}
              className="aesthetic-input flex-1 px-3.5 py-2 rounded-lg text-xs font-mono text-zinc-200 placeholder:font-sans placeholder:text-zinc-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#1f2338] hover:bg-[#282d47] text-zinc-200 border border-[#2f3552] text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Verify</span>
            </button>
          </form>
        </div>
      </section>

      {/* Clean Feature Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto pt-2">
        <div className="aesthetic-panel p-5 rounded-xl space-y-2.5">
          <div className="p-2 w-fit rounded-lg bg-[#181a28] text-zinc-300 border border-[#262a3f]">
            <Lock className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-100">Sovereign Ownership</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Achievements and certificates remain bound to your wallet forever without dependence on third-party databases.
          </p>
        </div>

        <div className="aesthetic-panel p-5 rounded-xl space-y-2.5">
          <div className="p-2 w-fit rounded-lg bg-[#181a28] text-zinc-300 border border-[#262a3f]">
            <Zap className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-100">Instant Verification</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Anyone can inspect validity, issuer authorization, and proof of work in real-time via direct contract read.
          </p>
        </div>

        <div className="aesthetic-panel p-5 rounded-xl space-y-2.5">
          <div className="p-2 w-fit rounded-lg bg-[#181a28] text-zinc-300 border border-[#262a3f]">
            <CheckCircle className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-100">Authorized Issuance</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Only recognized organizations can mint credentials, with complete transparency and on-chain revocation support.
          </p>
        </div>
      </section>
    </div>
  );
}
