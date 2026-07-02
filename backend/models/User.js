const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    default: "user"
  },

  location: {
    type: {
      type: String,
      enum: ["Point"]
    },
    coordinates: {
      type: [Number]
    }
  }
}, { timestamps: true });

// Important: Create 2dsphere index
userSchema.index({ location: "2dsphere" }, { sparse: true });

module.exports = mongoose.model("User", userSchema);