import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { 
  Calendar, 
  Ticket, 
  UserCheck, 
  TrendingUp, 
  Plus,
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import StatsCard from "@/components/dashboard/StatsCard";
import EventCard from "@/components/dashboard/EventCard";
import EventForm from "@/components/forms/EventForm";
import ConfirmDialog from "@/components/modals/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit/Cancel States
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [cancellingEvent, setCancellingEvent] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { OrganizerData } = useOutletContext();

  // 1. Fetch events
  const fetchEvents = async() => {
    if (!OrganizerData?._id) return;
    try {
      setEventsLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event/getevents/${OrganizerData._id}`, {
        method: "GET",
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching Events:", error);
      setError("Failed to connect to server.");
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [OrganizerData]);

  // 2. Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      if (!OrganizerData?._id) return;
      try {
        setTicketsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event/getalltickets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ organizerID: OrganizerData._id })
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setTickets(data.tickets || []);
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
      } finally {
        setTicketsLoading(false);
        setLoading(false);
      }
    };
    fetchTickets();
  }, [OrganizerData]);

  // 3. Handle Edit Submission
  const handleUpdateSubmit = async (data) => {
    setIsActionLoading(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append("title", data.title);
      dataToSend.append("description", data.description);
      dataToSend.append("category", data.category);
      dataToSend.append("startDate", data.startDate);
      dataToSend.append("endDate", data.endDate);
      dataToSend.append("status", data.status);
      dataToSend.append("venue", JSON.stringify(data.venue));
      dataToSend.append("tickets", JSON.stringify(data.tickets));

      if (data.coverImage instanceof File) dataToSend.append("coverImage", data.coverImage);
      if (data.gallery) {
        data.gallery.forEach(file => { if (file instanceof File) dataToSend.append("gallery", file); });
      }

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event/update/${editingEvent._id}`, {
        method: "PUT",
        body: dataToSend,
        credentials: "include"
      });

      if (res.ok) {
        toast.success("Event updated successfully!");
        setShowForm(false);
        setEditingEvent(null);
        fetchEvents();
      }
    } catch (error) {
      toast.error("Failed to update event");
    } finally {
      setIsActionLoading(false);
    }
  };

  // 4. Handle Cancel Confirm
  const handleCancelConfirm = async () => {
    if (!cancellingEvent) return;
    try {
      setIsActionLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event/cancel/${cancellingEvent._id}`, {
        method: "PATCH",
        credentials: "include"
      });
      if (res.ok) {
        toast.success("Event cancelled successfully");
        setEvents(prev => prev.map(e => e._id === cancellingEvent._id ? { ...e, status: "Cancelled" } : e));
      }
    } catch (error) {
      toast.error("Error cancelling event");
    } finally {
      setCancellingEvent(null);
      setIsActionLoading(false);
    }
  };

  const handleEditRequest = (event) => {
    if (event.status === "Cancelled" || event.status === "Completed") {
      return toast.error(`Cannot edit a ${event.status.toLowerCase()} event.`);
    }
    setEditingEvent(event);
    setShowForm(true);
  };

  const calculateStats = () => {
    const totalEvents = events.length;
    const ticketsSold = tickets.length;
    const checkedIn = tickets.filter(t => t.isFullyUsed || t.checkedInCount > 0).length;
    const revenue = tickets.reduce((sum, t) => sum + (parseFloat(t.pricePaid || 0)), 0);

    return { totalEvents, ticketsSold, checkedIn, revenue };
  };

  const stats = calculateStats();
  const recentEvents = events.slice(0, 3);
  const recentTickets = tickets.slice(0, 5);

  if (loading && eventsLoading && ticketsLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {OrganizerData?.Orgname || 'Organizer'}!</p>
        </div>
        <Link to="/Events?create=true">
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
            <Plus className="w-4 h-4 mr-2" /> Create Event
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Events" value={stats.totalEvents} icon={Calendar} loading={eventsLoading} />
        <StatsCard title="Tickets Sold" value={stats.ticketsSold} icon={Ticket} loading={ticketsLoading} />
        <StatsCard title="Checked In" value={stats.checkedIn} icon={UserCheck} loading={ticketsLoading} />
        <StatsCard title="Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} icon={TrendingUp} loading={ticketsLoading} />
      </div>

      {/* Recent Events Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Events</h2>
          <Link to="/events" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center font-medium">
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentEvents.map(event => (
            <EventCard 
              key={event._id} 
              event={event} 
              onEdit={handleEditRequest}
              onCancel={setCancellingEvent}
            />
          ))}
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Tickets</h2>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {recentTickets.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentTickets.map(ticket => (
                <div key={ticket._id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-50 p-2 rounded-lg"><Ticket className="w-5 h-5 text-indigo-600" /></div>
                      <div>
                        <code className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{ticket.token}</code>
                        <p className="text-sm font-medium text-slate-900 mt-1">{ticket.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-14 sm:ml-0">
                      <span className="text-sm text-slate-600">{ticket.ticketType}</span>
                      <StatusBadge status={ticket.isFullyUsed ? 'used' : 'valid'} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center text-slate-500">No tickets sold yet.</div>
          )}
        </div>
      </div>

      {/* Modals & Forms */}
      <Sheet open={showForm} onOpenChange={(open) => { if(!open) { setShowForm(false); setEditingEvent(null); } }}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mt-5 px-5">
            <SheetTitle className="text-2xl">Edit Event</SheetTitle>
          </SheetHeader>
          <div className="px-5 py-5">
            <EventForm 
              event={editingEvent} 
              onSubmit={handleUpdateSubmit} 
              onCancel={() => setShowForm(false)} 
              isLoading={isActionLoading} 
              organizerDetails={OrganizerData}
            />
          </div>
        </SheetContent>
      </Sheet>

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