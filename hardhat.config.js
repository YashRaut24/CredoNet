require("@nomicfoundation/hardhat-toolbox");
const path = require("path");
require("dotenv").config();
require("dotenv").config({ path: path.resolve(__dirname, ".env.local") });
require("dotenv").config({ path: path.resolve(__dirname, "src/.env.local") });

let PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
if (PRIVATE_KEY && !PRIVATE_KEY.startsWith("0x")) {
  PRIVATE_KEY = "0x" + PRIVATE_KEY;
}

const MONAD_TESTNET_RPC = process.env.MONAD_TESTNET_RPC || "https://testnet-rpc.monad.xyz";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    monadTestnet: {
      url: MONAD_TESTNET_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 10143,
    },
    monadDevnet: {
      url: process.env.MONAD_DEVNET_RPC || "https://rpc-devnet.monadinfra.com/rpc/3be81fedede705cf0010dc233839177b",
      accounts: [PRIVATE_KEY],
      chainId: 20143,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
