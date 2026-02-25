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
  CreditCard,
  Globe,
  Phone,
  Calendar,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
    image: "https://images.unsplash.com/photo-1494790108777-2fde9b7b7d9a?w=150&q=80"
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
    <div className="min-h-screen bg-white overflow-x-hidden">
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
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-slate-900 text-lg">TicketFlow</span>
            </motion.div>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" className="hover:bg-slate-100">Login</Button>
                </motion.div>
              </Link>
              <Link to="/register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white shadow-lg">
                    Get Started
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <motion.div 
          style={{ opacity, scale }}
          className="max-w-7xl mx-auto relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm text-purple-700 mb-6 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Trusted by 2,000+ event organizers</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-tight mb-6"
              >
                Event ticketing that{" "}
                <span className="relative">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    just works
                  </span>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 1 }}
                    className="absolute bottom-2 left-0 h-3 bg-purple-200/50 -z-0 rounded-lg"
                  />
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto"
              >
                Create events, generate secure ticket codes, and validate entries in real-time. 
                The complete ticket management system for modern event organizers.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link to="/register">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 h-12 px-8 text-base shadow-xl hover:shadow-2xl transition-all duration-300">
                      Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/ticket-verification">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="outline" className="h-12 px-8 text-base border-2 hover:bg-slate-50">
                      <ScanLine className="w-4 h-4 mr-2" /> Verify a Ticket
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.05 }}
                className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 text-center border border-slate-200 shadow-sm"
              >
                <stat.icon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-gradient-to-b from-slate-100 to-slate-200 rounded-2xl p-2 sm:p-3 shadow-2xl shadow-purple-200/50"
            >
              <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                <img 
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80" 
                  alt="Event Dashboard Preview"
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 mt-2">
              Everything you need to manage events
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From ticket creation to entry validation, we've got every aspect covered.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl hover:shadow-purple-200/30 transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 mt-2">
              How it works
            </h2>
            <p className="text-lg text-slate-600">
              Get started in minutes with our simple 4-step process.
            </p>
          </motion.div>
          
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-24 left-0 w-full h-0.5 bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200 hidden lg:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10`}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <div className="text-6xl font-bold text-slate-100 absolute -top-4 -right-4 -z-0">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2 text-center relative z-10">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-sm text-center">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 mt-2">
              Loved by event organizers
            </h2>
            <p className="text-lg text-slate-600">
              Don't just take our word for it - hear from our happy customers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-100"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{testimonial.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to streamline your events?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of organizers who trust TicketFlow for their ticket management needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-8 shadow-xl cursor-pointer">
                      Create Free Account
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/login">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="outline" className="border-slate-700 text-slate-900 hover:bg-white h-12 px-8 cursor-pointer">
                      Sign In
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-slate-900">TicketFlow</span>
              </div>
              <p className="text-sm text-slate-500">
                Modern ticketing solution for event organizers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/features" className="hover:text-purple-600 transition">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-purple-600 transition">Pricing</Link></li>
                <li><Link to="/faq" className="hover:text-purple-600 transition">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/about" className="hover:text-purple-600 transition">About</Link></li>
                <li><Link to="/blog" className="hover:text-purple-600 transition">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-purple-600 transition">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>hello@ticketflow.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2024 TicketFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="text-sm text-slate-500 hover:text-purple-600 transition">Privacy</Link>
              <Link to="/terms" className="text-sm text-slate-500 hover:text-purple-600 transition">Terms</Link>
              <Link to="/cookies" className="text-sm text-slate-500 hover:text-purple-600 transition">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .bg-grid-slate-100 {
          background-image: linear-gradient(to right, #f1f5f9 1px, transparent 1px),
            linear-gradient(to bottom, #f1f5f9 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .bg-grid-white\/10 {
          background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
}