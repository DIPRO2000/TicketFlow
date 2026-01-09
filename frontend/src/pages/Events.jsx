import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate,useOutletContext } from "react-router-dom";
import Cookies from "js-cookie";
import { 
  Plus, 
  Search, 
  Filter,
  Calendar,
  LayoutGrid,
  List,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import EventCard from "@/components/dashboard/EventCard";
import EventForm from "@/components/forms/EventForm";
import ConfirmDialog from "@/components/modals/ConfirmDialog";
import { set } from "date-fns";

export default function Events() {
  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);

  const { OrganizerData }=useOutletContext();

  // const queryClient = useQueryClient();

  // Check URL for create param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "true") {
      setShowForm(true);
    }
  }, []);

  useEffect(() => {
    // Fetch events from backend API
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        console.log(OrganizerData)
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event/getevents/${OrganizerData?._id}`);
        const data = await response.json();

        if (data.success) {
          setEvents(data.events);
        } else {
          console.error("Failed to fetch events:", data.message);
        }
      } 
      catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [OrganizerData]);

  // const { data: events = [], isLoading } = useQuery({
  //   queryKey: ["events"],
  //   queryFn: () => base44.entities.Event.list("-created_date", 100)
  // });

  // const createMutation = useMutation({
  //   mutationFn: (data) => base44.entities.Event.create(data),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["events"] });
  //     setShowForm(false);
  //     toast.success("Event created successfully!");
  //   }
  // });

  // const updateMutation = useMutation({
  //   mutationFn: ({ id, data }) => base44.entities.Event.update(id, data),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["events"] });
  //     setShowForm(false);
  //     setEditingEvent(null);
  //     toast.success("Event updated successfully!");
  //   }
  // });

  // const deleteMutation = useMutation({
  //   mutationFn: (id) => base44.entities.Event.delete(id),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["events"] });
  //     setDeleteEvent(null);
  //     toast.success("Event deleted successfully!");
  //   }
  // });

  const handleSubmit = (data) => {
    // if (editingEvent) {
    //   updateMutation.mutate({ id: editingEvent.id, data });
    // } else {
    //   createMutation.mutate(data);
    // }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(search.toLowerCase()) ||
      event.venue?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events</h1>
          <p className="text-slate-500 mt-1">{events.length} total events</p>
        </div>
        <Button 
          className="bg-slate-900 hover:bg-slate-800"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Create Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 h-11">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 ${viewMode === "grid" ? "bg-slate-100" : "hover:bg-slate-50"}`}
          >
            <LayoutGrid className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 ${viewMode === "list" ? "bg-slate-100" : "hover:bg-slate-50"}`}
          >
            <List className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Events Grid/List */}
      {isLoading ? (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "space-y-4"
        }>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-72 animate-pulse" />
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "space-y-4"
        }>
          {filteredEvents.map(event => (
            <EventCard 
              key={event._id} 
              event={event} 
              onEdit={handleEdit}
              onDelete={setDeleteEvent}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-medium text-slate-900 mb-2">
            {search || statusFilter !== "all" ? "No events found" : "No events yet"}
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            {search || statusFilter !== "all" 
              ? "Try adjusting your search or filters" 
              : "Create your first event to get started"
            }
          </p>
          {!search && statusFilter === "all" && (
            <Button 
              className="bg-slate-900 hover:bg-slate-800"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> Create Event
            </Button>
          )}
        </div>
      )}

      {/* Create/Edit Sheet */}
      <Sheet open={showForm} onOpenChange={handleCloseForm}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingEvent ? "Edit Event" : "Create Event"}</SheetTitle>
          </SheetHeader>
          <EventForm
            event={editingEvent}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={isLoading}
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteEvent}
        onOpenChange={() => setDeleteEvent(null)}
        title="Delete Event"
        description={`Are you sure you want to delete "${deleteEvent?.name}"? This action cannot be undone and will also delete all associated tickets.`}
        confirmLabel="Delete Event"
        onConfirm={() => deleteMutation.mutate(deleteEvent.id)}
      />
    </div>
  );
}