import { useState } from "react";
import { Link } from "react-router-dom";
import { Ticket, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2, Server, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // Assuming you use sonner for better alerts

const benefits = [
  "Unlimited events",
  "Secure ticket codes",
  "Real-time verification",
  "Analytics dashboard"
];

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingServer, setIsCheckingServer] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Function to wake up/check the free-tier server
  const checkServerStatus = async () => {
    setIsCheckingServer(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/`, {
        method: "GET",
      });
      const data = await res.json();
      
      if (res.ok) {
        alert(`✅ Server is Active: ${data}`);
      } else {
        alert("⚠️ Server responded with an error.");
      }
    } catch (err) {
      alert("❌ Server is currently sleeping or unreachable. Please wait a few seconds and try again.");
      console.error("Server check error:", err);
    } finally {
      setIsCheckingServer(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orglogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
        credentials: "include"
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      navigate("/Dashboard");
      
    } catch (error) {
      setError("Network error. The server might be waking up. Try 'Check Server' below.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700">
          <img 
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80"
            alt="Event"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12">
          <h2 className="text-3xl font-bold text-white mb-6">
            Start managing events like a pro
          </h2>
          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-white">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm py-10">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to home
          </Link>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-xl">TicketFlow</span>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign in to your account</h1>
          <p className="text-slate-600 mb-8">Get started with your organizer account</p>
          
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="you@example.com"
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Min. 8 characters"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="flex flex-col gap-4">
              <p className="text-center text-sm text-slate-600">
                Don't have an account?{" "}
                <Link to="/Register" className="font-medium text-slate-900 hover:underline">
                  Create one
                </Link>
              </p>

              {/* Server Wake-up Button */}
              <Button 
                variant="outline"
                type="button"
                onClick={checkServerStatus}
                disabled={isCheckingServer}
                className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 text-xs h-9"
              >
                {isCheckingServer ? (
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                ) : (
                  <Globe className="w-3 h-3 mr-2" />
                )}
                Check Server Status (Wake up)
              </Button>
            </div>
          </div>
          
          <p className="mt-6 text-center text-[10px] text-slate-400 leading-relaxed uppercase tracking-widest font-bold">
            Secure Entry Management System
          </p>
        </div>
      </div>
    </div>
  );
}