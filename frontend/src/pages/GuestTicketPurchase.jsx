import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Ticket, Loader2, Plus, Minus, X, AlertCircle, Ban, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

export default function GuestTicketPurchase() {
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [purchaserInfo, setPurchaserInfo] = useState({ name: "", email: "", phone: "" });
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [events, setEvents] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const { eventLinkId } = useParams();

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event/${eventLinkId}`, {
          method: "GET",
          credentials: "include"
        });
        const data = await response.json();
        if (data.success) {
          setEvents(data.event);
        } else {
          toast.error(data.message || "Failed to load event details");
        }
      } catch (error) {
        toast.error("Error loading event. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [eventLinkId]);

  // Ticket handling logic...
  const addTicketToCart = (ticketType) => {
    if (events.status !== "Published") return; // Safety guard
    setSelectedTickets(prev => {
      const existingTicket = prev.find(t => t._id === ticketType._id);
      const availableQty = ticketType.quantity - (ticketType.sold || 0);
      if (existingTicket) {
        if (existingTicket.cartQuantity < availableQty) {
          return prev.map(t => t._id === ticketType._id ? { ...t, cartQuantity: t.cartQuantity + 1 } : t);
        } else {
          toast.error(`Only ${availableQty} tickets available`);
          return prev;
        }
      } else {
        return [{ ...ticketType, cartQuantity: 1 }];
      }
    });
  };

  const removeTicketFromCart = (ticketId) => setSelectedTickets(prev => prev.filter(t => t._id !== ticketId));

  const updateTicketQuantity = (ticketId, newQuantity) => {
    if (newQuantity < 1) { removeTicketFromCart(ticketId); return; }
    setSelectedTickets(prev => {
      const ticket = prev.find(t => t._id === ticketId);
      const availableQty = ticket.quantity - (ticket.sold || 0);
      if (newQuantity > availableQty) return prev;
      return prev.map(t => t._id === ticketId ? { ...t, cartQuantity: newQuantity } : t);
    });
  };

  const calculateTotal = () => selectedTickets.reduce((total, ticket) => total + (ticket.price * ticket.cartQuantity), 0);
  const totalTicketsCount = () => selectedTickets.reduce((total, ticket) => total + ticket.cartQuantity, 0);

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (events.status !== "Published") {
      toast.error("Booking is not available for this event.");
      return;
    }
    if (selectedTickets.length === 0) { toast.error("Please select a ticket"); return; }
    
    setIsPurchasing(true);
    try {
      const ticket = selectedTickets[0];
      const formData = new FormData();
      formData.append("eventLinkId", eventLinkId);
      formData.append("name", purchaserInfo.name);
      formData.append("email", purchaserInfo.email);
      formData.append("phone", purchaserInfo.phone);
      formData.append("ticketType", ticket.type);
      formData.append("quantity", ticket.cartQuantity);
      formData.append("pricePaid", ticket.price * ticket.cartQuantity);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/participant/register-participant`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Registration Successful!");
        setPurchaseComplete(true);
        if (result.participants) setPurchasedTickets([result.participants]);
      } else {
        toast.error(result.message || "Failed to purchase tickets");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!events) return <div className="p-10 text-center">Event not found.</div>;

  const availableTickets = events?.tickets?.filter(t => (t.quantity - (t.sold || 0)) > 0) || [];

  // Success Screen logic...
  if (purchaseComplete) {
    return (
      <div className="min-h-screen bg-indigo-50/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">Purchase Successful!</h2>
            <p className="text-slate-600 mb-6">Your tickets have been booked. Check your email for details.</p>
            <Button onClick={() => setPurchaseComplete(false)} className="w-full bg-indigo-600">Purchase More</Button>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Event Content Side */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="h-72 bg-slate-200 relative">
                {events?.coverImage ? (
                  <img src={events.coverImage} alt={events.name} className="w-full h-full object-cover" />
                ) : (
                  <Calendar className="w-24 h-24 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </div>
              <div className="p-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-6">{events?.title}</h1>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-2xl">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium text-indigo-600 uppercase">Date & Time</p>
                      <div className="font-semibold">{format(new Date(events.startDate), "EEEE, MMMM d, yyyy")}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-2xl">
                    <MapPin className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-purple-600 uppercase">Venue</p>
                      <span className="font-semibold">{events?.venue.name}, {events?.venue.city}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Side / Status Guard Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl p-8 sticky top-8 border border-slate-100 min-h-[400px] flex flex-col">
              {events.status === "Published" ? (
                // NORMAL PURCHASE FLOW
                <form onSubmit={handlePurchase} className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Ticket className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold">Get Tickets</h2>
                  </div>

                  <div className="space-y-3">
                    {availableTickets.map((ticket) => {
                      const inCart = selectedTickets.find(t => t._id === ticket._id);
                      return (
                        <button
                          key={ticket._id}
                          type="button"
                          onClick={() => addTicketToCart(ticket)}
                          className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                            inCart ? "border-indigo-500 bg-indigo-50" : "border-slate-100 hover:border-indigo-200"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold">{ticket.type}</div>
                              <div className="text-xs text-slate-500">{ticket.quantity - (ticket.sold || 0)} available</div>
                            </div>
                            <div className="text-xl font-bold text-indigo-600">₹{ticket.price}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedTickets.length > 0 && (
                    <div className="space-y-4">
                      {selectedTickets.map(t => (
                        <div key={t._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <span className="font-medium">{t.type} (x{t.cartQuantity})</span>
                          <span className="font-bold">₹{(t.price * t.cartQuantity).toFixed(2)}</span>
                        </div>
                      ))}
                      
                      <div className="space-y-4 pt-4 border-t">
                        <Input placeholder="Full Name" required value={purchaserInfo.name} onChange={e => setPurchaserInfo({...purchaserInfo, name: e.target.value})} />
                        <Input type="email" placeholder="Email Address" required value={purchaserInfo.email} onChange={e => setPurchaserInfo({...purchaserInfo, email: e.target.value})} />
                        <Input placeholder="Phone Number" required value={purchaserInfo.phone} onChange={e => setPurchaserInfo({...purchaserInfo, phone: e.target.value})} />
                        
                        <Button type="submit" disabled={isPurchasing} className="w-full h-14 bg-indigo-600 text-lg font-bold">
                          {isPurchasing ? <Loader2 className="animate-spin mr-2" /> : `Pay ₹${calculateTotal().toFixed(2)}`}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                // STATUS BLOCKED FLOW
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-10">
                  {events.status === "Draft" && (
                    <>
                      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-amber-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">Event Not Published</h2>
                        <p className="text-slate-500 mt-2">The organizer hasn't opened ticket sales for this event yet. Please check back later!</p>
                      </div>
                    </>
                  )}

                  {events.status === "Cancelled" && (
                    <>
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <Ban className="w-10 h-10 text-red-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">Event Cancelled</h2>
                        <p className="text-slate-500 mt-2">Unfortunately, this event has been cancelled by the organizer. Ticket sales are closed.</p>
                      </div>
                    </>
                  )}

                  {events.status === "Completed" && (
                    <>
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-slate-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">Event Completed</h2>
                        <p className="text-slate-500 mt-2">This event has already taken place. Ticket sales are no longer available.</p>
                      </div>
                    </>
                  )}
                  
                  <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
                    Go Back
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}