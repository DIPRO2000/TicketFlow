import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { User, Building2, Bell, Save, Loader2 } from "lucide-react";
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

  const [isUpdating, setIsUpdating] = useState(false);
  const { OrganizerData } = useOutletContext();

  // Sync state when context data loads
  useEffect(() => {
    if (OrganizerData) {
      setProfile({
        full_name: OrganizerData.name || "",
        email: OrganizerData.email || "",
        organization_name: OrganizerData.Orgname || "" 
      });
    }
  }, [OrganizerData]);

  const handleSaveProfile = async () => {
    if (!profile.organization_name.trim()) {
      return toast.error("Organization name cannot be empty");
    }

    setIsUpdating(true);
    try {
      // 1. Construct URL (handles trailing slashes in env variables)
      const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || "";
      const apiUrl = `${backendBaseUrl.replace(/\/$/, "")}/api/update/orgname`;

      // 2. Execute Request
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Uncomment if using Bearer Tokens:
          // "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ 
          newOrgName: profile.organization_name 
        }),
        credentials: "include" // Important if you use cookies for sessions
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update organization name");
      }

      toast.success("Settings updated successfully!");
    } catch (error) {
      toast.error(error.message || "An error occurred");
      console.error("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
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
                <Input id="full_name" value={profile.full_name} disabled className="h-11 bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={profile.email} disabled className="h-11 bg-slate-50" />
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
                disabled={isUpdating}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                {isUpdating ? (
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
              {['email_tickets', 'email_checkins', 'email_reports'].map((id) => (
                <div key={id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {id.split('_')[1].charAt(0).toUpperCase() + id.split('_')[1].slice(1)}
                    </p>
                    <p className="text-sm text-slate-500">Enable or disable {id.replace('_', ' ')}</p>
                  </div>
                  <Switch
                    checked={notifications[id]}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, [id]: checked })}
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}