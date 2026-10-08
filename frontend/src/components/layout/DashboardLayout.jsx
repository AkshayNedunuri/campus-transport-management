import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import apiClient from '../../api/client';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await apiClient.get('/notifications');
        if (res.data?.notifications) {
          const count = res.data.notifications.filter((n) => !n.read).length;
          setUnreadCount(count);
        }
      } catch (e) {
        // Ignore silent background notification fetch error
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        notificationsCount={unreadCount}
      />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
