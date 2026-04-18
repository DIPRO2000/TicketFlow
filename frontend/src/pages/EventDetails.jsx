import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Edit, 
  Ticket, 
  Users,
  Copy,
  Check,
  Download,
  Search,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import StatusBadge from "@/components/ui/StatusBadge";
import TicketRow from "@/components/tickets/TicketRow";
import EventForm from "@/components/forms/EventForm";

export default function EventDetails() {
  const [showEditForm, setShowEditForm] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [events, setEvents] = useState(null);
  const [tickets, setTickets] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");

  // Determine if the event is in a terminal state (Locked)
  const isLocked = events?.status === "Cancelled" || events?.status === "Completed";

  const fetchEventDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event/getDetails/${eventId}`, {
        method: "GET",
        credentials: "include"
      });
      const data = await response.json();
      if (data.success) {
        setEvents(data.event);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    const fetchTickets = async () => {
      setTicketsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event/getallticketsofevent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId: eventId }),
          credentials: "include"
        });
        const data = await response.json();
        if (data.success) {
          setTickets(data.tickets || []);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setTicketsLoading(false);
      }
    };
    if (eventId) fetchTickets();
  }, [eventId]);

  const handleCopy = async () => {
    const publicLink = `${import.meta.env.VITE_FRONTEND_URL}/link/${events.eventLinkId}`;
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  const handleEditClick = () => {
    if (isLocked) {
      toast.error(`Cannot edit an event that is already ${events.status.toLowerCase()}.`);
      return;
    }
    setShowEditForm(true);
  };

  // FIXED: Added handleUpdateSubmit to call the PUT API
  const handleUpdateSubmit = async (formData) => {
    setIsUpdating(true);
    try {
      const dataToSend = new FormData();
      
      // Append basic fields
      dataToSend.append("title", formData.title);
      dataToSend.append("description", formData.description);
      dataToSend.append("category", formData.category);
      dataToSend.append("startDate", formData.startDate);
      dataToSend.append("endDate", formData.endDate);
      dataToSend.append("status", formData.status);
      dataToSend.append("venue", JSON.stringify(formData.venue));
      dataToSend.append("tickets", JSON.stringify(formData.tickets));

      // Append files only if they are new File instances
      if (formData.coverImage instanceof File) {
        dataToSend.append("coverImage", formData.coverImage);
      }
      if (formData.gallery && Array.isArray(formData.gallery)) {
        formData.gallery.forEach((file) => {
          if (file instanceof File) dataToSend.append("gallery", file);
        });
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event/update/${eventId}`, {
        method: "PUT",
        body: dataToSend,
        credentials: "include"
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Event updated successfully!");
        setShowEditForm(false);
        fetchEventDetails(); // Refresh the page data
      } else {
        toast.error(result.message || "Failed to update event");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("An error occurred during update");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.token?.toLowerCase().includes(search.toLowerCase()) ||
    ticket.name?.toLowerCase().includes(search.toLowerCase()) ||
    ticket.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading && !events) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!events) return <div className="p-10 text-center">Event not found.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/events">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{events.title}</h1>
            <StatusBadge status={events.status} />
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleEditClick}
          className={cn(isLocked && "opacity-50 cursor-not-allowed bg-slate-50")}
        >
          <Edit className="w-4 h-4 mr-2" /> Edit
        </Button>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="h-48 bg-slate-100 relative">
          {events.coverImage && <img src={events.coverImage} className="w-full h-full object-cover" />}
          {isLocked && (
            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center">
               <span className="bg-white/90 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-slate-900 shadow-sm border border-slate-200">
                 Event {events.status}
               </span>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-500 flex items-center gap-1"><Calendar className="w-4 h-4"/> Date</p>
              <p className="font-medium">{format(new Date(events.startDate), "MMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="w-4 h-4"/> Venue</p>
              <p className="font-medium text-slate-900 line-clamp-1">{events.venue.city}, {events.venue.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 flex items-center gap-1"><Ticket className="w-4 h-4"/> Sold</p>
              <p className="font-medium">{events.totalTicketsSold} Tickets</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Public Link</p>
              {events.status === "Published" ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-blue-600 truncate max-w-[120px]">
                    {import.meta.env.VITE_FRONTEND_URL}/link/{events.eventLinkId}
                  </span>
                  <Button size="icon" variant="ghost" className="h-7 w-7 border" onClick={handleCopy}>
                    {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic mt-1 font-medium">Link available when published</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">Tickets ({tickets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Ticket Availability</h3>
            <div className="grid gap-4">
              {events.tickets?.map((type, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-slate-900">{type.type}</h4>
                    <p className="text-sm text-slate-500">{type.sold} / {type.quantity} Sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">₹{type.price}</p>
                    <div className="w-32 h-1.5 bg-slate-200 rounded-full mt-2">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          events.status === "Cancelled" ? "bg-slate-400" : "bg-slate-900"
                        )}
                        style={{ width: `${(type.sold / type.quantity) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="mt-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search by name, email or token..." 
                  className="pl-10" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
            </div>
            
            {ticketsLoading ? (
               <div className="p-10 text-center text-slate-500">Loading tickets...</div>
            ) : filteredTickets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-4 border-b border-slate-100">Token</th>
                      <th className="p-4 border-b border-slate-100">Type</th>
                      <th className="p-4 border-b border-slate-100">Purchaser</th>
                      <th className="p-4 border-b border-slate-100 text-center">Qty</th>
                      <th className="p-4 border-b border-slate-100">Price</th>
                      <th className="p-4 border-b border-slate-100">Usage</th>
                      <th className="p-4 border-b border-slate-100">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(ticket => (
                      <tr key={ticket._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-mono font-medium text-slate-900 text-sm">{ticket.token}</td>
                        <td className="p-4 text-slate-600 text-sm">{ticket.ticketType}</td>
                        <td className="p-4">
                          <div className="text-sm font-medium text-slate-900">{ticket.name}</div>
                          <div className="text-xs text-slate-500">{ticket.email}</div>
                        </td>
                        <td className="p-4 text-slate-600 text-sm text-center">{ticket.quantity}</td>
                        <td className="p-4 text-slate-900 text-sm font-medium">₹{ticket.pricePaid}</td>
                        <td className="p-4">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                            ticket.isFullyUsed ? "bg-slate-100 text-slate-500" : "bg-green-100 text-green-700"
                          )}>
                            {ticket.checkedInCount}/{ticket.quantity} In
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 text-sm">
                          {format(new Date(ticket.purchasedAt), "MMM d, HH:mm")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">No tickets found for this event.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Edit Sheet */}
      <Sheet open={showEditForm} onOpenChange={(open) => {
          if(!open) setShowEditForm(false);
      }}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mt-5 px-5">
            <SheetTitle className="text-2xl">Edit Event</SheetTitle>
          </SheetHeader>
          <div className="px-5 py-5">
            <EventForm
              event={events}
              onSubmit={handleUpdateSubmit}
              onCancel={() => setShowEditForm(false)}
              isLoading={isUpdating}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}