import React, { useState, useEffect } from "react";
import Sidebar from "./components/navigation/Sidebar"; 
import { Outlet, useNavigate, useLocation } from "react-router-dom"; 
import { Loader2 } from "lucide-react"; // Assuming you use lucide-react

const Layout = () => {
    const [OrganizerData, setOrganizerData] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Track loading state
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchOrganizerProfile = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/organizerProfile`, {
                    method: 'GET',
                    credentials: "include"
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setOrganizerData(data.organizer);
                } else {
                    // If response is 401 or not ok, redirect to login
                    console.error("Unauthorized: Redirecting to login");
                    navigate("/login", { state: { from: location }, replace: true });
                }
            } catch (error) {
                console.error("Error fetching organizer profile:", error);
                navigate("/login", { replace: true });
            } finally {
                setIsLoading(false);
            }
        }

        fetchOrganizerProfile();
    }, [navigate, location.pathname]); // Re-check if path changes significantly

    // Show a loading screen while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-600 font-medium">Verifying session...</p>
            </div>
        );
    }

    // Double check: if not loading and no data, don't render the private layout
    if (!OrganizerData) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar organizer={OrganizerData} />
            
            {/* Main Content */}
            <main className="pt-16 lg:pt-0 lg:ml-64 min-h-screen transition-all duration-300">
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
                    <Outlet context={{ OrganizerData }} /> 
                </div>
            </main>
        </div>
    );
}

export default Layout;