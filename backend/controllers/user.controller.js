import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";
import Notification from "../models/notification.model.js";
export const getUserProfile = async (req, res) => {
    const username=req.params;
    try {
        const user= await User.findOne({username}).select("-password");
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getUserProfile: ", error.message);
        res.status(500).json({error:error.message});
    }
};


import mongoose from "mongoose";

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;  // ✅ Extract ID from params
        console.log("Received ID from params:", id);

        console.log("JWT User ID:", req.user?.userId);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        if (!mongoose.Types.ObjectId.isValid(req.user.userId)) {
            return res.status(400).json({ error: "Invalid current user ID" });
        }

        const userToModify = await User.findById(new mongoose.Types.ObjectId(id));
        console.log("User to Modify:", userToModify);

        const currentUser = await User.findById(new mongoose.Types.ObjectId(req.user.userId));
        console.log("Current User:", currentUser);

        if (!userToModify || !currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        if (id.toString() === req.user.userId.toString()) {
            return res.status(400).json({ error: "You cannot follow/unfollow yourself" });
        }

        const isFollowing = currentUser.following.includes(id);
        if (isFollowing) {
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user.userId } }, { new: true });
            await User.findByIdAndUpdate(req.user.userId, { $pull: { following: id } }, { new: true });
            return res.status(200).json({ message: "User unfollowed successfully" });
        } else {
            await User.findByIdAndUpdate(id, { $push: { followers: req.user.userId } }, { new: true });
            await User.findByIdAndUpdate(req.user.userId, { $push: { following: id } }, { new: true });
            //send notifications
            const newNotification = new Notification({
                from: req.user.userId,
                to: userToModify._id,
                type: "follow",
            });
            await newNotification.save();
            return res.status(200).json({ message: "User followed successfully" });
        }

    } catch (error) {
        console.error("Error in followUnfollowUser:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
};



export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get the current user's following list
        const userFollowedByMe = await User.findById(userId).select("following");

        // Get random users, excluding the current user
        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: new mongoose.Types.ObjectId(userId) }  // Ensure userId is ObjectId
                }
            },
            { $sample: { size: 10 } }
        ]);

        // Filter out users already followed and the current user (extra safeguard)
        const filteredUsers = users.filter((user) => 
            user._id.toString() !== userId && 
            (!userFollowedByMe?.following || !userFollowedByMe.following.includes(user._id.toString()))
        );

        // Select only 4 suggested users
        const suggestedUsers = filteredUsers.slice(0, 4);

        // Remove passwords before sending response
        suggestedUsers.forEach((user) => (user.password = null));

        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.error(error); // Log errors for debugging
        res.status(500).json({ message: "Server error" });
    }
};

export const updateUser=async(req, res)=>{
    const {fullName, email, username, currentPassword, newPassword, bio, link}=req.body;

    let {profileImg, coverImg}=req.body;
    const userId=req.user.userId;
    try {
        let user= await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        if((!newPassword && currentPassword)||(!currentPassword && newPassword)){
            return res.status(400).json({message:"Please provide both current and new password"});
        }
        if(newPassword && currentPassword){
            const isMatch= await bcrypt.compare(currentPassword, user.password);
            if(!isMatch){
                return res.status(400).json({message:"Current password is incorrect"});
            }
            if(newPassword.length<6){
                return res.status(400).json({error:"New password must be at least 6 characters long"});
            }
            const salt= await bcrypt.genSalt(10);
            const hashedPassword= await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;
        }
       if(profileImg){
        if(user.profileImg){
            await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
        // Extract the public ID from the URL and delete it from Cloudinary
        }
         const uploadResponse=await cloudinary.uploader.upload(profileImg)
         profileImg=uploadResponse.secure_url;

       }
       if(coverImg){
        if(user.coverImg){
            await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
        // Extract the public ID from the URL and delete it from Cloudinary
        }
            const uploadResponse=await cloudinary.uploader.upload(coverImg)
            coverImg=uploadResponse.secure_url;
       }
       user.fullName=fullName || user.fullName;
       user.email=email || user.email;
       user.username=username || user.username;
         user.bio=bio || user.bio;
         user.link=link || user.link;
         user.profileImg=profileImg || user.profileImg;
         user.coverImg=coverImg || user.coverImg;
                 // 🔥 Fix: Mark modified fields to ensure update
        user.markModified("profileImg");
        user.markModified("coverImg");
        user.markModified("bio");
        user.markModified("link");
         user=await user.save();
         user.password=null;
         return res.status(200).json(user);

    } catch (error) {
        console.log("Error in updateUser: ", error.message);
        res.status(500).json({error:error.message});
    }
}

