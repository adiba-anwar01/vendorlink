const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  startConversation,
  acceptOffer,
  getMyConversations,
  deleteConversation
} = require("../controllers/conversationController");

router.post("/:productId", protect, startConversation);

router.get("/myconvo", protect, getMyConversations);

router.put("/accept/:id", protect, acceptOffer);

router.delete("/:id", protect, deleteConversation);


module.exports = router;