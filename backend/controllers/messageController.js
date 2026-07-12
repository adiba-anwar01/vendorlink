const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

exports.sendMessage = async (req, res) => {
  try {
    const { text, offerPrice, messageType } = req.body;

    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isbuyer = conversation.buyer.toString() === req.user.id;
    const isSeller = conversation.seller.toString() === req.user.id;

    if (!isbuyer && !isSeller) {
      return res.status(401).json({ message: "Not authorized" });
    }

    let message = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      messageType,
      text,
      offerPrice,
    });

    message = await message.populate("sender", "name role");

    const io = req.app.get("io");
    if (io) {
      io.to(req.params.conversationId).emit("newMessage", message);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
    }).populate("sender", "name role");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
