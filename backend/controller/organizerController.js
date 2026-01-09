// controllers/organizerController.js
import Organizer from "../models/organizer.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { OTPgenerator } from "../utils/OTPgenerator.js";
import { sendOTP } from "../utils/sendOTP.js";


export const otpStore = {}; // Temp in-memory store (use Redis in prod)


// Organizer Registration
export const registerOrganizer = async (req, res) => { 
    const { name, email, username,Orgname, password } = req.body;

    try {
        const existing = await Organizer.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already registered" });

        const existingUserename = await Organizer.findOne({ username });
        if (existingUserename) return res.status(400).json({ message: "Username already exist!! Choose something else" });

        const otp =await OTPgenerator();
        otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000, data: { name, email,username, Orgname, password } };

        await sendOTP(email, otp);

        res.status(200).json({ message: "OTP sent to your email. Please verify to complete registration." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


// Organizer Login
export const loginOrganizer = async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ message: "No email provided" });
    }

    if (!password) {
        return res.status(400).json({ message: "No password provided" });
    }

    try {
        const existingOrganizer = await Organizer.findOne({ email:email });
        //console.log(existingOrganizer);
        if (!existingOrganizer) {
            return res.status(404).json({ message: `Incorrect ${email} provided` });
        }

        const passwordcheck=await bcrypt.compare(password,existingOrganizer.password)

        if (!passwordcheck) {
            return res.status(401).json({ message: "Invalid Password Provided" });
        }

        // Create JWT token
        const payload = {
            id: existingOrganizer._id,
            name: existingOrganizer.name,
            email: existingOrganizer.email
        };

        const token = jwt.sign(payload, process.env.ORGANIZER_JWT_SECRET , {
            expiresIn: "1h"
        });

        res.cookie("organizer_token", token, {
            httpOnly: true,        // JS cannot access it (XSS protection)
            secure: process.env.NODE_ENV === "production", // HTTPS only in prod
            sameSite: "strict",    // CSRF protection
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        return res.status(200).json({
            message: "Login successful",
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};


// Organizer Profile Retrieval(like id,name,email)
export const getOrganizerProfile = async (req,res) => {
    try {
        const organizer = await Organizer.findById(req.user.id).select('-password');
        if (!organizer) {
            return res.status(404).json({ message: "Organizer not found" });
        }

        return res.status(200).json({ organizer });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}