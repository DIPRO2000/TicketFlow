import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const generateId = () => Math.random().toString(36).substring(2, 15);

export default function EventForm({ event, onSubmit, onCancel, isLoading, organizerDetails }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    email: organizerDetails?.email || "",
    organizer: organizerDetails?.Orgname || "",
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
    coverImage: null, 
    gallery: [],   
    tickets: [{ id: generateId(), type: "General Admission", price: 0, quantity: 100, sold: 0 }]
  });

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        // Ensure category is a string and handle potential undefined
        category: event.category ? String(event.category) : "", 
        startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
        endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
        venue: event.venue || formData.venue,
        status: event.status || "Draft",
        tickets: event.tickets?.length > 0 ? event.tickets : formData.tickets
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
    <form onSubmit={handleSubmit} className="space-y-8 pb-10">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Event Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input id="title" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            {/* FIX: We add 'key={formData.category}' 
              This forces the Select component to update its internal display 
              when the state changes from "" to "Sports" during editing.
            */}
            <Select 
              key={formData.category || "new"}
              value={formData.category} 
              onValueChange={(val) => handleChange("category", val)}
            >
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
            <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input id="startDate" type="datetime-local" value={formData.startDate} onChange={(e) => handleChange("startDate", e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date *</Label>
            <Input id="endDate" type="datetime-local" value={formData.endDate} onChange={(e) => handleChange("endDate", e.target.value)} required />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} required rows={4} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Venue Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input placeholder="Venue Name" value={formData.venue.name} onChange={(e) => handleVenueChange("name", e.target.value)} required />
          <Input placeholder="Address" value={formData.venue.address} onChange={(e) => handleVenueChange("address", e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="City" value={formData.venue.city} onChange={(e) => handleVenueChange("city", e.target.value)} required />
            <Input placeholder="Pincode" value={formData.venue.pincode} onChange={(e) => handleVenueChange("pincode", e.target.value)} required />
          </div>
          
          {/* Status Select also gets a key for sync */}
          <Select 
            key={formData.status || "draft-key"}
            value={formData.status} 
            onValueChange={(val) => handleChange("status", val)}
          >
            <SelectTrigger className="h-11"><SelectValue placeholder="Draft" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Tickets</h3>
        {formData.tickets.map((t, index) => (
          <div key={t.id || index} className="flex gap-4 p-4 bg-slate-50 rounded-xl border">
            <Input className="flex-1" placeholder="Type" value={t.type} onChange={(e) => handleTicketChange(index, "type", e.target.value)} required />
            <Input className="w-24" type="number" placeholder="Price" value={t.price} onChange={(e) => handleTicketChange(index, "price", e.target.value)} required />
            <Input className="w-24" type="number" placeholder="Qty" value={t.quantity} onChange={(e) => handleTicketChange(index, "quantity", e.target.value)} required />
            <Button type="button" variant="ghost" onClick={() => removeTicketType(index)} disabled={formData.tickets.length === 1}><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addTicketType}><Plus className="w-4 h-4 mr-1" /> Add Ticket Type</Button>
      </div>

      <div className="space-y-4">
        <Label>Images</Label>
        <Input type="file" onChange={(e) => handleChange("coverImage", e.target.files[0])} />
        <Input type="file" multiple onChange={(e) => handleChange("gallery", Array.from(e.target.files))} />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="bg-slate-900 text-white">
          {isLoading ? "Saving..." : event ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}