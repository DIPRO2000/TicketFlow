import express from "express";
import upload from "../config/multer.js";
import {registerParticipant,ParticipantscheckIn} from "../controller/ParticipantController.js";

const router=express.Router()

router.post("/register-participant",upload.single("paymentProof"), registerParticipant);

export default router;
