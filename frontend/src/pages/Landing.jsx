import { Link } from "react-router-dom";
import { 
  Ticket, 
  Shield, 
  Zap, 
  BarChart3, 
  CheckCircle2,
  ArrowRight,
  ScanLine,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const features = [
  {
    icon: Ticket,
    title: "Smart Ticket Generation",
    description: "Generate unique alphanumeric codes for every ticket automatically. Each code is cryptographically secure."
  },
  {
    icon: ScanLine,
    title: "Instant Verification",
    description: "Validate tickets in under a second. Staff can verify by entering or scanning the code at entry."
  },
  {
    icon: Shield,
    title: "Fraud Prevention",
    description: "Real-time status tracking prevents duplicate entries and ticket fraud."
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    description: "Track sales, check-ins, and attendance in real-time with comprehensive dashboards."
  }
];

const steps = [
  { number: "01", title: "Create Event", description: "Set up your event with venue, date, and ticket types" },
  { number: "02", title: "Configure Tickets", description: "Define pricing, quantities, and generate unique codes" },
  { number: "03", title: "Sell & Distribute", description: "Share ticket links and track purchases in real-time" },
  { number: "04", title: "Verify at Entry", description: "Staff validates tickets instantly at the venue" }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-slate-900 text-lg">TicketFlow</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to={("Login")}>
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to={("Register")}>
                <Button className="bg-slate-900 hover:bg-slate-800">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-600 mb-6">
                <Zap className="w-4 h-4" />
                <span>Trusted by 2,000+ event organizers</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                Event ticketing that{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-900">
                  just works
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed">
                Create events, generate secure ticket codes, and validate entries in real-time. 
                The complete ticket management system for modern event organizers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to={("Register")}>
                  <Button size="lg" className="bg-slate-900 hover:bg-slate-800 h-12 px-8 text-base cursor-pointer">
                    Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to={("TicketVerification")}>
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base cursor-pointer">
                    <ScanLine className="w-4 h-4 mr-2" /> Verify a Ticket
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
            <div className="bg-gradient-to-b from-slate-100 to-slate-200 rounded-2xl p-2 sm:p-3 shadow-2xl shadow-slate-200/50">
              <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                <img 
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80" 
                  alt="Event Dashboard Preview"
                  className="w-full h-auto opacity-90"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to manage events
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From ticket creation to entry validation, we've got every aspect covered.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-slate-700" />
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
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-slate-600">
              Get started in minutes with our simple 4-step process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-5xl font-bold text-slate-200 mb-4">{step.number}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to streamline your events?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Join thousands of organizers who trust TicketFlow for their ticket management needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={("Register")}>
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-8 cursor-pointer">
                  Create Free Account
                </Button>
              </Link>
              <Link to={("Login")}>
                <Button size="lg" variant="outline" className="border-slate-700 text-slate-900 hover:bg-slate-100 h-12 px-8 cursor-pointer">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">TicketFlow</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2024 TicketFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}