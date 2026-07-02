const Conversation = require("../models/Conversation");
const Product = require("../models/Product");

exports.startConversation = async (req, res) => {
  try {

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.status === "sold") {
      return res.status(400).json({ message: "Product already sold" });
    }

    const existing = await Conversation.findOne({
      product: product._id,
      buyer: req.user.id
    });

    if (existing) {
      return res.json(existing);
    }

    const conversation = await Conversation.create({
      product: product._id,
      buyer: req.user.id,
      seller: product.seller
    });

    res.status(201).json(conversation);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acceptOffer = async (req, res) => {
  try {

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found"
      });
    }

    // Only seller can accept
    if (conversation.seller.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Not authorized"
      });
    }

    // Accept this conversation
    conversation.status = "accepted";
    await conversation.save();

    // Mark product sold
    const product = await Product.findById(conversation.product);
    product.status = "sold";
    await product.save();

    // Reject all other conversations for this product
    await Conversation.updateMany(
      {
        product: conversation.product,
        _id: { $ne: conversation._id }
      },
      {
        $set: { status: "rejected" }
      }
    );

    res.json({
      message: "Offer accepted. Other negotiations closed and product marked sold."
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.rejectConversation = async (req, res) => {
  try {

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (conversation.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    conversation.status = "rejected";
    await conversation.save();

    res.json({
      message: "Negotiation rejected"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyConversations = async (req,res) => {

 const conversations = await Conversation.find({
   $or: [
     { buyer: req.user.id },
     { seller: req.user.id }
   ]
 })
 .populate("product","title price")
 .populate("buyer","name")
 .populate("seller","name");

 res.json(conversations);

};