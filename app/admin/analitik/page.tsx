'use client';

import { motion } from 'motion/react';
import { 
  Users, FileText, Activity, ShieldCheck, 
  ArrowUpRight, PieChart, Eye, Download,
  TrendingUp
} from 'lucide-react';

const stats = [
  { label: 'Total User', value: '12,402', icon: Users, trend: '+12%', color: 'bg-primary-container' },
  { label: 'User Premium', value: '2,891', icon: ShieldCheck, trend: '+8%', color: 'bg-secondary-container' },
  { label: 'Konten Aktif', value: '852', icon: FileText, trend: '+5%', color: 'bg-surface-container-high' },
  { label: 'Departemen', value: '14', icon: Activity, trend: '0%', color: 'bg-surface-container-highest' },
];

const topContent = [
  { id: '1', title: 'Topologi Lanjut & Manifold', views: '1,240', downloads: '450', trend: '+12%' },
  { id: '2', title: 'Aljabar Abstrak: Ring & Field', views: '980', downloads: '320', trend: '+8%' },
  { id: '3', title: 'Dasar Teori Medan Kuantum', views: '850', downloads: '280', trend: '+5%' },
  { id: '4', title: 'Kalkulus I: Limit & Turunan', views: '760', downloads: '210', trend: '+15%' },
  { id: '5', title: 'Metode Numerik: Newton-Raphson', views: '640', downloads: '180', trend: '+2%' },
];

export default function AnalyticsPage() {
  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="max-w-2xl">
          <h1 className="font-headline font-bold text-primary text-4xl lg:text-5xl leading-tight tracking-tighter mb-4">
            Analitik <span className="text-secondary italic">Platform</span>
          </h1>
          <p className="text-on-surface-variant text-lg">Detailed insights and performance metrics.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-headline font-bold text-primary">{stat.value}</p>
                  <span className="text-[10px] font-bold text-secondary flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> {stat.trend}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Top Content Table */}
        <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
            <h3 className="font-headline font-bold text-xl flex items-center gap-2">
              <PieChart className="w-5 h-5 text-secondary" />
              Konten Paling Banyak Diakses
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 text-on-surface-variant text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-4 font-bold">Judul Dokumen</th>
                  <th className="px-6 py-4 font-bold">Views</th>
                  <th className="px-6 py-4 font-bold">Downloads</th>
                  <th className="px-6 py-4 font-bold text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {topContent.map((content) => (
                  <tr key={content.id} className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-6 py-5 font-medium text-primary text-sm">{content.title}</td>
                    <td className="px-6 py-5 text-on-surface-variant text-xs flex items-center gap-2">
                      <Eye className="w-3 h-3" /> {content.views}
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant text-xs">
                      <div className="flex items-center gap-2">
                        <Download className="w-3 h-3" /> {content.downloads}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-xs font-bold text-secondary flex items-center justify-end gap-1">
                        <ArrowUpRight className="w-3 h-3" /> {content.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
