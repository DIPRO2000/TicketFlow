import React,{ useState,useEffect } from "react";
import Sidebar from "./components/navigation/Sidebar"; 
import { Outlet } from "react-router-dom"; 

const Layout = () => {
    const [OrganizerData, setOrganizerData] = useState(null);

    useEffect(() => {
        const fetchOrganizerProfile = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/organizerProfile`,{
                    method: 'GET',
                    credentials: "include"
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setOrganizerData(data.organizer);
                } else {
                    console.error("Failed to fetch organizer profile");
                }
            } catch (error) {
                console.error("Error fetching organizer profile:", error);
            }
        }

        fetchOrganizerProfile();
    },[]);

    // useEffect(() => {
    //     console.log("State updated! New OrganizerData:", OrganizerData);
    // }, [OrganizerData]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            
            {/* Main Content */}
            <main className="pt-16 lg:pt-0 lg:ml-64 min-h-screen transition-all duration-300">
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
                    <Outlet context={{OrganizerData}} /> 
                </div>
            </main>
        </div>
    );
}

export default Layout;