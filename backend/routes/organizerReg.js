import express from "express";
import { loginOrganizer, registerOrganizer } from "../controller/organizerController.js";
import { verifyOtp } from "../controller/verifyOrgRegOTP.js";

const router=express.Router();

router.post("/orgregister", registerOrganizer);
router.post("/verify-otp-orgreg", verifyOtp);
router.post("/orglogin", loginOrganizer);

export default router;