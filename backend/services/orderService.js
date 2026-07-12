const Message = require("../models/Message");

exports.getLatestOfferPrice = async (conversationId) => {
  const latestOffer = await Message.findOne({
    conversation: conversationId,
    messageType: "offer",
  }).sort({ createdAt: -1 });

  return latestOffer ? latestOffer.offerPrice : null;
};


