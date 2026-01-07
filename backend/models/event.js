import mongoose from "mongoose";
import { customAlphabet } from "nanoid"; // npm i nanoid

// nanoid with letters+numbers (8 chars)
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);

const ticketSchema = new mongoose.Schema({
  type: {
    type: String, // e.g., "VIP", "Regular", "Student"
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number, // total available tickets of this type
    required: true,
  },
  sold: {
    type: Number,
    default: 0,
  },
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String, // e.g., "Concert", "Sports", "Theater", "Conference"
    required: true,
  },
  organizer: {
    type: String,
    required: true,
  },
  organizerID: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  venue: {
    name: String,
    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  tickets: [ticketSchema],

  coverImage: {
    type: String, // URL of banner/cover image
  },
  gallery: [String], // Additional images

  status: {
    type: String,
    enum: ["Draft", "Published", "Cancelled", "Completed"],
    default: "Draft",
  },

  // ✅ new fields
  eventLinkId: {
    type: String,
    unique: true,
    index: true,
  },

  totalTicketsSold: {
    type: Number,
    default: 0,
  },

  totalIncome: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

// ✅ Auto-generate eventLinkId before saving if missing
eventSchema.pre("save", function (next) {
  if (!this.eventLinkId) {
    this.eventLinkId = nanoid();
  }

  // compute totals from tickets array
  if (this.tickets && this.tickets.length > 0) {
    let soldCount = 0;
    let income = 0;
    this.tickets.forEach((t) => {
      soldCount += t.sold;
      income += t.sold * t.price;
    });
    this.totalTicketsSold = soldCount;
    this.totalIncome = income;
  } else {
    this.totalTicketsSold = 0;
    this.totalIncome = 0;
  }

  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Event", eventSchema);
