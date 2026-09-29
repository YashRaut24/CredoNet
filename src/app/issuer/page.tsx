"use client";

import React, { useState } from "react";
import { 
  useAccount, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain,
  useWalletClient
} from "wagmi";
import { isAddress } from "viem";
import { 
  ShieldCheck, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  XCircle, 
  Layers, 
  KeyRound
} from "lucide-react";
import { SKILL_PASSPORT_ADDRESS, SKILL_PASSPORT_ABI, CredentialData } from "@/config/contracts";
import { monadTestnet } from "@/config/wagmi";
import { CredentialCard } from "@/components/CredentialCard";
import { WalletConnect } from "@/components/WalletConnect";

export default function IssuerPortalPage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { switchChain, switchChainAsync } = useSwitchChain();
  const isWrongChain = isConnected && chainId !== monadTestnet.id;

  // Form states
  const [studentInput, setStudentInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [metadataInput, setMetadataInput] = useState("");
  const [authorizeInput, setAuthorizeInput] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Write contract hook
  const { data: txHash, writeContractAsync, isPending: isWritePending, error: writeError } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isTxWaiting, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Check if caller is authorized issuer directly from Monad Testnet
  const { data: isAuthorized, refetch: refetchAuth } = useReadContract({
    chainId: monadTestnet.id,
    address: SKILL_PASSPORT_ADDRESS,
    abi: SKILL_PASSPORT_ABI,
    functionName: "isAuthorizedIssuer",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Check contract owner directly from Monad Testnet
  const { data: ownerAddress } = useReadContract({
    chainId: monadTestnet.id,
    address: SKILL_PASSPORT_ADDRESS,
    abi: SKILL_PASSPORT_ABI,
    functionName: "owner",
  });

  // Get credentials issued by this issuer directly from Monad Testnet
  const { 
    data: rawIssuedCredentials, 
    isLoading: isIssuedLoading, 
    refetch: refetchIssued,
    isRefetching: isIssuedRefetching 
  } = useReadContract({
    chainId: monadTestnet.id,
    address: SKILL_PASSPORT_ADDRESS,
    abi: SKILL_PASSPORT_ABI,
    functionName: "getIssuerCredentials",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const issuedCredentials: CredentialData[] = (rawIssuedCredentials as unknown as CredentialData[]) || [];
  const isOwner = address && ownerAddress && address.toLowerCase() === (ownerAddress as string).toLowerCase();

  // Helper to switch wallet to Monad Testnet directly via EIP-3326
  const handleSwitchToMonad = async () => {
    setFormError("");
    const monadHex = "0x279f"; // 10143
    try {
      if (typeof window !== "undefined" && (window as unknown as { ethereum?: { request: (args: unknown) => Promise<unknown> } }).ethereum) {
        const eth = (window as unknown as { ethereum: { request: (args: unknown) => Promise<unknown> } }).ethereum;
        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: monadHex }],
          });
        } catch (switchErr: unknown) {
          const sObj = switchErr as { code?: number };
          if (sObj?.code === 4902) {
            await eth.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: monadHex,
                  chainName: "Monad Testnet",
                  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
                  rpcUrls: ["https://testnet-rpc.monad.xyz"],
                  blockExplorerUrls: ["https://testnet.monadexplorer.com"],
                },
              ],
            });
          } else {
            throw switchErr;
          }
        }
      } else {
        await switchChainAsync({ chainId: monadTestnet.id });
      }
    } catch (err: unknown) {
      console.error("Switch chain error:", err);
      const eObj = err as { shortMessage?: string; message?: string };
      setFormError("Failed to switch network: " + (eObj?.shortMessage || eObj?.message || "Please switch to Monad Testnet in your wallet manually."));
    }
  };

  // Handle issuing credential
  const handleIssueCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!isConnected || !address) {
      setFormError("Please connect your wallet first.");
      return;
    }

    if (!studentInput.trim()) {
      setFormError("Student wallet address is required.");
      return;
    }

    if (!isAddress(studentInput.trim())) {
      setFormError(`"${studentInput.trim()}" is not a valid EVM address format.`);
      return;
    }

    if (!skillInput.trim()) {
      setFormError("Skill title is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Ensure wallet is on Monad Testnet (0x279F / 10143)
      if (typeof window !== "undefined" && (window as unknown as { ethereum?: { request: (args: unknown) => Promise<unknown> } }).ethereum) {
        const eth = (window as unknown as { ethereum: { request: (args: unknown) => Promise<unknown> } }).ethereum;
        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x279F" }],
          });
        } catch (switchErr: unknown) {
          const sObj = switchErr as { code?: number };
          if (sObj?.code === 4902) {
            await eth.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x279F",
                  chainName: "Monad Testnet",
                  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
                  rpcUrls: ["https://testnet-rpc.monad.xyz"],
                  blockExplorerUrls: ["https://testnet.monadexplorer.com"],
                },
              ],
            });
          } else {
            console.warn("Wallet switch prompt:", switchErr);
          }
        }
      } else if (walletClient) {
        await walletClient.switchChain({ id: 10143 });
      }

      // 2. Execute credential issuance on Monad
      const hash = await writeContractAsync({
        chainId: monadTestnet.id,
        address: SKILL_PASSPORT_ADDRESS,
        abi: SKILL_PASSPORT_ABI,
        functionName: "issueCredential",
        args: [studentInput.trim() as `0x${string}`, skillInput.trim(), metadataInput.trim()],
      });
      console.log("Transaction sent successfully! Tx Hash:", hash);
    } catch (err: unknown) {
      console.error("Issue credential error:", err);
      const eObj = err as { shortMessage?: string; details?: string; message?: string };
      const errorMsg = eObj?.shortMessage || eObj?.details || eObj?.message || "Transaction failed";
      setFormError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle revoking credential
  const handleRevokeCredential = async (credentialId: `0x${string}`) => {
    if (!confirm("Are you sure you want to revoke this credential? This action is permanent on-chain.")) {
      return;
    }

    try {
      await writeContractAsync({
        chainId: monadTestnet.id,
        address: SKILL_PASSPORT_ADDRESS,
        abi: SKILL_PASSPORT_ABI,
        functionName: "revokeCredential",
        args: [credentialId],
      });
    } catch (err: unknown) {
      const eObj = err as { shortMessage?: string; message?: string };
      alert(eObj?.shortMessage || eObj?.message || "Failed to revoke credential");
    }
  };

  // Handle authorizing a new issuer (owner only)
  const handleAuthorizeIssuer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddress(authorizeInput.trim())) {
      alert("Invalid address format.");
      return;
    }

    try {
      await writeContractAsync({
        chainId: monadTestnet.id,
        address: SKILL_PASSPORT_ADDRESS,
        abi: SKILL_PASSPORT_ABI,
        functionName: "authorizeIssuer",
        args: [authorizeInput.trim() as `0x${string}`],
      });
    } catch (err: unknown) {
      const eObj = err as { shortMessage?: string; message?: string };
      alert(eObj?.shortMessage || eObj?.message || "Failed to authorize issuer");
    }
  };

  // Auto-refresh when tx succeeds
  React.useEffect(() => {
    if (isTxSuccess) {
      refetchIssued();
      refetchAuth();
      setStudentInput("");
      setSkillInput("");
      setMetadataInput("");
      setAuthorizeInput("");
      setFormError("");
    }
  }, [isTxSuccess, refetchIssued, refetchAuth]);

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] text-center space-y-5 max-w-sm mx-auto">
        <div className="p-3.5 rounded-xl bg-[#161826] text-zinc-300 border border-[#262a3f]">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold text-zinc-100">Issuer Portal</h2>
          <p className="text-xs text-zinc-400">
            Connect an authorized issuer or admin wallet to issue verifiable credentials.
          </p>
        </div>
        <WalletConnect />
      </div>
    );
  }

  const activeError = formError || (writeError as { shortMessage?: string; message?: string })?.shortMessage || writeError?.message;

  return (
    <div className="space-y-8">
      {/* Header & Status */}
      <div className="aesthetic-panel p-6 sm:p-8 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-[#181a28] text-zinc-300 border border-[#262a3f]">
                Issuer Hub
              </span>
              {isAuthorized ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Authorized
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Not Authorized
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Issue & Manage Credentials
            </h1>
            <p className="text-xs text-zinc-400 font-mono">
              Issuer Wallet: {address}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                refetchAuth();
                refetchIssued();
              }}
              disabled={isIssuedRefetching}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#161826] border border-[#262a3f] text-xs font-medium text-zinc-300 hover:text-white hover:bg-[#1f2235] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isIssuedRefetching ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {!isAuthorized && (
          <div className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Authorization Required</p>
              <p className="text-amber-300/80 mt-0.5">
                Your wallet address is not registered as an authorized issuer in the contract. The contract deployer ({ownerAddress ? `${(ownerAddress as string).slice(0, 8)}...` : "owner"}) can grant authorization.
              </p>
            </div>
          </div>
        )}

        {isWrongChain && (
          <div className="mt-5 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Your browser wallet is on another network. Switch to Monad Testnet to issue credentials.</span>
            </div>
            <button
              onClick={() => switchChain?.({ chainId: monadTestnet.id })}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors whitespace-nowrap"
            >
              Switch to Monad Testnet
            </button>
          </div>
        )}
      </div>

      {/* Owner Admin Panel */}
      {isOwner && (
        <div className="aesthetic-panel p-5 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-zinc-200">
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-sm">Admin: Authorize New Issuer</h3>
          </div>
          <p className="text-xs text-zinc-400">
            Contract Owner Action: Authorize universities, organizations, or mentors to issue credentials.
          </p>
          <form onSubmit={handleAuthorizeIssuer} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              placeholder="Issuer Wallet Address (0x...)"
              value={authorizeInput}
              onChange={(e) => setAuthorizeInput(e.target.value)}
              className="aesthetic-input flex-1 px-3.5 py-2 rounded-lg text-xs font-mono text-zinc-200 placeholder:font-sans placeholder:text-zinc-500"
            />
            <button
              type="submit"
              disabled={isWritePending || isTxWaiting || isSubmitting}
              className="px-4 py-2 rounded-lg bg-[#1f2338] hover:bg-[#282d47] border border-[#2f3552] text-zinc-200 text-xs font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              Authorize Issuer
            </button>
          </form>
        </div>
      )}

      {/* Issue Form */}
      <div className="aesthetic-panel p-6 sm:p-8 rounded-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#181a28] text-indigo-400 border border-[#262a3f]">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Issue New Credential</h2>
            <p className="text-xs text-zinc-400">Record a verifiable skill credential on-chain</p>
          </div>
        </div>

        <form onSubmit={handleIssueCredential} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">
              Student Wallet Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={studentInput}
              onChange={(e) => {
                setStudentInput(e.target.value);
                if (formError) setFormError("");
              }}
              disabled={isWritePending || isTxWaiting || isSubmitting}
              className="aesthetic-input w-full px-3.5 py-2.5 rounded-lg text-xs font-mono text-zinc-200 placeholder:font-sans placeholder:text-zinc-500 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">
              Skill or Achievement Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Smart Contract Security, Solidity Architecture, Zero Knowledge"
              value={skillInput}
              onChange={(e) => {
                setSkillInput(e.target.value);
                if (formError) setFormError("");
              }}
              disabled={isWritePending || isTxWaiting || isSubmitting}
              className="aesthetic-input w-full px-3.5 py-2.5 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">
              Evidence / Proof / Metadata Hash <span className="text-zinc-500">(Optional URL, GitHub PR, or Hash)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. https://github.com/org/repo/pull/42 or ipfs://Qm..."
              value={metadataInput}
              onChange={(e) => setMetadataInput(e.target.value)}
              disabled={isWritePending || isTxWaiting || isSubmitting}
              className="aesthetic-input w-full px-3.5 py-2.5 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 disabled:opacity-50"
            />
          </div>

          {/* Visible Error Display Box */}
          {activeError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <XCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-rose-200">Unable to Issue Credential</p>
                <p className="break-all text-rose-300/90 leading-relaxed">{activeError}</p>
              </div>
            </div>
          )}

          {isTxSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Credential successfully recorded on Monad!</span>
              </span>
              {txHash && (
                <span className="font-mono text-[11px] text-emerald-400">
                  tx: {txHash.slice(0, 10)}...
                </span>
              )}
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={isWritePending || isTxWaiting || isSubmitting}
              className="px-6 py-2.5 rounded-lg font-medium text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {(isWritePending || isTxWaiting || isSubmitting) && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {isSubmitting || isWritePending
                  ? "Confirm in Wallet..."
                  : isTxWaiting
                  ? "Confirming on Monad..."
                  : isWrongChain
                  ? "Switch to Monad & Issue"
                  : "Issue Credential"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Credentials Issued by this issuer */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-indigo-400" />
            Credentials Issued by You ({issuedCredentials.length})
          </h2>
          <p className="text-xs text-zinc-400">Manage, inspect, and revoke credentials issued by this wallet</p>
        </div>

        {isIssuedLoading ? (
          <div className="p-8 text-center aesthetic-panel rounded-xl">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
            <p className="text-xs text-zinc-400">Loading credentials...</p>
          </div>
        ) : issuedCredentials.length === 0 ? (
          <div className="aesthetic-panel p-8 text-center rounded-xl text-zinc-400 text-xs">
            No credentials issued yet from this account. Fill the form above to issue your first student credential.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issuedCredentials.map((cred) => (
              <CredentialCard
                key={cred.credentialId}
                credential={cred}
                isIssuerView={true}
                onRevoke={handleRevokeCredential}
                isRevoking={isWritePending || isTxWaiting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
