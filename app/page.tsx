'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ArrowRight, Star, Clock, User, FileText, Calculator, Sigma, Lock, X, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CatalogDocument } from '@/lib/types/catalog';
import { useAuth } from '@/hooks/useAuth';
import { useCatalog } from '@/hooks/useCatalog';

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, isAdmin, user } = useAuth();
  // Label only (button text). Real access is decided by the server (canAccess).
  const userStatus: 'free' | 'premium' = user?.status === 'premium' || isAdmin ? 'premium' : 'free';
  const [searchQuery, setSearchQuery] = useState('');
  const { documents, isLoading: catalogLoading } = useCatalog();
  const allContents = useMemo(
    () => documents.filter(d => d.status === 'aktif'),
    [documents],
  );
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalType, setModalType] = useState<'login' | 'premium'>('premium');

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/library?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/library');
    }
  };

  const handleAction = (doc: CatalogDocument) => {
    if (!doc.canAccess) {
      setModalType(isLoggedIn ? 'premium' : 'login');
      setShowUpgradeModal(true);
      return;
    }
    router.push(`/document/${doc.id}`);
  };

  const handleUpgradeAction = () => {
    if (!isLoggedIn) {
      setModalType('login');
      setShowUpgradeModal(true);
    } else if (userStatus === 'premium') {
      router.push('/library');
    } else {
      window.location.href = '/pricing';
    }
  };

  // Get some featured documents
  // Picked by rule (newest premium, newest free, then the next two newest),
  // not by hardcoded ids, so it keeps working as documents are added or removed.
  const [featuredDoc, secondaryDoc, smallDoc1, smallDoc2] = useMemo(() => {
    const featured = allContents.find(d => d.isPremium) ?? allContents[0];
    const secondary =
      allContents.find(d => !d.isPremium && d.id !== featured?.id) ??
      allContents.find(d => d.id !== featured?.id);
    const rest = allContents.filter(d => d.id !== featured?.id && d.id !== secondary?.id);
    return [featured, secondary, rest[0], rest[1]];
  }, [allContents]);

  if (catalogLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    );
  }

  const isLocked = (doc: CatalogDocument) => !doc.canAccess;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-8 overflow-hidden bg-gradient-to-br from-primary to-primary-container text-white">
          <div className="absolute inset-0 math-pattern pointer-events-none"></div>
          
          {/* Background Mathematical Formula Motif */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none text-[10rem] font-headline font-bold">
            ∫ f(x) dx = F(x) + C
          </div>

          <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-headline font-bold tracking-tighter leading-tight"
            >
              Kuasai Matematika dengan <br/>
              <span className="text-secondary-fixed-dim">Pembahasan Soal-Soal.</span>
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto group"
            >
              <form onSubmit={handleSearch} className="flex items-center bg-surface-container-lowest rounded-full p-2 shadow-2xl transition-all duration-300 focus-within:ring-4 focus-within:ring-secondary/20">
                <Search className="w-5 h-5 text-on-surface-variant ml-4" />
                <input 
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface px-4 py-3 placeholder:text-on-surface-variant/60 font-medium" 
                  placeholder="Cari soal UTS, UAS, atau kuis" 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit"
                  className="bg-secondary text-on-secondary px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all scale-95 active:scale-90"
                >
                  Cari
                </button>
              </form>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 pt-4"
            >
              <Link href="/library" className="bg-secondary text-on-secondary px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-secondary/20 transition-all flex items-center gap-2">
                Mulai Menjelajah
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/pricing" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
                Upgrade ke Premium
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Bento Grid Trending Documents */}
        <section className="max-w-7xl mx-auto px-8 py-24 space-y-12">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs block">Materi Pilihan</span>
              <h2 className="text-4xl font-headline font-bold text-primary tracking-tight">Dokumen Populer</h2>
            </div>
            <Link href="/library" className="text-secondary font-semibold hover:underline flex items-center gap-1">
              Lihat Perpustakaan <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 min-h-[600px]">
            {/* Large Feature Card */}
            {featuredDoc && (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                onClick={() => handleAction(featuredDoc)}
                className="md:col-span-2 md:row-span-2 bg-surface-container-lowest rounded-3xl p-8 flex flex-col justify-between group cursor-pointer relative overflow-hidden border border-outline-variant/10 shadow-sm"
              >
                {isLocked(featuredDoc) && (
                  <div className="absolute inset-0 z-20 bg-surface/40 backdrop-blur-[2px] rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white p-4 rounded-full shadow-xl">
                      <Lock className="w-8 h-8 text-secondary" />
                    </div>
                  </div>
                )}
                <div className="absolute top-0 right-0 p-12 opacity-5">
                  <Sigma className="w-48 h-48" />
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="flex gap-2">
                    <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider">{featuredDoc.type}</span>
                    <span className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider ${featuredDoc.isPremium ? 'bg-secondary text-on-secondary' : 'bg-surface-variant text-on-surface-variant'}`}>
                      {featuredDoc.isPremium ? 'Premium' : 'Gratis'}
                    </span>
                  </div>
                  <h3 className="text-3xl font-headline font-bold text-primary leading-tight">{featuredDoc.title}</h3>
                  <p className="text-on-surface-variant max-w-sm">{featuredDoc.description}</p>
                </div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                      <User className="w-5 h-5 text-on-primary-container" />
                    </div>
                    <span className="text-sm font-semibold text-primary">{featuredDoc.author}</span>
                  </div>
                  <ArrowRight className="w-6 h-6 text-secondary transform group-hover:translate-x-2 transition-transform" />
                </div>
              </motion.div>
            )}

            {/* Secondary Card 1 */}
            {secondaryDoc && (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                onClick={() => handleAction(secondaryDoc)}
                className="md:col-span-2 bg-primary text-white rounded-3xl p-8 flex flex-col justify-between group cursor-pointer overflow-hidden relative shadow-sm"
              >
                {isLocked(secondaryDoc) && (
                  <div className="absolute inset-0 z-20 bg-primary/40 backdrop-blur-[2px] rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white p-4 rounded-full shadow-xl">
                      <Lock className="w-8 h-8 text-secondary" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 math-pattern opacity-10"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-2">
                    <span className="bg-white/10 text-white px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider">{secondaryDoc.type}</span>
                    <h3 className="text-2xl font-headline font-bold">{secondaryDoc.title}</h3>
                  </div>
                  <Star className="w-6 h-6 text-secondary-fixed-dim fill-current" />
                </div>
                <div className="flex items-center gap-2 text-sm text-on-primary-container relative z-10">
                  <Clock className="w-4 h-4" />
                  <span>Baru saja diunggah</span>
                </div>
              </motion.div>
            )}

            {/* Small Card 1 */}
            {smallDoc1 && (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                onClick={() => handleAction(smallDoc1)}
                className="bg-surface-container-low rounded-3xl p-6 flex flex-col justify-between hover:bg-surface-container-high transition-colors cursor-pointer group border border-outline-variant/10 shadow-sm relative overflow-hidden"
              >
                {isLocked(smallDoc1) && (
                  <div className="absolute inset-0 z-20 bg-surface/40 backdrop-blur-[2px] rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white p-2 rounded-full shadow-xl">
                      <Lock className="w-4 h-4 text-secondary" />
                    </div>
                  </div>
                )}
                <FileText className="w-8 h-8 text-secondary" />
                <div className="space-y-1">
                  <h4 className="font-bold text-primary">{smallDoc1.subject}</h4>
                  <p className="text-xs text-on-surface-variant truncate">{smallDoc1.title}</p>
                </div>
              </motion.div>
            )}

            {/* Small Card 2 */}
            {smallDoc2 && (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                onClick={() => handleAction(smallDoc2)}
                className="bg-surface-container-low rounded-3xl p-6 flex flex-col justify-between hover:bg-surface-container-high transition-colors cursor-pointer group border border-outline-variant/10 shadow-sm relative overflow-hidden"
              >
                {isLocked(smallDoc2) && (
                  <div className="absolute inset-0 z-20 bg-surface/40 backdrop-blur-[2px] rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white p-2 rounded-full shadow-xl">
                      <Lock className="w-4 h-4 text-secondary" />
                    </div>
                  </div>
                )}
                <Calculator className="w-8 h-8 text-secondary" />
                <div className="space-y-1">
                  <h4 className="font-bold text-primary">{smallDoc2.subject}</h4>
                  <p className="text-xs text-on-surface-variant truncate">{smallDoc2.title}</p>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Premium Tier Promo */}
        <section className="max-w-7xl mx-auto px-8 mb-24">
          <div className="bg-gradient-to-r from-secondary to-teal-800 rounded-3xl p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 hidden md:block">
              <div className="w-full h-full math-pattern"></div>
            </div>
            <div className="relative z-10 max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full border border-white/20">
                <Star className="w-4 h-4 text-white fill-current" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">Akses Premium</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-headline font-bold text-white leading-tight">
                Tingkatkan belajarmu dengan <br/>materi eksklusif.
              </h2>
              <p className="text-secondary-fixed-dim text-lg font-medium leading-relaxed">
                Dapatkan akses ke e-book eksklusif, spreadsheet, dan rangkuman materi hanya dengan <span className="text-white font-bold">Rp20rb Lifetime</span>. Bergabunglah dan tingkatkan kualitas belajarmu!
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={handleUpgradeAction}
                  className="bg-white text-secondary px-8 py-3 rounded-xl font-bold hover:bg-surface-container transition-colors"
                >
                  {userStatus === 'premium' ? 'Akses Materi Premium' : 'Upgrade ke Premium'}
                </button>
                <button 
                  onClick={() => router.push('/library')}
                  className="text-white font-bold flex items-center gap-2 px-4 group"
                >
                  Pelajari lebih lanjut 
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Upgrade/Login Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpgradeModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center"
            >
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-surface-container rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
              
              <div className="w-20 h-20 bg-secondary-container rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
                {modalType === 'login' ? (
                  <User className="w-10 h-10 text-secondary" />
                ) : (
                  <Sparkles className="w-10 h-10 text-secondary" />
                )}
              </div>
              
              <h3 className="text-2xl font-headline font-bold text-primary mb-2">
                {modalType === 'login' ? 'Login Diperlukan' : 'Konten Premium'}
              </h3>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
                {modalType === 'login' 
                  ? 'Silakan login atau daftar terlebih dahulu untuk dapat mengakses dokumen di MathSpace.' 
                  : 'Dokumen ini hanya tersedia untuk anggota Premium. Dapatkan akses ke ribuan pembahasan soal dan materi eksklusif lainnya.'}
              </p>
              
              <div className="space-y-3">
                {modalType === 'login' ? (
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="w-full py-4 rounded-2xl bg-secondary text-white font-bold shadow-lg shadow-secondary/20 hover:opacity-90 transition-all"
                  >
                    Login / Daftar
                  </button>
                ) : (
                  <button 
                    onClick={() => window.location.href = '/pricing'}
                    className="w-full py-4 rounded-2xl bg-secondary text-white font-bold shadow-lg shadow-secondary/20 hover:opacity-90 transition-all"
                  >
                    Lihat Paket Premium
                  </button>
                )}
                <button 
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full py-4 rounded-2xl bg-surface-container text-on-surface-variant font-bold hover:bg-surface-container-high transition-all"
                >
                  Mungkin Nanti
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
