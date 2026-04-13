const Product = require("../models/Product");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    // Check if Cloudinary is configured
    if (
      !process.env.CLOUDINARY_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("Cloudinary credentials missing:", {
        name: !!process.env.CLOUDINARY_NAME,
        key: !!process.env.CLOUDINARY_API_KEY,
        secret: !!process.env.CLOUDINARY_API_SECRET,
      });
      return res.status(500).json({
        message: "Cloudinary not configured",
      });
    }

    // Reconfigure Cloudinary (ensure fresh config)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log(
      "Uploading file:",
      req.file.originalname,
      "Size:",
      req.file.size,
    );

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "vendorlink/products",
          resource_type: "auto",
          quality: "auto",
          fetch_format: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log("Cloudinary upload success:", result.secure_url);
            resolve(result);
          }
        },
      );

      uploadStream.on("error", (error) => {
        console.error("Upload stream error:", error);
        reject(error);
      });

      uploadStream.end(req.file.buffer);
    });

    res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("uploadImage error:", error);
    res.status(500).json({
      message: "Image upload failed",
      error: error.message,
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category, condition, images } = req.body;

    if (!title || !description || !price || !category || !condition) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    // Get seller's location to associate with product
    const seller = await User.findById(req.user.id);
    if (!seller) {
      return res.status(404).json({
        message: "Seller not found",
      });
    }

    const product = await Product.create({
      title,
      description,
      price,
      category,
      condition,
      images: images || [],
      seller: req.user.id,
      sellerRole: req.user.role,
      location: seller.location || undefined, // Copy seller's location to product
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      condition,
      title,
      minPrice,
      maxPrice,
      sellerRole,
      status,
    } = req.query;

    const filter = {
      status: status || "open",
    };

    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (title) {
      filter.title = {
        $regex: title,
        $options: "i",
      };
    }
    if (sellerRole) filter.sellerRole = sellerRole;

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(filter).populate("seller", "name role");

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name role",
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await product.deleteOne();

    res.json({
      message: "Product deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const { title, description, price } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Only seller can update
    if (product.seller.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    // Cannot update sold product
    if (product.status === "sold") {
      return res.status(400).json({
        message: "Cannot update a sold product",
      });
    }

    // Update only provided fields
    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({
          message: "Price cannot be negative",
        });
      }
      product.price = price;
    }

    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchNearbyProducts = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude and longitude required",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Convert radius (in km) to meters for MongoDB. Default: 50km
    const radiusMeters = radius ? Math.round(parseFloat(radius) * 1000) : 50000;

    // Query products by their location using geospatial queries
    const products = await Product.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusMeters,
        },
      },
      status: "open",
    })
      .populate("seller", "name role location")
      .select(
        "title description price category condition images seller status location createdAt",
      );

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
