import { Calendar, MapPin, Users, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function EventCard({ event, onEdit, onDelete }) {
  const totalTickets = event.ticket_types?.reduce((sum, t) => sum + (t.quantity || 0), 0) || 0;
  const soldTickets = event.ticket_types?.reduce((sum, t) => sum + (t.sold || 0), 0) || 0;
  const soldPercentage = totalTickets > 0 ? Math.round((soldTickets / totalTickets) * 100) : 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/60 overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50">
      <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200">
        {event.cover_image ? (
          <img 
            src={event.cover_image} 
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-12 h-12 text-slate-300" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge status={event.status} />
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-slate-900 text-lg leading-tight line-clamp-1">
            {event.name}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={createPageUrl("EventDetails") + `?id=${event.id}`}>
                  <Eye className="w-4 h-4 mr-2" /> View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(event)}>
                <Edit className="w-4 h-4 mr-2" /> Edit Event
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(event)}
                className="text-rose-600 focus:text-rose-600"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-slate-500">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{format(new Date(event.date), "MMM d, yyyy · h:mm a")}</span>
          </div>
          <div className="flex items-center text-sm text-slate-500">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-sm text-slate-600">
              <Users className="w-4 h-4 mr-1.5" />
              <span>{soldTickets} / {totalTickets} tickets</span>
            </div>
            <span className="text-sm font-medium text-slate-700">{soldPercentage}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${soldPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}