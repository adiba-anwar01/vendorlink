const express = require("express");
const router = express.Router();
const { getNearbyVendors } = require("../controllers/locationController");

router.get("/nearby", getNearbyVendors);

module.exports = router;