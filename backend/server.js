import express, { urlencoded } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js"
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";
import cors from "cors";
dotenv.config();
cloudinary.config({});
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app=express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const PORT=process.env.PORT ||8000;
//console.log(process.env.MONGO_URI);


app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/posts", postRoute);

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectMongoDB(); // Ensure the database connects when server starts
});