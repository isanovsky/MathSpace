'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Copy, ArrowRight, ShieldCheck, Star, Sparkles, CreditCard, Lock, Clock, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface LatestPayment {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string | null;
}

const BANKS = [
  { id: 'BCA', label: 'BCA', account: '023-4455-991', accountRaw: '0234455991' },
  { id: 'Mandiri', label: 'Mandiri', account: '121-00-1234567-8', accountRaw: '1210012345678' },
] as const;

export default function Pricing() {
  const router = useRouter();
  const { user: currentUser, refresh } = useAuth();
  const [senderName, setSenderName] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const MAX_PROOF_BYTES = 200 * 1024; // 200KB — must match the server's limit
  const [bank, setBank] = useState<'BCA' | 'Mandiri' | ''>('');
  const [transferTime, setTransferTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [latestPayment, setLatestPayment] = useState<LatestPayment | null>(null);

  useEffect(() => {
    if (currentUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSenderName(currentUser.name || '');
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    fetch('/api/payments/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setLatestPayment(data?.payment ?? null);
      })
      .catch(() => {});
  }, [currentUser]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !bank || !transferTime || !proofFile) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(proofFile.type)) {
      setFormError('Format gambar harus JPEG, PNG, atau WebP.');
      return;
    }
    if (proofFile.size > MAX_PROOF_BYTES) {
      setFormError('Ukuran gambar maksimal 200KB.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const body = new FormData();
      body.append('senderName', senderName);
      body.append('bank', bank);
      body.append('transferTime', transferTime);
      body.append('proof', proofFile);

      const res = await fetch('/api/payments', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Gagal mengirim permintaan.');

      await refresh();
      setBank('');
      setTransferTime('');
      setProofFile(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal mengirim permintaan.');
    } finally {
      setIsSubmitting(false);
    }
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
                  <div className="text-3xl font-bold text-primary">Rp20rb<span className="text-sm font-normal text-on-surface-variant">/lifetime</span></div>
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
                    Permintaan pembayaran Anda telah dikirim. Admin akan melakukan verifikasi dalam waktu maksimal 1×24 jam.
                  </p>
                </div>
              </div>
            ) : (
              /* Case D: Logged in and Unverified/Free */
              <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
                <h4 className="font-headline text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Pembayaran
                </h4>

                {latestPayment?.status === 'rejected' && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-700">Permintaan sebelumnya ditolak</p>
                      {latestPayment.reason && (
                        <p className="text-xs text-red-600 mt-1">{latestPayment.reason}</p>
                      )}
                      <p className="text-xs text-red-600 mt-1">Silakan kirim ulang dengan data yang benar.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Detail Transfer Bank</p>

                  {BANKS.map((b) => (
                    <div key={b.id} className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between group transition-all hover:bg-white border border-outline-variant/5">
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold">{b.label}</p>
                        <p className="text-sm font-mono font-bold text-primary">{b.account}</p>
                        <p className="text-[10px] text-on-surface-variant">Departemen Matematika ITS</p>
                      </div>
                      <button onClick={() => handleCopy(b.accountRaw)} className="p-2 text-on-surface-variant hover:text-secondary transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
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
                      className="w-full px-4 py-2 bg-white border border-outline-variant/10 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 transition-all"
                      placeholder="Nama sesuai rekening"
                    />
                    <p className="text-[10px] text-on-surface-variant mt-1">Isi persis seperti nama di struk transfer, terutama kalau ditransfer bukan atas nama sendiri.</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase mb-1 block">Transfer ke Rekening</label>
                    <select
                      required
                      value={bank}
                      onChange={(e) => setBank(e.target.value as 'BCA' | 'Mandiri')}
                      className="w-full px-4 py-2 bg-white border border-outline-variant/10 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 transition-all appearance-none"
                    >
                      <option value="">Pilih rekening tujuan...</option>
                      {BANKS.map((b) => (
                        <option key={b.id} value={b.id}>{b.label} — {b.account}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase mb-1 block">Waktu Transfer</label>
                    <input
                      type="datetime-local"
                      required
                      value={transferTime}
                      onChange={(e) => setTransferTime(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-outline-variant/10 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase mb-1 block">Foto Bukti Transfer</label>
                    <label className={`flex items-center justify-center gap-2 w-full px-4 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm ${
                      proofFile ? 'border-secondary bg-secondary/5 text-secondary' : 'border-outline-variant/30 bg-white text-on-surface-variant hover:border-secondary'
                    }`}>
                      {proofFile ? `${proofFile.name} (${(proofFile.size / 1024).toFixed(0)} KB)` : 'Klik untuk pilih foto, maks 200KB'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                    <p className="text-[10px] text-on-surface-variant mt-1">
                      Screenshot notifikasi transfer dari aplikasi bank/e-wallet kamu. Format JPEG, PNG, atau WebP, maksimal 200KB.
                    </p>
                  </div>

                  {formError && (
                    <p className="text-xs font-bold text-red-600">{formError}</p>
                  )}

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim untuk Verifikasi'}
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
