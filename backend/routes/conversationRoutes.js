const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  startConversation,
  acceptOffer,
  rejectConversation,
  getMyConversations
} = require("../controllers/conversationController");

router.post("/:productId", protect, startConversation);

router.get("/my", protect, getMyConversations);

router.put("/accept/:id", protect, acceptOffer);

router.put("/reject/:id", protect, rejectConversation);


module.exports = router;