import mongoose from "mongoose";

// A small helper to generate random codes (you can also use uuid)
const generateToken = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase(); // e.g. "X4H9PQ"
};

const participantSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },

  // Info about the person filling the form
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  
  phone: String,

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
    default: generateToken, // automatically generated on create
  },

  // new field for screenshot/payment image URL
  paymentProof: {
    type: String,
  },

  // Total tickets bought in this transaction
  quantity: {
    type: Number,
    required: true,
    default: 1, //
  },

  // Track how many people have already entered using this token
  checkedInCount: {
    type: Number,
    default: 0, //
  },

  // to check if the group is fully checked in
  isFullyUsed: {
    type: Boolean,
    default: false, //
  },

  purchasedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Participant", participantSchema);
