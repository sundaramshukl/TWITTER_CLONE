import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js'; // Ensure correct import
import { getUserProfile, followUnfollowUser, getSuggestedUsers, updateUser } from '../controllers/user.controller.js';

const router=express.Router();
router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.patch("/update", protectRoute, updateUser);

export default router;