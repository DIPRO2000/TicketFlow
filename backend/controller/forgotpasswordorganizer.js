import mongoose from "mongoose";
import Organizer from "../models/organizer.js";
import { OTPgenerator } from "../utils/OTPgenerator.js";
import { verifyforgotpassOTP } from "./verifyforgotpassOTP.js";
import { forgotpassOTP } from "../utils/forgotpassOTP.js";

export const forgotOTPstore={}

export const OrgForgotPass = async(req,res) => {
    const {email}=req.body;

    if(!email )
    {
        res.status(400).json({ message:"No email provided " });
    }

    try 
    {
        const existing=await Organizer.findOne({ email });
        if(!existing) res.status(401).json({ message:`No Organizer Account found for this email` });

        const otp=await OTPgenerator();
        const password=existing.password
        forgotOTPstore[email]={otp , expires:Date.now() + 5 * 60 * 1000}

        await forgotpassOTP(email, otp);

        res.status(200).json({ message: "OTP sent to your email. Please verify to complete forgot password process." });
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }

}