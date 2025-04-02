// import User from "../models/user.model.js";
// import bcrypt from "bcryptjs";
// import { generateTokenAndSetCookie } from "../lib/utils/generateToken";
// export const signup= async(req, res)=>{
//     try {
//         const {fullName, username,email, password}=req.body;
//         const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if(!emailRegex.test(email)){
//             return res.json(400).json({error: "Invalid email format"});
//         }
//         const existingUser=await User.findOne({username});
//         if(existingUser){
//             return res.status(400).json({error:"Username is laready taken"});
//         }

//         const existingEmail=await User.findOne({email});
//         if(existingEmail){
//             return res.status(400).json({error:"Email is laready taken"});
//         }

//       ///  hash password
//       const salt=await bcrypt.genSalt(10);
//       const hashPassword= await bcrypt.hash(password, salt);

//       const newUser=new User ({
//         fullName,
//         username,
//         email,
//         password: hashPassword
//       });
//       if(newUser){
//         generateTokenAndSetCookie(newUser._id, res);
//         await newUser.save();
//         res.status(201).json({
//             _id: newUser._id,
//             username: newUser.username,
//             email: newUser.email,
//             profileImg: newUser.profileImg,
//             coverImg: newUser.coverImg,
//             followers: newUser.followers,
//             following: newUser.following,
//             bio: newUser.bio,
//             link: newUser.link,
//         })

//       }
//       else{
//         res.status(400).json({error:"Invalid user  data"});

//       }

//     } catch (error) {
//         console.log("Error in signup controller", error.message);
//         res.status(500).json({error: "Internal server error"});
//     }}


// export const login= async(req, res)=>{
//     res.json({
//         data: "You hit login",
//     });
// }

// export const logout= async(req, res)=>{
//     res.json({
//         data: "You hit logout",
//     });
// }


import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js"; // Ensure correct import
import { protectRoute } from "../middleware/protectRoute.js"; // Ensure correct import

export const signup = async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;

        // Validate email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        

        // Check if username or email is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username is already taken" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email is already taken" });
        }
        if(password.length<6){
            return res.status(400).json({error:"Password should be at least 6 characters long"});
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            fullName,
            username,
            email,
            password: hashPassword,
        });

        // Save user and generate token
        await newUser.save();
        generateTokenAndSetCookie(newUser._id, res);

        res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            profileImg: newUser.profileImg || "",
            coverImg: newUser.coverImg || "",
            followers: newUser.followers || [],
            following: newUser.following || [],
            bio: newUser.bio || "",
            link: newUser.link || "",
        });

    } catch (error) {
        console.log("Error in signup controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};



export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ username });

        // If no user is found, return an error
        if (!user) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Check if password matches
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        // If password doesn't match
        if (!isPasswordMatch) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Generate token and set it as a cookie
        generateTokenAndSetCookie(user._id, res);

        // Return user data as response
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            profileImg: user.profileImg || "",
            coverImg: user.coverImg || "",
            followers: user.followers || [],
            following: user.following || [],
            bio: user.bio || "",
            link: user.link || "",
        });

    } catch (error) {
        console.log("Error in login controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const logout= async(req, res)=>{
    try {
        res.cookie("jwt", "", {maxAge: 0}); // Clear the token cookie
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


export const getMe= async(req, res)=>{
    try{
        const user= await User.findById(req.user._id).select("-password");
        res.status(200).json(user);


    }catch(error){
        console.log("Error in getMe controller:", error.message);
        res.status(500).json({ error: "Internal server error" });

    }
}