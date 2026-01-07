import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TicketVerification() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const verifyMutation = useMutation({
    mutationFn: async (ticketCode) => {
      const tickets = await base44.entities.Ticket.filter({ code: ticketCode.toUpperCase() });
      if (tickets.length === 0) {
        return { status: "invalid", message: "Ticket not found" };
      }
      
      const ticket = tickets[0];
      
      if (ticket.status === "used") {
        return { 
          status: "used", 
          message: "Already checked in",
          ticket,
          checkedInAt: ticket.checked_in_at
        };
      }
      
      if (ticket.status === "invalid" || ticket.status === "refunded") {
        return { 
          status: "invalid", 
          message: `Ticket is ${ticket.status}`,
          ticket
        };
      }
      
      // Get event details
      const events = await base44.entities.Event.filter({ id: ticket.event_id });
      const event = events[0];
      
      return { 
        status: "valid", 
        message: "Valid ticket",
        ticket,
        event
      };
    },
    onSuccess: (data) => {
      setResult(data);
      setIsVerifying(false);
    },
    onError: () => {
      setResult({ status: "error", message: "Verification failed" });
      setIsVerifying(false);
    }
  });

  const checkInMutation = useMutation({
    mutationFn: async (ticketId) => {
      await base44.entities.Ticket.update(ticketId, {
        status: "used",
        checked_in_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      setResult(prev => ({
        ...prev,
        status: "checked_in",
        message: "Successfully checked in!"
      }));
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setIsVerifying(true);
    setResult(null);
    verifyMutation.mutate(code.trim());
  };

  const handleReset = () => {
    setCode("");
    setResult(null);
    inputRef.current?.focus();
  };

  const handleCheckIn = () => {
    if (result?.ticket?.id) {
      checkInMutation.mutate(result.ticket.id);
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
          canCheckIn: false
        };
      case "used":
        return {
          icon: AlertCircle,
          color: "bg-amber-500",
          textColor: "text-amber-500",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          title: "Already Used",
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
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Enter Ticket Code
              </label>
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABCD1234"
                  className="h-14 text-xl font-mono tracking-wider text-center uppercase"
                  maxLength={12}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 mt-4 bg-slate-900 hover:bg-slate-800 text-base"
                disabled={isVerifying || !code.trim()}
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
                  <p className="text-white/80 mt-1">{result.message}</p>
                </div>

                {/* Ticket Details */}
                {result.ticket && (
                  <div className="p-6 bg-white">
                    <div className="text-center mb-4">
                      <code className="text-2xl font-mono font-bold text-slate-900">
                        {result.ticket.code}
                      </code>
                      <p className="text-sm text-slate-500 mt-1">{result.ticket.ticket_type}</p>
                    </div>

                    {result.event && (
                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          <Ticket className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-900 font-medium">{result.event.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-600">
                            {format(new Date(result.event.date), "EEEE, MMMM d, yyyy · h:mm a")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-600">{result.event.venue}</span>
                        </div>
                        {result.ticket.purchaser_name && (
                          <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-600">{result.ticket.purchaser_name}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {result.status === "used" && result.ticket.checked_in_at && (
                      <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
                        Checked in at {format(new Date(result.ticket.checked_in_at), "h:mm a 'on' MMM d")}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                      {config.canCheckIn && (
                        <Button 
                          className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700"
                          onClick={handleCheckIn}
                          disabled={checkInMutation.isPending}
                        >
                          {checkInMutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-5 h-5 mr-2" /> Check In
                            </>
                          )}
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className={cn("h-12", !config.canCheckIn && "flex-1")}
                        onClick={handleReset}
                      >
                        <RefreshCw className="w-5 h-5 mr-2" /> Scan Next
                      </Button>
                    </div>
                  </div>
                )}

                {/* No ticket found */}
                {!result.ticket && (
                  <div className="p-6 bg-white text-center">
                    <p className="text-slate-600 mb-4">
                      The code entered does not match any ticket in the system.
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
              <p>Enter the alphanumeric code printed on the ticket</p>
              <p className="mt-1">Press Enter or click Verify to check</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}