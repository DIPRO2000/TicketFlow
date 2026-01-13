import { useState,useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Ticket, CheckCircle2, Loader2, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

const generateTicketCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if ((i + 1) % 4 === 0 && i < 11) code += '-';
  }
  return code;
};

export default function GuestTicketPurchase() {
  const urlParams = new URLSearchParams(window.location.search);
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [purchaserInfo, setPurchaserInfo] = useState({ name: "", email: "", phone: "" });
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [events, setEvents] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { eventLinkId } = useParams()

  useEffect(() => {
    // Fetch events from backend API
    const fetchEvents = async () => {
    setIsLoading(true);
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event/${eventLinkId}`,{
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
}, []);

useEffect(()=>{
    console.log(events);
},[events]);

//   const { data: event, isLoading } = useQuery({
//     queryKey: ['event-public', eventId],
//     queryFn: async () => {
//       const events = await .entities.Event.filter({ id: eventId });
//       return events[0];
//     },
//     enabled: !!eventId,
//   });

  const purchaseMutation = ({
    // mutationFn: async ({ ticketType, qty, info }) => {
    //   const tickets = [];
    //   for (let i = 0; i < qty; i++) {
    //     const ticket = await .entities.Ticket.create({
    //       code: generateTicketCode(),
    //       event_id: eventId,
    //       ticket_type: ticketType.name,
    //       price: ticketType.price,
    //       status: "valid",
    //       purchaser_name: info.name,
    //       purchaser_email: info.email,
    //     });
    //     tickets.push(ticket);
    //   }
      
    //   const updatedTypes = event.ticket_types.map(t => 
    //     t.id === ticketType.id 
    //       ? { ...t, sold: (t.sold || 0) + qty }
    //       : t
    //   );
    //   await .entities.Event.update(eventId, { ticket_types: updatedTypes });
      
    //   return tickets;
    // },
    // onSuccess: (tickets) => {
    //   setPurchasedTickets(tickets);
    //   setPurchaseComplete(true);
    //   toast.success("Tickets purchased successfully!");
    // },
    // onError: () => {
    //   toast.error("Failed to purchase tickets");
    // }
  });

  const handlePurchase = async(e) => {
    e.preventDefault();
    if (!selectedTicketType || !purchaserInfo.name || !purchaserInfo.email || !purchaserInfo.phone) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      console.log(selectedTicketType);
      const form = new FormData();
      form.append("eventLinkId",eventLinkId);
      form.append("name",purchaserInfo.name);
      form.append("email",purchaserInfo.email);
      form.append("phone",purchaserInfo.phone);
      form.append("ticketType",selectedTicketType.type);
      form.append("pricePaid",(selectedTicketType.price * quantity));
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/participant/register-participant`,{
        method : "POST",
        body : form
      });

      if(response.ok)
      {
        console.log("Successful",response);
      } else {
        console.log("Failure",response.message);
      }

    } catch (error) {
      console.log("Error in buying tickets:",error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!events) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Ticket className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Event Not Found</h2>
          <p className="text-slate-600">This event doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (purchaseComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center border border-emerald-100">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              🎉 Purchase Successful!
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Your tickets have been sent to <strong className="text-slate-900">{purchaserInfo.email}</strong>
            </p>

            <div className="space-y-4 mb-10">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Your Ticket Codes:</h3>
              {purchasedTickets.map((ticket) => (
                <div key={ticket.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
                  <code className="text-2xl font-mono font-bold text-indigo-900 tracking-wider">
                    {ticket.code}
                  </code>
                  <p className="text-sm text-slate-600 mt-3 font-medium">{ticket.ticket_type} • ${ticket.price}</p>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-900 font-medium">
                💡 Save these codes! You'll need them to enter the event.
              </p>
            </div>

            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="mt-4"
            >
              Purchase More Tickets
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const availableTickets = events.tickets?.filter(t => 
    (t.quantity - (t.sold || 0)) > 0
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Event Details - Left Side */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
              <div className="h-72 bg-gradient-to-br from-indigo-400 to-purple-500 relative overflow-hidden">
                {events.cover_image ? (
                  <img 
                    src={events.cover_image} 
                    alt={events.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="w-24 h-24 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              <div className="p-8 md:p-10">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                  {events.name}
                </h1>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                      <Calendar className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide mb-1">Date & Time</p>
                      <div className="font-semibold text-slate-900 text-lg">
                        {format(new Date(events.startDate), "EEEE, MMMM d, yyyy")}
                      </div>
                      <div className="text-slate-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {format(new Date(events.startDate), "h:mm a")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-600 uppercase tracking-wide mb-1">Venue</p>
                      <span className="font-semibold text-slate-900 text-lg">{events.venue.name}{" "}{events.venue.address}{","}{events.venue.city}</span>
                    </div>
                  </div>
                </div>

                {events.description && (
                  <div className="pt-8 border-t border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">About This Event</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">
                      {events.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Purchase Form - Right Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl p-8 sticky top-8 border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <Ticket className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Get Tickets
                </h2>
              </div>

              <form onSubmit={handlePurchase} className="space-y-6">
                {/* Ticket Type Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-slate-900">Choose Ticket Type</Label>
                  {availableTickets.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <Ticket className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p className="font-medium">No tickets available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {availableTickets.map((type) => (
                        <button
                          key={type._id}
                          type="button"
                          onClick={() => setSelectedTicketType(type)}
                          className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${
                            selectedTicketType?.id === type.id
                              ? "border-indigo-500 bg-indigo-50 shadow-md"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-900 text-lg">{type.name}</div>
                              <div className="text-sm text-slate-500 mt-1">
                                {type.quantity - (type.sold || 0)} tickets left
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-indigo-600">
                              {(type.price != 0) ? `₹${type.price}` : "Free"}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedTicketType && (
                  <>
                    {/* Quantity */}
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-base font-semibold text-slate-900">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={selectedTicketType.quantity - (selectedTicketType.sold || 0)}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="h-12 text-lg border-2"
                      />
                    </div>

                    {/* Purchaser Info */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-base font-semibold text-slate-900">Full Name</Label>
                        <Input
                          id="name"
                          value={purchaserInfo.name}
                          onChange={(e) => setPurchaserInfo(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="John Doe"
                          className="h-12 text-base border-2"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-base font-semibold text-slate-900">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={purchaserInfo.email}
                          onChange={(e) => setPurchaserInfo(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="john@example.com"
                          className="h-12 text-base border-2"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-base font-semibold text-slate-900">Phone No.</Label>
                        <Input
                          id="phone"
                          type="phone"
                          value={purchaserInfo.phone}
                          onChange={(e) => setPurchaserInfo(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="9876543210"
                          className="h-12 text-base border-2"
                          required
                        />
                      </div>
                    </div>

                    {/* Total & Submit */}
                    <div className="pt-6 border-t-2 border-slate-200 space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-lg font-semibold text-slate-600">Total Amount</span>
                        <span className="text-3xl font-bold text-slate-900">
                          ₹{(selectedTicketType.price * quantity).toFixed(2)}
                        </span>
                      </div>

                      <Button
                        type="submit"
                        disabled={purchaseMutation.isPending}
                        className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        {purchaseMutation.isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Ticket className="w-5 h-5 mr-2" />
                            Purchase {quantity} {quantity === 1 ? 'Ticket' : 'Tickets'}
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-slate-500 px-2">
                        By purchasing, you agree to receive your tickets via email
                      </p>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}