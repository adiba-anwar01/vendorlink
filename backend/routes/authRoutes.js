const express = require("express");
const router = express.Router();
const { registerUser, loginUser, updateLocation } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/update-location", updateLocation);

module.exports = router;

const protect = require("../middleware/authMiddleware");

router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});