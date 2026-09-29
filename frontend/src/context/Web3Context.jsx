import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, MONAD_TESTNET_CONFIG } from "../config/contractConfig";

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [contractOwner, setContractOwner] = useState(null);

  // Read-only fallback provider (Monad Testnet RPC)
  const getReadOnlyProvider = useCallback(() => {
    return new ethers.JsonRpcProvider(MONAD_TESTNET_CONFIG.rpcUrl);
  }, []);

  // Get read-only contract
  const getReadOnlyContract = useCallback(() => {
    const prov = getReadOnlyProvider();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, prov);
  }, [getReadOnlyProvider]);

  // Switch or Add Monad Testnet to wallet
  const switchToMonad = async () => {
    if (!window.ethereum) throw new Error("No Web3 wallet found");
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MONAD_TESTNET_CONFIG.chainIdHex }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: MONAD_TESTNET_CONFIG.chainIdHex,
              chainName: MONAD_TESTNET_CONFIG.chainName,
              nativeCurrency: {
                name: "Monad",
                symbol: MONAD_TESTNET_CONFIG.symbol,
                decimals: MONAD_TESTNET_CONFIG.decimals,
              },
              rpcUrls: [MONAD_TESTNET_CONFIG.rpcUrl],
              blockExplorerUrls: [MONAD_TESTNET_CONFIG.explorerUrl],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  };

  // Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask or Rabby to connect.");
      return;
    }

    setIsConnecting(true);
    setError(null);
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const currentSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      setAccount(accounts[0]);
      setSigner(currentSigner);
      setChainId(Number(network.chainId));

      // Check authorization & owner
      const readContract = getReadOnlyContract();
      const [authStatus, ownerAddr] = await Promise.all([
        readContract.isAuthorizedIssuer(accounts[0]).catch(() => false),
        readContract.owner().catch(() => null),
      ]);
      setIsAuthorized(authStatus);
      setContractOwner(ownerAddr);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setChainId(null);
    setIsAuthorized(false);
  };

  // Refresh status
  const refreshAccountStatus = useCallback(async (currentAccount) => {
    if (!currentAccount) return;
    try {
      const readContract = getReadOnlyContract();
      const [authStatus, ownerAddr] = await Promise.all([
        readContract.isAuthorizedIssuer(currentAccount).catch(() => false),
        readContract.owner().catch(() => null),
      ]);
      setIsAuthorized(authStatus);
      setContractOwner(ownerAddr);
    } catch (err) {
      console.warn("Error refreshing status:", err);
    }
  }, [getReadOnlyContract]);

  // Listen to account & chain changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          refreshAccountStatus(accounts[0]);
        }
      });

      window.ethereum.on("chainChanged", (chainHex) => {
        setChainId(parseInt(chainHex, 16));
      });
    }

    // Attempt passive check if already authorized
    if (window.ethereum) {
      const checkCurrent = async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const acc = accounts[0].address;
            const currentSigner = await provider.getSigner();
            const network = await provider.getNetwork();
            setAccount(acc);
            setSigner(currentSigner);
            setChainId(Number(network.chainId));
            refreshAccountStatus(acc);
          }
        } catch (e) {
          // Passive check ignore
        }
      };
      checkCurrent();
    }
  }, [refreshAccountStatus]);

  // Contract Methods
  const getContractWithSigner = () => {
    if (!signer) throw new Error("Wallet not connected");
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  };

  const isOwner = Boolean(
    account && contractOwner && account.toLowerCase() === contractOwner.toLowerCase()
  );

  const value = {
    account,
    chainId,
    signer,
    isConnecting,
    error,
    isAuthorized,
    contractOwner,
    isOwner,
    connectWallet,
    disconnectWallet,
    switchToMonad,
    getReadOnlyContract,
    getContractWithSigner,
    refreshAccountStatus: () => refreshAccountStatus(account),
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
