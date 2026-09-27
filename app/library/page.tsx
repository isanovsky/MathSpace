'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, BookOpen, FileText, Lock, ChevronRight, ChevronDown, Folder, File, User, X, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter, useSearchParams } from 'next/navigation';
import { getContents, Content } from '@/lib/contentStore';
import { getFolders, Folder as FolderType } from '@/lib/folderStore';

function LibraryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedSubfolderId, setSelectedSubfolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalType, setModalType] = useState<'login' | 'premium'>('premium');
  
  const [allContents, setAllContents] = useState<Content[]>([]);
  const [allFolders, setAllFolders] = useState<FolderType[]>([]);
  const [userStatus, setUserStatus] = useState<'free' | 'premium'>('free');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadData = () => {
      setAllContents(getContents().filter(c => c.status === 'aktif'));
      setAllFolders(getFolders());
      
      const storedUser = localStorage.getItem('mathspace_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserStatus(user.status || 'free');
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUserStatus('free');
      }

      // Sync search from URL once on load
      const query = searchParams.get('search');
      if (query) {
        setSearchQuery(query);
      }
    };
    loadData();
  }, [searchParams]);

  const categories = useMemo(() => {
    const types = new Set<string>();
    allContents.forEach(c => types.add(c.type));
    return ['Semua Tipe', ...Array.from(types)];
  }, [allContents]);

  const filteredDocuments = useMemo(() => {
    return allContents.filter(doc => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = doc.title.toLowerCase().includes(searchLower) || 
                           doc.description.toLowerCase().includes(searchLower);
      
      let matchesFolder = true;
      if (selectedSubfolderId) {
        matchesFolder = doc.folderId === selectedSubfolderId;
      } else if (selectedFolderId) {
        const folder = allFolders.find(f => f.id === selectedFolderId);
        matchesFolder = doc.subject === folder?.name;
      }

      const matchesCategory = !selectedCategory || doc.type === selectedCategory;
      
      return matchesSearch && matchesFolder && matchesCategory;
    });
  }, [allContents, searchQuery, selectedFolderId, selectedSubfolderId, selectedCategory, allFolders]);

  const handleAction = (doc: Content) => {
    if (!isLoggedIn) {
      setModalType('login');
      setShowUpgradeModal(true);
      return;
    }
    if (doc.isPremium && userStatus !== 'premium') {
      setModalType('premium');
      setShowUpgradeModal(true);
      return;
    }
    router.push(`/document/${doc.id}`);
  };

  const resetNavigation = () => {
    setSelectedFolderId(null);
    setSelectedSubfolderId(null);
    setSelectedCategory(null);
    setSearchQuery('');
    setExpandedFolders(new Set());
  };

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  const rootFolders = useMemo(() => allFolders.filter(f => f.parentId === null), [allFolders]);

  const selectedFolder = useMemo(() => allFolders.find(f => f.id === selectedFolderId), [allFolders, selectedFolderId]);
  const selectedSubfolder = useMemo(() => allFolders.find(f => f.id === selectedSubfolderId), [allFolders, selectedSubfolderId]);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      
      <div className="flex pt-16 min-h-screen">
        {/* Sidebar Filter */}
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-low border-r border-outline-variant/10 p-6 hidden lg:flex flex-col gap-8 overflow-y-auto">
          <div>
            <h2 className="text-teal-600 font-bold text-xs uppercase tracking-widest mb-4">Penjelajah Perpustakaan</h2>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 flex items-center gap-2">
                  <BookOpen className="w-3 h-3" /> Mata Kuliah
                </p>
                <div className="space-y-1">
                  <button 
                    onClick={() => {
                      setSelectedFolderId(null);
                      setSelectedSubfolderId(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                      !selectedFolderId ? 'bg-white text-primary font-bold shadow-sm border border-outline-variant/10' : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span>Semua Mata Kuliah</span>
                    <span className="text-[10px] opacity-60">{allContents.length}</span>
                  </button>
                  
                  {rootFolders.map(folder => {
                    const docCount = allContents.filter(c => c.subject === folder.name).length;
                    const subfolders = allFolders.filter(f => f.parentId === folder.id);
                    const isExpanded = expandedFolders.has(folder.id);
                    const isSelected = selectedFolderId === folder.id && !selectedSubfolderId;

                    return (
                      <div key={folder.id} className="space-y-1">
                        <div className="flex items-center">
                          <button 
                            onClick={() => toggleFolder(folder.id)}
                            className="p-1 hover:bg-surface-container rounded transition-colors"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedFolderId(folder.id);
                              setSelectedSubfolderId(null);
                            }}
                            className={`flex-1 text-left px-2 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                              isSelected 
                              ? 'bg-white text-primary font-bold shadow-sm border border-outline-variant/10' 
                              : 'text-on-surface-variant hover:bg-surface-container'
                            }`}
                          >
                            <span className="truncate pr-2">{folder.name}</span>
                            <span className="text-[10px] opacity-60">{docCount}</span>
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="ml-4 space-y-1">
                            {subfolders.map(sub => {
                              const subDocCount = allContents.filter(c => c.folderId === sub.id).length;
                              const isSubSelected = selectedSubfolderId === sub.id;

                              return (
                                <button 
                                  key={sub.id}
                                  onClick={() => {
                                    setSelectedFolderId(folder.id);
                                    setSelectedSubfolderId(sub.id);
                                  }}
                                  className={`w-full text-left pl-8 pr-3 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                                    isSubSelected 
                                    ? 'bg-secondary/10 text-secondary font-bold' 
                                    : 'text-on-surface-variant hover:bg-surface-container'
                                  }`}
                                >
                                  <span className="truncate pr-2">{sub.name}</span>
                                  <span className="text-[10px] opacity-60">{subDocCount}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <button 
              onClick={resetNavigation}
              className="w-full py-3 text-on-surface-variant text-xs font-bold uppercase tracking-widest border border-outline-variant/20 rounded-xl hover:bg-surface-container transition-colors"
            >
              Kembali ke Awal
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-64 flex-1 p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Breadcrumbs */}
            {selectedFolderId && (
              <nav className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                <button 
                  onClick={() => {
                    setSelectedFolderId(null);
                    setSelectedSubfolderId(null);
                  }}
                  className="hover:text-secondary transition-colors"
                >
                  Semua Mata Kuliah
                </button>
                <ChevronRight className="w-3 h-3 opacity-40" />
                <button 
                  onClick={() => setSelectedSubfolderId(null)}
                  className={`hover:text-secondary transition-colors ${!selectedSubfolderId ? 'text-primary font-bold' : ''}`}
                >
                  {selectedFolder?.name}
                </button>
                {selectedSubfolderId && (
                  <>
                    <ChevronRight className="w-3 h-3 opacity-40" />
                    <span className="text-primary font-bold">{selectedSubfolder?.name}</span>
                  </>
                )}
              </nav>
            )}

            {/* Header Section */}
            <section className="relative py-10 px-10 rounded-3xl overflow-hidden bg-primary text-white shadow-xl">
              <div className="absolute inset-0 math-pattern opacity-10"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-headline font-bold mb-2">
                  {selectedSubfolder?.name || selectedFolder?.name || 'Perpustakaan Matematika'}
                </h2>
                <p className="text-on-primary-container text-sm max-w-md">
                  Akses pembahasan soal-soal, e-book, dan materi pendukung perkuliahanmu.
                </p>
              </div>
            </section>

            {/* Controls */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <input 
                    type="text" 
                    placeholder="Cari dokumen perpustakaan..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant/10 rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Navigation Filters */}
              <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Filter className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-bold uppercase tracking-widest">Tipe Konten</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          if (category === 'Semua Tipe') {
                            setSelectedCategory(null);
                          } else {
                            setSelectedCategory(category);
                          }
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition-all border ${
                          (category === 'Semua Tipe' && !selectedCategory) || selectedCategory === category
                            ? 'bg-secondary text-white border-secondary shadow-md'
                            : 'bg-surface-container-low text-on-surface-variant border-outline-variant/10 hover:border-secondary/50'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDocuments.map((doc) => {
                const isLocked = !isLoggedIn || (doc.isPremium && userStatus !== 'premium');
                const subfolder = allFolders.find(f => f.id === doc.folderId && f.parentId !== null);
                
                return (
                  <motion.div 
                    key={doc.id}
                    whileHover={{ y: -4 }}
                    onClick={() => handleAction(doc)}
                    className="group relative bg-white rounded-2xl p-6 transition-all duration-300 hover:shadow-xl flex flex-col h-full border border-outline-variant/10 cursor-pointer"
                  >
                    {isLocked && (
                      <div className="absolute inset-0 z-10 bg-surface/40 backdrop-blur-[2px] rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white p-3 rounded-full shadow-xl">
                          <Lock className="w-6 h-6 text-secondary" />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center text-on-secondary-container">
                        <File className="w-6 h-6" />
                      </div>
                      {doc.isPremium && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-secondary text-on-secondary text-[10px] font-bold rounded uppercase">Premium</span>
                          <Lock className="w-4 h-4 text-secondary fill-current" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-primary leading-tight mb-2 group-hover:text-secondary transition-colors">
                        {doc.title}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                          <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {doc.type}</span>
                          <span className="flex items-center gap-1"><User className="w-3 h-3" /> {doc.author}</span>
                        </div>
                        {subfolder && (
                          <div className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-bold text-secondary uppercase tracking-wider">
                            {subfolder.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-outline-variant/10 flex justify-between items-center">
                      <span className="text-xs text-on-surface-variant">{doc.createdAt}</span>
                      <span className="text-secondary text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                        {isLocked ? 'Buka' : 'Lihat'} <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredDocuments.length === 0 && (
              <div className="text-center py-20 bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/20">
                <FileText className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
                <p className="text-on-surface-variant font-medium">
                  Tidak ada dokumen ditemukan.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

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

export default function Library() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    }>
      <LibraryContent />
    </Suspense>
  );
}
