const User = require("../models/User");

// Find vendors near user
exports.getNearbyVendors = async (req, res) => {
  try {
    const { latitude, longitude, distance } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude required" });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const vendors = await User.find({
      role: "vendor",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lon, lat]
          },
          $maxDistance: parseInt(distance) || 5000
        }
      }
    });

    res.json(vendors);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};