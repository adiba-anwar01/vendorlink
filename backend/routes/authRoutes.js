const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  updateLocation,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/update-location", protect, updateLocation);
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;
