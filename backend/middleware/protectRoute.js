//verify jwt token
import User from "../models/user.model.js"
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        console.log("Received Cookies:", req.cookies);

        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);

        // Change from decoded._id to decoded.userId
        const user = await User.findById(decoded.userId).select("-password");
        console.log("User Found:", user);

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
