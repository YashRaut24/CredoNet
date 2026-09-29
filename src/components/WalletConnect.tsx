"use client";

import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { monadTestnet } from "@/config/wagmi";
import { Wallet, LogOut, Check, Copy, AlertTriangle } from "lucide-react";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isWrongNetwork = isConnected && chainId !== monadTestnet.id && chainId !== 31337 && chainId !== 20143;

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2">
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            disabled={isPending}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-98 disabled:opacity-50"
          >
            <Wallet className="w-4 h-4" />
            <span>{isPending ? "Connecting..." : "Connect Wallet"}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isWrongNetwork && (
        <button
          onClick={() => switchChain?.({ chainId: monadTestnet.id })}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Switch Network</span>
        </button>
      )}

      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121420] rounded-lg text-sm border border-[#212538]">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="font-mono text-xs text-zinc-300">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={copyAddress}
          className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors"
          title="Copy address"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => disconnect()}
          className="p-1 text-zinc-400 hover:text-rose-400 transition-colors ml-0.5"
          title="Disconnect wallet"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
