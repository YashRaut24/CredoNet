# CredoNet 🛡️⚡

**CredoNet** is a decentralized, tamper-proof competency protocol and sovereign credential ledger built on the **Ethereum Virtual Machine (EVM) Blockchain**.

> **"CredoNet introduces the CredoVault — an unalterable, self-sovereign cryptographic vault of human competency, degrees, and engineering skills anchored on the blockchain."**

---

## 📌 Project Overview (B.E. Blockchain Engineering)

Traditional academic and professional skill credentials suffer from rampant resume fraud, centralized database obsolescence (link rot), and slow, expensive third-party verification processes ($20–$80 per manual background check taking 3–14 days).

**CredoNet** solves this by establishing the **CredoVault**: a decentralized, self-sovereign credential vault powered by **Solidity smart contracts** on EVM blockchain infrastructure:
* **The Sovereign CredoVault**: An unalterable on-chain competency record bound to the student's self-custody wallet address.
* **Cryptographic Signatures & Hashing**: Each credential generates an on-chain `keccak256` state hash derived from the candidate's address, skill title, issuer signature, unalterable block timestamp, and IPFS metadata.
* **Role-Based Access Control (RBAC)**: Only authorized universities, colleges, and certifying authorities can issue credentials into a student's CredoVault, with transparent on-chain revocation capabilities.
* **Direct Verification**: Anyone (recruiters, employers, institutions) can mathematically audit the validity of a credential in sub-second execution without gas costs or permission barriers.

---

## 🌟 Key Features

1. **The Sovereign CredoVault**: Unalterable, self-custodied credential vault owned 100% by the candidate's private key.
2. **Cryptographic Proof**: Tamper-proof badges signed with ECDSA signatures and `keccak256` hashing.
3. **Authorized Certifying Authorities**: Smart contract owner delegates issuance authority to accredited institutions.
4. **Sub-Second EVM Consensus Reads**: Instant zero-cost view queries against EVM state with cryptographic proof of authenticity.
5. **On-Chain Revocation Trail**: Transparent invalidation mechanisms if credentials expire or are retracted.
6. **Mobile Verification QR**: Embeddable dynamic QR verification codes for resumes, GitHub portfolios, and LinkedIn.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Smart Contracts** | **Solidity `^0.8.20`**, Hardhat | Core decentralized credential ledger, RBAC, keccak256 hashing |
| **Blockchain Network** | **EVM Network** (Monad Testnet / Hardhat Local) | High-throughput, low-latency consensus and unalterable state |
| **Backend API** | **Node.js, Express.js (JavaScript)** | RESTful API for on-chain queries, stats, and metadata simulation |
| **Frontend Web App** | **React.js (JavaScript, Vite)** | 100% full-screen responsive user interface |
| **Styling** | **Component-Scoped Vanilla CSS (`.css`)** | Enterprise dark espresso & warm amber palette (no neon glows) |
| **Web3 Client** | **Ethers.js v6** | Browser wallet handshake, contract calls, and RPC providers |

---

## 📁 Repository Structure

```text
SkillPassport/
├── frontend/                          # React.js Frontend (100% screen width)
│   ├── src/
│   │   ├── components/                # UI Components with dedicated .css files
│   │   │   ├── Navbar.jsx             & Navbar.css
│   │   │   ├── CredoVaultCard.jsx     & CredoVaultCard.css (Interactive Vault Terminal)
│   │   │   ├── CredentialCard.jsx     & CredentialCard.css
│   │   │   ├── QRCodeModal.jsx        & QRCodeModal.css
│   │   │   ├── InitialLoader.jsx      & InitialLoader.css (Security handshake)
│   │   │   └── Footer.jsx             & Footer.css
│   │   ├── pages/                     # Product Views with dedicated .css files
│   │   │   ├── LandingPage.jsx        & LandingPage.css (Explore)
│   │   │   ├── DashboardPage.jsx      & DashboardPage.css (My Vault)
│   │   │   ├── IssuerPage.jsx         & IssuerPage.css (Issuer Portal)
│   │   │   ├── PassportPage.jsx       & PassportPage.css (Public CredoVault)
│   │   │   ├── VerifyPage.jsx         & VerifyPage.css (Credential Verification)
│   │   │   └── VerifySearchPage.jsx   & VerifySearchPage.css (Direct Verification)
│   │   ├── context/Web3Context.jsx    # Ethers.js v6 Web3 provider & network switch
│   │   ├── config/contractConfig.js   # Contract address & ABI configuration
│   │   ├── App.jsx & App.css
│   │   ├── main.jsx
│   │   └── index.css                  # Solid color tokens & typography
│   ├── index.html
│   └── vite.config.js
│
├── backend/                           # Node.js + Express API
│   ├── server.js                      # Express API routes (/api/credentials, /api/stats, /api/student)
│   ├── contractConfig.js              # EVM JSON-RPC provider connection
│   ├── deployedContracts.json         # Deployed contract reference
│   └── package.json
│
├── contracts/                         # Solidity Smart Contracts
│   └── SkillPassport.sol              # Core CredoNet protocol contract
├── scripts/                           # Hardhat deployment scripts
│   └── deploy.js                      # Automated deployment to local or testnet
├── test/                              # Automated Smart Contract Tests
│   └── SkillPassport.test.js          # Chai test suite (9 passing tests)
├── hardhat.config.js                  # Hardhat EVM network configuration
└── package.json                       # Master workspace scripts
```

---

## 🚀 How to Run the Project

### 1. Start the Node.js Express Backend
In Terminal 1:
```bash
npm run dev:backend
```
Backend runs at `http://localhost:5000` (provides `/api/health`, `/api/stats`, `/api/credentials/:id`, etc.).

### 2. Start the React Frontend Application
In Terminal 2:
```bash
npm run dev:frontend
```
Frontend runs at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied).

---

## 🧪 Smart Contract Compilation & Automated Tests

Compile the Solidity smart contracts:
```bash
npm run compile
```

Run the unit test suite verifying deployment, RBAC, issuing, and revoking:
```bash
npm run test:contract
```

---

## 🧭 Application Modules & Routes

* `/` — **Explore**: Introducing the CredoVault, 4 system stages, and live sample vaults.
* `/dashboard` — **My Vault**: Student's self-sovereign credential vault, wallet address, and QR key sharing.
* `/issuer` — **Issuer Portal**: Authority portal for accredited institutions to issue and revoke credentials.
* `/vault/:address` — **Public CredoVault**: Publicly auditable portfolio for any candidate address.
* `/verify/:credentialId` — **Credential Audit**: Real-time cryptographic consensus audit of a specific credential hash.
* `/verify/search` — **Verify**: Direct on-chain hash lookup portal.
