import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";

//all imports from routes
import organizerRegRoute from "./routes/organizerReg.js";
import organizerforgotpass from "./routes/organizerForgotpassword.js";
import { verifyToken } from "./middleware/auth.js";
import eventControllerroute from "./routes/EventControllerRoute.js";
import participantcontrollerroute from "./routes/ParticipantRoute.js";

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use("/api",organizerRegRoute);
app.use("/api",organizerforgotpass);
app.use("/api/event",eventControllerroute);
app.use("/api/participant", participantcontrollerroute);

//Test Route
app.get("/",(req,res)=>{
    res.json("Welcome From Server");
})

app.get('/orgtest',verifyToken,(req,res)=>{
    res.status(200).json({ message: "Token Logic Successful " })
})

//Mongodb Connection

const  connectdb = async() => {
    try 
    {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB Connected");
 
    } 
    catch (error) {
        console.log("MongoDb not Connected");
        console.log("Error:",error);
    }
}

connectdb();
 
// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
