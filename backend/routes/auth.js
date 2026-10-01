const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// Generate Token
function generateToken(id) {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "30d",
  });
}

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user (student, issuer, or employer)
 * @access  Public
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, organization, walletAddress } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, email, and password.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long.",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: "An account with this email address already exists.",
      });
    }

    const assignedRole = ["student", "issuer", "employer"].includes(role) ? role : "student";

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
      organization: organization ? organization.trim() : "",
      walletAddress: walletAddress ? walletAddress.trim() : "",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        walletAddress: user.walletAddress,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, error: err.message || "Server signup error" });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email and password.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        walletAddress: user.walletAddress,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: err.message || "Server login error" });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private
 */
router.get("/me", protect, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      organization: req.user.organization,
      walletAddress: req.user.walletAddress,
    },
  });
});

/**
 * Seed initial sample users if database is empty
 */
async function seedDefaultUsers() {
  try {
    // Update any existing Alex Raut in the database to Alex John
    await User.updateMany({ name: "Alex Raut" }, { name: "Alex John" });
    await User.updateOne({ email: "student@credonet.xyz" }, { name: "Alex John" });

    const count = await User.countDocuments();
    if (count === 0) {
      console.log("[CredoNet Auth] Seeding default demo accounts for Student, Issuer, Employer...");
      await User.create([
        {
          name: "Alex John",
          email: "student@credonet.xyz",
          password: "password123",
          role: "student",
          organization: "Sardar Patel Institute of Technology",
          walletAddress: "0x71C92a8C943B8d62283e1c66289b5B38B71C4e92",
        },
        {
          name: "XYZ Academy Admin",
          email: "issuer@credonet.xyz",
          password: "password123",
          role: "issuer",
          organization: "XYZ Web3 Academy",
          walletAddress: "0x21626cDb67f0114D0F6a7dBC1140B7C0A9101864",
        },
        {
          name: "TechCorp Recruiting",
          email: "recruiter@techcorp.com",
          password: "password123",
          role: "employer",
          organization: "TechCorp Ventures",
          walletAddress: "",
        },
      ]);
      console.log("[CredoNet Auth] Demo accounts successfully created!");
    }
  } catch (err) {
    console.warn("[CredoNet Auth] Seed accounts warning:", err.message);
  }
}

module.exports = {
  router,
  seedDefaultUsers,
};
