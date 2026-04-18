import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Search, Filter, Calendar, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import EventCard from "@/components/dashboard/EventCard";
import EventForm from "@/components/forms/EventForm";
import ConfirmDialog from "@/components/modals/ConfirmDialog";

export default function Events() {
  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [cancellingEvent, setCancellingEvent] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);

  const { OrganizerData } = useOutletContext();

  // 1. Fetch Events List
  const fetchEvents = async () => {
    if (!OrganizerData?._id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event/getevents/${OrganizerData._id}`, {
        method: "GET",
        credentials: "include"
      });
      const data = await response.json();
      if (data.success) setEvents(data.events);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [OrganizerData]);

  // 2. Handle Create / Update Submission
  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      const dataToSend = new FormData();
      
      // Basic Fields
      dataToSend.append("title", data.title);
      dataToSend.append("description", data.description);
      dataToSend.append("category", data.category);
      dataToSend.append("organizer", OrganizerData.Orgname);
      dataToSend.append("organizerID", OrganizerData._id);
      dataToSend.append("email", OrganizerData.email);
      dataToSend.append("startDate", data.startDate);
      dataToSend.append("endDate", data.endDate);
      dataToSend.append("status", data.status);

      // JSON Fields
      dataToSend.append("venue", JSON.stringify(data.venue));
      dataToSend.append("tickets", JSON.stringify(data.tickets));

      // Image Fields
      if (data.coverImage instanceof File) {
        dataToSend.append("coverImage", data.coverImage);
      }
      if (data.gallery && data.gallery.length > 0) {
        data.gallery.forEach((file) => {
          if (file instanceof File) {
            dataToSend.append(`gallery`, file);
          }
        });
      }

      // Logic to toggle between Create and Edit
      const url = editingEvent 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/event/update/${editingEvent._id}` 
        : `${import.meta.env.VITE_BACKEND_URL}/api/event/registration`;

      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        body: dataToSend,
        credentials: "include"
      });

      const responseData = await res.json();

      if (res.ok) {
        toast.success(editingEvent ? "Event updated successfully!" : "Event created successfully!");
        setShowForm(false);
        setEditingEvent(null);
        fetchEvents(); // Refresh the list
      } else {
        toast.error(responseData.message || "Failed to save event");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("An error occurred while saving the event");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Cancellation logic
  const handleCancelConfirm = async () => {
    if (!cancellingEvent) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event/cancel/${cancellingEvent._id}`, {
        method: "PATCH",
        credentials: "include"
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Event has been cancelled.");
        setEvents(prev => prev.map(e => e._id === cancellingEvent._id ? { ...e, status: "Cancelled" } : e));
      } else {
        toast.error(data.message || "Failed to cancel event");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setCancellingEvent(null);
    }
  };

  const handleEditRequest = (event) => {
    if (event.status === "Cancelled" || event.status === "Completed") {
      return toast.error(`Cannot edit an event that is already ${event.status.toLowerCase()}.`);
    }
    setEditingEvent(event);
    setShowForm(true);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(search.toLowerCase()) || 
                          event.venue?.city?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events</h1>
          <p className="text-slate-500 mt-1">{events.length} total events</p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800" onClick={() => { setEditingEvent(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Create Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 h-11">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Published">Published</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Event Display */}
      {isLoading && events.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-200 h-72 animate-pulse" />)}
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
          {filteredEvents.map(event => (
            <EventCard 
              key={event._id} 
              event={event} 
              onEdit={handleEditRequest} 
              onCancel={setCancellingEvent} 
            />
          ))}
        </div>
      )}

      {/* Form Sheet */}
      <Sheet open={showForm} onOpenChange={(open) => { if(!open) { setShowForm(false); setEditingEvent(null); } }}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mt-5 px-5">
            <SheetTitle className="text-2xl">{editingEvent ? "Edit Event" : "Create Event"}</SheetTitle>
          </SheetHeader>
          <div className="px-5 py-5">
            <EventForm 
              event={editingEvent} 
              onSubmit={handleSubmit} 
              onCancel={() => { setShowForm(false); setEditingEvent(null); }} 
              isLoading={isLoading} 
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={!!cancellingEvent}
        onOpenChange={() => setCancellingEvent(null)}
        variant="warning"
        title="Cancel Event"
        description={`Warning: Cancelling "${cancellingEvent?.title}" is permanent. You will not be able to edit this event once it is cancelled.`}
        confirmLabel="Confirm Cancellation"
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}