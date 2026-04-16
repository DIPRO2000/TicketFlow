import express from "express";
import { loginOrganizer, registerOrganizer, getOrganizerProfile,OrgNameChanging } from "../controller/organizerController.js";
import { verifyOtp } from "../controller/verifyOrgRegOTP.js";
import { authOrganizerMiddleware } from "../middleware/auth.js";

const router=express.Router();

router.post("/orgregister", registerOrganizer);
router.post("/verify-otp-orgreg", verifyOtp);
router.post("/orglogin", loginOrganizer);
router.get("/organizerProfile", authOrganizerMiddleware , getOrganizerProfile);
router.put("/update/orgname", authOrganizerMiddleware, OrgNameChanging)

export default router;