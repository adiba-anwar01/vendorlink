const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");
const productRoutes = require("./routes/productRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const orderRoutes = require("./routes/orderRoutes");


const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // VERY IMPORTANT (reads JSON body)

// Connect Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/orders", orderRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("VendorLink API Running");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

