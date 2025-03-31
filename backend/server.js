import express, { urlencoded } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import authRoutes from "./routes/authroutes.js";
import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();
const app=express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT=process.env.PORT ||8000;
console.log(process.env.MONGO_URI);


app.use("/api/auth", authRoutes);

app.listen(8000, ()=>{
    console.log(`Server is runnin on port ${PORT}`);
    connectMongoDB
});