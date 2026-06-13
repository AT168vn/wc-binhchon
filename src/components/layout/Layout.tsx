"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { AppSnackbarProvider } from "@/contexts/AppSnackbarContext";

const MOBILE_BREAKPOINT = 768;

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Màn nhỏ: mặc định sidebar chỉ hiện icon (collapsed), và giữ nguyên khi resize
    useEffect(() => {
        const check = () => {
            if (window.innerWidth < MOBILE_BREAKPOINT) {
                setIsCollapsed(true);
            }
        };
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <AppSnackbarProvider>
        <div className="flex h-screen bg-[#F8F9FA]">
            <Sidebar
                isOpen={isSidebarOpen}
                isCollapsed={isCollapsed}
                toggleCollapse={toggleCollapse}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    toggleCollapse={toggleCollapse}
                    isCollapsed={isCollapsed}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8F9FA] pt-[72px]">
                    {children}
                </main>
            </div>
        </div>
        </AppSnackbarProvider>
    );
};

export default Layout; 