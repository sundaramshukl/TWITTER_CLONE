import express, { urlencoded } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import authRoutes from "./routes/authroutes.js";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app=express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const PORT=process.env.PORT ||8000;
//console.log(process.env.MONGO_URI);


app.use("/api/auth", authRoutes);

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectMongoDB(); // Ensure the database connects when server starts
});