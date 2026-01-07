import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Calendar, 
  Ticket, 
  UserCheck, 
  TrendingUp, 
  Plus,
  ArrowRight,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import StatsCard from "@/components/dashboard/StatsCard";
import EventCard from "@/components/dashboard/EventCard";
import StatusBadge from "@/components/ui/StatusBadge";

export default function Dashboard() {
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => base44.entities.Event.list("-created_date", 50)
  });

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => base44.entities.Ticket.list("-created_date", 100)
  });

  const stats = {
    totalEvents: events.length,
    ticketsSold: tickets.length,
    checkedIn: tickets.filter(t => t.status === "used").length,
    revenue: tickets.reduce((sum, t) => sum + (t.price || 0), 0)
  };

  const recentEvents = events.slice(0, 3);
  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's your overview.</p>
        </div>
        <Link to={createPageUrl("Events") + "?create=true"}>
          <Button className="bg-slate-900 hover:bg-slate-800">
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
          subtitle="Active campaigns"
        />
        <StatsCard
          title="Tickets Sold"
          value={stats.ticketsSold.toLocaleString()}
          icon={Ticket}
          trend={{ positive: true, value: "12%", label: "vs last month" }}
        />
        <StatsCard
          title="Checked In"
          value={stats.checkedIn.toLocaleString()}
          icon={UserCheck}
          subtitle={`${((stats.checkedIn / stats.ticketsSold) * 100 || 0).toFixed(1)}% attendance`}
        />
        <StatsCard
          title="Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ positive: true, value: "8%", label: "vs last month" }}
        />
      </div>

      {/* Recent Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Events</h2>
          <Link to={createPageUrl("Events")} className="text-sm text-slate-600 hover:text-slate-900 flex items-center">
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        {eventsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-72 animate-pulse" />
            ))}
          </div>
        ) : recentEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-medium text-slate-900 mb-2">No events yet</h3>
            <p className="text-slate-500 text-sm mb-4">Create your first event to get started</p>
            <Link to={createPageUrl("Events") + "?create=true"}>
              <Button className="bg-slate-900 hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" /> Create Event
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Recent Tickets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Tickets</h2>
          <Link to={createPageUrl("Tickets")} className="text-sm text-slate-600 hover:text-slate-900 flex items-center">
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {ticketsLoading ? (
            <div className="p-8 animate-pulse">
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-slate-100 rounded" />
                ))}
              </div>
            </div>
          ) : recentTickets.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentTickets.map(ticket => (
                <div key={ticket.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <code className="font-mono text-sm font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded">
                        {ticket.code}
                      </code>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{ticket.purchaser_name || "Anonymous"}</p>
                        <p className="text-xs text-slate-500">{ticket.ticket_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={ticket.status} />
                      <span className="text-sm text-slate-500 flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {format(new Date(ticket.created_date), "MMM d")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-medium text-slate-900 mb-2">No tickets yet</h3>
              <p className="text-slate-500 text-sm">Tickets will appear here once sold</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}