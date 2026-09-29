# CredoNet — Project Technical Documentation
**A Decentralized Sovereign Competency Ledger & Verifiable Credential Protocol on Blockchain**  
*B.E. Computer Engineering (Sem 7) — Blockchain Mini Project*

---

## 📑 Table of Contents
1. [Project Overview & Problem Statement](#1-project-overview--problem-statement)
2. [Core Conceptual Architecture](#2-core-conceptual-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Project Directory & File Structure](#4-project-directory--file-structure)
5. [Smart Contract Implementation (Solidity)](#5-smart-contract-implementation-solidity)
6. [Backend API Implementation (Node.js + Express)](#6-backend-api-implementation-nodejs--express)
7. [Frontend Application Implementation (React.js + Ethers.js)](#7-frontend-application-implementation-reactjs--ethersjs)
8. [Step-by-Step Guide: How to Run & Test the Project](#8-step-by-step-guide-how-to-run--test-the-project)
9. [Viva & Project Review Q&A Cheatsheet](#9-viva--project-review-qa-cheatsheet)

---

## 1. Project Overview & Problem Statement

### The Problem
In the modern hiring and academic ecosystem:
* **Rampant Resume & Degree Fraud**: Over 54% of candidates embellish technical competencies or forge certificate PDFs.
* **Centralized Database Vulnerability (Link Rot)**: When a bootcamp, university portal, or verification platform goes offline, graduates permanently lose verifiable proof of their achievements.
* **Slow & Costly Audits**: Employers and background check agencies spend $20 to $80 per candidate and wait 3 to 14 business days waiting for manual registrar verification.

### The CredoNet Solution
**CredoNet** replaces static PDFs and centralized certificates with **tamper-proof, cryptographically signed on-chain credentials** anchored inside a student's personal **CredoVault**:
* **Cryptographic Immutability**: Every credential generates a unique `keccak256` hash derived from the student's address, skill title, issuer signature, and block timestamp.
* **Self-Sovereignty**: Students own their credentials directly in their self-custody Web3 wallet. No platform can delete or alter them.
* **Role-Based Access Control (RBAC)**: Only authorized academic institutions and certifying authorities can issue valid credentials.
* **Instant, Zero-Cost Verification**: Anyone (recruiters, hiring teams, universities) can mathematically audit the validity of a credential in sub-second execution without gas costs or permission barriers.

---

## 2. Core Conceptual Architecture

```
+-----------------------------------------------------------------------------------+
|                                 USER / CLIENT                                     |
|           (Student Wallet / University Registrar / Recruiter Scanner)             |
+-----------------------------------------+-----------------------------------------+
                                          |
                 +------------------------+------------------------+
                 |                                                 |
                 v                                                 v
+----------------------------------+             +----------------------------------+
|      REACT.JS FRONTEND (Vite)    |             |      EXPRESS.JS REST API         |
|  - Ethers.js v6 Web3 Provider    |             |  - Port 5000                     |
|  - Scoped Vanilla CSS Components |             |  - Ethers.js Read-Only Provider  |
|  - Network Switch (Chain 10143)  |             |  - Metadata & Stats Aggregation  |
+-----------------+----------------+             +-----------------+----------------+
                  |                                                |
                  +-----------------------+------------------------+
                                          |
                                          v JSON-RPC
+-----------------------------------------------------------------------------------+
|                        EVM BLOCKCHAIN CONSENSUS LAYER                             |
|  - Network: Monad Testnet (Chain ID: 10143) / Local Hardhat Node                  |
|  - Deployed Smart Contract: 0xc6BfB22D6B46346B113333b5513BDcD361488e6f          |
|  - Solidity ^0.8.20 (RBAC, Keccak-256 Hashes, Revocation Mapping, Events)       |
+-----------------------------------------------------------------------------------+
```

### Core Terminology
* **CredoNet**: The name of the entire platform and protocol.
* **CredoVault**: The sovereign, on-chain credential container bound to a student's wallet address (`VAULT ID: 0x...`).
* **Verified Credential**: An immutable on-chain record containing skill name, issuing authority, timestamp, metadata hash, and revocation status.
* **Issuer Portal**: The authority interface where verified universities and academies issue and revoke credentials.
* **Verify Engine**: The public audit interface where anyone can query a credential hash or scan a QR code.

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose & Rationale |
| :--- | :--- | :--- | :--- |
| **Smart Contracts** | **Solidity** | `^0.8.20` | Core decentralized ledger logic, role-based access control, hashing |
| **Development Environment** | **Hardhat** | `^2.22.x` | Smart contract compilation, automated unit testing, deployment |
| **Blockchain Network** | **EVM (Monad Testnet)** | Chain ID `10143` | High-throughput, sub-second transaction finality, low gas cost |
| **Backend Runtime** | **Node.js** | `v18+ / v22` | Server runtime environment |
| **Backend Framework** | **Express.js** | `^4.21.x` | RESTful API endpoints for credential queries, stats, and metadata |
| **Frontend Framework** | **React.js (JavaScript)** | `^18.3.x` | Component-based, responsive single-page application |
| **Frontend Build Tool** | **Vite** | `^5.4.x` | Ultra-fast bundling, HMR, and production optimization |
| **Styling** | **Component-Scoped CSS** | Pure CSS3 | Clean, modular `.css` files per component (no Tailwind bloat) |
| **Web3 Client Library** | **Ethers.js** | `v6.13.x` | Wallet handshake, contract calls, ABI encoding, RPC providers |
| **Icons & QR** | **Lucide React & QRCode.react** | Latest | Minimalist vector iconography and dynamic verification QR codes |

---

## 4. Project Directory & File Structure

```text
SkillPassport/
├── contracts/
│   └── SkillPassport.sol          # Core Solidity smart contract
├── scripts/
│   └── deploy.js                  # Automated contract deployment script
├── test/
│   └── SkillPassport.test.js      # Comprehensive Chai test suite (9 tests)
├── hardhat.config.js              # Hardhat configuration (Solidity 0.8.20 & Monad RPC)
│
├── backend/                       # Node.js + Express API
│   ├── server.js                  # Express endpoints (/api/health, /api/credentials, etc.)
│   ├── contractConfig.js          # Contract address & Ethers.js JSON-RPC provider
│   ├── deployedContracts.json     # Deployed address & deployed ABI reference
│   └── package.json               # Backend dependencies
│
├── frontend/                      # React.js Application
│   ├── src/
│   │   ├── components/            # UI Components (with dedicated .css files)
│   │   │   ├── Navbar.jsx         & Navbar.css          # Navigation & network badge
│   │   │   ├── CredoVaultCard.jsx & CredoVaultCard.css  # Interactive hero terminal card
│   │   │   ├── CredentialCard.jsx & CredentialCard.css  # Single credential display item
│   │   │   ├── QRCodeModal.jsx    & QRCodeModal.css     # Shareable verification modal
│   │   │   ├── InitialLoader.jsx  & InitialLoader.css   # Startup security handshake animation
│   │   │   └── Footer.jsx         & Footer.css          # Protocol footer
│   │   │
│   │   ├── pages/                 # Full application pages (with dedicated .css files)
│   │   │   ├── LandingPage.jsx      & LandingPage.css      # Explore: Hero, 4 stages, demo vaults
│   │   │   ├── DashboardPage.jsx    & DashboardPage.css    # My Vault: Student self-custody view
│   │   │   ├── IssuerPage.jsx       & IssuerPage.css       # Issuer Portal: Authority minting
│   │   │   ├── PassportPage.jsx     & PassportPage.css     # Public CredoVault (/vault/:address)
│   │   │   ├── VerifyPage.jsx       & VerifyPage.css       # Credential consensus audit (/verify/:id)
│   │   │   └── VerifySearchPage.jsx & VerifySearchPage.css # Direct hash lookup portal
│   │   │
│   │   ├── context/
│   │   │   └── Web3Context.jsx    # React Context for MetaMask connection & contract signers
│   │   ├── config/
│   │   │   └── contractConfig.js  # Contract address & network chain configuration
│   │   ├── App.jsx & App.css      # Main application router
│   │   ├── index.css              # Global tokens (espresso/amber palette, 100% width layout)
│   │   └── main.jsx               # React DOM entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json               # Frontend dependencies
│
├── package.json                   # Root workspace scripts (dev:frontend, dev:backend, test:contract)
└── README.md                      # Quickstart documentation
```

---

## 5. Smart Contract Implementation (Solidity)

The smart contract is written in **Solidity `^0.8.20`** in [contracts/SkillPassport.sol](file:///d:/B.E%20Engineering%20Content/Sem%207/BC/Mini%20Project/SkillPassport/contracts/SkillPassport.sol).

### 1. Data Structure (`Credential`)
```solidity
struct Credential {
    bytes32 credentialId;   // Unique Keccak-256 cryptographic hash
    address student;        // Candidate's self-custody wallet address
    string skill;           // Skill title or degree (e.g., "B.E. Computer Engineering")
    address issuer;         // Verified authority who minted the credential
    string metadataHash;    // IPFS CID or curriculum hash string
    uint256 issuedAt;       // Unalterable block timestamp
    bool revoked;           // Revocation flag (true = invalidated)
}
```

### 2. Role-Based Access Control (RBAC)
```solidity
address public owner;
mapping(address => bool) public authorizedIssuers;

modifier onlyOwner() {
    require(msg.sender == owner, "Caller is not the owner");
    _;
}

modifier onlyAuthorizedIssuer() {
    require(authorizedIssuers[msg.sender] || msg.sender == owner, "Caller is not authorized issuer");
    _;
}
```
* **Contract Deployer (Owner)**: Can authorize or revoke institutional accounts (`authorizeIssuer(address)`, `revokeIssuer(address)`).
* **Authorized Issuers**: Certified institutions who have permission to mint and revoke credentials.

### 3. Keccak-256 Cryptographic Hash Generation
When an institution calls `issueCredential()`, the contract computes an immutable 32-byte hash:
```solidity
bytes32 credentialId = keccak256(
    abi.encodePacked(
        student,
        skill,
        msg.sender,
        block.timestamp,
        metadataHash
    )
);
```
This guarantees that **no two credentials can ever share the same ID**, and the credential is cryptographically bound to the issuer's key and block timestamp.

### 4. Transparent On-Chain Revocation
If a degree is retracted or an accreditation expires, the issuing authority or contract owner can call:
```solidity
function revokeCredential(bytes32 credentialId) external {
    Credential storage cred = credentials[credentialId];
    require(msg.sender == cred.issuer || msg.sender == owner, "Unauthorized");
    cred.revoked = true;
    emit CredentialRevoked(credentialId, msg.sender, block.timestamp);
}
```
The transaction is permanently recorded on the blockchain, preventing former students from presenting invalidated qualifications.

---

## 6. Backend API Implementation (Node.js + Express)

Located in [backend/server.js](file:///d:/B.E%20Engineering%20Content/Sem%207/BC/Mini%20Project/SkillPassport/backend/server.js), running on port `5000`.

### Key Endpoints:
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Verifies node health, current block number, and contract connectivity |
| `GET` | `/api/stats` | Returns total credentials minted, active credentials, and issuer count |
| `GET` | `/api/credentials/:credentialId` | Directly reads contract storage for a given 32-byte credential hash |
| `GET` | `/api/student/:address` | Returns all credentials bound to a specific student wallet address |
| `GET` | `/api/issuer/:address` | Returns all credentials issued by an institution |
| `POST` | `/api/metadata` | Simulates decentralized metadata upload (e.g. course syllabus, grade sheet) |

### Blockchain Provider Initialization:
```javascript
const { ethers } = require("ethers");
const { CONTRACT_ADDRESS, RPC_URL, CONTRACT_ABI } = require("./contractConfig");

const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
```
The backend provides instant responses to clients by querying the EVM consensus network using read-only JSON-RPC calls.

---

## 7. Frontend Application Implementation (React.js + Ethers.js)

The frontend is a single-page React application powered by Vite, located in [frontend/](file:///d:/B.E%20Engineering%20Content/Sem%207/BC/Mini%20Project/SkillPassport/frontend/).

### 1. Web3 Context Provider (`Web3Context.jsx`)
Manages browser wallet state:
* Detects MetaMask or any EIP-1193 compatible wallet (`window.ethereum`).
* Automatically checks if the user is connected to **Monad Testnet (Chain ID: 10143)**.
* Offers one-click automatic network switching (`wallet_switchEthereumChain` / `wallet_addEthereumChain`).
* Provides a read-only fallback provider (`new ethers.JsonRpcProvider(...)`) so non-wallet visitors (like recruiters) can still audit credentials without needing a wallet installed!

### 2. Styling System (Vanilla Component-Scoped CSS)
* **Zero Tailwind / Zero external CSS framework**: Every component and page has its own dedicated `.css` file (e.g., `Navbar.css`, `LandingPage.css`, `DashboardPage.css`).
* **Design Palette (Dark Espresso & Amber)**:
  * Backgrounds: `#0d0b09` (deep obsidian), `#14110e` (dark espresso surface), `#1c1813` (elevated cards).
  * Accents: `#f26c36` (primary warm amber), `#e36128` (hover amber), `#d95822` (dark amber).
  * Borders: `#332b23` (crisp subtle borders), `#473d32` (active borders).
  * Text: `#f5efe6` (bright high-contrast text), `#d4cbbe` (secondary text), `#9e9384` (muted metadata).
  * Flat, solid borders with zero blurry neon glows.
* **100% Full-Screen Layout**: The `.container` class spans the full window screen width with fluid responsive padding.

### 3. Application Pages & Workflows:
1. **Explore (`/`)**:
   - Hero section featuring the interactive **CredoVault Card** (`CredoVaultCard.jsx`) with live tab switching.
   - 4-stage operational lifecycle (Vault Initialization, Authorized Issuance, Cryptographic Anchoring, Instant Verification).
   - Clickable demonstration sample vaults (Rahul S., Elena K., Marcus V.).
   - Interactive search bar to audit any wallet or credential hash.
2. **My Vault (`/dashboard`)**:
   - The student's private control center. Displays total credentials, active credentials, unique competencies, and unalterable vault ID.
   - Allows students to generate a dynamic **Vault QR Code** or copy their public shareable link.
3. **Issuer Portal (`/issuer`)**:
   - Restricted interface for universities and certifying bodies.
   - Verifies whether the connected wallet is authorized on the smart contract (`isAuthorizedIssuer(address)`).
   - Form to mint new credentials (Student Address, Skill Title, Curriculum Proof).
   - Table of issued credentials with one-click **Revocation** button.
4. **Public CredoVault (`/vault/:address`)**:
   - Publicly accessible page for employers and recruiters.
   - Displays candidate's verified skills, issuing authority keys, timestamps, and on-chain validity badges.
5. **Direct Verification (`/verify/:credentialId`)**:
   - Reads the smart contract directly using `verifyCredential(credentialId)`.
   - Displays cryptographic audit verdict: `CRYPTOGRAPHICALLY VERIFIED & VALID` or `CRYPTOGRAPHICALLY REVOKED`.

---

## 8. Step-by-Step Guide: How to Run & Test the Project

### Prerequisites
1. **Node.js** installed (v18.0.0 or higher recommended).
2. **MetaMask** browser extension installed in Google Chrome, Brave, or Edge.

---

### Step 1: Clone & Install Dependencies

Open a terminal in the root folder:
```bash
# 1. Install root dependencies
npm install

# 2. Install backend dependencies
cd backend
npm install
cd ..

# 3. Install frontend dependencies
cd frontend
npm install
cd ..
```

---

### Step 2: Start the Backend API

In **Terminal 1**:
```bash
npm run dev:backend
```
* The Express server starts on **`http://localhost:5000`**.
* Verify it works by opening `http://localhost:5000/api/health` in your browser. You should receive a JSON response showing `status: "healthy"` and contract connectivity.

---

### Step 3: Start the React Frontend Application

In **Terminal 2**:
```bash
npm run dev:frontend
```
* The Vite dev server starts on **`http://localhost:3000`** (or `http://localhost:3001`).
* Open your browser and navigate to `http://localhost:3000`.

---

### Step 4: How to Test the Complete End-to-End Workflow

1. **Explore the Platform**:
   - Visit `http://localhost:3000`.
   - Interact with the **CredoVault Card** in the hero section: click between *Credentials (3)*, *Cryptographic Proof*, and *Recruiter QR*.
   - In the "Live Demonstration" section, click **"Inspect CredoVault"** on any sample candidate (e.g. Rahul S.) to view their public vault without needing a wallet connected!

2. **Connect Student Wallet**:
   - Click **"Connect Wallet"** in the top-right navbar.
   - Approve the MetaMask connection prompt.
   - If prompted, allow MetaMask to switch to **Monad Testnet** (Chain ID: `10143`).
   - Click **"My Vault"** in the navbar to see your personal CredoVault ID.

3. **Issue a Credential (Issuer Portal)**:
   - Navigate to **"Issuer Portal"** (`/issuer`).
   - If connected with the contract deployer account (`0x71C9...`), you will see the green **"Authorized CredoNet Certifying Authority"** status.
   - In the minting form:
     * **Student Wallet Address**: Enter any EVM wallet address (or your own student address).
     * **Skill / Degree Title**: e.g., `B.E. Computer Engineering (Sem 7)`.
     * **Curriculum Proof**: e.g., `Grade: Distinction, Final Year Blockchain Capstone Project`.
   - Click **"Issue Credential to CredoVault"**.
   - Approve the transaction in MetaMask.
   - Wait 1–2 seconds for EVM block confirmation. You will see a success message with the transaction hash!

4. **Verify the Credential**:
   - Copy the generated `Credential ID` hash (starts with `0x...`).
   - Go to **"Verify"** in the navbar (`/verify/search`).
   - Paste the hash and click **"Verify"**.
   - The system queries the blockchain consensus layer directly and displays the tamper-proof validity certificate!

---

### Step 5: Running Automated Smart Contract Unit Tests

To prove the security and correctness of the Solidity smart contract:
```bash
npm run test:contract
```
This runs the Hardhat + Chai automated test suite verifying:
* ✅ Deployer ownership and issuer authorization.
* ✅ Owner authorization of new institutional issuers.
* ✅ Rejection of unauthorized users attempting to authorize issuers.
* ✅ Authorized issuers successfully minting credentials.
* ✅ Rejection of unauthorized users attempting to mint credentials.
* ✅ Successful revocation of credentials by the issuer.
* ✅ Successful revocation of credentials by the contract owner.
* ✅ Rejection of unauthorized users attempting to revoke credentials.

---

## 9. Viva & Project Review Q&A Cheatsheet

### Q1: Why use blockchain instead of a standard SQL / MongoDB database?
> **Answer**: Centralized databases have a single point of failure and are prone to administrative tampering, unauthorized SQL updates, and service obsolescence (link rot). If a university's server goes down or gets breached, certificates can be faked or lost. By anchoring credentials on an immutable EVM blockchain, records are permanently secured by cryptographic consensus and cannot be altered by anyone—not even the database administrator.

### Q2: How does the verification process work without costing the recruiter gas fees?
> **Answer**: In EVM-compatible blockchains, writing data (like minting or revoking) changes state and requires gas fees. However, reading state is executed via `view` functions (such as `contract.verifyCredential(id)`). Anyone can query the blockchain state locally through an RPC node without broadcasting a transaction, meaning **all verification searches and QR code audits are 100% free and instantaneous**.

### Q3: What cryptographic hashing algorithm is used, and how is the Credential ID computed?
> **Answer**: We use the native Ethereum `keccak256` hashing function. The Credential ID is computed as:
> `keccak256(abi.encodePacked(studentAddress, skillTitle, issuerAddress, block.timestamp, metadataHash))`.
> This guarantees that the credential identifier is deterministically unique, mathematically tied to the issuer's key, and stamped with the unalterable block timestamp.

### Q4: Can a student transfer or sell their credentials to someone else?
> **Answer**: No. The credentials in CredoNet are **soulbound to the student's wallet address**. The smart contract does not contain any `transfer()` function for credentials. Only the accredited issuer can mint a credential to a student's address, and only that student's address can showcase it in their CredoVault.

### Q5: How does the revocation mechanism work if a degree was issued in error?
> **Answer**: The smart contract stores a boolean `revoked` flag inside the `Credential` struct. If an authority calls `revokeCredential(credentialId)`, the contract verifies that `msg.sender` is either the original issuer or the contract owner, and flips `revoked` to `true`. When recruiters query the credential, the consensus auditor instantly marks it as `CRYPTOGRAPHICALLY REVOKED`.

### Q6: Why did you choose Monad Testnet for deployment?
> **Answer**: Monad is a high-throughput, 100% EVM-compatible Layer 1 blockchain offering sub-second block finality. This allows institutions to mint credentials and candidates to verify them instantaneously without the severe network congestion and high transaction fees found on Ethereum mainnet, while preserving complete compatibility with standard Solidity code, MetaMask, and Ethers.js.

### Q7: What is the purpose of the Node.js Express backend if the smart contract is on-chain?
> **Answer**: The backend serves as a high-performance caching, analytics, and metadata aggregation layer. It provides REST endpoints for mobile apps, quick global statistics (total credentials, issuer lists), and simulated decentralized IPFS metadata storage, reducing direct RPC query load on client browsers.
