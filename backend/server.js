import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

//all imports from routes
import organizerRegRoute from "./routes/organizerReg.js";
import organizerforgotpass from "./routes/organizerForgotpassword.js";
import eventControllerroute from "./routes/EventControllerRoute.js";
import participantcontrollerroute from "./routes/ParticipantRoute.js";

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Routes
app.use("/api",organizerRegRoute);
app.use("/api",organizerforgotpass);
app.use("/api/event",eventControllerroute);
app.use("/api/participant", participantcontrollerroute);

//Test Route
app.get("/",(req,res)=>{
    res.json("Welcome From Server");
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
