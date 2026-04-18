import Event from "../models/event.js";  // ✅ use capitalized model
import participant from "../models/participant.js";

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

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    console.log("Error:",error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Update Event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      venue,
      startDate,
      endDate,
      tickets,
      status,
    } = req.body;

    // 1. Find the existing event first
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // 2. Prepare the update object
    const updateData = {
      title,
      description,
      category,
      startDate,
      endDate,
      status,
      updatedAt: Date.now(),
    };

    // Parse JSON strings from FormData
    if (venue) updateData.venue = typeof venue === "string" ? JSON.parse(venue) : venue;
    if (tickets) updateData.tickets = typeof tickets === "string" ? JSON.parse(tickets) : tickets;

    // 3. Handle Cover Image Update
    if (req.files?.coverImage) {
      const coverUpload = await uploadBufferToCloudinary(
        req.files.coverImage[0].buffer,
        { folder: `Ticketrise/events/${title || existingEvent.title}/cover` }
      );
      updateData.coverImage = coverUpload.secure_url;
    }

    // 4. Handle Gallery Images Update 
    // (Note: This logic replaces the gallery. If you want to append, use $push or spread)
    if (req.files?.gallery) {
      let newGalleryUrls = [];
      for (const file of req.files.gallery) {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: `Ticketrise/events/${title || existingEvent.title}/gallery`,
        });
        newGalleryUrls.push(result.secure_url);
      }
      updateData.gallery = newGalleryUrls;
    }

    // 5. Update in Database
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
    
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get All Events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    return res.json({ success: true, events });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  } 
};

// ✅ Get All Events of Org by OrgId
export const getEventsbyOrgId = async (req, res) => {
  try {
    const events = await Event.find({ organizerID: req.params.id }).sort({ createdAt: -1 });
    return res.json({ success: true, events });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Single Event
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.EventId);
    if (!event)
      return res.status(404).json({ success: false, message: "Event not found" });
    return res.json({ success: true, event });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Single Event by EventLinkId
export const getEventByEventLinkId = async (req, res) => {
  try {
    const event = await Event.findOne({ eventLinkId: req.params.EventLinkId });
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    return res.json({ success: true, event });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Cancel Event
export const cancelEvent = async (req, res) => {
  try {
    // We update the status to "Cancelled" instead of deleting the document
    const cancelledEvent = await Event.findByIdAndUpdate(
      req.params.id, 
      { status: "Cancelled" }, 
      { new: true } // Returns the updated document
    );

    if (!cancelledEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.json({ 
      success: true, 
      message: "Event cancelled successfully", 
      event: cancelledEvent 
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get all Tickets for all Events of an Organizer
export const allTicket = async (req,res) => {

  const { organizerID } = req.body
  try {
    if (!organizerID)
    {
      return res.status(400).json({success: false, message: "OrganizerId not provided"});
    }

    const tickets = await participant.find({ organizerID: organizerID});
    if (tickets == null || tickets.length == 0)
    {
      return res.status(404).json({ success:false, message: "No Ticket found yet or bought"});
    }

    return res.status(200).json({success:true, message: "All Tickets found Successfully", tickets});
  } 
  catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Get all Tickets for a specific Event
export const allTicketsofanEvent = async (req, res) => { 
  const { eventId } = req.body;

  try {
    if (!eventId) {
      return res.status(400).json({ success: false, message: "EventId not provided" });
    }

    const tickets = await participant.find({ eventId: eventId });

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ success: false, message: "No Ticket found yet or bought" });
    }

    return res.status(200).json({
      success: true, 
      message: `All Tickets found Successfully for the event`, 
      tickets
    });

  } catch (error) {
    if (res.headersSent) return;
    return res.status(500).json({ success: false, error: error.message });
  }
}