import { otpStore } from "./organizerController.js";
import organizer from "../models/organizer.js";
import bcrypt from "bcrypt"

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const val=email;

    try {
        
        const stored = otpStore[val];
        if (!stored) return res.status(400).json({ message: "OTP not found or expired" });

        if (Date.now() > stored.expires) {
            delete otpStore[val];
            return res.status(400).json({ message: "OTP expired" });  
        }

        if (parseInt(otp) !== stored.otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const { name, email, username, Orgname, password } = stored.data;
        const hashedpassword=await bcrypt.hash(password,10);

        const Organizer = new organizer({ name, email, username, Orgname, password:hashedpassword });
        await Organizer.save();

        delete otpStore[email];
        res.status(201).json({ message: "Organizer registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
        console.log("Error:",err);
    }
};
