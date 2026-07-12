const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
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

    priceAtOrder: {
      type: Number,
      required: true,
      min: 0
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    deliveryAddress: {
      type: String,
      required: true,
      trim: true
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true
    },

    notes: {
      type: String,
      trim: true,
      default: ""
    },

    status: {
      type: String,
      enum: ["placed", "completed"],
      default: "placed"
    }
  },
  { timestamps: true }
);

// Compound unique index: only one order per buyer per product
orderSchema.index({ product: 1, buyer: 1 }, { unique: true });

module.exports = mongoose.model("Order", orderSchema);
