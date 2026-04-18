import mongoose from "mongoose";

// Helper to generate unique codes
const generateToken = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase(); // e.g. "X4H9PQ"
};

const participantSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },

  organizerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organizer", // Fixed: Should refer to Organizer model
    required: true
  },

  // Info about the person filling the form
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  
  phone: {
    type: String,
    required: true,
  },

  // Which ticket they bought
  ticketType: {
    type: String, // VIP, Regular, Student
    required: true,
  },
  pricePaid: {
    type: Number,
    required: true,
  },

  // Unique code/token for check-in
  token: {
    type: String,
    unique: true,
    default: generateToken,
  },

  paymentProof: {
    type: String,
  },

  // Total tickets bought in this transaction
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },

  // Track how many people have already entered using this token
  checkedInCount: {
    type: Number,
    default: 0,
  },

  // Logic flag for "Access Denied" once full
  isFullyUsed: {
    type: Boolean,
    default: false,
  },

  purchasedAt: {
    type: Date,
    default: Date.now,
  },

  // UPDATED: Check-in History Logic
  // Stores a list of every time a part of the group entered
  checkInHistory: [
    {
      timestamp: { type: Date, default: Date.now },
      count: { type: Number, required: true },
    }
  ],

  // Keep this for quick "Last Entry" reference if you want
  lastCheckedInAt: {
    type: Date,
    default: null,
  }
});

export default mongoose.model("Participant", participantSchema);