'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, UserCheck, PieChart, 
  ShieldCheck
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      window.location.href = '/login';
    } else if (!isAdmin) {
      window.location.href = '/';
    }
  }, [isLoading, user, isAdmin]);

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Kelola Konten', href: '/admin', icon: LayoutDashboard },
    { name: 'Verifikasi Pengguna', href: '/admin/verifikasi', icon: UserCheck },
    { name: 'Analitik', href: '/admin/analitik', icon: PieChart },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      
      <div className="flex pt-16 min-h-screen">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-low border-r border-outline-variant/10 flex flex-col p-4 z-40">
          <div className="mb-8 px-2">
            <h2 className="font-headline font-bold text-primary text-lg">Administrator Dashboard</h2>
            <p className="text-on-surface-variant text-xs">Platform Management</p>
          </div>
          
          <nav className="flex flex-col gap-1 flex-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:translate-x-1 ${
                    isActive 
                      ? 'text-primary font-semibold bg-white shadow-sm' 
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-secondary' : ''}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Systems Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
              <span className="text-xs font-medium text-on-surface">All Systems Normal</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="ml-64 flex-1">
          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
}