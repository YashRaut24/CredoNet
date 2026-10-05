const mongoose = require("mongoose");

const BlindProofSchema = new mongoose.Schema(
  {
    proofId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    credentialId: {
      type: String,
      required: true,
      index: true,
    },
    blindCandidateCode: {
      type: String,
      required: true,
    },
    skillTitle: {
      type: String,
      required: true,
    },
    issuerAddress: {
      type: String,
      required: true,
    },
    issuerName: {
      type: String,
      default: "Accredited Web3 Authority",
    },
    issuedAt: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Number,
      default: 0,
    },
    proofCommitmentHash: {
      type: String,
      required: true,
    },
    blockchainContract: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "VALID",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BlindProof", BlindProofSchema);
