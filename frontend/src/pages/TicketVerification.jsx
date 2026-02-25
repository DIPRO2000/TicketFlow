import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  ScanLine, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  Ticket,
  RefreshCw,
  Calendar,
  MapPin,
  User,
  Users,
  Minus,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TicketVerification() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [entryCount, setEntryCount] = useState(1);
  const inputRef = useRef(null);

  const { OrganizerData } = useOutletContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current && !document.getElementById('root')?.hasAttribute('aria-hidden')) {
        inputRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const EventFetching = async() => {
      if (!OrganizerData?._id) return;
      
      setIsLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event/getevents/${OrganizerData._id}`,
          {
            method: "GET",
            credentials: "include"
          }
        );
        const data = await res.json();
        
        setEvents(data.events || []);
        
        if (data.events && data.events.length > 0) {
          setSelectedEvent(data.events[0]._id);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    }

    EventFetching();
  }, [OrganizerData]);

  // Filter events to show only upcoming/active events
  const activeEvents = events.filter(event => {
    const eventDate = new Date(event.startDate || event.date);
    const now = new Date();
    // Show events that haven't ended (within 24 hours after start)
    const eventEndTime = new Date(eventDate);
    eventEndTime.setHours(eventEndTime.getHours() + (event.duration || 4)); // Assuming 4 hours duration if not specified
    
    return eventEndTime >= now || Math.abs(eventDate - now) < 24 * 60 * 60 * 1000; // Within 24 hours
  });

  const VerifyToken = async(e) => {
    e.preventDefault();
    if (!code.trim() || !selectedEvent) return;
    
    setIsVerifying(true);
    setResult(null);
    setEntryCount(1); // Reset entry count on new verification
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/participant/verify-ticket`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          eventId: selectedEvent,
          token: code.trim().toUpperCase() 
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }
      
      if (data.status === "Success" && data.participants) {
        const participant = data.participants;
        const remainingEntries = participant.quantity - (participant.checkedInCount || 0);
        
        if (remainingEntries <= 0) {
          setResult({
            status: "fully_used",
            message: "All entries have been used",
            participant,
            event: events.find(e => e._id === participant.eventId),
            remainingEntries: 0
          });
        } else {
          setResult({
            status: "valid",
            message: `Valid ticket - ${remainingEntries} entry(s) remaining`,
            participant,
            event: events.find(e => e._id === participant.eventId),
            remainingEntries
          });
        }
      } else {
        setResult({
          status: "invalid",
          message: data.message || "Invalid ticket",
          participant: null
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setResult({
        status: "error",
        message: error.message || "Verification failed. Please try again.",
        participant: null
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCheckIn = async() => {
    if (!result?.participant?._id || entryCount < 1 || entryCount > result.remainingEntries) return;
    
    setIsCheckingIn(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/participant/checkin-ticket`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          participantId: result.participant._id,
          eventId: selectedEvent,
          count: entryCount
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        const updatedParticipant = {
          ...result.participant,
          checkedInCount: (result.participant.checkedInCount || 0) + entryCount
        };
        
        const newRemainingEntries = result.remainingEntries - entryCount;
        
        if (newRemainingEntries <= 0) {
          setResult({
            ...result,
            status: "fully_used",
            message: "All entries have been used",
            participant: updatedParticipant,
            remainingEntries: 0
          });
        } else {
          setResult({
            ...result,
            status: "checked_in",
            message: `Successfully checked in ${entryCount} entry(s)`,
            participant: updatedParticipant,
            remainingEntries: newRemainingEntries
          });
        }
        
        // Clear code after successful check-in
        setCode("");
        setEntryCount(1);
        
        // Focus back on input after a short delay
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      } else {
        alert(data.message || "Check-in failed");
      }
    } catch (error) {
      console.error("Check-in error:", error);
      alert("Check-in failed. Please try again.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleReset = () => {
    setCode("");
    setResult(null);
    setEntryCount(1);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleIncrementEntry = () => {
    if (result && entryCount < result.remainingEntries) {
      setEntryCount(prev => prev + 1);
    }
  };

  const handleDecrementEntry = () => {
    if (entryCount > 1) {
      setEntryCount(prev => prev - 1);
    }
  };

  const getResultConfig = () => {
    if (!result) return null;
    
    switch (result.status) {
      case "valid":
        return {
          icon: CheckCircle2,
          color: "bg-emerald-500",
          textColor: "text-emerald-500",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          title: "Valid Ticket",
          canCheckIn: true
        };
      case "checked_in":
        return {
          icon: CheckCircle2,
          color: "bg-emerald-500",
          textColor: "text-emerald-500",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          title: "Checked In!",
          canCheckIn: result.remainingEntries > 0 // Can check in again if entries remain
        };
      case "fully_used":
        return {
          icon: AlertCircle,
          color: "bg-amber-500",
          textColor: "text-amber-500",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          title: "All Entries Used",
          canCheckIn: false
        };
      case "invalid":
      case "error":
      default:
        return {
          icon: XCircle,
          color: "bg-rose-500",
          textColor: "text-rose-500",
          bgColor: "bg-rose-50",
          borderColor: "border-rose-200",
          title: result.message || "Invalid Ticket",
          canCheckIn: false
        };
    }
  };

  const config = getResultConfig();
  const selectedEventDetails = events.find(event => event._id === selectedEvent);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-900">Ticket Verification</h1>
            <p className="text-sm text-slate-500">Entry Gate Scanner</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Input Form */}
          <form onSubmit={VerifyToken} className="mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              {/* Event Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Event
                </label>
                <Select
                  value={selectedEvent}
                  onValueChange={setSelectedEvent}
                  disabled={isVerifying || isLoading}
                >
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder={isLoading ? "Loading events..." : "Choose an event"} />
                  </SelectTrigger>
                  <SelectContent 
                    className="max-h-[300px]"
                    position="popper"
                    sideOffset={4}
                  >
                    {activeEvents.length > 0 ? (
                      activeEvents.map((event) => (
                        <SelectItem key={event._id} value={event._id}>
                          <div className="flex flex-col items-start py-1">
                            <span className="font-medium">{event.title}</span>
                            <span className="text-xs text-slate-500">
                              {format(new Date(event.startDate || event.date), "MMM d, yyyy · h:mm a")}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-4 text-sm text-slate-500 text-center">
                        {isLoading ? "Loading events..." : "No active events found"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Event Info */}
              {selectedEventDetails && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Currently checking for:</p>
                  <p className="font-medium text-slate-900">{selectedEventDetails.title}</p>
                  <p className="text-sm text-slate-600">
                    {format(new Date(selectedEventDetails.startDate || selectedEventDetails.date), "MMMM d, yyyy · h:mm a")}
                  </p>
                  <p className="text-sm text-slate-600">
                    {selectedEventDetails.venue?.name} {selectedEventDetails.venue?.address} {selectedEventDetails.venue?.city}
                  </p>
                </div>
              )}

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Enter Ticket Code
              </label>
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g., O34U39"
                  className="h-14 text-xl font-mono tracking-wider text-center uppercase"
                  maxLength={12}
                  disabled={!selectedEvent || isVerifying || isLoading}
                  autoFocus={!document.getElementById('root')?.hasAttribute('aria-hidden')}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 mt-4 bg-slate-900 hover:bg-slate-800 text-base"
                disabled={isVerifying || !code.trim() || !selectedEvent || isLoading}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <ScanLine className="w-5 h-5 mr-2" /> Verify Ticket
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Result */}
          <AnimatePresence mode="wait">
            {result && config && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "rounded-2xl border-2 overflow-hidden",
                  config.bgColor,
                  config.borderColor
                )}
              >
                {/* Status Header */}
                <div className={cn("p-6 text-center", config.color)}>
                  <config.icon className="w-16 h-16 text-white mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-white">{config.title}</h2>
                  <p className="text-white/90 mt-1">{result.message}</p>
                </div>

                {/* Ticket Details */}
                {result.participant && (
                  <div className="p-6 bg-white">
                    <div className="text-center mb-4">
                      <code className="text-2xl font-mono font-bold text-slate-900">
                        {result.participant.token}
                      </code>
                      <p className="text-sm text-slate-500 mt-1">{result.participant.ticketType}</p>
                    </div>

                    {/* Participant Info */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-900 font-medium">{result.participant.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Ticket className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-600">
                          {result.participant.quantity} tickets purchased
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-600">
                          Used: {result.participant.checkedInCount || 0} | 
                          Remaining: {result.remainingEntries}
                        </span>
                      </div>
                    </div>

                    {/* Entry Counter for Check-in */}
                    {config.canCheckIn && (
                      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                          Number of people entering:
                        </label>
                        <div className="flex items-center justify-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full"
                            onClick={handleDecrementEntry}
                            disabled={entryCount <= 1 || isCheckingIn}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-2xl font-bold text-slate-900 min-w-[3rem] text-center">
                            {entryCount}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full"
                            onClick={handleIncrementEntry}
                            disabled={entryCount >= result.remainingEntries || isCheckingIn}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500 text-center mt-2">
                          Max: {result.remainingEntries} entries
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                      {config.canCheckIn && (
                        <Button 
                          className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700"
                          onClick={handleCheckIn}
                          disabled={isCheckingIn || entryCount < 1 || entryCount > result.remainingEntries}
                        >
                          {isCheckingIn ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-5 h-5 mr-2" /> 
                              Check In {entryCount > 1 ? `(${entryCount})` : ''}
                            </>
                          )}
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className={cn("h-12", !config.canCheckIn && "flex-1")}
                        onClick={handleReset}
                        disabled={isCheckingIn}
                      >
                        <RefreshCw className="w-5 h-5 mr-2" /> Scan Next
                      </Button>
                    </div>
                  </div>
                )}

                {/* No participant found */}
                {!result.participant && (
                  <div className="p-6 bg-white text-center">
                    <p className="text-slate-600 mb-4">
                      The code entered does not match any ticket for the selected event.
                    </p>
                    <Button 
                      variant="outline" 
                      className="h-12 w-full"
                      onClick={handleReset}
                    >
                      <RefreshCw className="w-5 h-5 mr-2" /> Try Again
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions */}
          {!result && (
            <div className="text-center text-sm text-slate-500">
              {!selectedEvent ? (
                <p>Please select an event to start verification</p>
              ) : (
                <>
                  <p>Enter the token code (e.g., O34U39) printed on the ticket</p>
                  <p className="mt-1">Press Enter or click Verify to check</p>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}