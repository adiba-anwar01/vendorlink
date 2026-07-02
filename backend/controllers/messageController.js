const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Product = require("../models/Product");

exports.sendMessage = async (req, res) => {
  try {

    const { text, offerPrice, messageType } = req.body;

    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (
      conversation.buyer.toString() !== req.user.id &&
      conversation.seller.toString() !== req.user.id
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      messageType,
      text,
      offerPrice
    });

    res.status(201).json(message);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {

    const messages = await Message.find({
      conversation: req.params.conversationId
    }).populate("sender", "name role");

    res.json(messages);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};