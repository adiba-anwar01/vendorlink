const Conversation = require("../models/Conversation");
const Product = require("../models/Product");
const User = require("../models/User");
const Message = require("../models/Message");
const orderService = require("../services/orderService");

exports.startConversation = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.status === "sold") return res.status(400).json({ message: "Product already sold" });

    let isNew = false;
    let conversation = await Conversation.findOne({
      product: product._id,
      buyer: req.user.id,
    });

    if (!conversation) {
      isNew = true;
      conversation = await Conversation.create({
        product: product._id,
        buyer: req.user.id,
        seller: product.seller,
      });
    }

    const populated = await Conversation.findById(conversation._id)
      .populate("product", "title price status")
      .populate("buyer", "name")
      .populate("seller", "name");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acceptOffer = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (conversation.seller.toString() !== req.user.id) return res.status(401).json({ message: "Not authorized" });

    conversation.status = "accepted";
    await conversation.save();

    const populated = await Conversation.findById(conversation._id)
      .populate("product", "title price status")
      .populate("buyer", "name")
      .populate("seller", "name");

    const offerPrice = await orderService.getLatestOfferPrice(conversation._id);

    let priceText = "";
    if (offerPrice !== null) {
      priceText = ` of ₹${offerPrice}`;
    }

    let systemMessage = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      text: `Offer${priceText} accepted. Waiting for the buyer to place the order.`,
      messageType: "text"
    });
    
    systemMessage = await systemMessage.populate("sender", "name role");

    const io = req.app.get("io");
    if (io) {
      io.to(conversation._id.toString()).emit("newMessage", systemMessage);
      io.to(conversation._id.toString()).emit("offerUpdated", populated);
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getMyConversations = async (req, res) => {
  const conversations = await Conversation.find({
    $or: [{ buyer: req.user.id }, { seller: req.user.id }],
  })
    .populate("product", "title price status")
    .populate("buyer", "name")
    .populate("seller", "name");

  res.json(conversations);
};

exports.deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isBuyer = conversation.buyer.toString() === req.user.id;
    const isSeller = conversation.seller.toString() === req.user.id;

    if (!isBuyer && !isSeller) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Delete all messages in this conversation
    await Message.deleteMany({ conversation: conversation._id });

    // Delete the conversation
    await Conversation.findByIdAndDelete(conversation._id);

    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};