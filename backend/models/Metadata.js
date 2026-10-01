const mongoose = require("mongoose");

const MetadataSchema = new mongoose.Schema(
  {
    hash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Metadata", MetadataSchema);
