"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { isAddress } from "viem";
import { useReadContract } from "wagmi";
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  QrCode, 
  ExternalLink, 
  Layers
} from "lucide-react";
import { SKILL_PASSPORT_ADDRESS, SKILL_PASSPORT_ABI, CredentialData } from "@/config/contracts";
import { monadTestnet } from "@/config/wagmi";
import { QRCodeModal } from "@/components/QRCodeModal";

export default function StudentPassportViewPage() {
  const params = useParams();
  const addressParam = (params.address as string) || "";
  const isValidEthAddress = isAddress(addressParam);

  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const { data: rawCredentials, isLoading } = useReadContract({
    chainId: monadTestnet.id,
    address: SKILL_PASSPORT_ADDRESS,
    abi: SKILL_PASSPORT_ABI,
    functionName: "getStudentCredentials",
    args: isValidEthAddress ? [addressParam as `0x${string}`] : undefined,
    query: {
      enabled: isValidEthAddress,
    },
  });

  const credentials: CredentialData[] = (rawCredentials as unknown as CredentialData[]) || [];
  const validCredentials = credentials.filter((c) => !c.revoked);
  const uniqueSkills = Array.from(new Set(validCredentials.map((c) => c.skill)));

  const copyAddress = () => {
    navigator.clipboard.writeText(addressParam);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const passportUrl = typeof window !== "undefined" ? window.location.href : "";

  if (!isValidEthAddress) {
    return (
      <div className="aesthetic-panel p-10 text-center rounded-2xl max-w-md mx-auto space-y-3">
        <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-semibold text-white">Invalid Wallet Address</h2>
        <p className="text-xs text-zinc-400">
          The address &quot;{addressParam}&quot; is not a valid EVM address format.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Passport Header Profile */}
      <div className="aesthetic-panel p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#181a28] border border-[#262a3f] text-xs font-medium text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Public Skill Passport</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Student Portfolio
            </h1>
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-300 bg-[#0c0d14] px-3 py-1 rounded-lg border border-[#1f2336] w-fit">
              <span>{addressParam}</span>
              <button
                onClick={copyAddress}
                className="text-zinc-400 hover:text-white transition-colors"
                title="Copy address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQR(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Share Passport</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-[#1f2336]">
          <div className="p-3.5 rounded-lg bg-[#0c0d14] border border-[#1b1e2e]">
            <p className="text-xs text-zinc-400 font-medium">Verified Skills</p>
            <p className="text-2xl font-bold text-white mt-0.5">{uniqueSkills.length}</p>
          </div>
          <div className="p-3.5 rounded-lg bg-[#0c0d14] border border-[#1b1e2e]">
            <p className="text-xs text-zinc-400 font-medium">Active Credentials</p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">{validCredentials.length}</p>
          </div>
          <div className="p-3.5 rounded-lg bg-[#0c0d14] border border-[#1b1e2e]">
            <p className="text-xs text-zinc-400 font-medium">Status</p>
            <p className="text-sm font-semibold text-zinc-200 mt-1">Verified On-Chain</p>
          </div>
        </div>
      </div>

      {/* Verified Skills Badges */}
      {uniqueSkills.length > 0 && (
        <div className="aesthetic-panel p-5 rounded-xl space-y-3">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
            Verified Skill Badges
          </h2>
          <div className="flex flex-wrap gap-2">
            {uniqueSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-[#181a28] text-zinc-200 border border-[#262a3f] flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Credentials Feed */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <Layers className="w-4.5 h-4.5 text-indigo-400" />
          Credentials & Proof of Work
        </h2>

        {isLoading ? (
          <div className="p-8 text-center aesthetic-panel rounded-xl text-zinc-400 text-xs">
            Loading credentials from chain...
          </div>
        ) : credentials.length === 0 ? (
          <div className="aesthetic-panel p-8 text-center rounded-xl text-zinc-400 text-xs">
            This student has not received any credentials on-chain yet.
          </div>
        ) : (
          <div className="space-y-3">
            {credentials.map((cred) => {
              const issueDate = new Date(Number(cred.issuedAt) * 1000).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
              const isMetadataUrl =
                cred.metadataHash.startsWith("http://") ||
                cred.metadataHash.startsWith("https://") ||
                cred.metadataHash.startsWith("ipfs://");

              return (
                <div
                  key={cred.credentialId}
                  className="aesthetic-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-semibold text-white">{cred.skill}</h3>
                      {cred.revoked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" />
                          REVOKED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          VALID
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-zinc-400">
                      <div>
                        Issuer: <span className="font-mono text-zinc-300">{cred.issuer.slice(0, 6)}...{cred.issuer.slice(-4)}</span>
                      </div>
                      <div>
                        Date: <span className="text-zinc-300">{issueDate}</span>
                      </div>
                      {cred.metadataHash && (
                        <div>
                          Evidence:{" "}
                          {isMetadataUrl ? (
                            <a
                              href={cred.metadataHash.replace("ipfs://", "https://ipfs.io/ipfs/")}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-400 hover:text-indigo-300 underline"
                            >
                              View Proof
                            </a>
                          ) : (
                            <span className="font-mono text-zinc-400">{cred.metadataHash}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <a
                      href={`/verify/${cred.credentialId}`}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#181a28] hover:bg-[#202336] text-zinc-200 border border-[#262a3f] transition-colors flex items-center gap-1.5"
                    >
                      <span>Verify</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        title="Student Skill Passport"
        url={passportUrl}
      />
    </div>
  );
}
