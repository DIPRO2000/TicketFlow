import { Link } from "react-router-dom";
import { 
  Ticket, 
  Shield, 
  Zap, 
  BarChart3, 
  CheckCircle2,
  ArrowRight,
  ScanLine,
  Users,
  Sparkles,
  Star,
  Clock,
  Globe,
  Phone,
  Calendar,
  Mail,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Ticket,
    title: "Smart Ticket Generation",
    description: "Generate unique alphanumeric codes for every ticket automatically. Each code is cryptographically secure.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: ScanLine,
    title: "Instant Verification",
    description: "Validate tickets in under a second. Staff can verify by entering or scanning the code at entry.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Shield,
    title: "Fraud Prevention",
    description: "Real-time status tracking prevents duplicate entries and ticket fraud.",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    description: "Track sales, check-ins, and attendance in real-time with comprehensive dashboards.",
    gradient: "from-green-500 to-emerald-500"
  }
];

const steps = [
  { 
    number: "01", 
    title: "Create Event", 
    description: "Set up your event with venue, date, and ticket types",
    icon: Calendar,
    color: "bg-blue-500"
  },
  { 
    number: "02", 
    title: "Configure Tickets", 
    description: "Define pricing, quantities, and generate unique codes",
    icon: Ticket,
    color: "bg-purple-500"
  },
  { 
    number: "03", 
    title: "Sell & Distribute", 
    description: "Share ticket links and track purchases in real-time",
    icon: Globe,
    color: "bg-orange-500"
  },
  { 
    number: "04", 
    title: "Verify at Entry", 
    description: "Staff validates tickets instantly at the venue",
    icon: ScanLine,
    color: "bg-green-500"
  }
];

const pricing = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for small community meetups",
    features: ["Up to 100 tickets/event", "Basic Analytics", "Email Support", "QR Verification"],
    button: "Get Started",
    highlight: false
  },
  {
    name: "Pro",
    price: "₹1,999",
    period: "/month",
    description: "Best for professional event organizers",
    features: ["Unlimited tickets", "Advanced Analytics", "Priority Support", "Custom Branding", "Export to Excel"],
    button: "Go Pro",
    highlight: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large scale festivals and conferences",
    features: ["Multi-organizer access", "API Integration", "Dedicated Account Manager", "White-label solution"],
    button: "Contact Sales",
    highlight: false
  }
];

const stats = [
  { label: "Events Hosted", value: "10,000+", icon: Calendar },
  { label: "Happy Organizers", value: "2,000+", icon: Users },
  { label: "Tickets Verified", value: "1M+", icon: CheckCircle2 },
  { label: "Avg. Response", value: "< 1 sec", icon: Clock }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Event Producer, TechConf",
    content: "TicketFlow has transformed how we manage events. The verification process is seamless and our attendees love it.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80"
  },
  {
    name: "Michael Chen",
    role: "Festival Director",
    content: "The real-time analytics help us make data-driven decisions on the fly. Absolutely essential for our large-scale events.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80"
  },
  {
    name: "Emily Rodriguez",
    role: "Concert Organizer",
    content: "Setting up events takes minutes, not hours. The ticket verification at the gate is incredibly fast.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80"
  }
];

export default function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden selection:bg-purple-100 selection:text-purple-900">
      <style dangerouslySetInnerHTML={{ __html: `html { scroll-behavior: smooth; }` }} />
      
      {/* Floating Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-9 h-9 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-slate-900 text-lg">TicketFlow</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-purple-600 transition-colors">Features</a>
              <a href="#process" className="hover:text-purple-600 transition-colors">How it Works</a>
              <a href="#pricing" className="hover:text-purple-600 transition-colors">Pricing</a>
              <a href="#testimonials" className="hover:text-purple-600 transition-colors">Testimonials</a>
            </nav>

            <div className="flex items-center gap-3">
              <Link to="/login"><Button variant="ghost">Login</Button></Link>
              <Link to="/register">
                <Button className="bg-slate-900 text-white shadow-lg">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <motion.div style={{ opacity, scale }} className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm text-purple-700 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Trusted by 2,000+ event organizers</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 mb-6">
            Event ticketing that <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">just works</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Create events, generate secure ticket codes, and validate entries in real-time. 
            The complete management system for modern organizers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register"><Button size="lg" className="bg-slate-900 text-white h-12 px-8">Start Free Trial <ArrowRight className="ml-2 w-4 h-4" /></Button></Link>
            <Link to="/login"><Button size="lg" variant="outline" className="h-12 px-8"> Log In</Button></Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200">
                <stat.icon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white scroll-mt-16">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">Everything you need to manage events</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 hover:shadow-xl transition-all">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-white bg-gradient-to-br", feature.gradient)}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-24 px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Process</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">How it works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="text-center relative">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg", step.color)}>
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl mb-2">{step.title}</h3>
              <p className="text-slate-500 text-sm">{step.description}</p>
              <div className="absolute top-0 right-0 text-5xl font-black text-slate-50 -z-10">{step.number}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">Scale with your events</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((plan, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className={cn(
                  "p-8 rounded-3xl border bg-white flex flex-col",
                  plan.highlight ? "border-purple-500 shadow-2xl ring-2 ring-purple-500/20" : "border-slate-200"
                )}
              >
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-slate-500">{plan.period}</span>}
                </div>
                <p className="text-sm text-slate-500 mb-6">{plan.description}</p>
                <div className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feat, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-green-500" /> {feat}
                    </div>
                  ))}
                </div>
                <Button className={plan.highlight ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-slate-900 text-white"}>
                  {plan.button}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">Loved by event organizers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-slate-900">{t.name}</h4>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(t.rating)].map((_, idx) => <Star key={idx} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed italic">"{t.content}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-900">TicketFlow</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Streamlining event management with secure ticketing and real-time validation. Built for organizers, loved by attendees.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Navigation</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#features" className="hover:text-purple-600 transition">Features</a></li>
                <li><a href="#process" className="hover:text-purple-600 transition">How it Works</a></li>
                <li><a href="#pricing" className="hover:text-purple-600 transition">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-purple-600 transition">Testimonials</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Contact</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +91-9875383377</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> hello@ticketflow.com</li>
                <li className="flex items-center gap-2"><Globe className="w-4 h-4" /> Kolkata, India</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><Link to="/faq" className="hover:text-purple-600 transition">Help Center</Link></li>
                <li><Link to="/terms" className="hover:text-purple-600 transition">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-purple-600 transition">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
              © 2026 TicketFlow. Empowering events globally.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}