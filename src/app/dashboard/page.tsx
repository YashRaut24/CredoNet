"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { 
  Award, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  PlusCircle, 
  RefreshCw,
  Search,
  Layers
} from "lucide-react";
import { SKILL_PASSPORT_ADDRESS, SKILL_PASSPORT_ABI, CredentialData } from "@/config/contracts";
import { monadTestnet } from "@/config/wagmi";
import { CredentialCard } from "@/components/CredentialCard";
import { QRCodeModal } from "@/components/QRCodeModal";
import { WalletConnect } from "@/components/WalletConnect";

export default function StudentDashboardPage() {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [showPassportQR, setShowPassportQR] = useState(false);

  // Read student credentials directly from smart contract
  const { 
    data: rawCredentials, 
    isLoading, 
    refetch,
    isRefetching 
  } = useReadContract({
    chainId: monadTestnet.id,
    address: SKILL_PASSPORT_ADDRESS,
    abi: SKILL_PASSPORT_ABI,
    functionName: "getStudentCredentials",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const credentials: CredentialData[] = (rawCredentials as unknown as CredentialData[]) || [];

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const passportUrl = typeof window !== "undefined" && address
    ? `${window.location.origin}/passport/${address}`
    : `/passport/${address || ""}`;

  const validCredentials = credentials.filter((c) => !c.revoked);
  const revokedCredentials = credentials.filter((c) => c.revoked);
  const uniqueSkillsCount = new Set(validCredentials.map((c) => c.skill.toLowerCase().trim())).size;

  const filteredCredentials = credentials.filter((c) =>
    c.skill.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.issuer.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] text-center space-y-5 max-w-sm mx-auto">
        <div className="p-3.5 rounded-xl bg-[#161826] text-zinc-300 border border-[#262a3f]">
          <Award className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold text-zinc-100">Connect Wallet</h2>
          <p className="text-xs text-zinc-400">
            Connect your Web3 wallet to access your on-chain skill credentials and public passport.
          </p>
        </div>
        <WalletConnect />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Profile Header */}
      <div className="aesthetic-panel p-6 sm:p-8 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#181a28] border border-[#262a3f] text-xs font-medium text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Student Passport</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              My Skill Credentials
            </h1>
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-300 bg-[#0c0d14] px-3 py-1 rounded-lg border border-[#1f2336] w-fit">
              <span>{address}</span>
              <button
                onClick={copyAddress}
                className="text-zinc-400 hover:text-white transition-colors"
                title="Copy address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#161826] border border-[#262a3f] text-xs font-medium text-zinc-300 hover:text-white hover:bg-[#1f2235] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
              <span>Sync</span>
            </button>

            <button
              onClick={() => setShowPassportQR(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Share QR</span>
            </button>

            <Link
              href={`/passport/${address}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#141624] border border-[#23283c] hover:bg-[#1a1d30] text-zinc-200 text-xs font-medium transition-colors"
            >
              <span>Public View</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#1f2336]">
          <div className="p-3.5 rounded-lg bg-[#0c0d14] border border-[#1b1e2e]">
            <p className="text-xs text-zinc-400 font-medium">Verified Skills</p>
            <p className="text-xl font-bold text-white mt-0.5">{uniqueSkillsCount}</p>
          </div>
          <div className="p-3.5 rounded-lg bg-[#0c0d14] border border-[#1b1e2e]">
            <p className="text-xs text-zinc-400 font-medium">Active Credentials</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{validCredentials.length}</p>
          </div>
          <div className="p-3.5 rounded-lg bg-[#0c0d14] border border-[#1b1e2e]">
            <p className="text-xs text-zinc-400 font-medium">Revoked Credentials</p>
            <p className="text-xl font-bold text-rose-400 mt-0.5">{revokedCredentials.length}</p>
          </div>
          <div className="p-3.5 rounded-lg bg-[#0c0d14] border border-[#1b1e2e]">
            <p className="text-xs text-zinc-400 font-medium">Total Credentials</p>
            <p className="text-xl font-bold text-zinc-300 mt-0.5">{credentials.length}</p>
          </div>
        </div>
      </div>

      {/* Add / Receive Credential Section */}
      <div className="aesthetic-panel p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-indigo-400" />
            How to Receive New Skill Credentials
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Share your wallet address with an authorized course issuer or mentor. Once issued on-chain, it will appear directly in your passport.
          </p>
        </div>
        <button
          onClick={copyAddress}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1a1d2e] border border-[#2b3049] hover:bg-[#22263d] text-zinc-200 text-xs font-medium transition-colors whitespace-nowrap"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy Student Address"}</span>
        </button>
      </div>

      {/* Credentials Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-indigo-400" />
              Credentials ({credentials.length})
            </h2>
            <p className="text-xs text-zinc-400">Verifiable on-chain records</p>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter by skill..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="aesthetic-input w-full pl-8 pr-3 py-1.5 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* Loading / Empty / Grid */}
        {isLoading ? (
          <div className="p-10 text-center text-zinc-400 aesthetic-panel rounded-xl">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
            <p className="text-xs">Loading credentials from chain...</p>
          </div>
        ) : filteredCredentials.length === 0 ? (
          <div className="aesthetic-panel p-10 text-center rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#171928] text-zinc-400 flex items-center justify-center mx-auto border border-[#24273d]">
              <Award className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-200">No Credentials Found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                {searchFilter
                  ? "No credentials match your filter."
                  : "You haven't received any credentials on this address yet. Share your address with an authorized issuer."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCredentials.map((cred) => (
              <CredentialCard key={cred.credentialId} credential={cred} />
            ))}
          </div>
        )}
      </div>

      <QRCodeModal
        isOpen={showPassportQR}
        onClose={() => setShowPassportQR(false)}
        title="Student Skill Passport"
        url={passportUrl}
      />
    </div>
  );
}
