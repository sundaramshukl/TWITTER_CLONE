//verify jwt token
import jwt from "jsonwebtoken";
import User from "../models/user.model.js"

// export const protectRoute = async (req, res, next) => {
//     try {
//         console.log("Received Cookies:", req.cookies);

//         const token = req.cookies.jwt;
//         if (!token) {
//             return res.status(401).json({ error: "Unauthorized: No token provided" });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         console.log("Decoded Token:", decoded);

//         // Change from decoded._id to decoded.userId
//         const user = await User.findById(decoded.userId).select("-password");
//         console.log("User Found:", user);

//         if (!user) {
//             return res.status(401).json({ error: "User not found" });
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         console.error("Error in protectRoute middleware:", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };



export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies?.jwt; // Ensure token is present in cookies
        if (!token) {
            return res.status(401).json({ error: "Unauthorized - No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded JWT Payload:", decoded);

        const user = await User.findById(decoded.userId).select("-password"); // Exclude password
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        req.user = { userId: user._id.toString() }; // Attach user ID to request
        console.log("Authenticated User ID:", req.user.userId);
        
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
};
