import { useState,useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Plus,
  Download,
  Search,
  Import
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import StatusBadge from "@/components/ui/StatusBadge";
import TicketRow from "@/components/tickets/TicketRow";
import EventForm from "@/components/forms/EventForm";

const generateTicketCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function EventDetails() {
  const [showEditForm, setShowEditForm] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [events, setEvents] = useState(null);
  const [eventLoading,seteventLoading]=useState(false);
  const [isLoading,setIsLoading]=useState(false);
  
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      // Reset the "Copied" icon back to "Copy" after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  useEffect(() => {
    // Fetch events from backend API
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event/getDetails/${eventId}`,{
          method : "GET",
          credentials : "include"
        });
        const data = await response.json();
        console.log(data)

        if (data.success) {
          setEvents(data.event);
        } else {
          console.error("Failed to fetch events:", data.message);
        }
      } 
      catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [eventId]);

  useEffect(()=>{
    console.log(events);
  },[events]);

  // const { data: event, isLoading: eventLoading } = useQuery({
  //   queryKey: ["event", eventId],
  //   queryFn: () => base44.entities.Event.filter({ id: eventId }),
  //   enabled: !!eventId,
  //   select: (data) => data[0]
  // });

  // const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
  //   queryKey: ["tickets", eventId],
  //   queryFn: () => base44.entities.Ticket.filter({ event_id: eventId }, "-created_date", 500),
  //   enabled: !!eventId
  // });

  const updateMutation = ({
    // mutationFn: (data) => base44.entities.Event.update(eventId, data),
    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    //   setShowEditForm(false);
    //   toast.success("Event updated successfully!");
    // }
  });

  const createTicketMutation = ({
    // mutationFn: (data) => base44.entities.Ticket.create(data),
    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: ["tickets", eventId] });
    //   toast.success("Ticket generated successfully!");
    // }
  });

  const generateTickets = async (ticketType, count = 1) => {
    for (let i = 0; i < count; i++) {
      await createTicketMutation.mutateAsync({
        code: generateTicketCode(),
        event_id: eventId,
        ticket_type: ticketType.name,
        price: ticketType.price,
        status: "valid"
      });
    }
  };

  // const filteredTickets = tickets.filter(ticket => 
  //   ticket.code?.toLowerCase().includes(search.toLowerCase()) ||
  //   ticket.purchaser_name?.toLowerCase().includes(search.toLowerCase()) ||
  //   ticket.purchaser_email?.toLowerCase().includes(search.toLowerCase())
  // );
  const filteredTickets =[]

  // const totalTickets = event?.ticket_types?.reduce((sum, t) => sum + (t.quantity || 0), 0) || 0;
  // const soldTickets = tickets.length;
  // const checkedIn = tickets.filter(t => t.status === "used").length;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (events == null) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Event not found</h2>
        <Link to={("Events")}>
          <Button variant="outline">Back to Events</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={("Events")}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{events.title}</h1>
            <StatusBadge status={events.status} />
          </div>
        </div>
        <Button variant="outline" onClick={() => setShowEditForm(true)}>
          <Edit className="w-4 h-4 mr-2" /> Edit
        </Button>
      </div>

      {/* Event Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative">
          {events.cover_image && (
            <img 
              src={events.cover_image} 
              alt={events.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Date & Time</p>
                <p className="font-medium text-slate-900">
                  {format(new Date(events.startDate), "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-sm text-slate-600">
                  {format(new Date(events.startDate), "h:mm a")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <MapPin className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Venue</p>
                <p className="font-medium text-slate-900">{events.venue.name}{" "}{events.venue.address}{","}{events.venue.city}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Attendance</p>
                {/* <p className="font-medium text-slate-900">
                  {checkedIn} / {soldTickets} checked in
                </p>
                <p className="text-sm text-slate-600">
                  {((checkedIn / soldTickets) * 100 || 0).toFixed(1)}% attendance rate
                </p> */}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Public Link</p>
                {/* <p className="font-medium text-slate-900">
                  {checkedIn} / {soldTickets} checked in
                </p> */}
                <p className="text-sm text-slate-600">
                  {`${import.meta.env.VITE_FRONTEND_URL}/${events.eventLinkId}`}
                </p>
                <button
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-slate-100 rounded-md transition-colors border border-slate-200"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
          {events.description && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-slate-600">{events.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* <TabsList className="bg-slate-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">Tickets ({tickets.length})</TabsTrigger>
        </TabsList> */}

        {/* <TabsContent value="overview" className="mt-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Ticket Types</h3>
            <div className="space-y-4">
              {events.ticket_types?.map((type, index) => {
                const typeTickets = tickets.filter(t => t.ticket_type === type.name);
                const sold = typeTickets.length;
                const available = type.quantity - sold;
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-slate-900">{type.name}</h4>
                        <span className="text-lg font-semibold text-slate-900">
                          ${type.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span>{sold} sold</span>
                        <span>{available} available</span>
                        <span>{type.quantity} total</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-slate-900 rounded-full"
                          style={{ width: `${(sold / type.quantity) * 100}%` }}
                        />
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => generateTickets(type, 1)}
                      disabled={createTicketMutation.isPending}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Generate
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent> */}

        {/* <TabsContent value="tickets" className="mt-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search tickets..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
              </div>
            </div>
            
            {ticketsLoading ? (
              <div className="p-8 animate-pulse">
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
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
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Type</th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Purchaser</th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Status</th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Purchased</th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Checked In</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(ticket => (
                      <TicketRow key={ticket.id} ticket={ticket} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-medium text-slate-900 mb-2">No tickets found</h3>
                <p className="text-slate-500 text-sm">
                  {search ? "Try adjusting your search" : "Generate tickets to get started"}
                </p>
              </div>
            )}
          </div>
        </TabsContent> */}
      </Tabs>

      {/* Edit Sheet */}
      <Sheet open={showEditForm} onOpenChange={setShowEditForm}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Edit Event</SheetTitle>
          </SheetHeader>
          <EventForm
            event={events}
            onSubmit={(data) => updateMutation.mutate(data)}
            onCancel={() => setShowEditForm(false)}
            isLoading={isLoading}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}