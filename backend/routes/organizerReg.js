import express from "express";
import { loginOrganizer, registerOrganizer, getOrganizerProfile } from "../controller/organizerController.js";
import { verifyOtp } from "../controller/verifyOrgRegOTP.js";
import { authOrganizerMiddleware } from "../middleware/auth.js";

const router=express.Router();

router.post("/orgregister", registerOrganizer);
router.post("/verify-otp-orgreg", verifyOtp);
router.post("/orglogin", loginOrganizer);
router.get("/organizerProfile", authOrganizerMiddleware , getOrganizerProfile);

export default router;