'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Upload, Copy, ArrowRight, ShieldCheck, Star, Sparkles, CreditCard, Lock, User, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Pricing() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [senderName, setSenderName] = useState('');

  useEffect(() => {
    if (currentUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSenderName(currentUser.name || '');
    }
  }, [currentUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // TODO(step 7): masih simulasi ke localStorage. Setelah payment_queue
  // dimigrasikan ke Supabase, ini harus jadi POST ke Route Handler yang
  // menyisipkan baris dengan user_id = currentUser.id, dan status di
  // profiles hanya boleh berubah lewat approval admin di server, bukan dari sini.
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !currentUser) return;

    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      // Update user status in localStorage
      const user = JSON.parse(localStorage.getItem('mathspace_user') || '{}');
      user.status = 'pending';
      localStorage.setItem('mathspace_user', JSON.stringify(user));

      // Add submission to payment queue
      const queue = JSON.parse(localStorage.getItem('mathspace_queue') || '[]');
      queue.push({
        id: 'pay-' + Date.now(),
        userId: currentUser.id,
        name: currentUser.name,
        role: currentUser.jurusan || 'Mahasiswa',
        status: 'pending',
        submittedAt: new Date().toISOString()
      });
      localStorage.setItem('mathspace_queue', JSON.stringify(queue));

      setIsUploading(false);
      setSelectedFile(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="w-full lg:w-2/3 space-y-12">
            <div className="space-y-4">
              <span className="font-bold uppercase tracking-widest text-secondary text-xs">Paket Langganan</span>
              <h1 className="font-headline text-5xl md:text-6xl font-bold text-primary tracking-tighter leading-tight">
                Precision Learning,<br/>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Exponential Growth.</span>
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Free Tier */}
              <motion.div 
                whileHover={{ y: -8 }}
                className="relative overflow-hidden bg-surface-container-lowest p-8 rounded-3xl flex flex-col justify-between group border border-outline-variant/10 shadow-sm"
              >
                <div className="absolute top-0 right-0 w-32 h-32 math-pattern opacity-10 pointer-events-none"></div>
                <div>
                  <div className="inline-flex px-3 py-1 bg-surface-container-low text-on-surface-variant text-[10px] font-bold rounded-full mb-6 uppercase tracking-wider">Gratis</div>
                  <h3 className="font-headline text-2xl font-bold text-primary mb-2">Akses Standar</h3>
                  <p className="text-on-surface-variant text-sm mb-8">Akses standar dan konten-konten gratis.</p>
                  <ul className="space-y-4 mb-10">
                    <li className="flex items-center gap-3 text-sm text-on-surface">
                      <CheckCircle2 className="w-5 h-5 text-secondary" />
                      Konten-konten gratis terbatas.
                    </li>
                    <li className="flex items-center gap-3 text-sm text-on-surface">
                      <CheckCircle2 className="w-5 h-5 text-secondary" />
                      Akses tutorial dasar
                    </li>
                    <li className="flex items-center gap-3 text-sm text-on-surface-variant">
                      <XCircle className="w-5 h-5" />
                      AI Assistant
                    </li>
                  </ul>
                </div>
                <div className="text-3xl font-bold text-primary">Rp 0<span className="text-sm font-normal text-on-surface-variant">/bln</span></div>
              </motion.div>

              {/* Premium Tier */}
              <motion.div 
                whileHover={{ y: -8 }}
                className="relative overflow-hidden bg-white p-8 rounded-3xl flex flex-col justify-between shadow-2xl ring-1 ring-primary/5 group scale-105 z-10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-40 h-40 math-pattern opacity-20 pointer-events-none"></div>
                <div>
                  <div className="inline-flex px-3 py-1 bg-gradient-to-r from-secondary to-teal-800 text-white text-[10px] font-bold rounded-full mb-6 uppercase tracking-wider shadow-lg">Premium</div>
                  <h3 className="font-headline text-2xl font-bold text-primary mb-2">Akses Premium</h3>
                  <p className="text-on-surface-variant text-sm mb-8">Akses tak terbatas ke seluruh konten dan fitur.</p>
                  <ul className="space-y-4 mb-10">
                    <li className="flex items-center gap-3 text-sm text-on-surface">
                      <CheckCircle2 className="w-5 h-5 text-secondary fill-current" />
                      Akses konten penuh
                    </li>
                    <li className="flex items-center gap-3 text-sm text-on-surface">
                      <CheckCircle2 className="w-5 h-5 text-secondary fill-current" />
                      AI Assistant
                    </li>
                    <li className="flex items-center gap-3 text-sm text-on-surface">
                      <CheckCircle2 className="w-5 h-5 text-secondary fill-current" />
                      Spreadsheet, E-Book dan Cheatsheet
                    </li>
                  </ul>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold text-primary">Rp10rb<span className="text-sm font-normal text-on-surface-variant">/6 bulan</span></div>
                  <ShieldCheck className="w-6 h-6 text-secondary animate-pulse" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Payment Hub */}
          <div className="w-full lg:w-1/3 space-y-6 sticky top-32">
            {!currentUser ? (
              /* Case A: Not logged in */
              <div className="bg-white p-8 rounded-3xl border border-outline-variant/10 shadow-xl text-center space-y-6">
                <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mx-auto text-on-surface-variant">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-headline text-xl font-bold text-primary">Login Diperlukan</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Anda perlu login untuk dapat melakukan upgrade ke Premium. Silakan masuk atau buat akun gratis terlebih dahulu.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="flex-1 py-3 bg-primary text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all"
                  >
                    Masuk
                  </button>
                  <button 
                    onClick={() => window.location.href = '/register'}
                    className="flex-1 py-3 border-2 border-primary text-primary font-bold rounded-xl text-sm hover:bg-primary/5 transition-all"
                  >
                    Daftar Akun
                  </button>
                </div>
              </div>
            ) : currentUser.status === 'premium' ? (
              /* Case B: Already Premium */
              <div className="bg-white p-8 rounded-3xl border border-outline-variant/10 shadow-xl text-center space-y-6">
                <div className="w-16 h-16 bg-secondary-container rounded-2xl flex items-center justify-center mx-auto text-secondary">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-headline text-xl font-bold text-primary">Anda sudah Premium!</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Anda memiliki akses penuh ke seluruh konten dan fitur MathSpace. Selamat belajar!
                  </p>
                </div>
                <button 
                  onClick={() => router.push('/library')}
                  className="w-full py-3 bg-secondary text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all"
                >
                  Ke Perpustakaan
                </button>
              </div>
            ) : currentUser.status === 'pending' ? (
              /* Case C: Pending Verification */
              <div className="bg-white p-8 rounded-3xl border border-outline-variant/10 shadow-xl text-center space-y-6">
                <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mx-auto text-secondary">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-headline text-xl font-bold text-primary">Verifikasi Diproses</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Bukti pembayaran Anda telah dikirim. Admin akan melakukan verifikasi dalam waktu maksimal 1×24 jam.
                  </p>
                </div>
              </div>
            ) : (
              /* Case D: Logged in and Unverified/Free */
              <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
                <h4 className="font-headline text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Pembayaran
                </h4>
                <div className="space-y-4 mb-8">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Detail Transfer Bank</p>
                  
                  <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between group transition-all hover:bg-white border border-outline-variant/5">
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold">BCA</p>
                      <p className="text-sm font-mono font-bold text-primary">023-4455-991</p>
                      <p className="text-[10px] text-on-surface-variant">Departemen Matematika ITS</p>
                    </div>
                    <button onClick={() => handleCopy('0234455991')} className="p-2 text-on-surface-variant hover:text-secondary transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between group transition-all hover:bg-white border border-outline-variant/5">
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold">Mandiri</p>
                      <p className="text-sm font-mono font-bold text-primary">121-00-1234567-8</p>
                      <p className="text-[10px] text-on-surface-variant">Departemen Matematika ITS</p>
                    </div>
                    <button onClick={() => handleCopy('1210012345678')} className="p-2 text-on-surface-variant hover:text-secondary transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Verifikasi</p>
                  
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase mb-1 block">Nama Pengirim</label>
                    <input 
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-outline-variant/10 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 transition-all mb-3"
                      placeholder="Nama sesuai rekening"
                    />
                  </div>

                  <div className="relative group">
                    <div className={`border-2 border-dashed rounded-2xl p-8 text-center bg-surface transition-all group-hover:bg-white group-hover:border-secondary ${selectedFile ? 'border-secondary' : 'border-outline-variant'}`}>
                      <Upload className={`w-10 h-10 mx-auto mb-2 transition-colors ${selectedFile ? 'text-secondary' : 'text-on-surface-variant'}`} />
                      <p className="text-xs text-on-surface-variant font-medium">
                        {selectedFile ? selectedFile.name : 'Unggah Bukti Transfer'}
                      </p>
                      <p className="text-[10px] text-on-surface-variant mt-1">JPEG, PNG, atau PDF hingga 5MB</p>
                      <input 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        type="file" 
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        required
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={!selectedFile || isUploading}
                    className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Mengirim...' : 'Kirim untuk Verifikasi'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-center text-on-surface-variant px-4 italic leading-relaxed">
                    Verifikasi biasanya memakan waktu 1-2 jam selama jam kerja. Status Anda akan diperbarui secara otomatis.
                  </p>
                </form>
              </div>
            )}

            <div className="relative h-48 rounded-3xl overflow-hidden group shadow-lg">
              <div className="absolute inset-0 bg-primary/80 z-10"></div>
              <div className="absolute inset-0 math-pattern opacity-20 z-20"></div>
              <div className="absolute inset-0 flex items-center justify-center p-8 z-30">
                <p className="text-white text-sm font-medium text-center leading-relaxed">
                  Bergabunglah dengan lebih dari 150 mahasiswa yang mengoptimalkan performa akademik mereka.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}