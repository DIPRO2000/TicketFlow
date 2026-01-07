import { format } from "date-fns";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TicketRow({ ticket, showEvent = false }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(ticket.code);
    setCopied(true);
    toast.success("Ticket code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
      <td className="py-4 px-6">
        <div className="flex items-center gap-2">
          <code className="font-mono text-sm font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded">
            {ticket.code}
          </code>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={copyCode}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
          </Button>
        </div>
      </td>
      {showEvent && (
        <td className="py-4 px-6 text-sm text-slate-600">
          {ticket.event_name || "—"}
        </td>
      )}
      <td className="py-4 px-6 text-sm text-slate-600">
        {ticket.ticket_type}
      </td>
      <td className="py-4 px-6">
        <div>
          <p className="text-sm font-medium text-slate-900">{ticket.purchaser_name || "—"}</p>
          <p className="text-xs text-slate-500">{ticket.purchaser_email || ""}</p>
        </div>
      </td>
      <td className="py-4 px-6">
        <StatusBadge status={ticket.status} />
      </td>
      <td className="py-4 px-6 text-sm text-slate-500">
        {ticket.created_date ? format(new Date(ticket.created_date), "MMM d, yyyy h:mm a") : "—"}
      </td>
      <td className="py-4 px-6 text-sm text-slate-500">
        {ticket.checked_in_at ? format(new Date(ticket.checked_in_at), "MMM d, h:mm a") : "—"}
      </td>
    </tr>
  );
}