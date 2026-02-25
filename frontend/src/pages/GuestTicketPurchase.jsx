import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Ticket, Loader2, Plus, Minus, X } from "lucide-react";
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
  const [isPurchasing, setIsPurchasing] = useState(false); // New state for purchase loading

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
          console.error("Failed to fetch events:", data.message);
          toast.error(data.message || "Failed to load event details");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Error loading event. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [eventLinkId]);

  const addTicketToCart = (ticketType) => {
    setSelectedTickets(prev => {
      const existingTicket = prev.find(t => t._id === ticketType._id);
      const availableQty = ticketType.quantity - (ticketType.sold || 0);
      
      if (existingTicket) {
        // If the same ticket is clicked, increase quantity
        if (existingTicket.cartQuantity < availableQty) {
          return prev.map(t =>
            t._id === ticketType._id
              ? { ...t, cartQuantity: t.cartQuantity + 1 }
              : t
          );
        } else {
          toast.error(`Only ${availableQty} tickets available for ${ticketType.type}`);
          return prev;
        }
      } else {
        // Enforce only one type: Replace previous selection with new type
        return [{ ...ticketType, cartQuantity: 1 }];
      }
    });
  };

  const removeTicketFromCart = (ticketId) => {
    setSelectedTickets(prev => prev.filter(t => t._id !== ticketId));
  };

  const updateTicketQuantity = (ticketId, newQuantity) => {
    if (newQuantity < 1) {
      removeTicketFromCart(ticketId);
      return;
    }

    setSelectedTickets(prev => {
      const ticket = prev.find(t => t._id === ticketId);
      const availableQty = ticket.quantity - (ticket.sold || 0);
      
      if (newQuantity > availableQty) {
        toast.error(`Only ${availableQty} tickets available`);
        return prev;
      }
      
      return prev.map(t =>
        t._id === ticketId ? { ...t, cartQuantity: newQuantity } : t
      );
    });
  };

  const calculateTotal = () => {
    return selectedTickets.reduce((total, ticket) => {
      return total + (ticket.price * ticket.cartQuantity);
    }, 0);
  };

  const totalTicketsCount = () => {
    return selectedTickets.reduce((total, ticket) => total + ticket.cartQuantity, 0);
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    
    if (selectedTickets.length === 0) {
      toast.error("Please select a ticket type");
      return;
    }
    
    if (!purchaserInfo.name || !purchaserInfo.email || !purchaserInfo.phone) {
      toast.error("Please fill in all purchaser information fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(purchaserInfo.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Phone validation (basic)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(purchaserInfo.phone.replace(/\D/g, ''))) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsPurchasing(true); // Start purchase loading

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

      console.log("Form Data Object:", Object.fromEntries(formData));

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/participant/register-participant`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Registration Successful!");
        setPurchaseComplete(true);
        setSelectedTickets([]);
        setPurchaserInfo({ name: "", email: "", phone: "" });
        
        // Optional: Show purchased tickets info
        if (result.participants) {
          setPurchasedTickets([result.participants]);
        }
      } else {
        toast.error(result.message || "Failed to purchase tickets");
      }
    } catch (error) {
      console.error("Error in buying tickets:", error);
      toast.error("An error occurred while purchasing tickets");
    } finally {
      setIsPurchasing(false); // Stop purchase loading regardless of outcome
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!events) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">Event not found or failed to load.</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const availableTickets = events?.tickets?.filter(t => (t.quantity - (t.sold || 0)) > 0) || [];

  // If purchase is complete, show success message
  if (purchaseComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 md:py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Purchase Successful!</h2>
            <p className="text-slate-600 mb-6">
              Thank you for your purchase. Your tickets have been booked successfully.
            </p>
            {purchasedTickets.length > 0 && (
              <div className="bg-indigo-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-medium text-indigo-600 mb-2">Ticket Details:</p>
                {purchasedTickets.map((ticket, idx) => (
                  <div key={idx} className="text-sm text-slate-700">
                    <p>Token: <span className="font-mono font-bold">{ticket.token}</span></p>
                    <p>Type: {ticket.ticketType}</p>
                    <p>Quantity: {ticket.quantity}</p>
                  </div>
                ))}
              </div>
            )}
            <Button 
              onClick={() => {
                setPurchaseComplete(false);
                setPurchasedTickets([]);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Purchase More Tickets
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-8">
          
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
              <div className="h-72 bg-gradient-to-br from-indigo-400 to-purple-500 relative overflow-hidden">
                {events?.coverImage ? (
                  <img src={events.coverImage} alt={events.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="w-24 h-24 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              <div className="p-8 md:p-10">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">{events?.name}</h1>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <div className="p-2 bg-indigo-100 rounded-xl"><Calendar className="w-6 h-6 text-indigo-600" /></div>
                    <div>
                      <p className="text-sm font-medium text-indigo-600 uppercase mb-1">Date & Time</p>
                      <div className="font-semibold text-slate-900 text-lg">
                        {events?.startDate ? format(new Date(events.startDate), "EEEE, MMMM d, yyyy") : "TBA"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                    <div className="p-2 bg-purple-100 rounded-xl"><MapPin className="w-6 h-6 text-purple-600" /></div>
                    <div>
                      <p className="text-sm font-medium text-purple-600 uppercase mb-1">Venue</p>
                      <span className="font-semibold text-slate-900 text-lg">
                        {events?.venue.name} {events?.venue.address}, {events?.venue.city}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl p-8 sticky top-8 border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-xl"><Ticket className="w-6 h-6 text-indigo-600" /></div>
                <h2 className="text-2xl font-bold text-slate-900">Get Tickets</h2>
              </div>

              <form onSubmit={handlePurchase} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Choose Ticket Type</Label>
                  <div className="space-y-3">
                    {availableTickets.map((ticket) => {
                      const inCart = selectedTickets.find(t => t._id === ticket._id);
                      return (
                        <button
                          key={ticket._id}
                          type="button"
                          onClick={() => !isPurchasing && addTicketToCart(ticket)}
                          disabled={isPurchasing}
                          className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                            inCart ? "border-indigo-500 bg-indigo-50 shadow-md" : "border-slate-200 bg-white"
                          } ${isPurchasing ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-300'}`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold text-lg">{ticket.type}</div>
                              <div className="text-sm text-slate-500">{ticket.quantity - (ticket.sold || 0)} left</div>
                            </div>
                            <div className="text-2xl font-bold text-indigo-600">₹{ticket.price}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedTickets.length > 0 && (
                  <div className="space-y-4 border-2 border-indigo-100 rounded-2xl p-4 bg-indigo-50/50">
                    <div className="space-y-3">
                      {selectedTickets.map((ticket) => {
                        const availableQty = ticket.quantity - (ticket.sold || 0);

                        return (
                          <div key={ticket._id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                            <div>
                              <div className="font-medium">{ticket.type}</div>
                              <div className="text-sm text-slate-500">₹{ticket.price} each</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <button 
                                  type="button" 
                                  onClick={() => updateTicketQuantity(ticket._id, ticket.cartQuantity - 1)} 
                                  disabled={isPurchasing}
                                  className="p-1 hover:bg-slate-100 rounded disabled:opacity-50"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-bold min-w-[20px] text-center">{ticket.cartQuantity}</span>
                                <button 
                                  type="button" 
                                  onClick={() => updateTicketQuantity(ticket._id, ticket.cartQuantity + 1)} 
                                  className="p-1 hover:bg-slate-100 rounded disabled:opacity-50"
                                  disabled={isPurchasing || ticket.cartQuantity >= availableQty}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => removeTicketFromCart(ticket._id)} 
                                disabled={isPurchasing}
                                className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-4 border-t border-indigo-200 flex justify-between font-bold">
                      <span className="text-slate-700">{totalTicketsCount()} Tickets</span>
                      <span className="text-xl text-slate-900">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <Label>Full Name</Label>
                  <Input 
                    required 
                    value={purchaserInfo.name} 
                    onChange={(e) => setPurchaserInfo({...purchaserInfo, name: e.target.value})}
                    disabled={isPurchasing}
                    className={isPurchasing ? 'bg-slate-50' : ''}
                  />
                  
                  <Label>Email Address</Label>
                  <Input 
                    type="email" 
                    required 
                    value={purchaserInfo.email} 
                    onChange={(e) => setPurchaserInfo({...purchaserInfo, email: e.target.value})}
                    disabled={isPurchasing}
                    className={isPurchasing ? 'bg-slate-50' : ''}
                  />
                  
                  <Label>Phone Number</Label>
                  <Input 
                    required 
                    value={purchaserInfo.phone} 
                    onChange={(e) => setPurchaserInfo({...purchaserInfo, phone: e.target.value})}
                    disabled={isPurchasing}
                    className={isPurchasing ? 'bg-slate-50' : ''}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isPurchasing || selectedTickets.length === 0}
                  className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                >
                  {isPurchasing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Purchase ${totalTicketsCount()} Ticket${totalTicketsCount() !== 1 ? 's' : ''}`
                  )}
                </Button>

                {isPurchasing && (
                  <p className="text-sm text-center text-slate-500 animate-pulse">
                    Please wait while we process your purchase...
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}