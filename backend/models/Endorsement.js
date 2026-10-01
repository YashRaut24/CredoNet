const mongoose = require("mongoose");

const EndorsementSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    endorsementId: {
      type: String,
      required: true,
      unique: true,
    },
    skill: {
      type: String,
      required: true,
      trim: true,
    },
    endorsementText: {
      type: String,
      default: "",
      trim: true,
    },
    endorserWallet: {
      type: String,
      default: "0x0000000000000000000000000000000000000000",
      trim: true,
    },
    endorserName: {
      type: String,
      default: "Project Mentor",
      trim: true,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Endorsement", EndorsementSchema);
