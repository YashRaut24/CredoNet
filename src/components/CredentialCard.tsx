"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ExternalLink, QrCode, Calendar, User, ShieldCheck } from "lucide-react";
import { QRCodeModal } from "./QRCodeModal";
import { CredentialData } from "@/config/contracts";

interface CredentialCardProps {
  credential: CredentialData;
  isIssuerView?: boolean;
  onRevoke?: (credentialId: `0x${string}`) => void;
  isRevoking?: boolean;
}

export function CredentialCard({
  credential,
  isIssuerView = false,
  onRevoke,
  isRevoking = false,
}: CredentialCardProps) {
  const [showQR, setShowQR] = useState(false);

  const issueDate = new Date(Number(credential.issuedAt) * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${credential.credentialId}`
    : `/verify/${credential.credentialId}`;

  const isMetadataUrl = credential.metadataHash.startsWith("http://") || credential.metadataHash.startsWith("https://") || credential.metadataHash.startsWith("ipfs://");

  return (
    <>
      <div className="aesthetic-panel rounded-xl p-4 sm:p-5 transition-colors flex flex-col justify-between group">
        <div>
          {/* Header Status & Skill */}
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div>
              <span className="text-[11px] uppercase font-semibold text-zinc-400 tracking-wider">
                Skill Credential
              </span>
              <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                {credential.skill}
              </h3>
            </div>
            <div>
              {credential.revoked ? (
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
          </div>

          {/* Details */}
          <div className="space-y-1.5 py-2.5 border-y border-[#1f2336] text-xs text-zinc-300">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <User className="w-3 h-3 text-indigo-400" /> Student:
              </span>
              <span className="font-mono text-zinc-300">
                {credential.student.slice(0, 6)}...{credential.student.slice(-4)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-indigo-400" /> Issuer:
              </span>
              <span className="font-mono text-zinc-300">
                {credential.issuer.slice(0, 6)}...{credential.issuer.slice(-4)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-indigo-400" /> Issued:
              </span>
              <span className="text-zinc-300">{issueDate}</span>
            </div>

            {credential.metadataHash && (
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-zinc-400">Evidence:</span>
                {isMetadataUrl ? (
                  <a
                    href={credential.metadataHash.replace("ipfs://", "https://ipfs.io/ipfs/")}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline truncate max-w-[150px]"
                  >
                    <span>View Proof</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="font-mono text-zinc-400 truncate max-w-[150px]" title={credential.metadataHash}>
                    {credential.metadataHash}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 pt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link
              href={`/verify/${credential.credentialId}`}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#181a28] hover:bg-[#222538] text-zinc-200 border border-[#262a3f] transition-colors"
            >
              <span>Verify</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={() => setShowQR(true)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-[#181a28] border border-[#262a3f] transition-colors"
              title="Show QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
          </div>

          {isIssuerView && !credential.revoked && onRevoke && (
            <button
              onClick={() => onRevoke(credential.credentialId)}
              disabled={isRevoking}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors disabled:opacity-50"
            >
              {isRevoking ? "Revoking..." : "Revoke"}
            </button>
          )}
        </div>
      </div>

      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        title={`Credential: ${credential.skill}`}
        url={verifyUrl}
      />
    </>
  );
}
