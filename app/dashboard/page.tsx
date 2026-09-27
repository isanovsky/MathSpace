'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  User, 
  BookOpen, 
  History, 
  Settings, 
  ChevronRight, 
  Star,
  Clock,
  Download,
  FileText
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem('mathspace_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } else {
        window.location.href = '/login';
      }
    };

    const timer = setTimeout(checkUser, 0);
    return () => clearTimeout(timer);
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const recentActivities = [
    { id: 1, title: 'Kalkulus II - Pembahasan UTS 2023', type: 'Dokumen', date: '2 jam yang lalu', icon: FileText },
    { id: 2, title: 'Aljabar Linier - Latihan Soal', type: 'Dokumen', date: '1 hari yang lalu', icon: FileText },
    { id: 3, title: 'Upgrade ke Premium', type: 'Sistem', date: '3 hari yang lalu', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      
      <main className="pt-24 pb-16 px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-headline font-bold text-primary tracking-tight mb-2">
                Halo, <span className="text-secondary">{user.name}</span>!
              </h1>
              <p className="text-on-surface-variant">Selamat datang kembali di dasbor MathSpace kamu.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/library" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Jelajahi Konten
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* User Profile Card */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-navy flex items-center justify-center text-white text-3xl font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary">{user.name}</h3>
                    <p className="text-sm text-on-surface-variant">{user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      user.status === 'premium' ? 'bg-teal-50 text-teal border-teal/20' : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {user.status?.toUpperCase() || 'GRATIS'}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/10">
                      ANGKATAN {user.angkatan}
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-outline-variant/10 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Jurusan</span>
                    <span className="font-bold text-primary">{user.jurusan}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Dokumen Diunduh</span>
                    <span className="font-bold text-primary">12</span>
                  </div>
                </div>

                <Link href="/profil" className="mt-8 w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-on-surface-variant border border-outline-variant/20 rounded-xl hover:bg-surface-container transition-all">
                  <Settings className="w-4 h-4" /> Pengaturan Profil
                </Link>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5">
                  <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center mb-4">
                    <Download className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-primary">12</p>
                  <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Unduhan</p>
                </div>
                <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center mb-4">
                    <Star className="w-5 h-5 text-secondary" />
                  </div>
                  <p className="text-2xl font-bold text-primary">5</p>
                  <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Favorit</p>
                </div>
                <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center mb-4">
                    <Clock className="w-5 h-5 text-on-surface-variant" />
                  </div>
                  <p className="text-2xl font-bold text-primary">24</p>
                  <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Jam Belajar</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                  <h3 className="font-headline font-bold text-xl flex items-center gap-2">
                    <History className="w-5 h-5 text-secondary" />
                    Aktivitas Terbaru
                  </h3>
                </div>
                <div className="divide-y divide-outline-variant/5">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="p-6 hover:bg-surface-container-low transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                          <activity.icon className="w-5 h-5 text-on-surface-variant" />
                        </div>
                        <div>
                          <p className="font-bold text-primary group-hover:text-secondary transition-colors">{activity.title}</p>
                          <p className="text-xs text-on-surface-variant">{activity.type} • {activity.date}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-outline group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-surface-container-low/50 text-center">
                  <button className="text-xs font-bold text-secondary uppercase tracking-widest hover:underline">
                    Lihat Semua Aktivitas
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
