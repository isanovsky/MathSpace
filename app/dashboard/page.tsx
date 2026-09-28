'use client';

import { useEffect } from 'react';
import {
  BookOpen,
  Settings,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/login';
    }
  }, [isLoading, user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const joinedLabel = new Date(user.createdAt).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="pt-24 pb-16 px-8">
        <div className="max-w-3xl mx-auto space-y-12">
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

          {/* User Profile Card */}
          <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm p-10 max-w-xl mx-auto">
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
                <span className="text-on-surface-variant">Bergabung Sejak</span>
                <span className="font-bold text-primary">{joinedLabel}</span>
              </div>
            </div>

            <Link href="/profil" className="mt-8 w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-on-surface-variant border border-outline-variant/20 rounded-xl hover:bg-surface-container transition-all">
              <Settings className="w-4 h-4" /> Pengaturan Profil
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}