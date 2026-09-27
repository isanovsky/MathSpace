'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { 
  UserCheck, Search, MoreVertical, 
  CheckCircle2, XCircle, AlertCircle, X, Eye, Image as ImageIcon
} from 'lucide-react';
import { getQueue, approveUser, rejectUser, PaymentItem } from '@/lib/adminStore';

export default function VerificationPage() {
  const [queue, setQueue] = useState<PaymentItem[]>([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PaymentItem | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Sync queue from localStorage
  useEffect(() => {
    const sync = () => {
      setQueue(getQueue());
    };
    sync();
    const interval = setInterval(sync, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleApprove = (id: string) => {
    approveUser(id);
    showToast('Pengguna berhasil diverifikasi');
    if (showProofModal) setShowProofModal(false);
  };

  const handleRejectClick = (id: string) => {
    setRejectingId(id);
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (rejectingId) {
      rejectUser(rejectingId, rejectReason);
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectReason('');
      showToast('Permintaan verifikasi ditolak', 'error');
      if (showProofModal) setShowProofModal(false);
    }
  };

  const handleShowProof = (item: PaymentItem) => {
    setSelectedItem(item);
    setShowProofModal(true);
  };

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
                placeholder="Cari pengguna..." 
                className="pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-lg text-xs focus:ring-2 focus:ring-secondary/20 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 text-on-surface-variant text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-4 font-bold">Nama</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Bank</th>
                  <th className="px-6 py-4 font-bold">Nominal</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {queue.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-6 py-5 font-medium text-primary text-sm">
                      <div>
                        {item.name}
                        <button 
                          onClick={() => handleShowProof(item)}
                          className="text-[10px] font-bold text-secondary hover:underline flex items-center gap-1 mt-1"
                        >
                          <Eye className="w-3 h-3" /> Lihat Bukti
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant text-xs">{item.role}</td>
                    <td className="px-6 py-5 text-on-surface-variant text-xs">{item.bank || '-'}</td>
                    <td className="px-6 py-5 text-on-surface-variant text-xs">Rp {(item.amount || 15000).toLocaleString()}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
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
                      <div className="flex justify-end gap-2">
                        {item.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(item.id)}
                              className="p-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all"
                              title="Setujui"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleRejectClick(item.id)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                              title="Tolak"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-1.5 rounded-lg hover:bg-surface-container transition-colors">
                          <MoreVertical className="w-4 h-4 text-on-surface-variant" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Preview Bukti Modal */}
        <AnimatePresence>
          {showProofModal && selectedItem && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowProofModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row"
              >
                <button 
                  onClick={() => setShowProofModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-surface-container rounded-full transition-colors z-10 bg-white/80 backdrop-blur-md"
                >
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>

                {/* Left: Image Preview */}
                <div className="w-full md:w-[60%] bg-surface-container-low flex items-center justify-center min-h-[300px] border-r border-outline-variant/10">
                  {selectedItem.proofImageUrl ? (
                    <div className="relative w-full h-full">
                      <Image 
                        src={selectedItem.proofImageUrl} 
                        alt="Bukti Transfer" 
                        fill
                        className="object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-on-surface-variant opacity-40 p-12 text-center">
                      <ImageIcon className="w-16 h-16 mb-4" />
                      <p className="text-sm font-medium">Bukti transfer akan tampil di sini setelah user upload</p>
                    </div>
                  )}
                </div>

                {/* Right: Details */}
                <div className="w-full md:w-[40%] p-8 flex flex-col">
                  <div className="mb-8">
                    <h3 className="text-2xl font-headline font-bold text-primary mb-1">Bukti Transfer</h3>
                    <p className="text-on-surface-variant text-sm">{selectedItem.name}</p>
                  </div>

                  <div className="space-y-6 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Nama Pengirim</p>
                        <p className="text-sm font-bold text-primary">{selectedItem.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Bank</p>
                        <p className="text-sm font-bold text-primary">{selectedItem.bank || '-'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Nominal</p>
                        <p className="text-sm font-bold text-secondary">Rp {(selectedItem.amount || 15000).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Waktu Transfer</p>
                        <p className="text-sm font-bold text-primary">{selectedItem.transferTime || '-'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Catatan User</p>
                      <p className="text-sm text-on-surface-variant italic">&quot;Mohon segera diproses untuk akses materi Kalkulus II.&quot;</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-8 mt-auto border-t border-outline-variant/10">
                    <button 
                      onClick={() => handleApprove(selectedItem.id)}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-secondary hover:opacity-90 shadow-lg shadow-secondary/20 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Setujui
                    </button>
                    <button 
                      onClick={() => handleRejectClick(selectedItem.id)}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Tolak
                    </button>
                  </div>
                </div>
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
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handleConfirmReject}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
                    >
                      Konfirmasi Tolak
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
