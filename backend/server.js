const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const authMiddleware = require("./middleware/authMiddleware");
const Conversation = require("./models/Conversation");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");
const productRoutes = require("./routes/productRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.set("io", io);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error: No token provided"));
    
    const decoded = authMiddleware.verifyToken(token);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket) => {

  socket.on("joinChat", async (conversationId) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;
      
      const isBuyer = conversation.buyer.toString() === socket.user.id;
      const isSeller = conversation.seller.toString() === socket.user.id;
      
      if (isBuyer || isSeller) {
        socket.join(conversationId);
      }
    } catch (error) {
    }
  });

  socket.on("leaveChat", (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on("disconnect", () => {
  });
});

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("VendorLink API Running");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  // Server listening on specified port
});
