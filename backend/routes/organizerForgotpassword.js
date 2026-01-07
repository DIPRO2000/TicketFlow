import express from "express";
import { OrgForgotPass } from "../controller/forgotpasswordorganizer.js";
import { verifyforgotpassOTP } from "../controller/verifyforgotpassOTP.js";


const router=express.Router();

router.post("/forgotpass",OrgForgotPass);
router.post("/verify_forgotpass",verifyforgotpassOTP);

export default router;