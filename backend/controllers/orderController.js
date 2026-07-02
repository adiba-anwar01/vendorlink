const Order = require("../models/Order");
const Product = require("../models/Product");

exports.placeOrder = async (req, res) => {
  try {
    const { deliveryAddress, phoneNumber, notes } = req.body;

    if (!deliveryAddress.trim() || !phoneNumber.trim()) {
      return res.status(400).json({
        message: "Delivery address and phone number are required"
      });
    }
    if (!/^\d{10}$/.test(phoneNumber.trim())) {
      return res.status(400).json({
        message: "Invalid phone number"
      });
    }

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    if (product.seller.toString() === req.user.id) {
      return res.status(400).json({
        message: "You cannot order your own product"
      });
    }

    if (product.status === "sold") {
      return res.status(400).json({
        message: "Product already sold"
      });
    }

    const existingOrder = await Order.findOne({
      product: product._id
    });

    if (existingOrder) {
      return res.status(400).json({
        message: "Order already exists for this product"
      });
    }

    const order = await Order.create({
      product: product._id,
      buyer: req.user.id,
      seller: product.seller,
      priceAtOrder: product.price,
      totalAmount: product.price,
      deliveryAddress,
      phoneNumber,
      notes: notes || ""
    });

    product.status = "sold";
    await product.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("product", "title price category condition status")
      .populate("buyer", "name email role")
      .populate("seller", "name email role");

    res.status(201).json(populatedOrder);

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Order already exists for this product"
      });
    }

    res.status(500).json({ message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      buyer: req.user.id
    })
      .populate("product", "title price category condition status")
      .populate("seller", "name email role")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      seller: req.user.id
    })
      .populate("product", "title price category condition status")
      .populate("buyer", "name email role")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("product", "title description price category condition status")
      .populate("buyer", "name email role")
      .populate("seller", "name email role");

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    const isBuyer = order.buyer._id.toString() === req.user.id;
    const isSeller = order.seller._id.toString() === req.user.id;

    if (!isBuyer && !isSeller) {
      return res.status(401).json({
        message: "Not authorized"
      });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["confirmed", "shipped", "delivered", "cancelled"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status"
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (order.seller.toString() !== req.user.id) {
      return res.status(401).json({
        message: "Not authorized"
      });
    }

    order.status = status;
    await order.save();

    if (status === "cancelled") {
      const product = await Product.findById(order.product);

      if (product) {
        product.status = "open";
        await product.save();
      }
    }

    const updatedOrder = await Order.findById(order._id)
      .populate("product", "title price category condition status")
      .populate("buyer", "name email role")
      .populate("seller", "name email role");

    res.json(updatedOrder);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
