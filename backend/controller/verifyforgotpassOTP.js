import { otpStore } from "./organizerController.js";
import organizer from "../models/organizer.js";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt"
import { forgotOTPstore } from "./forgotpasswordorganizer.js";
import { sendForgotPasswordEmail } from "../utils/sendForgotPasswordEmail.js";

export const verifyforgotpassOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const stored = forgotOTPstore[email];
        if (!stored) return res.status(400).json({ message: "OTP not found or expired" });

        if (Date.now() > stored.expires) {
            delete forgotOTPstore[email];
            return res.status(400).json({ message: "OTP expired" });
        }

        if (parseInt(otp) !== stored.otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const existing = await organizer.findOne({ email });
        if (!existing) return res.status(400).json({ message: "No account with this email found" });

        const temp_password = nanoid(8);
        const hashedPassword = await bcrypt.hash(temp_password, 10);

        await existing.updateOne({ password: hashedPassword });
        console.log(existing);

        await sendForgotPasswordEmail(email, temp_password);

        delete forgotOTPstore[email];

        return res.status(201).json({ message: "New password successfully sent" });

    } catch (err) {
        console.log("Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
