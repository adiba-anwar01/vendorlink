const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
{
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: ["active", "accepted", "rejected"],
    default: "active"
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);