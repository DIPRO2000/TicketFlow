import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2,
  Copy,
  Check,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import StatusBadge from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

export default function TicketView() {
  const [copied, setCopied] = useState(false);
  
  const params = new URLSearchParams(window.location.search);
  const ticketCode = params.get("code");

  const { data: ticket, isLoading: ticketLoading } = useQuery({
    queryKey: ["ticket", ticketCode],
    queryFn: () => base44.entities.Ticket.filter({ code: ticketCode }),
    enabled: !!ticketCode,
    select: (data) => data[0]
  });

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ["event", ticket?.event_id],
    queryFn: () => base44.entities.Event.filter({ id: ticket.event_id }),
    enabled: !!ticket?.event_id,
    select: (data) => data[0]
  });

  const copyCode = () => {
    navigator.clipboard.writeText(ticket.code);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isLoading = ticketLoading || eventLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="animate-pulse w-full max-w-md">
          <div className="bg-white rounded-3xl h-[600px]" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Ticket className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Ticket Not Found</h1>
          <p className="text-slate-500">The ticket you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Ticket Card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
          {/* Event Image/Header */}
          <div className="h-40 bg-gradient-to-br from-slate-900 to-slate-700 relative">
            {event?.cover_image && (
              <img 
                src={event.cover_image} 
                alt={event.name}
                className="w-full h-full object-cover opacity-50"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Ticket className="w-12 h-12 text-white/80 mx-auto mb-2" />
                <p className="text-white/80 text-sm font-medium">E-TICKET</p>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <StatusBadge status={ticket.status} className="bg-white/90" />
            </div>
          </div>

          {/* Event Details */}
          <div className="p-6 border-b border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              {event?.name || "Event"}
            </h1>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-600">
                <Calendar className="w-5 h-5 text-slate-400" />
                <span>
                  {event?.date 
                    ? format(new Date(event.date), "EEEE, MMMM d, yyyy")
                    : "Date TBD"
                  }
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Clock className="w-5 h-5 text-slate-400" />
                <span>
                  {event?.date 
                    ? format(new Date(event.date), "h:mm a")
                    : "Time TBD"
                  }
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <MapPin className="w-5 h-5 text-slate-400" />
                <span>{event?.venue || "Venue TBD"}</span>
              </div>
            </div>
          </div>

          {/* Ticket Code */}
          <div className="p-6 bg-slate-50">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Your Ticket Code
            </p>
            <div className="flex items-center justify-between bg-white rounded-xl border-2 border-dashed border-slate-200 p-4">
              <code className="text-3xl font-mono font-bold text-slate-900 tracking-wider">
                {ticket.code}
              </code>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={copyCode}
                className="h-10 w-10"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Copy className="w-5 h-5 text-slate-400" />
                )}
              </Button>
            </div>

            {/* QR Code Placeholder */}
            <div className="mt-4 p-6 bg-white rounded-xl border border-slate-200 flex flex-col items-center">
              <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                <QrCode className="w-16 h-16 text-slate-300" />
              </div>
              <p className="text-xs text-slate-500 text-center">
                Present this code at the entrance
              </p>
            </div>

            {/* Ticket Info */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500">Ticket Type</p>
                <p className="font-medium text-slate-900">{ticket.ticket_type}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500">Price</p>
                <p className="font-medium text-slate-900">${ticket.price || 0}</p>
              </div>
            </div>

            {ticket.purchaser_name && (
              <div className="mt-4 bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-500">Ticket Holder</p>
                <p className="font-medium text-slate-900">{ticket.purchaser_name}</p>
                {ticket.purchaser_email && (
                  <p className="text-sm text-slate-500">{ticket.purchaser_email}</p>
                )}
              </div>
            )}

            {ticket.status === "used" && ticket.checked_in_at && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">Checked In</p>
                  <p className="text-xs text-emerald-600">
                    {format(new Date(ticket.checked_in_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Powered by TicketFlow
        </p>
      </div>
    </div>
  );
}