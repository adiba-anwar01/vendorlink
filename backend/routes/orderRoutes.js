const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  placeOrder,
  getMyOrders,
  getSellerOrders,
  getOrderById,
  updateOrderStatus
} = require("../controllers/orderController");

router.post("/:productId", protect, placeOrder);
router.get("/my/orders", protect, getMyOrders);
router.get("/seller/orders", protect, getSellerOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, updateOrderStatus);

module.exports = router;
