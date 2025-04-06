import mongoose from "mongoose";
import User from "./user.model.js";

const postSchema=new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    text:{
        type:String,
        required:true,
    },
    img:{
        type:String,
        default:"",
    },
    likes:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            default:[],
        },
    ],
    comments:[
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref:"User",
                required:true,
            },
            text:{
                type:String,
                required:true,
            },
            likes:[
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref:"User",
                    default:[],
                },
            ],
        },
    ],
},{timestamps:true});
const Post=mongoose.model("Post",postSchema);
export default Post;