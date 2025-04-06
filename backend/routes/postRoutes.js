import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { createPost, likeunlikePost, commentOnPost, deletePost,getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts } from '../controllers/post.controller.js';

const router = express.Router();

router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeunlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);
router.get("/all", protectRoute, getAllPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/following", protectRoute, getFollowingPosts); // Assuming this is for getting posts from followed users
router.get("/user/:username", protectRoute, getUserPosts); // Assuming this is for getting posts from a specific user
export default router;