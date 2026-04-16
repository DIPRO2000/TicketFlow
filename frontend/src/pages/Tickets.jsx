import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Download, 
  Ticket,
  Calendar,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TicketRow from "@/components/tickets/TicketRow";
import { format } from "date-fns";

export default function Tickets() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { OrganizerData } = useOutletContext();

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      if (!OrganizerData?._id) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/event/getevents/${OrganizerData._id}`,
          {
            method: "GET",
            credentials: "include"
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setEvents(data.events || []);
        } else {
          console.error("Failed to fetch events:", data.message);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [OrganizerData]);

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      if (!OrganizerData?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
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
          // Process tickets to ensure consistent field names
          const processedTickets = (data.tickets || []).map(ticket => ({
            ...ticket,
            id: ticket._id || ticket.id,
            code: ticket.token || ticket.code,
            purchaser_name: ticket.name || ticket.purchaser_name,
            purchaser_email: ticket.email || ticket.purchaser_email,
            ticket_type: ticket.ticketType || ticket.ticket_type,
            status: ticket.isFullyUsed ? 'used' : (ticket.status || 'valid'),
            created_date: ticket.purchasedAt || ticket.created_date,
            checked_in_at: ticket.checkedInAt || ticket.checked_in_at,
            event_id: ticket.eventId || ticket.event_id
          }));
          
          setTickets(processedTickets);
        } else {
          console.error('Failed to fetch tickets:', data.message);
          setError(data.message || 'Failed to load tickets');
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [OrganizerData]);

  // Create event lookup map
  const eventMap = events.reduce((acc, event) => {
    acc[event._id || event.id] = event;
    return acc;
  }, {});

  // Filter tickets
  const filteredTickets = tickets
    .filter(ticket => {
      const matchesSearch = 
        ticket.code?.toLowerCase().includes(search.toLowerCase()) ||
        ticket.purchaser_name?.toLowerCase().includes(search.toLowerCase()) ||
        ticket.purchaser_email?.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchesEvent = eventFilter === "all" || ticket.event_id === eventFilter;
      
      return matchesSearch && matchesStatus && matchesEvent;
    })
    .map(ticket => ({
      ...ticket,
      event_name: eventMap[ticket.event_id]?.name || eventMap[ticket.event_id]?.title || 'Unknown Event',
      event: eventMap[ticket.event_id] // Add full event object for TicketRow
    }));

  // Calculate stats
  const stats = {
    total: tickets.length,
    valid: tickets.filter(t => t.status === "valid").length,
    used: tickets.filter(t => t.status === "used" || t.isFullyUsed).length,
    invalid: tickets.filter(t => t.status === "invalid" || t.status === "refunded").length
  };

  // Export tickets as CSV
  const handleExport = () => {
    const headers = ['Id', 'Event', 'Type', 'Purchaser Name', 'Email', 'Status', 'Purchased Date', 'Checked In'];
    const csvData = filteredTickets.map(t => [
      t.id,
      t.event_name,
      t.ticket_type,
      t.purchaser_name,
      t.purchaser_email,
      t.status,
      t.created_date ? format(new Date(t.created_date), 'yyyy-MM-dd HH:mm') : '',
      t.checked_in_at ? format(new Date(t.checked_in_at), 'yyyy-MM-dd HH:mm') : ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-600">Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-red-50 rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to load tickets</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tickets</h1>
          <p className="text-slate-500 mt-1">
            {tickets.length} total ticket{tickets.length !== 1 ? 's' : ''} across {events.length} event{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        {tickets.length > 0 && (
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Valid</p>
          <p className="text-2xl font-semibold text-emerald-600">{stats.valid}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Used</p>
          <p className="text-2xl font-semibold text-slate-600">{stats.used}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Invalid/Refunded</p>
          <p className="text-2xl font-semibold text-rose-600">{stats.invalid}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by code, name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-full sm:w-48 h-11">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map(event => (
              <SelectItem key={event._id || event.id} value={event._id || event.id}>
                {event.name || event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 h-11">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="valid">Valid</SelectItem>
            <SelectItem value="used">Used</SelectItem>
            <SelectItem value="invalid">Invalid</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filteredTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Id</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Event</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Type</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Purchaser</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Purchased</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Checked In</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map(ticket => (
                  <TicketRow 
                    key={ticket.id || ticket._id} 
                    ticket={ticket} 
                    showEvent={eventFilter === "all"} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-medium text-slate-900 mb-2">No tickets found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              {search || statusFilter !== "all" || eventFilter !== "all"
                ? "Try adjusting your search or filters to see more results"
                : tickets.length === 0
                ? "No tickets have been created yet. Tickets will appear here once attendees register for your events."
                : "No tickets match your current filters"
              }
            </p>
            {(search || statusFilter !== "all" || eventFilter !== "all") && (
              <Button 
                variant="link" 
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setEventFilter("all");
                }}
                className="mt-2"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer with count */}
      {filteredTickets.length > 0 && (
        <div className="text-sm text-slate-500 text-center">
          Showing {filteredTickets.length} of {tickets.length} tickets
          {(search || statusFilter !== "all" || eventFilter !== "all") && (
            <Button 
              variant="link" 
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setEventFilter("all");
              }}
              className="ml-2 text-sm"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}