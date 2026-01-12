import Participant from "../models/participant.js";
import Event from "../models/event.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
import { sendToken } from "../utils/sendToken.js";

// when user buys tickets
export const registerParticipant = async (req, res) => {
  try {
    const { eventLinkId, name, email, phone, ticketType, pricePaid } = req.body;

    const event = await Event.findOne({eventLinkId:eventLinkId});
    if (!event)
      return res.status(404).json({ success: false, message: "Event not found" });

    const ticketIndex = event.tickets.findIndex((t) => t.type === ticketType);
    if (ticketIndex === -1)
      return res
        .status(400)
        .json({ success: false, message: "Ticket type not found" });

    const ticket = event.tickets[ticketIndex];
    if (ticket.sold >= ticket.quantity)
      return res
        .status(400)
        .json({ success: false, message: "No tickets available for this type" });
    
    if (ticket.price != pricePaid)
    {
      return res
        .status(400)
        .json({ success: false, message: "Ticket Price is not matched with payed price" });
    }

    // ✅ upload screenshot if present
    let paymentProofUrl = null;
    if (req.file) {
      const upload = await uploadBufferToCloudinary(req.file.buffer, {
        folder: `Ticketrise/events/${event.title}/participants`,
      });
      paymentProofUrl = upload.secure_url;
    }

    // ✅ create participant
    const participant = new Participant({
      eventId: event._id,
      name,
      email,
      phone,
      ticketType,
      pricePaid,
      paymentProof: paymentProofUrl,
    });
    await participant.save();

    // ✅ update event stats
    ticket.sold += 1;
    event.totalTicketsSold += 1;
    event.totalIncome += pricePaid;
    event.updatedAt = new Date();
    await event.save();

    try {
      const token = participant.token;
      await sendToken(email,token,event.title);
    } catch (error) {
      console.log("Failed to send email to the participant:",error);
    }

    res.json({
      success: true,
      message: "Participant registered successfully",
      token: participant.token,
      participant,
    });
  } catch (err) {
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
