'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { AppSnackbarProvider } from '@/contexts/AppSnackbarContext';

export default function TrangChuLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const MOBILE_BREAKPOINT = 768;
  const BOTTOM_NAV_HEIGHT_PX = 72;

  // Khớp SSR: không đọc window trong initializer (server vs client khác nhau → hydration mismatch).
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);

      if (mobile) {
        // Mobile: mặc định đóng sidebar, chỉ mở theo "drawer"
        setIsSidebarOpen(false);
        setIsCollapsed(false);
      } else {
        // Desktop: giữ behavior cũ (collapse khi < 1024)
        setIsSidebarOpen(true);
        setIsCollapsed(window.innerWidth < 1024);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Khi đổi route trên mobile, đóng drawer để tránh che màn hình
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [pathname, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      // Mobile: mở/đóng drawer
      setIsSidebarOpen((prev) => !prev);
      setIsCollapsed(false);
      return;
    }
    setIsSidebarOpen((prev) => !prev);
  };

  // Topbar đang gọi toggleCollapse khi bấm menu button
  const toggleCollapse = () => {
    if (isMobile) {
      setIsSidebarOpen((prev) => !prev);
      setIsCollapsed(false);
      return;
    }
    setIsCollapsed((prev) => !prev);
  };

  const sidebarWidth = isMobile
    ? '0px'
    : !isSidebarOpen
      ? '0px'
      : isCollapsed
        ? '4rem'
        : '18rem';

  const bottomNavHeight = isMobile ? `${BOTTOM_NAV_HEIGHT_PX}px` : '0px';

  return (
    <AppSnackbarProvider>
    <div
      className="min-h-screen bg-gray-50"
      style={
        {
          '--sidebar-width': sidebarWidth,
          '--content-padding-right': '0.5rem',
          '--bottom-nav-height': bottomNavHeight,
        } as React.CSSProperties
      }
    >
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isMobile ? false : isCollapsed}
        toggleCollapse={toggleCollapse}
      />
      <Topbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        toggleCollapse={toggleCollapse}
        isCollapsed={isCollapsed}
      />

      <main
        className={`relative pt-[72px] min-h-screen transition-all duration-300 ease-in-out ${isMobile ? 'pl-0' : (isSidebarOpen ? (isCollapsed ? 'pl-16' : 'pl-72') : 'pl-0')} ${
          isMobile ? 'pb-[72px]' : ''
        }`}
      >
        {/*
          Neo modal `contained` theo đúng cột nội dung (sau padding sidebar), không full viewport —
          tránh lớp phủ absolute kéo dài sang vùng sidebar.
        */}
        <div className="relative z-0 min-h-0 w-full min-w-0 overflow-x-hidden">{children}</div>
      </main>

      {/*
        Portal modal: lớp phủ chỉ trong cột nội dung (không che sidebar), dưới topbar.
      */}
      <div
        id="homepage-modal-root"
        className="pointer-events-none fixed z-[110]"
        style={{
          top: '72px',
          left: 'var(--sidebar-width)',
          right: 0,
          bottom: 'var(--bottom-nav-height)',
        }}
      />

      {isMobile && <MobileBottomNav />}
    </div>
    </AppSnackbarProvider>
  );
}
