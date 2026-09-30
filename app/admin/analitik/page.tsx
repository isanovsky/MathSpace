'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, FileText, ShieldCheck, Search, AlertCircle } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  premiumUsers: number;
  activeDocuments: number;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'unverified' | 'pending' | 'premium';
  premium_since: string | null;
  created_at: string;
}

function premiumDuration(premiumSince: string | null): string {
  if (!premiumSince) return '-';
  const start = new Date(premiumSince).getTime();
  const days = Math.max(0, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)));
  if (days < 1) return 'Baru saja';
  if (days < 30) return `${days} hari`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths > 0 ? `${years} tahun ${remMonths} bulan` : `${years} tahun`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      const json = await res.json();
      if (res.ok) setUsers(json.users);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError('Gagal memuat analitik.'))
      .finally(() => setIsLoading(false));
    loadUsers();
  }, [loadUsers]);

  const handleToggleStatus = async (user: UserRow) => {
    const nextStatus = user.status === 'premium' ? 'unverified' : 'premium';
    setBusyId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Gagal mengubah status.');
      await loadUsers();
      showToast(nextStatus === 'premium' ? 'User dijadikan premium' : 'User dikembalikan ke biasa');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengubah status.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Gagal menghapus user.');
      setDeleteTarget(null);
      await loadUsers();
      showToast('User berhasil dihapus');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus user.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

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

        {/* User Management Table */}
        <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
            <h3 className="font-headline font-bold text-xl">Semua User Aktif</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 w-64"
              />
            </div>
          </div>

          {usersLoading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="p-12 text-center text-on-surface-variant italic text-sm">
              {userSearch ? 'Tidak ada hasil yang cocok.' : 'Belum ada user.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-low/50 text-on-surface-variant text-[10px] uppercase tracking-widest">
                    <th className="px-6 py-4 font-bold w-12">No</th>
                    <th className="px-6 py-4 font-bold">Nama</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Durasi Premium</th>
                    <th className="px-6 py-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-6 py-5 text-on-surface-variant text-sm">{i + 1}</td>
                      <td className="px-6 py-5">
                        <p className="font-medium text-primary text-sm">{u.name}</p>
                        <p className="text-xs text-on-surface-variant">{u.email}</p>
                      </td>
                      <td className="px-6 py-5">
                        {u.role === 'admin' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-container text-primary">Admin</span>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            u.status === 'premium' ? 'bg-secondary-container text-on-secondary-container' :
                            u.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {u.status === 'premium' ? 'Premium' : u.status === 'pending' ? 'Pending' : 'Biasa'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-on-surface-variant text-sm">
                        {u.role === 'admin' ? '-' : premiumDuration(u.premium_since)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {u.role === 'admin' ? (
                          <span className="text-xs text-on-surface-variant italic">Dikelola lewat Supabase</span>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={busyId === u.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all disabled:opacity-50"
                            >
                              {u.status === 'premium' ? 'Jadikan Biasa' : 'Jadikan Premium'}
                            </button>
                            <button
                              onClick={() => setDeleteTarget(u)}
                              disabled={busyId === u.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete User Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center"
            >
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-headline font-bold text-primary mb-2">Hapus {deleteTarget.name}?</h3>
              <p className="text-on-surface-variant text-sm mb-6">
                Akun, profil, dan seluruh riwayat pembayaran user ini akan dihapus permanen. Ini tidak bisa dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={busyId === deleteTarget.id}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {busyId === deleteTarget.id ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-8 right-8 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold ${
              toast.type === 'success' ? 'bg-secondary' : 'bg-red-600'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
