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


export const ParticipantscheckIn = async (req, res) => {
  try {
    const { participantId, eventId } = req.body;
    // Ensure count is a valid number
    const count = parseInt(req.body.count);

    // 1. Basic Validation
    if (!participantId || !eventId || isNaN(count) || count <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing or invalid fields: participantId, eventId, and a positive count are required" 
      });
    }

    // 2. Fetch the current state of the participant
    const participant = await Participant.findById(participantId);
    
    if (!participant) {
      return res.status(404).json({ success: false, message: "Participant not found" });
    }

    // 3. Security: Verify Event Match
    if (participant.eventId.toString() !== eventId) {
      return res.status(403).json({ 
        success: false, 
        message: "Access Denied: This ticket is not registered for this event" 
      });
    }

    // 4. Check Availability
    const remainingEntries = participant.quantity - participant.checkedInCount;
    
    if (participant.isFullyUsed || remainingEntries <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Ticket already fully used",
        remainingEntries: 0
      });
    }

    if (count > remainingEntries) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${remainingEntries} entries remaining on this ticket.`,
        remainingEntries
      });
    }

    // 5. Atomic Update
    // We use findByIdAndUpdate with $inc and $push to ensure data consistency
    const newTotalCheckedIn = participant.checkedInCount + count;
    const fullyUsed = newTotalCheckedIn >= participant.quantity;

    const updatedParticipant = await Participant.findByIdAndUpdate(
      participantId,
      {
        $inc: { checkedInCount: count },
        $set: { 
          isFullyUsed: fullyUsed,
          lastCheckedInAt: new Date() 
        },
        $push: { 
          checkInHistory: { 
            timestamp: new Date(), 
            count: count 
          } 
        }
      },
      { new: true, runValidators: true }
    );

    return res.json({ 
      success: true, 
      message: `Successfully checked in ${count} user(s)`, 
      participant: {
        _id: updatedParticipant._id,
        name: updatedParticipant.name,
        token: updatedParticipant.token,
        checkedInCount: updatedParticipant.checkedInCount,
        quantity: updatedParticipant.quantity,
        isFullyUsed: updatedParticipant.isFullyUsed,
        remainingEntries: updatedParticipant.quantity - updatedParticipant.checkedInCount,
        history: updatedParticipant.checkInHistory
      }
    });

  } catch (err) {
    console.error("Check-in error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during check-in processing",
      error: err.message 
    });
  }
};
