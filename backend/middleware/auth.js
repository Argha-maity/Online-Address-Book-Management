const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt_secret");
const User = require("../models/user");

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Authentication required",
            details: "Authorization header missing or malformed",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (!decoded || !decoded.id) {
            return res.status(401).json({ error: "Invalid token payload" });
        }

        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({ error: "User not found" });
        }

        next();
    } catch (error) {
        console.error("JWT verification failed:", error.message);
        return res.status(401).json({ error: "Not authorized, token invalid" });
    }
};

module.exports = { protect };