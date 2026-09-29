'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, FileText, ShieldCheck } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  premiumUsers: number;
  activeDocuments: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError('Gagal memuat analitik.'))
      .finally(() => setIsLoading(false));
  }, []);

  const stats = data
    ? [
        { label: 'Total User', value: data.totalUsers, icon: Users, color: 'bg-primary-container' },
        { label: 'User Premium', value: data.premiumUsers, icon: ShieldCheck, color: 'bg-secondary-container' },
        { label: 'Konten Aktif', value: data.activeDocuments, icon: FileText, color: 'bg-surface-container-high' },
      ]
    : [];

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="max-w-2xl">
          <h1 className="font-headline font-bold text-primary text-4xl lg:text-5xl leading-tight tracking-tighter mb-4">
            Analitik <span className="text-secondary italic">Platform</span>
          </h1>
          <p className="text-on-surface-variant text-lg">Ringkasan jumlah pengguna dan konten saat ini.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary"></div>
          </div>
        ) : error ? (
          <p className="text-on-surface-variant">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -4 }}
                className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-headline font-bold text-primary">{stat.value.toLocaleString('id-ID')}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
