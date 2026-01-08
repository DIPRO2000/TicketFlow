import React from "react";
import Sidebar from "./components/navigation/Sidebar"; 
import { Outlet } from "react-router-dom"; // Import this!

const Layout = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            
            {/* Main Content */}
            <main className="pt-16 lg:pt-0 lg:ml-64 min-h-screen transition-all duration-300">
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
                    <Outlet /> 
                </div>
            </main>
        </div>
    );
}

export default Layout;