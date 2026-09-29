"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  QrCode, 
  ExternalLink, 
  Calendar, 
  User, 
  Award,
  Link as LinkIcon,
  Search,
  Database
} from "lucide-react";
import { SKILL_PASSPORT_ADDRESS, SKILL_PASSPORT_ABI, CredentialData } from "@/config/contracts";
import { monadTestnet } from "@/config/wagmi";
import { QRCodeModal } from "@/components/QRCodeModal";

export default function PublicVerificationPage() {
  const params = useParams();
  const credentialIdParam = (params.credentialId as string) || "";
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  // Validate format of bytes32 (66 chars starting with 0x)
  const isBytes32 = /^0x[a-fA-F0-9]{64}$/.test(credentialIdParam);

  const { data: rawCredential, isLoading, isError } = useReadContract({
    chainId: monadTestnet.id,
    address: SKILL_PASSPORT_ADDRESS,
    abi: SKILL_PASSPORT_ABI,
    functionName: "getCredential",
    args: isBytes32 ? [credentialIdParam as `0x${string}`] : undefined,
    query: {
      enabled: isBytes32,
    },
  });

  const credential = rawCredential as unknown as CredentialData | undefined;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  if (!isBytes32) {
    return (
      <div className="aesthetic-panel p-10 text-center rounded-2xl max-w-md mx-auto space-y-4">
        <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-white">Invalid Credential ID</h2>
          <p className="text-xs text-zinc-400">
            A valid credential ID must be a 32-byte hexadecimal string (0x...).
          </p>
        </div>
        <Link
          href="/verify/search"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search Another ID</span>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="aesthetic-panel p-10 text-center rounded-2xl max-w-md mx-auto space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-300">Verifying credential on-chain...</p>
      </div>
    );
  }

  if (isError || !credential || credential.student === "0x0000000000000000000000000000000000000000") {
    return (
      <div className="aesthetic-panel p-10 text-center rounded-2xl max-w-md mx-auto space-y-4">
        <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-white">Credential Not Found</h2>
          <p className="text-xs text-zinc-400">
            No credential with ID <span className="font-mono text-zinc-300">{credentialIdParam.slice(0, 10)}...</span> was found.
          </p>
        </div>
        <Link
          href="/verify/search"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Try Another ID</span>
        </Link>
      </div>
    );
  }

  const issueDate = new Date(Number(credential.issuedAt) * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isMetadataUrl =
    credential.metadataHash.startsWith("http://") ||
    credential.metadataHash.startsWith("https://") ||
    credential.metadataHash.startsWith("ipfs://");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Verification Status Header */}
      <div className={`aesthetic-panel p-6 sm:p-8 rounded-2xl space-y-4 ${
        credential.revoked ? "border-rose-500/30" : "border-emerald-500/30"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {credential.revoked ? (
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <XCircle className="w-6 h-6" />
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded border ${
                  credential.revoked 
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}>
                  {credential.revoked ? "REVOKED CREDENTIAL" : "VALID CREDENTIAL"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {credential.skill}
              </h1>
            </div>
          </div>

          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#181a28] hover:bg-[#202336] text-zinc-200 border border-[#262a3f] text-xs font-medium transition-colors self-start sm:self-center"
          >
            <QrCode className="w-3.5 h-3.5 text-zinc-400" />
            <span>Share QR</span>
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          {credential.revoked
            ? "This credential was revoked by the issuing authority and is no longer valid."
            : "This skill credential is authentic, active, and verified directly from the smart contract."}
        </p>
      </div>

      {/* Metadata Panel */}
      <div className="aesthetic-panel p-6 sm:p-8 rounded-2xl space-y-5">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-2">
          <Database className="w-3.5 h-3.5" />
          On-Chain Credential Metadata
        </h2>

        <div className="space-y-3 text-xs">
          {/* Student */}
          <div className="p-3.5 rounded-lg bg-[#0c0d14] border border-[#1b1e2e] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <span className="text-zinc-400 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-indigo-400" /> Student Wallet
            </span>
            <div className="flex items-center gap-2 font-mono text-zinc-200">
              <Link href={`/passport/${credential.student}`} className="hover:underline flex items-center gap-1">
                <span>{credential.student}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                onClick={() => copyToClipboard(credential.student, "student")}
                className="text-zinc-500 hover:text-white"
              >
                {copiedField === "student" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Issuer */}
          <div className="p-3.5 rounded-lg bg-[#0c0d14] border border-[#1b1e2e] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <span className="text-zinc-400 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Authorized Issuer
            </span>
            <div className="flex items-center gap-2 font-mono text-zinc-200">
              <span>{credential.issuer}</span>
              <button
                onClick={() => copyToClipboard(credential.issuer, "issuer")}
                className="text-zinc-500 hover:text-white"
              >
                {copiedField === "issuer" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Credential ID */}
          <div className="p-3.5 rounded-lg bg-[#0c0d14] border border-[#1b1e2e] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <span className="text-zinc-400 flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-indigo-400" /> Credential ID (bytes32)
            </span>
            <div className="flex items-center gap-2 font-mono text-zinc-200 truncate max-w-xs sm:max-w-sm">
              <span className="truncate">{credential.credentialId}</span>
              <button
                onClick={() => copyToClipboard(credential.credentialId, "credId")}
                className="text-zinc-500 hover:text-white shrink-0"
              >
                {copiedField === "credId" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Issue Date */}
          <div className="p-3.5 rounded-lg bg-[#0c0d14] border border-[#1b1e2e] flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Issuance Timestamp
            </span>
            <span className="text-zinc-200 font-medium">{issueDate}</span>
          </div>

          {/* Evidence / Proof */}
          {credential.metadataHash && (
            <div className="p-3.5 rounded-lg bg-[#0c0d14] border border-[#1b1e2e] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="text-zinc-400 flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-400" /> Evidence Proof
              </span>
              <div>
                {isMetadataUrl ? (
                  <a
                    href={credential.metadataHash.replace("ipfs://", "https://ipfs.io/ipfs/")}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1 font-medium"
                  >
                    <span>View Evidence Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="font-mono text-zinc-400">{credential.metadataHash}</span>
                )}
              </div>
            </div>
          )}

          {/* Contract Address */}
          <div className="p-3.5 rounded-lg bg-[#0c0d14] border border-[#1b1e2e] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <span className="text-zinc-400">Smart Contract Address</span>
            <span className="font-mono text-zinc-300">{SKILL_PASSPORT_ADDRESS}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#1f2336] flex flex-wrap items-center justify-between gap-3 text-xs">
          <Link
            href={`/passport/${credential.student}`}
            className="text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1 font-medium"
          >
            <span>View Student Passport</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <Link
            href="/verify/search"
            className="text-zinc-400 hover:text-white"
          >
            Verify another credential →
          </Link>
        </div>
      </div>

      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        title={`Verification: ${credential.skill}`}
        url={pageUrl}
      />
    </div>
  );
}
