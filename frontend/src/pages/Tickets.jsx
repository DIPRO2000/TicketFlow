import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Download, 
  Ticket,
  Calendar,
  Loader2,
  AlertCircle,
  Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TicketRow from "@/components/tickets/TicketRow";
import { format } from "date-fns";
import * as XLSX from "xlsx"; // Ensure you have installed xlsx
import { toast } from "sonner";

export default function Tickets() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { OrganizerData } = useOutletContext();

  // 1. Fetch Events for lookup
  useEffect(() => {
    const fetchEvents = async () => {
      if (!OrganizerData?._id) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event/getevents/${OrganizerData._id}`, {
          method: "GET",
          credentials: "include"
        });
        const data = await response.json();
        if (data.success) setEvents(data.events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, [OrganizerData]);

  // 2. Fetch Tickets
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
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ organizerID: OrganizerData._id })
        });
        const data = await response.json();

        if (response.ok && data.success) {
          const processedTickets = (data.tickets || []).map(ticket => ({
            ...ticket,
            id: ticket._id,
            code: ticket.token,
            purchaser_name: ticket.name,
            purchaser_email: ticket.email,
            ticket_type: ticket.ticketType,
            status: ticket.isFullyUsed ? 'used' : 'valid',
            created_date: ticket.purchasedAt,
            checked_in_at: ticket.lastCheckedInAt, // Updated to use history field
            event_id: ticket.eventId
          }));
          setTickets(processedTickets);
        } else {
          setError(data.message || 'Failed to load tickets');
        }
      } catch (err) {
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [OrganizerData]);

  const eventMap = events.reduce((acc, event) => {
    acc[event._id] = event;
    return acc;
  }, {});

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
      event_name: eventMap[ticket.event_id]?.title || 'Unknown Event',
      event: eventMap[ticket.event_id]
    }));

  // FIXED STATS: Calculation based on Quantity and History
  const stats = {
    totalTickets: tickets.length, // Total transactions
    totalQuantity: tickets.reduce((sum, t) => sum + (t.quantity || 0), 0), // Total people
    checkedInPeople: tickets.reduce((sum, t) => sum + (t.checkedInCount || 0), 0),
    fullyUsed: tickets.filter(t => t.isFullyUsed).length
  };

  const handleExport = () => {
    if (filteredTickets.length === 0) return toast.error("Nothing to export");

    const exportData = filteredTickets.map(t => ({
      "Token": t.code,
      "Event": t.event_name,
      "Purchaser": t.purchaser_name,
      "Email": t.purchaser_email,
      "Phone": t.phone || "N/A",
      "Type": t.ticket_type,
      "Qty": t.quantity,
      "Checked In": t.checkedInCount,
      "Total Paid": `₹${t.pricePaid}`,
      "Status": t.status.toUpperCase(),
      "Purchase Date": format(new Date(t.created_date), 'yyyy-MM-dd HH:mm'),
      "Last Entry": t.checked_in_at ? format(new Date(t.checked_in_at), 'yyyy-MM-dd HH:mm') : "Never"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
    XLSX.writeFile(workbook, `TicketFlow_Export_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    toast.success("Excel exported successfully");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-600">Syncing ticket records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tickets & Attendees</h1>
          <p className="text-slate-500 mt-1">
            Managing {stats.totalQuantity} total guests across {events.length} events
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={filteredTickets.length === 0}>
          <Download className="w-4 h-4 mr-2" /> Export Excel
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total People</p>
          <p className="text-2xl font-bold text-slate-900">{stats.totalQuantity}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total Checked In</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.checkedInPeople}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Attendance Rate</p>
          <p className="text-2xl font-bold text-indigo-600">
            {stats.totalQuantity > 0 ? ((stats.checkedInPeople / stats.totalQuantity) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Tickets Used</p>
          <p className="text-2xl font-bold text-slate-900">{stats.fullyUsed} / {stats.totalTickets}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search token, name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map(event => (
              <SelectItem key={event._id} value={event._id}>{event.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="valid">Valid (Active)</SelectItem>
            <SelectItem value="used">Fully Used</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {filteredTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase py-4 px-6">EventId</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase py-4 px-6">Purchaser</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase py-4 px-6">Event</th>
                  <th className="text-center text-xs font-bold text-slate-500 uppercase py-4 px-6">Qty</th>
                  <th className="text-center text-xs font-bold text-slate-500 uppercase py-4 px-6">Usage</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase py-4 px-6">Last Entry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map(ticket => (
                  <TicketRow 
                    key={ticket.id} 
                    ticket={ticket} 
                    showEvent={eventFilter === "all"} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No ticket records found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}