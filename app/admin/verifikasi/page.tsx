'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserCheck, MoreVertical, Search,
  CheckCircle2, XCircle, AlertCircle, X
} from 'lucide-react';

interface PaymentItem {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  bank: string | null;
  amount: number | null;
  sender_name: string | null;
  transfer_time: string | null;
  hasProof: boolean;
  reason: string | null;
  created_at: string;
  profiles: { id: string; name: string; email: string; jurusan: string | null } | null;
}

export default function VerificationPage() {
  const [queue, setQueue] = useState<PaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PaymentItem | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const loadQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/payments');
      const data = await res.json();
      if (res.ok) setQueue(data.queue);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleApprove = async (id: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Gagal menyetujui.');
      await loadQueue();
      showToast('Pengguna berhasil diverifikasi, status diubah jadi premium');
      setSelectedItem(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menyetujui.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectClick = (id: string) => {
    setRejectingId(id);
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectingId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/payments/${rejectingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Gagal menolak.');
      await loadQueue();
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectReason('');
      showToast('Permintaan verifikasi ditolak', 'error');
      setSelectedItem(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menolak.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    setOpenMenuId(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/payments/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Gagal menghapus riwayat.');
      await loadQueue();
      showToast('Riwayat berhasil dihapus');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus riwayat.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQueue = queue.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      item.profiles?.name?.toLowerCase().includes(q) ||
      item.profiles?.email?.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (!selectedItem?.hasProof) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProofUrl(null);
      return;
    }
    let active = true;
    setProofLoading(true);
    fetch(`/api/admin/payments/${selectedItem.id}/proof`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (active) setProofUrl(data.url);
      })
      .catch(() => {
        if (active) setProofUrl(null);
      })
      .finally(() => {
        if (active) setProofLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedItem]);

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="max-w-2xl">
          <h1 className="font-headline font-bold text-primary text-4xl lg:text-5xl leading-tight tracking-tighter mb-4">
            Verifikasi <span className="text-secondary italic">Pengguna</span>
          </h1>
          <p className="text-on-surface-variant text-lg">Manage user verification requests and premium access.</p>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
            <h3 className="font-headline font-bold text-xl flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-secondary" />
              Daftar Permintaan Verifikasi
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 w-64"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
            </div>
          ) : filteredQueue.length === 0 ? (
            <p className="p-12 text-center text-on-surface-variant italic text-sm">
              {searchQuery ? 'Tidak ada hasil yang cocok.' : 'Belum ada permintaan verifikasi.'}
            </p>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 text-on-surface-variant text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-4 font-bold">Nama Akun</th>
                  <th className="px-6 py-4 font-bold">Jurusan</th>
                  <th className="px-6 py-4 font-bold">Bank</th>
                  <th className="px-6 py-4 font-bold">Nominal</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-6 py-5 font-medium text-primary text-sm">
                      <div>
                        {item.profiles?.name ?? '(akun tidak ditemukan)'}
                        <button 
                          onClick={() => setSelectedItem(item)}
                          className="text-xs font-bold text-secondary hover:underline block mt-1"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant text-sm">{item.profiles?.jurusan || '-'}</td>
                    <td className="px-6 py-5 text-on-surface-variant text-sm">{item.bank || '-'}</td>
                    <td className="px-6 py-5 text-on-surface-variant text-sm">Rp {(item.amount ?? 0).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === 'approved' 
                          ? 'bg-secondary-container text-on-secondary-container' 
                          : item.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 relative">
                        {item.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(item.id)}
                              disabled={isSubmitting}
                              className="p-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all disabled:opacity-50"
                              title="Setujui"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleRejectClick(item.id)}
                              disabled={isSubmitting}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                              title="Tolak"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {item.status !== 'pending' && (
                          <>
                            <button
                              onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                              className="p-1.5 rounded-lg hover:bg-surface-container transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-on-surface-variant" />
                            </button>
                            {openMenuId === item.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-lg border border-outline-variant/10 py-1 min-w-[160px]">
                                  <button
                                    onClick={() => handleDeleteHistory(item.id)}
                                    disabled={isSubmitting}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                  >
                                    Hapus Riwayat
                                  </button>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Detail Modal (no proof image yet — deferred until file storage exists) */}
        <AnimatePresence>
          {selectedItem && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedItem(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
              >
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-surface-container rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>

                <div className="mb-8">
                  <h3 className="text-2xl font-headline font-bold text-primary mb-1">Detail Permintaan</h3>
                  <p className="text-on-surface-variant text-sm">{selectedItem.profiles?.name ?? '(akun tidak ditemukan)'}</p>
                </div>

                <div className="space-y-6">
                  {selectedItem.hasProof ? (
                    proofLoading ? (
                      <div className="w-full h-48 rounded-xl bg-surface-container-low flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary"></div>
                      </div>
                    ) : proofUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL, not worth Next/Image's remote-pattern config for this
                      <img
                        src={proofUrl}
                        alt="Bukti transfer"
                        className="w-full max-h-64 object-contain rounded-xl border border-outline-variant/10 bg-surface-container-low"
                      />
                    ) : (
                      <div className="p-3 rounded-xl bg-red-50 text-xs text-red-700 italic">
                        Gagal memuat gambar bukti.
                      </div>
                    )
                  ) : (
                    <div className="p-3 rounded-xl bg-yellow-50 text-xs text-yellow-800 italic">
                      User tidak menyertakan bukti transfer.
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Nama Pengirim</p>
                      <p className="text-sm font-bold text-primary">{selectedItem.sender_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Bank</p>
                      <p className="text-sm font-bold text-primary">{selectedItem.bank || '-'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Nominal</p>
                      <p className="text-sm font-bold text-secondary">Rp {(selectedItem.amount ?? 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Waktu Transfer</p>
                      <p className="text-sm font-bold text-primary">
                        {selectedItem.transfer_time
                          ? new Date(selectedItem.transfer_time).toLocaleString('id-ID')
                          : '-'}
                      </p>
                    </div>
                  </div>
                  {selectedItem.status === 'rejected' && selectedItem.reason && (
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Alasan Ditolak</p>
                      <p className="text-sm text-red-600">{selectedItem.reason}</p>
                    </div>
                  )}
                </div>

                {selectedItem.status === 'pending' && (
                  <div className="flex gap-3 pt-8 mt-8 border-t border-outline-variant/10">
                    <button 
                      onClick={() => handleApprove(selectedItem.id)}
                      disabled={isSubmitting}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-secondary hover:opacity-90 shadow-lg shadow-secondary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Setujui
                    </button>
                    <button 
                      onClick={() => handleRejectClick(selectedItem.id)}
                      disabled={isSubmitting}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Tolak
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Reject Modal */}
        <AnimatePresence>
          {showRejectModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowRejectModal(false)}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden"
              >
                <button 
                  onClick={() => setShowRejectModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-surface-container rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
                
                <div className="mb-6">
                  <h3 className="text-2xl font-headline font-bold text-primary mb-2">Tolak Permintaan</h3>
                  <p className="text-on-surface-variant text-sm">Berikan alasan penolakan untuk pengguna ini.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Alasan Penolakan (Opsional)</label>
                    <textarea 
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Contoh: Dokumen pendukung tidak valid atau tidak terbaca."
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/10 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm min-h-[120px] resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => setShowRejectModal(false)}
                      disabled={isSubmitting}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handleConfirmReject}
                      disabled={isSubmitting}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Memproses...' : 'Konfirmasi Tolak'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast.show && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className={`fixed bottom-8 right-8 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold ${
                toast.type === 'success' ? 'bg-secondary' : 'bg-red-600'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm">{toast.message}</span>
              <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
