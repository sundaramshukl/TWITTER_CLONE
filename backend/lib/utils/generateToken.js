import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({userId }, process.env.JWT_SECRET, {
        expiresIn: '15d',
    });

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: false, // Change this to true in production
        sameSite: "lax", // Fix cookie sending issues
      });
      
}