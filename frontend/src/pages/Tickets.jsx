import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Filter, 
  Download, 
  Ticket,
  Calendar
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TicketRow from "@/components/tickets/TicketRow";

export default function Tickets() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => base44.entities.Ticket.list("-created_date", 500)
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: () => base44.entities.Event.list("-created_date", 100)
  });

  // Create event lookup
  const eventMap = events.reduce((acc, event) => {
    acc[event.id] = event;
    return acc;
  }, {});

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.code?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.purchaser_name?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.purchaser_email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesEvent = eventFilter === "all" || ticket.event_id === eventFilter;
    return matchesSearch && matchesStatus && matchesEvent;
  }).map(ticket => ({
    ...ticket,
    event_name: eventMap[ticket.event_id]?.name
  }));

  const stats = {
    total: tickets.length,
    valid: tickets.filter(t => t.status === "valid").length,
    used: tickets.filter(t => t.status === "used").length,
    invalid: tickets.filter(t => t.status === "invalid").length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tickets</h1>
          <p className="text-slate-500 mt-1">{tickets.length} total tickets across all events</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export All
        </Button>
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
          <p className="text-sm text-slate-500">Invalid</p>
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
            <SelectValue placeholder="Event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map(event => (
              <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
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
        {ticketsLoading ? (
          <div className="p-8 animate-pulse">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-slate-100 rounded" />
              ))}
            </div>
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Code</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Event</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Type</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Purchaser</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Purchased</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Checked In</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(ticket => (
                  <TicketRow key={ticket.id} ticket={ticket} showEvent />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-medium text-slate-900 mb-2">No tickets found</h3>
            <p className="text-slate-500 text-sm">
              {search || statusFilter !== "all" || eventFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Tickets will appear here once created"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}