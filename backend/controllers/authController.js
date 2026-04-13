const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role, latitude, longitude } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userRole = role || "user";

        let userData = {
            name,
            email,
            password: hashedPassword,
            role: userRole
        };

        if (userRole === "vendor") {
            if (!latitude || !longitude) {
                return res.status(400).json({
                    message: "Vendor must provide latitude and longitude"
                });
            }

            userData.location = {
                type: "Point",
                coordinates: [
                    parseFloat(longitude),
                    parseFloat(latitude)
                ]
            };
        }

        const user = await User.create(userData);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// LOGIN
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        
        if (!email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateLocation = async (req, res) => {

  const { latitude, longitude } = req.body;

  await User.findByIdAndUpdate(req.user.id, {
    location: {
      type: "Point",
      coordinates: [longitude, latitude]
    }
  });

  res.json({ message: "Location updated" });

};