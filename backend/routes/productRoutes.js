const express = require("express");
const router = express.Router();
const multer = require("multer");

const protect = require("../middleware/authMiddleware");
const {
  uploadImage,
  createProduct,
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  searchNearbyProducts,
} = require("../controllers/productController");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"));
    }
  },
});

// Image upload endpoint
router.post("/upload", protect, upload.single("image"), uploadImage);

router.post("/", protect, createProduct);
router.get("/nearby", protect, searchNearbyProducts);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
