import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function Settings() {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    organization_name: ""
  });
  const [notifications, setNotifications] = useState({
    email_tickets: true,
    email_checkins: false,
    email_reports: true
  });

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me()
  });

  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name || "",
        email: user.email || "",
        organization_name: user.organization_name || ""
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      toast.success("Settings saved successfully!");
    }
  });

  const handleSaveProfile = () => {
    updateMutation.mutate({
      organization_name: profile.organization_name
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Organization
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Profile Information</h2>
            <div className="space-y-6 max-w-lg">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  disabled
                  className="h-11 bg-slate-50"
                />
                <p className="text-xs text-slate-500">Name cannot be changed here</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="h-11 bg-slate-50"
                />
                <p className="text-xs text-slate-500">Email cannot be changed</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Organization Settings</h2>
            <div className="space-y-6 max-w-lg">
              <div className="space-y-2">
                <Label htmlFor="organization_name">Organization Name</Label>
                <Input
                  id="organization_name"
                  value={profile.organization_name}
                  onChange={(e) => setProfile({ ...profile, organization_name: e.target.value })}
                  placeholder="Your company or organization"
                  className="h-11"
                />
              </div>
              
              <Button 
                onClick={handleSaveProfile}
                disabled={updateMutation.isPending}
                className="bg-slate-900 hover:bg-slate-800"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Email Notifications</h2>
            <div className="space-y-6 max-w-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Ticket Sales</p>
                  <p className="text-sm text-slate-500">Get notified when tickets are sold</p>
                </div>
                <Switch
                  checked={notifications.email_tickets}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, email_tickets: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Check-ins</p>
                  <p className="text-sm text-slate-500">Get notified when attendees check in</p>
                </div>
                <Switch
                  checked={notifications.email_checkins}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, email_checkins: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Weekly Reports</p>
                  <p className="text-sm text-slate-500">Receive weekly summary reports</p>
                </div>
                <Switch
                  checked={notifications.email_reports}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, email_reports: checked })
                  }
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}