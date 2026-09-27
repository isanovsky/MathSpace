'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Calendar, 
  ShieldCheck, 
  Edit3, 
  ChevronLeft, 
  CheckCircle2, 
  X, 
  AlertCircle,
  CreditCard,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [editForm, setEditForm] = useState({
    name: '',
    jurusan: '',
    angkatan: ''
  });

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    const stored = localStorage.getItem('mathspace_user');
    if (!stored) {
      window.location.href = '/login';
      return;
    }

    const storedPayments = localStorage.getItem('mathspace_payments');
    let parsedPayments = [];
    if (storedPayments) {
      try {
        parsedPayments = JSON.parse(storedPayments);
      } catch (e) {
        parsedPayments = [];
      }
    }

    try {
      const parsedUser = JSON.parse(stored);
      setTimeout(() => {
        setUser(parsedUser);
        setEditForm({
          name: parsedUser.name || '',
          jurusan: parsedUser.jurusan || '',
          angkatan: parsedUser.angkatan || '2023'
        });
        setPayments(parsedPayments);
        setIsLoading(false);
      }, 0);
    } catch (e) {
      window.location.href = '/login';
    }
  }, [router]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      name: editForm.name,
      jurusan: editForm.jurusan,
      angkatan: editForm.angkatan
    };
    
    localStorage.setItem('mathspace_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    showToast('Profil berhasil diperbarui');
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-body">
      <Navbar />
      
      <main className="pt-24 pb-16 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-navy hover:text-teal font-bold mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Section Atas: Info Profil */}
          <div className="lg:col-span-12">
            <div className="bg-white rounded-3xl shadow-xl shadow-navy/5 border border-outline-variant/10 overflow-hidden">
              <div className="h-32 bg-navy relative">
                <div className="absolute inset-0 math-pattern opacity-10"></div>
              </div>
              <div className="px-8 pb-8 relative">
                <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12 mb-8">
                  <div className="w-24 h-24 rounded-3xl bg-navy border-4 border-white flex items-center justify-center text-white text-4xl font-bold shadow-lg relative z-10">
                    {user?.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h1 className="text-3xl font-display font-bold text-navy">{user?.name}</h1>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user?.status === 'premium' ? 'bg-teal text-white' : 
                        user?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {user?.status || 'Gratis'}
                      </span>
                    </div>
                    <p className="text-on-surface-variant flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4" /> {user?.email}
                    </p>
                  </div>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="bg-surface-container-high text-navy px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-navy hover:text-white transition-all shadow-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Profil
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.form 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleSave}
                      className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-navy uppercase tracking-wider">Nama Lengkap</label>
                          <input 
                            type="text" 
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all text-sm"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-navy uppercase tracking-wider">Jurusan</label>
                          <input 
                            type="text" 
                            value={editForm.jurusan}
                            onChange={(e) => setEditForm({...editForm, jurusan: e.target.value})}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all text-sm"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-navy uppercase tracking-wider">Angkatan</label>
                          <select 
                            value={editForm.angkatan}
                            onChange={(e) => setEditForm({...editForm, angkatan: e.target.value})}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all text-sm appearance-none"
                          >
                            <option value="2021">2021</option>
                            <option value="2022">2022</option>
                            <option value="2023">2023</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <button 
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2.5 text-sm font-bold text-on-surface-variant hover:text-navy transition-colors"
                        >
                          Batal
                        </button>
                        <button 
                          type="submit"
                          className="bg-teal text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-teal/20 hover:opacity-90 transition-all text-sm"
                        >
                          Simpan Perubahan
                        </button>
                      </div>
                    </motion.form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/5">
                        <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-navy">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jurusan</p>
                          <p className="text-sm font-bold text-navy">{user?.jurusan || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/5">
                        <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-navy">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Angkatan</p>
                          <p className="text-sm font-bold text-navy">{user?.angkatan || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/5">
                        <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-navy">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status Akun</p>
                          <p className="text-sm font-bold text-navy">{user?.status === 'premium' ? 'Premium Member' : 'Free Member'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Section Bawah: Riwayat Pembayaran */}
          <div className="lg:col-span-12">
            <div className="bg-white rounded-3xl shadow-xl shadow-navy/5 border border-outline-variant/10 overflow-hidden">
              <div className="p-8 border-b border-outline-variant/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center text-teal">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-display font-bold text-navy">Riwayat Pembayaran</h3>
              </div>
              
              <div className="p-0">
                {payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low/50 text-on-surface-variant text-[10px] uppercase tracking-widest">
                          <th className="px-8 py-4 font-bold">Tanggal</th>
                          <th className="px-8 py-4 font-bold">Nominal</th>
                          <th className="px-8 py-4 font-bold">Status</th>
                          <th className="px-8 py-4 font-bold">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {payments.map((payment, i) => (
                          <tr key={i} className="hover:bg-surface-container-low/30 transition-colors">
                            <td className="px-8 py-5 text-sm text-navy font-medium">{payment.date}</td>
                            <td className="px-8 py-5 text-sm text-navy font-bold">{payment.amount}</td>
                            <td className="px-8 py-5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                payment.status === 'Berhasil' ? 'bg-green-100 text-green-700' : 
                                payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                                'bg-red-100 text-red-700'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-xs text-on-surface-variant">{payment.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                    <History className="w-16 h-16 mb-4 opacity-10" />
                    <p className="text-lg font-medium">Belum ada riwayat pembayaran.</p>
                    <p className="text-sm opacity-60">Transaksi kamu akan muncul di sini.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className={`fixed bottom-8 right-8 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold ${
              toast.type === 'success' ? 'bg-teal' : 'bg-red-600'
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
  );
}
