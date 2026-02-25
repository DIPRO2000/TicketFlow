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
      organizerID: event.organizerID,
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

//Ticket Verify
export const TicketVerify = async(req,res) => {
  try {
    const { eventId,  token } = req.body;

    const participants = await Participant.findOne({ eventId:eventId , token:token });
    if (!participants)
    {
      return res.status(404).json({ message: "No Ticket found"});
    }

    res.status(200).json({ status:"Success", message: "Verified" , participants});
  } 
  catch (error) {
    return res.status(500).json({ success: false, message: error.message});
  }
}


//Participant Check-in
export const ParticipantscheckIn = async (req, res) => {
  try {
    const { participantId, eventId, count } = req.body;

    // Validate input
    if (!participantId || !eventId || !count) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: participantId, eventId, and count are required" 
      });
    }

    if (count <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Count must be greater than 0" 
      });
    }

    const participant = await Participant.findById(participantId);
    
    if (!participant) {
      return res.status(404).json({ 
        success: false, 
        message: "Participant not found" 
      });
    }

    // Verify the participant belongs to the correct event
    if (participant.eventId.toString() !== eventId) {
      return res.status(400).json({ 
        success: false, 
        message: "Participant does not belong to this event" 
      });
    }

    if (participant.isFullyUsed) {
      return res.status(400).json({ 
        success: false, 
        message: "Ticket already fully used", 
        participant 
      });
    }

    const remainingEntries = participant.quantity - participant.checkedInCount;
    
    if (count > remainingEntries) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot check in ${count} users. Only ${remainingEntries} entries remaining`,
        participant 
      });
    }

    // Update checked in count
    participant.checkedInCount = participant.checkedInCount + count;
    
    // Check if fully used
    if (participant.checkedInCount >= participant.quantity) {
      participant.isFullyUsed = true;
      participant.checkedInCount = participant.quantity; // Ensure it doesn't exceed
    }
    
    await participant.save();

    return res.json({ 
      success: true, 
      message: `Check-in successful for ${count} user(s)`, 
      participant: {
        _id: participant._id,
        name: participant.name,
        token: participant.token,
        checkedInCount: participant.checkedInCount,
        quantity: participant.quantity,
        isFullyUsed: participant.isFullyUsed,
        remainingEntries: participant.quantity - participant.checkedInCount
      }
    });

  } catch (err) {
    console.error("Check-in error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during check-in",
      error: err.message 
    });
  }
};
