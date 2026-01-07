import Event from "../models/event.js";  // ✅ use capitalized model

import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

// ✅ Create Event
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      organizer,
      organizerID,
      email,
      venue,
      startDate,
      endDate,
      tickets,
      status,
    } = req.body;

    const venueObj = typeof venue === "string" ? JSON.parse(venue) : venue;
    const ticketsArr = typeof tickets === "string" ? JSON.parse(tickets) : tickets;

    let coverImageUrl = null;
    if (req.files?.coverImage) {
      const coverUpload = await uploadBufferToCloudinary(
        req.files.coverImage[0].buffer,
        { folder: `Ticketrise/events/${title}/cover` }
      );
      coverImageUrl = coverUpload.secure_url;
    }

    let galleryUrls = [];
    if (req.files?.gallery) {
      for (const file of req.files.gallery) {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: `Ticketrise/events/${title}/gallery`,
        });
        galleryUrls.push(result.secure_url);
      }
    }

    const newEvent = new Event({
      title,
      description,
      category,
      organizer,
      organizerID,
      email,
      venue: venueObj,
      startDate,
      endDate,
      tickets: ticketsArr || [],
      coverImage: coverImageUrl,
      gallery: galleryUrls,
      status: status || "Draft",
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get All Events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } 
};

// ✅ Get All Events of Org by OrgId
export const getEventsbyOrgId = async (req, res) => {
  try {
    const events = await Event.find({ organizerID: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Single Event
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.EventId);
    if (!event)
      return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Single Event by EventLinkId
export const getEventByEventLinkId = async (req, res) => {
  try {
    const event = await Event.findOne({ eventLinkId: req.params.EventLinkId });
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Update Event
export const updateEvent = async (req, res) => {
  try {
    const updatedData = { ...req.body, updatedAt: Date.now() };

    if (req.files?.coverImage) {
      const coverUpload = await cloudinary.uploader.upload(
        req.files.coverImage[0].path,
        { folder: "events/cover" }
      );
      updatedData.coverImage = coverUpload.secure_url;
    }

    if (req.files?.gallery) {
      let galleryUrls = [];
      for (const file of req.files.gallery) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "events/gallery",
        });
        galleryUrls.push(result.secure_url);
      }
      updatedData.gallery = galleryUrls;
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });

    if (!updatedEvent) return res.status(404).json({ success: false, message: "Event not found" });

    res.json({ success: true, message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
