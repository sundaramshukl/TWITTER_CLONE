
import Post from "../models/post.model.js";
import {v2 as cloudinary} from "cloudinary";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const  createPost =async (req,res)=>{
    try {
        const {text}= req.body;
        let {img}= req.body;
        const userId=req.user.userId.toString();
        const user=await User.findById(userId);
        if(!user) return res.status(404).json({message:"User not found"});
        if(!text && !img){
            return res.status(400).json({error: "Post must have text or image"});
        }
        if(img){
            const uploadResponse=await cloudinary.uploader.upload(img);
            img=uploadResponse.secure_url;
        }
        const newPost=new Post({
            user : userId,
            text: text,
            img
        })
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({error: "Interval server error"});
        console.log("Error in createPost: ", error.message);
    }
}
export const  likeunlikePost =async (req,res)=>{
    try {
        const userId=req.user.userId.toString();
        const postId=req.params.id;
        const post =await Post.findById(postId);
        if(!post) return res.status(404).json({message:"Post not found"});
        const isLiked=post.likes.includes(userId);
        if(isLiked){
         //unlike the post 
         await Post.updateOne({_id: postId},{$pull:{likes: userId}});
         await User.updateOne({_id: userId},{$pull:{likedPosts: postId}});
         res.status(200).json({message:"Post unliked successfully"});
          
        }else{
            //like the post
            post.likes.push(userId);
            await User.updateOne({_id: userId},{$push:{likedPosts: postId}});
            await post.save();
           
            const notification=new Notification({
                from:userId,
                to:post.user,
                post:postId,
                type:"like",
            });
            await notification.save();
            res.status(200).json({message:"Post liked successfully"});
        }
        
    } catch (error) {
        console.log("Error in likeunlikePost: ", error.message);
        res.status(500).json({error:"Internal server error"});
        
    }
}
export const  commentOnPost =async (req,res)=>{
    try {
        const {text}= req.body;
        const postId=req.params.id;
        const userId=req.user.userId.toString();
        const post=await Post.findById(postId);
        if(!post) return res.status(404).json({message:"Post not found"});
        if(!text){
            return res.status(400).json({error: "Comment cannot be empty"});
        }
        post.comments.push({
            user:userId,
            text:text
        })
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        console.log("Error in commentOnPost: ", error.message);
        res.status(500).json({error:"Internal server error"});
    }
}
export const  deletePost =async (req,res)=>{
    try {
        const post =await Post.findById(req.params.id);
        if(!post) return res.status(404).json({error:"Post not found"});

        if(post.user.toString() !== req.user.userId.toString()){
            return res.status(403).json({error:"You are not authorized to delete this post"});
        }
        if(post.img){
            //delete from cloudinary
            const publicId=post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
        }
        await Post.findByIdAndDelete(req.params.id);
        //delete from user posts array
        res.status(200).json({message:"Post deleted successfully"});

    } catch (error) {
        console.log("Error in deletePost: ", error.message);
        res.status(500).json({error:"Internal server error"});
    }
}

export const  getAllPosts =async (req,res)=>{
    try {
        const posts=await Post.find()
        .sort({createdAt:-1})
        .populate({path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        })
        if(posts.length===0) return res.status(200).json([]);
        else{
            return res.status(200).json(posts);
        }
    } catch (error) {
        console.log("Error in getAllPosts: ", error.message);
        res.status(500).json({error:"Internal server error"});
    }
}
export const getLikedPosts = async (req, res) => {

    const userId=req.params.id;
    try {
        const user=await User.findById(userId);
        if(!user) return res.status(404).json({message:"User not found"});
        const LikedPosts=await Post.find({_id:{$in:user.likedPosts}}).
        populate({path: "user",
            select: "-password",
        })
        .populate({path:"comments.user",
            select:"-password",
        });
        res.status(200).json(LikedPosts);
    } catch (error) {
        console.log("Error in getLikedPosts: ", error.message);
    }

}
export const getFollowingPosts = async (req, res) => {
    const userId=req.user.userId;
    try{
    const user=await User.findById(userId);
    if(!user) return res.status(404).json({message:"User not found"});
    const following= user.following;
    const feedPosts=await Post.find({user:{$in:following}})
    .sort({createdAt: -1}).
    populate({path: "user",
        select: "-password",
    })
    .populate({path:"comments.user",
        select:"-password",
    });
    res.status(200).json(feedPosts);
}
catch(error){
    console.log("Error in getFollowingPosts: ", error.message);
    res.status(500).json({error:"Internal server error"});
    
}

}

export const getUserPosts = async (req, res) => {
try{
    const {username} = req.params;
    const user=await User.findOne({username});
    if(!user) return res.status(404).json({message:"User not found"});
    const posts=await Post.find({user:user._id})
    .sort({createdAt: -1}).
    populate({path: "user",
        select: "-password",
    })
    .populate({path:"comments.user",
        select:"-password",
    });
    res.status(200).json(posts);

}
catch(error){
    console.log("Error in getUserPosts: ", error.message);
    res.status(500).json({error:"Internal server error"});
}
}