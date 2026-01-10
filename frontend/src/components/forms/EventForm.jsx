import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const generateId = () => Math.random().toString(36).substring(2, 15);

export default function EventForm({ event, onSubmit, onCancel, isLoading, organizerDetails }) {
  // aligned with Mongoose Schema
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    email: organizerDetails?.email || "",
    organizer: organizerDetails?.name || "",
    organizerID: organizerDetails?._id || "",
    startDate: "",
    endDate: "",
    venue: {
      name: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
    },
    status: "Draft",
    coverImage: "",
    tickets: [{ id: generateId(), type: "General Admission", price: 0, quantity: 100, sold: 0 }]
  });

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
        endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
        venue: event.venue || formData.venue,
        tickets: event.tickets?.length > 0 
          ? event.tickets 
          : formData.tickets
      });
    }
  }, [event]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVenueChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      venue: { ...prev.venue, [field]: value }
    }));
  };

  const handleTicketChange = (index, field, value) => {
    const newTickets = [...formData.tickets];
    newTickets[index] = { ...newTickets[index], [field]: value };
    setFormData(prev => ({ ...prev, tickets: newTickets }));
  };

  const addTicketType = () => {
    setFormData(prev => ({
      ...prev,
      tickets: [...prev.tickets, { id: generateId(), type: "", price: 0, quantity: 0, sold: 0 }]
    }));
  };

  const removeTicketType = (index) => {
    if (formData.tickets.length > 1) {
      setFormData(prev => ({
        ...prev,
        tickets: prev.tickets.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-900">Event Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Tech Summit 2026"
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(val) => handleChange("category", val)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Concert">Concert</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Theater">Theater</SelectItem>
                <SelectItem value="Conference">Conference</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Organizer Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="contact@organizer.com"
              required
              className="h-11"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date & Time *</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date & Time *</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              required
              className="h-11"
            />
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe your event..."
              rows={4}
              required
            />
          </div>
        </div>
      </div>

      {/* Venue Info */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-900">Venue Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Venue Name *</Label>
            <Input
              value={formData.venue.name}
              onChange={(e) => handleVenueChange("name", e.target.value)}
              placeholder="Grand Ballroom"
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label>Address *</Label>
            <Input
              value={formData.venue.address}
              onChange={(e) => handleVenueChange("address", e.target.value)}
              placeholder="123 Street Name"
              required
              className="h-11"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  value={formData.venue.city}
                  onChange={(e) => handleVenueChange("city", e.target.value)}
                  placeholder="Kolkata"
                  required
                />
             </div>
             <div className="space-y-2">
                <Label>Pincode *</Label>
                <Input
                  value={formData.venue.pincode}
                  onChange={(e) => handleVenueChange("pincode", e.target.value)}
                  placeholder="700001"
                  required
                />
             </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Event Status</Label>
            <Select value={formData.status} onValueChange={(val) => handleChange("status", val)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Draft" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Ticket Types */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Ticket Categories</h3>
          <Button type="button" variant="outline" size="sm" onClick={addTicketType}>
            <Plus className="w-4 h-4 mr-1" /> Add Ticket Type
          </Button>
        </div>
        
        <div className="space-y-4">
          {formData.tickets.map((t, index) => (
            <div 
              key={t.id} 
              className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
            >
              <div className="flex-1 space-y-2">
                <Label>Type Name (e.g. VIP)</Label>
                <Input
                  value={t.type}
                  onChange={(e) => handleTicketChange(index, "type", e.target.value)}
                  placeholder="Ticket type"
                  required
                />
              </div>
              <div className="w-full sm:w-32 space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  min="0"
                  value={t.price}
                  onChange={(e) => handleTicketChange(index, "price", parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="w-full sm:w-32 space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={t.quantity}
                  onChange={(e) => handleTicketChange(index, "quantity", parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTicketType(index)}
                  disabled={formData.tickets.length === 1}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <Label htmlFor="coverImage">Cover Image URL</Label>
        <Input
          id="coverImage"
          value={formData.coverImage}
          onChange={(e) => handleChange("coverImage", e.target.value)}
          placeholder="https://cloudinary.com/your-image.jpg"
          className="h-11"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800 text-white px-8">
          {isLoading ? "Saving..." : event ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}