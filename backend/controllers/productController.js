const Product = require("../models/Product");
const cloudinary = require("cloudinary").v2;

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const cloudName = process.env.CLOUDINARY_NAME;

    if (
      !cloudName ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        message: "Cloudinary not configured",
      });
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "vendorlink/products",
          resource_type: "auto",
          quality: "auto",
          fetch_format: "auto",
        },
        (error, uploadResult) => {
          if (error) {
            reject(error);
          } else {
            resolve(uploadResult);
          }
        },
      );

      uploadStream.on("error", (error) => {
        reject(error);
      });

      uploadStream.end(req.file.buffer);
    });

    res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Image upload failed",
      error: error.message,
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category, condition, images, location } =
      req.body;

    if (!title || !description || !price || !category || !condition) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    if (
      !location ||
      location.type !== "Point" ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        message: "Product location is required",
      });
    }

    const [longitude, latitude] = location.coordinates.map(Number);

    if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
      return res.status(400).json({
        message: "Product location coordinates are invalid",
      });
    }

    const product = await Product.create({
      title,
      description,
      price,
      category,
      condition,
      images: Array.isArray(images) ? images : [],
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      seller: req.user.id,
      sellerRole: req.user.role,
    });

    const createdProduct = await Product.findById(product._id).populate(
      "seller",
      "name role",
    );

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "open" }).populate(
      "seller",
      "name role",
    );

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

exports.updateProduct = async (req, res) => {
  try {
    const { title, description, price } = req.body;

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

    if (product.status === "sold") {
      return res.status(400).json({
        message: "Cannot update a sold product",
      });
    }

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
    const { lat, lng, radius, query, page = 1, limit = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude and longitude required",
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    const searchRadius = radius ? parseInt(radius, 10) : 5000;
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;
    const skip = (parsedPage - 1) * parsedLimit;

    const targetRole = req.user.role === "user" ? "vendor" : "user";

    const matchQuery = {
      status: "open",
      sellerRole: targetRole,
    };

    if (query) {
      matchQuery.title = {
        $regex: query,
        $options: "i",
      };
    }

    const results = await Product.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          key: "location",
          distanceField: "distanceMeters",
          maxDistance: searchRadius,
          spherical: true,
          query: matchQuery,
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "seller",
          foreignField: "_id",
          as: "seller",
        },
      },

      {
        $unwind: {
          path: "$seller",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          price: 1,
          category: 1,
          condition: 1,
          images: 1,
          location: 1,
          sellerRole: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          seller: {
            _id: "$seller._id",
            name: "$seller.name",
            role: "$seller.role",
          },
          distanceKm: {
            $divide: ["$distanceMeters", 1000],
          },
        },
      },

      { $sort: { distanceMeters: 1 } },

      { $skip: skip },

      { $limit: parsedLimit },
    ]);

    res.json(results);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
