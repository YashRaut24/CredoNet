import deployedData from "./deployedContracts.json";

export const SKILL_PASSPORT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  (deployedData as { address?: string }).address ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3" // Default Hardhat test address
) as `0x${string}`;

export const SKILL_PASSPORT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "credentialId", type: "bytes32" },
      { indexed: true, internalType: "address", name: "student", type: "address" },
      { indexed: true, internalType: "address", name: "issuer", type: "address" },
      { indexed: false, internalType: "string", name: "skill", type: "string" },
      { indexed: false, internalType: "string", name: "metadataHash", type: "string" },
      { indexed: false, internalType: "uint256", name: "issuedAt", type: "uint256" },
    ],
    name: "CredentialIssued",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "credentialId", type: "bytes32" },
      { indexed: true, internalType: "address", name: "issuer", type: "address" },
      { indexed: false, internalType: "uint256", name: "revokedAt", type: "uint256" },
    ],
    name: "CredentialRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "issuer", type: "address" },
    ],
    name: "IssuerAuthorized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "issuer", type: "address" },
    ],
    name: "IssuerRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
      { indexed: true, internalType: "address", name: "newOwner", type: "address" },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "issuer", type: "address" }],
    name: "authorizeIssuer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "authorizedIssuers",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllCredentialIds",
    outputs: [{ internalType: "bytes32[]", name: "", type: "bytes32[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "credentialId", type: "bytes32" }],
    name: "getCredential",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "credentialId", type: "bytes32" },
          { internalType: "address", name: "student", type: "address" },
          { internalType: "string", name: "skill", type: "string" },
          { internalType: "address", name: "issuer", type: "address" },
          { internalType: "string", name: "metadataHash", type: "string" },
          { internalType: "uint256", name: "issuedAt", type: "uint256" },
          { internalType: "bool", name: "revoked", type: "bool" },
        ],
        internalType: "struct SkillPassport.Credential",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "issuer", type: "address" }],
    name: "getIssuerCredentials",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "credentialId", type: "bytes32" },
          { internalType: "address", name: "student", type: "address" },
          { internalType: "string", name: "skill", type: "string" },
          { internalType: "address", name: "issuer", type: "address" },
          { internalType: "string", name: "metadataHash", type: "string" },
          { internalType: "uint256", name: "issuedAt", type: "uint256" },
          { internalType: "bool", name: "revoked", type: "bool" },
        ],
        internalType: "struct SkillPassport.Credential[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "student", type: "address" }],
    name: "getStudentCredentials",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "credentialId", type: "bytes32" },
          { internalType: "address", name: "student", type: "address" },
          { internalType: "string", name: "skill", type: "string" },
          { internalType: "address", name: "issuer", type: "address" },
          { internalType: "string", name: "metadataHash", type: "string" },
          { internalType: "uint256", name: "issuedAt", type: "uint256" },
          { internalType: "bool", name: "revoked", type: "bool" },
        ],
        internalType: "struct SkillPassport.Credential[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalCredentials",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "issuer", type: "address" }],
    name: "isAuthorizedIssuer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "student", type: "address" },
      { internalType: "string", name: "skill", type: "string" },
      { internalType: "string", name: "metadataHash", type: "string" },
    ],
    name: "issueCredential",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "credentialId", type: "bytes32" }],
    name: "isValidCredential",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "credentialId", type: "bytes32" }],
    name: "revokeCredential",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "issuer", type: "address" }],
    name: "revokeIssuer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export interface CredentialData {
  credentialId: `0x${string}`;
  student: `0x${string}`;
  skill: string;
  issuer: `0x${string}`;
  metadataHash: string;
  issuedAt: bigint;
  revoked: boolean;
}
