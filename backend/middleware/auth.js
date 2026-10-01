const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "credonet_monad_super_secret_jwt_key_2026";

/**
 * Protect routes - verifies JWT from Authorization header
 */
async function protect(req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to access this route. Please log in.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ success: false, error: "User no longer exists." });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Token is invalid or expired." });
  }
}

/**
 * Grant access to specific roles
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user ? req.user.role : "guest"}' is not authorized to access this endpoint. Required: [${roles.join(", ")}]`,
      });
    }
    next();
  };
}

module.exports = {
  protect,
  authorize,
  JWT_SECRET,
};
