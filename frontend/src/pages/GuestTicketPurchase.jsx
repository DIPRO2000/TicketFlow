import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Ticket, Loader2, Plus, Minus, X, AlertCircle, Ban, CheckCircle2, Layout } from "lucide-react";
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

  const addTicketToCart = (ticketType) => {
    if (events?.status !== "Published") return;
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
    if (events?.status !== "Published") {
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

  if (!events) return <div className="p-10 text-center text-slate-500">Event not found.</div>;

  const availableTickets = events?.tickets?.filter(t => (t.quantity - (t.sold || 0)) > 0) || [];

  if (purchaseComplete) {
    return (
      <div className="min-h-screen bg-indigo-50/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2 text-slate-900">Purchase Successful!</h2>
            <p className="text-slate-600 mb-6">Your tickets have been booked. Check your email for details.</p>
            <Button onClick={() => setPurchaseComplete(false)} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-semibold">Purchase More</Button>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Main Content Side */}
          <div className="lg:col-span-3 space-y-8">
            {/* Event Header Card */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
              <div className="h-80 bg-slate-200 relative">
                {events?.coverImage ? (
                  <img src={events.coverImage} alt={events.title} className="w-full h-full object-cover" />
                ) : (
                  <Calendar className="w-24 h-24 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </div>
              <div className="p-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">{events?.title}</h1>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-5 bg-indigo-50 rounded-2xl border border-indigo-100/50">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm text-indigo-600"><Calendar className="w-6 h-6" /></div>
                    <div>
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Date & Time</p>
                      <div className="font-semibold text-slate-900">{format(new Date(events.startDate), "EEEE, MMMM d, yyyy")}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-5 bg-purple-50 rounded-2xl border border-purple-100/50">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm text-purple-600"><MapPin className="w-6 h-6" /></div>
                    <div>
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Venue</p>
                      <span className="font-semibold text-slate-900 leading-snug">{events?.venue.name}, {events?.venue.city}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">About this Event</h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{events?.description}</p>
                </div>
              </div>
            </div>

            {/* Gallery Section - Only shows if images are present */}
            {events?.gallery && events.gallery.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-pink-50 rounded-lg text-pink-600"><Layout className="w-5 h-5" /></div>
                  <h2 className="text-2xl font-bold text-slate-900">Event Gallery</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {events.gallery.map((img, index) => (
                    <div key={index} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 hover:opacity-90 transition-opacity cursor-pointer border border-slate-100 shadow-sm">
                      <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ticket/Sidebar Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl p-8 sticky top-8 border border-slate-100 min-h-[450px] flex flex-col">
              {events?.status === "Published" ? (
                <form onSubmit={handlePurchase} className="space-y-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <Ticket className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold text-slate-900">Get Tickets</h2>
                  </div>

                  <div className="space-y-3">
                    {availableTickets.length > 0 ? availableTickets.map((ticket) => {
                      const inCart = selectedTickets.find(t => t._id === ticket._id);
                      return (
                        <button
                          key={ticket._id}
                          type="button"
                          onClick={() => addTicketToCart(ticket)}
                          className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                            inCart ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500/20" : "border-slate-100 hover:border-indigo-200"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold text-slate-900">{ticket.type}</div>
                              <div className="text-xs text-slate-500 font-medium">{ticket.quantity - (ticket.sold || 0)} left</div>
                            </div>
                            <div className="text-2xl font-bold text-indigo-600">₹{ticket.price}</div>
                          </div>
                        </button>
                      );
                    }) : (
                      <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-500 font-medium">Sold Out</p>
                      </div>
                    )}
                  </div>

                  {selectedTickets.length > 0 && (
                    <div className="space-y-6 pt-2">
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        {selectedTickets.map(t => (
                          <div key={t._id} className="flex items-center justify-between py-1">
                            <span className="text-sm font-semibold text-slate-700">{t.type} (x{t.cartQuantity})</span>
                            <span className="text-sm font-bold text-slate-900">₹{(t.price * t.cartQuantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-slate-700 font-semibold ml-1">Full Name</Label>
                          <Input className="h-12 rounded-xl" placeholder="Enter your name" required value={purchaserInfo.name} onChange={e => setPurchaserInfo({...purchaserInfo, name: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-slate-700 font-semibold ml-1">Email Address</Label>
                          <Input className="h-12 rounded-xl" type="email" placeholder="email@example.com" required value={purchaserInfo.email} onChange={e => setPurchaserInfo({...purchaserInfo, email: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-slate-700 font-semibold ml-1">Phone Number</Label>
                          <Input className="h-12 rounded-xl" placeholder="10 digit mobile number" required value={purchaserInfo.phone} onChange={e => setPurchaserInfo({...purchaserInfo, phone: e.target.value})} />
                        </div>
                        
                        <Button type="submit" disabled={isPurchasing} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all mt-4">
                          {isPurchasing ? <Loader2 className="animate-spin mr-2" /> : `Pay ₹${calculateTotal().toFixed(2)}`}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-10">
                  {events?.status === "Draft" && (
                    <>
                      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600"><AlertCircle className="w-10 h-10" /></div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">Event Not Published</h2>
                        <p className="text-slate-500 mt-2 px-4 text-sm">The organizer hasn't opened ticket sales for this event yet.</p>
                      </div>
                    </>
                  )}
                  {events?.status === "Cancelled" && (
                    <>
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600"><Ban className="w-10 h-10" /></div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">Event Cancelled</h2>
                        <p className="text-slate-500 mt-2 px-4 text-sm">This event has been cancelled. Ticket sales are closed.</p>
                      </div>
                    </>
                  )}
                  {events?.status === "Completed" && (
                    <>
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-600"><CheckCircle2 className="w-10 h-10" /></div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">Event Completed</h2>
                        <p className="text-slate-500 mt-2 px-4 text-sm">This event has already taken place.</p>
                      </div>
                    </>
                  )}
                  <Button variant="outline" className="mt-4 rounded-xl px-8" onClick={() => window.history.back()}>Go Back</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}