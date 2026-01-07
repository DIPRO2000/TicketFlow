import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const generateId = () => Math.random().toString(36).substring(2, 15);

export default function EventForm({ event, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    venue: "",
    status: "draft",
    cover_image: "",
    ticket_types: [{ id: generateId(), name: "General Admission", price: 0, quantity: 100, sold: 0 }]
  });

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        date: event.date ? new Date(event.date).toISOString().slice(0, 16) : "",
        ticket_types: event.ticket_types?.length > 0 
          ? event.ticket_types 
          : [{ id: generateId(), name: "General Admission", price: 0, quantity: 100, sold: 0 }]
      });
    }
  }, [event]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTicketTypeChange = (index, field, value) => {
    const newTypes = [...formData.ticket_types];
    newTypes[index] = { ...newTypes[index], [field]: value };
    setFormData(prev => ({ ...prev, ticket_types: newTypes }));
  };

  const addTicketType = () => {
    setFormData(prev => ({
      ...prev,
      ticket_types: [...prev.ticket_types, { id: generateId(), name: "", price: 0, quantity: 0, sold: 0 }]
    }));
  };

  const removeTicketType = (index) => {
    if (formData.ticket_types.length > 1) {
      setFormData(prev => ({
        ...prev,
        ticket_types: prev.ticket_types.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      date: new Date(formData.date).toISOString()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-900">Event Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter event name"
              required
              className="h-11"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date & Time *</Label>
            <Input
              id="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              required
              className="h-11"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="venue">Venue *</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => handleChange("venue", e.target.value)}
              placeholder="Event location"
              required
              className="h-11"
            />
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe your event..."
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cover_image">Cover Image URL</Label>
            <Input
              id="cover_image"
              value={formData.cover_image}
              onChange={(e) => handleChange("cover_image", e.target.value)}
              placeholder="https://..."
              className="h-11"
            />
          </div>
        </div>
      </div>

      {/* Ticket Types */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Ticket Types</h3>
          <Button type="button" variant="outline" size="sm" onClick={addTicketType}>
            <Plus className="w-4 h-4 mr-1" /> Add Type
          </Button>
        </div>
        
        <div className="space-y-4">
          {formData.ticket_types.map((type, index) => (
            <div 
              key={type.id} 
              className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
            >
              <div className="flex-1 space-y-2">
                <Label>Name</Label>
                <Input
                  value={type.name}
                  onChange={(e) => handleTicketTypeChange(index, "name", e.target.value)}
                  placeholder="Ticket type name"
                />
              </div>
              <div className="w-full sm:w-32 space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={type.price}
                  onChange={(e) => handleTicketTypeChange(index, "price", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="w-full sm:w-32 space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={type.quantity}
                  onChange={(e) => handleTicketTypeChange(index, "quantity", parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTicketType(index)}
                  disabled={formData.ticket_types.length === 1}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800">
          {isLoading ? "Saving..." : event ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}