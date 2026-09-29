# SkillPassport 🎓⚡

**SkillPassport** is a decentralized, tamper-proof skill credential verification protocol built for the **Monad Web3 SkillBuildZ Buildathon**.

> **"Own your skills. Verify your achievements."**

---

## 🌟 Key Features

1. **Decentralized Sovereign Ownership**: Credentials belong directly to the student's wallet address.
2. **Authorized Issuer Management**: Contract owner can authorize universities, bootcamps, and mentors.
3. **Instant Monad Verification**: Real-time verification with Monad high-throughput EVM.
4. **Permanent & Revocable Status**: Issuers can transparently revoke outdated or invalidated credentials.
5. **Interactive QR Codes**: Share student passports and individual credentials via mobile-ready QR codes.

---

## 🛠️ Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (Dark Monad aesthetic & glassmorphism)
- **Smart Contracts**: Solidity `^0.8.20`, Hardhat
- **Web3 Integration**: wagmi, viem, TanStack React Query
- **Network**: Monad Testnet (Chain ID: `10143`) / Monad Devnet (Chain ID: `20143`) / Hardhat Local

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Compile & Test Smart Contract
```bash
npm run compile
npm run test:contract
```

### 3. Deploy Contract

#### Local Node:
```bash
# Terminal 1:
npx hardhat node

# Terminal 2:
npm run deploy:local
```

#### Monad Testnet:
Add your deployer `PRIVATE_KEY` in `.env.local` or `.env`:
```env
PRIVATE_KEY=0x...
MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz
```

Deploy:
```bash
npm run deploy:monadTestnet
```

### 4. Start Next.js Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 🧭 Application Routes

- `/` - **Landing Page**: Value proposition, wallet connection, quick student passport & verification search.
- `/dashboard` - **Student Dashboard**: View earned credentials, verified skills count, copy student address.
- `/issuer` - **Issuer Portal**: Check authorization, authorize new issuers (owner), issue credentials, view and revoke credentials.
- `/passport/[address]` - **Public Passport Page**: Verified skill badges, credentials feed, QR code sharing.
- `/verify/[credentialId]` - **Public Verification Page**: Direct mathematical validity check on Monad with issuer origin and timestamp.
- `/verify/search` - **Lookup Search**: Query any credential ID on Monad.
