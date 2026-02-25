// routes/event.js
import express from "express";
import { createEvent, getEvents, getEventsbyOrgId, getEventByEventLinkId, getEventById, allTicket } from "../controller/EventController.js";
import { authOrganizerMiddleware } from "../middleware/auth.js";
import upload from "../config/multer.js"; // your memoryStorage multer config

const router = express.Router();

router.post("/registration",upload.fields([{ name: "coverImage", maxCount: 1 },{ name: "gallery", maxCount: 10 }]), authOrganizerMiddleware ,createEvent);
router.get("/getevents",getEvents);
router.get("/getevents/:id", authOrganizerMiddleware ,getEventsbyOrgId);
router.get("/:EventLinkId",getEventByEventLinkId);
router.get("/getDetails/:EventId",getEventById);

router.post("/getalltickets",allTicket)

export default router;
