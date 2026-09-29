"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, QrCode } from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export function QRCodeModal({ isOpen, onClose, title, url }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="aesthetic-panel w-full max-w-sm p-6 rounded-2xl border border-[#262a3f] bg-[#111320] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3 text-zinc-300">
          <QrCode className="w-4.5 h-4.5 text-indigo-400" />
          <h3 className="font-semibold text-white text-base">{title}</h3>
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-inner my-3">
          <QRCodeSVG value={url} size={200} level="H" includeMargin />
        </div>

        <p className="text-xs text-center text-zinc-400 mt-1 mb-3">
          Scan to verify credentials directly on-chain.
        </p>

        <div className="flex items-center gap-2 p-1.5 bg-[#0b0d17] rounded-lg border border-[#212538]">
          <input
            type="text"
            readOnly
            value={url}
            className="bg-transparent text-xs text-zinc-300 w-full px-2 py-1 outline-none font-mono truncate"
          />
          <button
            onClick={copyUrl}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors whitespace-nowrap"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
