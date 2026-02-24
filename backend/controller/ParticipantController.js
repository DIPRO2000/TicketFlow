import Participant from "../models/participant.js";
import Event from "../models/event.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
import { sendToken } from "../utils/sendToken.js";

// when user buys tickets
export const registerParticipant = async (req, res) => {
  try {
    const { eventLinkId, name, email, phone, ticketType, quantity, pricePaid } = req.body;
    const qty = Number(quantity) || 1; // Ensure it's a number

    const event = await Event.findOne({ eventLinkId });
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    const ticketIndex = event.tickets.findIndex((t) => t.type === ticketType);
    if (ticketIndex === -1) return res.status(400).json({ success: false, message: "Ticket type not found" });

    const ticket = event.tickets[ticketIndex];

    // ✅ FIX 1: Check if enough quantity remains
    if (ticket.sold + qty > ticket.quantity) {
      return res.status(400).json({ success: false, message: "Not enough tickets available" });
    }

    // ✅ FIX 2: Validate total price (Price * Qty)
    const expectedTotal = ticket.price * qty;
    if (expectedTotal !== Number(pricePaid)) {
      return res.status(400).json({ success: false, message: "Incorrect payment amount" });
    }

    // ✅ Upload screenshot
    let paymentProofUrl = null;
    if (req.file) {
      const upload = await uploadBufferToCloudinary(req.file.buffer, {
        folder: `Ticketrise/events/${event.title}/participants`,
      });
      paymentProofUrl = upload.secure_url;
    }

    const participant = new Participant({
      eventId: event._id,
      name,
      email,
      phone,
      ticketType,
      pricePaid: Number(pricePaid), // Store the full amount paid
      paymentProof: paymentProofUrl,
      quantity: qty
    });
    await participant.save();

    // ✅ Update event stats
    ticket.sold += qty;
    event.totalTicketsSold += qty;
    event.totalIncome += Number(pricePaid); 
    event.updatedAt = new Date();
    await event.save();

    // ✅ Non-blocking Email
    try {
      await sendToken(email, participant.token, event.title);
    } catch (error) {
      console.log("Failed to send email:", error);
    }

    res.json({
      success: true,
      message: "Participant registered successfully",
      token: participant.token,
    });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


//Participant Check-in
export const ParticipantscheckIn = async (req, res) => {
  try {
    const { token } = req.body; // scan or enter code

    const participant = await Participant.findOne({ token });
    if (!participant)
      return res.status(404).json({ success: false, message: "Invalid token" });

    if (participant.used)
      return res
        .status(400)
        .json({ success: false, message: "Ticket already used" });

    participant.used = true;
    await participant.save();

    res.json({ success: true, message: "Check-in successful", participant });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
