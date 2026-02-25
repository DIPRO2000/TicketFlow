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
import { format } from "date-fns";
import StatsCard from "@/components/dashboard/StatsCard";
import EventCard from "@/components/dashboard/EventCard";
import StatusBadge from "@/components/ui/StatusBadge";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { OrganizerData } = useOutletContext();

  // Fetch events
  useEffect(() => {
    const fetchEvents = async() => {
      if (!OrganizerData?._id) {
        return;
      }

      try {
        setEventsLoading(true);
        setError(null);

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event/getevents/${OrganizerData._id}`, {
          method: "GET",
          credentials: "include"
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setEvents(data.events || []);
        } else {
          console.error("Failed to fetch events:", data.message);
          setError(data.message || "Failed to load events");
        }
      } catch (error) {
        console.error("Error fetching Events:", error);
        setError("Failed to connect to server. Please check your connection.");
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, [OrganizerData]);

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      if (!OrganizerData?._id) {
        return;
      }

      try {
        setTicketsLoading(true);
        setError(null);

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event/getalltickets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            organizerID: OrganizerData._id
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setTickets(data.tickets || []);
        } else {
          console.error('Failed to fetch tickets:', data.message);
          // Don't set error for tickets failing - just show empty
          setTickets([]);
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
        // Don't set error for tickets failing - just show empty
        setTickets([]);
      } finally {
        setTicketsLoading(false);
        setLoading(false);
      }
    };

    fetchTickets();
  }, [OrganizerData]);

  // Calculate stats with proper number parsing
  const calculateStats = () => {
    const totalEvents = events.length;
    const ticketsSold = tickets.length;
    const checkedIn = tickets.filter(t => 
      t.status === "used" || t.status === "checked_in" || t.isFullyUsed
    ).length;
    
    // Parse price correctly - handle different possible field names
    const revenue = tickets.reduce((sum, t) => {
      const price = parseFloat(t.pricePaid || t.price || t.amount || 0);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    return {
      totalEvents,
      ticketsSold,
      checkedIn,
      revenue
    };
  };

  const stats = calculateStats();
  const recentEvents = events.slice(0, 3);
  const recentTickets = tickets.slice(0, 5);

  // Loading state
  if (loading && eventsLoading && ticketsLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-600">Loading your dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-red-50 rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="mx-auto"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome back! Here's your overview for {OrganizerData?.name || 'your events'}.
          </p>
        </div>
        <Link to="/Events?create=true">
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4 mr-2" /> Create Event
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Events"
          value={stats.totalEvents}
          icon={Calendar}
          subtitle={stats.totalEvents === 1 ? 'Event' : 'Events'}
          loading={eventsLoading}
        />
        <StatsCard
          title="Tickets Sold"
          value={stats.ticketsSold.toLocaleString()}
          icon={Ticket}
          trend={stats.ticketsSold > 0 ? { positive: true, value: "+", label: "total sales" } : undefined}
          loading={ticketsLoading}
        />
        <StatsCard
          title="Checked In"
          value={stats.checkedIn.toLocaleString()}
          icon={UserCheck}
          subtitle={stats.ticketsSold > 0 
            ? `${((stats.checkedIn / stats.ticketsSold) * 100).toFixed(1)}% attendance`
            : 'No tickets sold'
          }
          loading={ticketsLoading}
        />
        <StatsCard
          title="Revenue"
          value={`₹${stats.revenue.toLocaleString('en-IN')}`}
          icon={TrendingUp}
          trend={stats.revenue > 0 ? { positive: true, value: "₹", label: "total" } : undefined}
          loading={ticketsLoading}
        />
      </div>

      {/* Recent Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Events</h2>
          {events.length > 3 && (
            <Link to="/events" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center font-medium">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>
        
        {eventsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse p-4">
                <div className="h-32 bg-slate-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : recentEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentEvents.map(event => (
              <EventCard key={event._id || event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">No events yet</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              Create your first event to start selling tickets and tracking attendance
            </p>
            <Link to="/Events?create=true">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Create Your First Event
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Recent Tickets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Tickets</h2>
          {tickets.length > 5 && (
            <Link to="/tickets" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center font-medium">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {ticketsLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : recentTickets.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentTickets.map(ticket => (
                <div key={ticket._id || ticket.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-50 p-2 rounded-lg">
                        <Ticket className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <code className="font-mono text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          {ticket.token || ticket.code}
                        </code>
                        <p className="text-sm font-medium text-slate-900 mt-1">
                          {ticket.name || ticket.purchaser_name || "Anonymous"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-14 sm:ml-0">
                      <span className="text-sm text-slate-600">
                        {ticket.ticketType || ticket.ticket_type}
                      </span>
                      <StatusBadge status={ticket.isFullyUsed ? 'used' : (ticket.status || 'valid')} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">No tickets yet</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Tickets will appear here once attendees start registering for your events
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}