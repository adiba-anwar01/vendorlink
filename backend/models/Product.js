const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    category: {
      type: String,
      required: true
    },

    condition: {
      type: String,
      enum: ["new", "used"],
      default: "used"
    },

    images: [
      {
        type: String
      }
    ],

    location: {
      type: {
        type: String,
        enum: ["Point"]
      },
      coordinates: {
        type: [Number]
      }
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    sellerRole: {
      type: String,
      enum: ["user", "vendor"],
      required: true
    },

    status: {
      type: String,
      enum: ["open", "sold"],
      default: "open"
    }
  },
  { timestamps: true }
);

productSchema.index({ location: "2dsphere" }, { sparse: true });

module.exports = mongoose.model("Product", productSchema);
