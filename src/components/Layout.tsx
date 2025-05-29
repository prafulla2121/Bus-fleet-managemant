import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle clicking outside sidebar to close it
  useEffect(() => {
    if (!sidebarOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar && !sidebar.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onMenuClick={() => setSidebarOpen(prev => !prev)} />
      
      <div className="flex-1 flex">
        {/* Sidebar for desktop */}
        {!isMobile && (
          <div className="w-64 hidden lg:block">
            <Sidebar />
          </div>
        )}
        
        {/* Mobile sidebar */}
        {isMobile && sidebarOpen && (
          <div 
            id="sidebar"
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out animate-slide-in"
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 p-6 lg:ml-0">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;