import { format } from "date-fns";
import { Clock } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

export default function TicketRow({ ticket, showEvent = false }) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
      {/* Event ID Column - Replaces Token */}
      <td className="py-4 px-6">
        <code className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
          {ticket.eventId || "—"} 
        </code>
      </td>

      {/* Purchaser Info */}
      <td className="py-4 px-6">
        <div>
          <p className="text-sm font-bold text-slate-900">{ticket.purchaser_name || "—"}</p>
          <p className="text-xs text-slate-500 font-medium">{ticket.purchaser_email || ""}</p>
        </div>
      </td>

      {/* Event Name (Conditional) */}
      {showEvent && (
        <td className="py-4 px-6 text-sm font-medium text-slate-600 max-w-[200px] truncate">
          {ticket.event_name || "—"}
        </td>
      )}

      {/* Quantity Column */}
      <td className="py-4 px-6 text-center">
        <span className="text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
          {ticket.quantity}
        </span>
      </td>

      {/* Usage/Check-in Progress */}
      <td className="py-4 px-6 text-center">
        <div className="flex flex-col items-center gap-1">
          <span className={cn(
            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight",
            ticket.isFullyUsed 
              ? "bg-slate-100 text-slate-500 border border-slate-200" 
              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
          )}>
            {ticket.checkedInCount} / {ticket.quantity} In
          </span>
          {/* Progress bar */}
          <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                ticket.isFullyUsed ? "bg-slate-400" : "bg-emerald-500"
              )}
              style={{ width: `${(ticket.checkedInCount / ticket.quantity) * 100}%` }}
            />
          </div>
        </div>
      </td>

      {/* Last Entry Time */}
      <td className="py-4 px-6">
        {ticket.checked_in_at ? (
          <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            {format(new Date(ticket.checked_in_at), "MMM d, HH:mm")}
          </div>
        ) : (
          <span className="text-slate-300 italic text-[11px] font-medium">Not scanned</span>
        )}
      </td>
    </tr>
  );
}