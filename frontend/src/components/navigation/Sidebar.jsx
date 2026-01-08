import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  ScanLine, 
  Settings,
  LogOut,
  ChevronLeft,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Events", icon: Calendar, page: "Events" },
  { name: "Tickets", icon: Ticket, page: "Tickets" },
  { name: "Verify Ticket", icon: ScanLine, page: "TicketVerification" },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (page) => {
    return location.pathname.includes(page);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900">TicketFlow</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Overlay */}
      {!collapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-50 transition-all duration-300",
        "lg:translate-x-0",
        collapsed ? "-translate-x-full lg:w-23" : "translate-x-0 w-64 lg:w-64"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between gap-1 px-4 border-b border-slate-100">
            <div className={cn("flex items-center gap-3", collapsed && "lg:justify-center lg:w-full")}>
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className={cn(
                "font-semibold text-slate-900 text-lg",
                collapsed && "lg:hidden"
              )}>
                TicketFlow
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="hidden lg:flex h-8 w-8"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft className={cn(
                "w-4 h-4 transition-transform",
                collapsed && "rotate-180"
              )} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.page}
                to={(item.page)}
                onClick={() => setCollapsed(true)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150",
                  "hover:bg-slate-100",
                  isActive(item.page) 
                    ? "bg-slate-900 text-white hover:bg-slate-800" 
                    : "text-slate-600",
                  collapsed && "lg:justify-center lg:px-0"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className={cn(
                  "font-medium text-sm",
                  collapsed && "lg:hidden"
                )}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          {/* Bottom */}
          <div className="p-3 border-t border-slate-100 space-y-1">
            <Link
              to={("Settings")}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors",
                collapsed && "lg:justify-center lg:px-0"
              )}
            >
              <Settings className="w-5 h-5" />
              <span className={cn("font-medium text-sm", collapsed && "lg:hidden")}>Settings</span>
            </Link>
            <button
              // onClick={() => base44.auth.logout()}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors",
                collapsed && "lg:justify-center lg:px-0"
              )}
            >
              <LogOut className="w-5 h-5" />
              <span className={cn("font-medium text-sm", collapsed && "lg:hidden")}>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}