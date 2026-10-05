const mongoose = require("mongoose");

const CredentialRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
    },
    studentAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    studentName: {
      type: String,
      default: "Student Learner",
      trim: true,
    },
    skillTitle: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["skill", "project", "certification"],
      default: "skill",
    },
    evidenceProject: {
      type: String,
      default: "",
      trim: true,
    },
    githubUrl: {
      type: String,
      default: "",
      trim: true,
    },
    liveUrl: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    issuerAddress: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    validityDuration: {
      type: String,
      default: "Perpetual",
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    credentialId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CredentialRequest", CredentialRequestSchema);
