import express from "express";
import upload from "../config/multer.js";
import {registerParticipant,TicketVerify,ParticipantscheckIn} from "../controller/ParticipantController.js";
import { authOrganizerMiddleware } from "../middleware/auth.js"

const router=express.Router()

router.post("/register-participant",upload.single("paymentProof"), registerParticipant);
router.post("/verify-ticket",authOrganizerMiddleware,TicketVerify);
router.post("/checkin-ticket",authOrganizerMiddleware,ParticipantscheckIn);


export default router;
