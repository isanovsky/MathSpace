'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Upload, MoreVertical, Search,
  Folder as FolderIcon, FolderPlus, ChevronRight, ChevronDown,
  Plus, Edit, Trash2, Archive, CheckCircle2, AlertCircle, X,
  Lock, Globe
} from 'lucide-react';
import type { CatalogDocument, CatalogFolder } from '@/lib/types/catalog';
import { useCatalog } from '@/hooks/useCatalog';

export default function ContentManagementPage() {
  const { folders, documents: contents, isLoading: catalogLoading, error: catalogError, refresh } = useCatalog();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'folder' | 'content', id: string } | null>(null);
  
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const [folderForm, setFolderForm] = useState({
    name: '',
    type: 'matkul' as 'matkul' | 'subfolder',
    parentId: '' as string
  });

  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'Catatan Kuliah',
    rootFolderId: '',
    folderId: '',
    isPremium: false,
    status: 'aktif' as 'aktif' | 'diarsipkan'
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10MB — must match the server's limit

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadFile(null);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
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

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderForm.name) return;

    try {
      const res = await fetch('/api/admin/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: folderForm.name,
          type: folderForm.type,
          parentId: folderForm.type === 'subfolder' ? folderForm.parentId : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Gagal membuat folder');

      await refresh();
      setShowFolderModal(false);
      setFolderForm({ name: '', type: 'matkul', parentId: '' });
      showToast('Folder berhasil dibuat');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal membuat folder', 'error');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.rootFolderId) {
      showToast('Judul dan Mata Kuliah wajib diisi', 'error');
      return;
    }
    if (!uploadFile) {
      showToast('File PDF wajib diunggah', 'error');
      return;
    }
    if (uploadFile.type !== 'application/pdf') {
      showToast('File harus berformat PDF', 'error');
      return;
    }
    if (uploadFile.size > MAX_PDF_BYTES) {
      showToast('Ukuran file maksimal 10MB', 'error');
      return;
    }

    const finalFolderId = uploadForm.folderId || uploadForm.rootFolderId;

    try {
      const body = new FormData();
      body.append('title', uploadForm.title);
      body.append('description', uploadForm.description);
      body.append('type', uploadForm.type);
      body.append('folderId', finalFolderId);
      body.append('isPremium', String(uploadForm.isPremium));
      body.append('status', uploadForm.status);
      body.append('file', uploadFile);

      const res = await fetch('/api/admin/documents', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Gagal mengunggah dokumen');

      await refresh();
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadForm({
        title: '',
        description: '',
        type: 'Catatan Kuliah',
        rootFolderId: '',
        folderId: '',
        isPremium: false,
        status: 'aktif'
      });
      showToast('Dokumen berhasil diunggah');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengunggah dokumen', 'error');
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    const { type, id } = showDeleteConfirm;
    setShowDeleteConfirm(null);

    try {
      const res = await fetch(
        type === 'folder' ? `/api/admin/folders/${id}` : `/api/admin/documents/${id}`,
        { method: 'DELETE' },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Gagal menghapus');

      await refresh();
      if (type === 'folder' && selectedFolderId === id) setSelectedFolderId(null);
      showToast(type === 'folder' ? 'Folder berhasil dihapus' : 'Dokumen berhasil dihapus');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menghapus', 'error');
    }
  };

  const handleToggleStatus = async (doc: CatalogDocument) => {
    try {
      const res = await fetch(`/api/admin/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: doc.status === 'aktif' ? 'diarsipkan' : 'aktif' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Gagal mengubah status');
      await refresh();
      showToast(doc.status === 'aktif' ? 'Dokumen diarsipkan' : 'Dokumen diaktifkan');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengubah status', 'error');
    }
  };

  const filteredContents = selectedFolderId 
    ? contents.filter(c => c.folderId === selectedFolderId)
    : contents;

  const rootFolders = folders.filter(f => f.parentId === null);

  if (catalogLoading) {
    return (
      <main className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary"></div>
      </main>
    );
  }

  if (catalogError) {
    return (
      <main className="p-8 flex items-center justify-center min-h-[60vh]">
        <p className="text-on-surface-variant">{catalogError}</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-2xl">
            <h1 className="font-headline font-bold text-primary text-4xl lg:text-5xl leading-tight tracking-tighter mb-2">
              Kelola <span className="text-secondary italic">Konten</span>
            </h1>
            <p className="text-on-surface-variant text-lg">Atur dokumen dan folder mata kuliah</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowFolderModal(true)}
              className="px-6 py-2.5 rounded-xl font-bold text-primary border-2 border-primary hover:bg-primary/5 transition-all flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              Folder Baru
            </button>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-secondary hover:opacity-90 shadow-lg shadow-secondary/20 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Unggah Dokumen
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Panel: Folders */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-6">
              <h3 className="font-headline font-bold text-xl mb-6 flex items-center gap-2">
                <FolderIcon className="w-5 h-5 text-secondary" />
                Folder Mata Kuliah
              </h3>
              
              <div className="space-y-1">
                <button 
                  onClick={() => setSelectedFolderId(null)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    selectedFolderId === null ? 'bg-secondary/10 text-secondary' : 'hover:bg-surface-container-low'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Semua Dokumen
                </button>
                
                {rootFolders.map(folder => (
                  <div key={folder.id} className="space-y-1">
                    <div className="group relative flex items-center">
                      <button 
                        onClick={() => toggleFolder(folder.id)}
                        className="p-1 hover:bg-surface-container rounded transition-colors"
                      >
                        {expandedFolders.has(folder.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => setSelectedFolderId(folder.id)}
                        className={`flex-1 text-left px-2 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                          selectedFolderId === folder.id ? 'bg-secondary/10 text-secondary' : 'hover:bg-surface-container-low'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <FolderIcon className="w-4 h-4" />
                          {folder.name}
                        </span>
                        <span className="text-[10px] bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface-variant">
                          {folder.documentCount}
                        </span>
                      </button>
                      
                      <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm({ type: 'folder', id: folder.id });
                          }}
                          className="p-1 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    {expandedFolders.has(folder.id) && (
                      <div className="ml-6 space-y-1 border-l border-outline-variant/10 pl-2">
                        {folders.filter(f => f.parentId === folder.id).map(sub => (
                          <div key={sub.id} className="group relative flex items-center">
                            <button 
                              onClick={() => setSelectedFolderId(sub.id)}
                              className={`flex-1 text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                                selectedFolderId === sub.id ? 'bg-secondary/10 text-secondary' : 'hover:bg-surface-container-low'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <FolderIcon className="w-4 h-4 opacity-60" />
                                {sub.name}
                              </span>
                              <span className="text-[10px] bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface-variant">
                                {sub.documentCount}
                              </span>
                            </button>
                            <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteConfirm({ type: 'folder', id: sub.id });
                                }}
                                className="p-1 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            setFolderForm({ name: '', type: 'subfolder', parentId: folder.id });
                            setShowFolderModal(true);
                          }}
                          className="w-full text-left px-4 py-2 rounded-lg text-xs font-bold text-on-surface-variant hover:text-secondary flex items-center gap-2 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Tambah Subfolder
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Documents */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                <h3 className="font-headline font-bold text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary" />
                  {selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : 'Semua Dokumen'}
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <input 
                    type="text" 
                    placeholder="Cari dokumen..." 
                    className="pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-lg text-xs focus:ring-2 focus:ring-secondary/20 w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/50 text-on-surface-variant text-[10px] uppercase tracking-widest">
                      <th className="px-6 py-4 font-bold">Judul</th>
                      <th className="px-6 py-4 font-bold">Tipe</th>
                      <th className="px-6 py-4 font-bold">Subfolder</th>
                      <th className="px-6 py-4 font-bold">Akses</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filteredContents.map((doc) => {
                      const subfolder = folders.find(f => f.id === doc.folderId && f.parentId !== null);
                      return (
                        <tr key={doc.id} className="hover:bg-surface-container-low/30 transition-colors group">
                          <td className="px-6 py-5 font-medium text-primary text-sm">{doc.title}</td>
                          <td className="px-6 py-5 text-on-surface-variant text-xs">{doc.type}</td>
                          <td className="px-6 py-5 text-on-surface-variant text-xs">{subfolder?.name || '—'}</td>
                          <td className="px-6 py-5">
                            {doc.isPremium ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-secondary">
                                <Lock className="w-3 h-3" /> Premium
                              </span>
                            ) : (
                              <span className="text-xs text-on-surface-variant">Gratis</span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              doc.status === 'aktif' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'
                            }`}>
                              {doc.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-2">
                              {doc.status === 'aktif' && (
                                <button 
                                  onClick={() => window.open(`/document/${doc.id}`, '_blank')}
                                  className="p-1.5 rounded-lg hover:bg-surface-container text-secondary transition-colors"
                                  title="Preview di Perpustakaan"
                                  id={`preview-btn-${doc.id}`}
                                >
                                  <Globe className="w-4 h-4" />
                                </button>
                              )}
                              <button 
                                onClick={() => handleToggleStatus(doc)}
                                className="p-1.5 rounded-lg hover:bg-surface-container transition-colors"
                                title={doc.status === 'aktif' ? 'Arsipkan' : 'Aktifkan'}
                                id={`archive-btn-${doc.id}`}
                              >
                                <Archive className="w-4 h-4 text-on-surface-variant" />
                              </button>
                              <button 
                                onClick={() => setShowDeleteConfirm({ type: 'content', id: doc.id })}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                title="Hapus"
                                id={`delete-btn-${doc.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredContents.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant italic text-sm">
                          Tidak ada dokumen di folder ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Folder Modal */}
      <AnimatePresence>
        {showFolderModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFolderModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden"
            >
              <button 
                onClick={() => setShowFolderModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-surface-container rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
              
              <div className="mb-6">
                <h3 className="text-2xl font-headline font-bold text-primary mb-2">Folder Baru</h3>
                <p className="text-on-surface-variant text-sm">Buat kategori baru untuk dokumen.</p>
              </div>

              <form onSubmit={handleCreateFolder} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Nama Folder</label>
                  <input 
                    type="text" 
                    required
                    value={folderForm.name}
                    onChange={(e) => setFolderForm({...folderForm, name: e.target.value})}
                    placeholder="Contoh: Kalkulus III"
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/10 focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Tipe Folder</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="folderType" 
                        value="matkul"
                        checked={folderForm.type === 'matkul'}
                        onChange={() => setFolderForm({...folderForm, type: 'matkul', parentId: ''})}
                        className="w-4 h-4 text-secondary border-outline-variant focus:ring-secondary" 
                      />
                      <span className="text-sm font-medium text-on-surface group-hover:text-secondary transition-colors">Mata Kuliah Baru</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="folderType" 
                        value="subfolder"
                        checked={folderForm.type === 'subfolder'}
                        onChange={() => setFolderForm({...folderForm, type: 'subfolder'})}
                        className="w-4 h-4 text-secondary border-outline-variant focus:ring-secondary" 
                      />
                      <span className="text-sm font-medium text-on-surface group-hover:text-secondary transition-colors">Subfolder</span>
                    </label>
                  </div>
                </div>

                {folderForm.type === 'subfolder' && (
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Pilih Parent Folder</label>
                    <select 
                      required
                      value={folderForm.parentId}
                      onChange={(e) => setFolderForm({...folderForm, parentId: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/10 focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm appearance-none"
                    >
                      <option value="">Pilih Folder Mata Kuliah...</option>
                      {rootFolders.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowFolderModal(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-secondary hover:opacity-90 shadow-lg shadow-secondary/20 transition-all"
                  >
                    Simpan Folder
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeUploadModal}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto p-8"
            >
              <button 
                onClick={closeUploadModal}
                className="absolute top-4 right-4 p-2 hover:bg-surface-container rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
              
              <div className="mb-8">
                <h3 className="text-2xl font-headline font-bold text-primary mb-2">Unggah Dokumen Baru</h3>
                <p className="text-on-surface-variant text-sm">Tambahkan materi matematika baru ke repositori.</p>
              </div>

              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Judul Dokumen *</label>
                    <input 
                      type="text" 
                      required
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                      placeholder="Contoh: Ringkasan Teorema Dasar Kalkulus"
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/10 focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Deskripsi</label>
                    <textarea 
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                      placeholder="Tulis deskripsi singkat tentang dokumen ini..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/10 focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">File PDF *</label>
                    <label className={`flex items-center justify-center gap-2 w-full px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm ${
                      uploadFile ? 'border-secondary bg-secondary/5 text-secondary' : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:border-secondary'
                    }`}>
                      {uploadFile ? `${uploadFile.name} (${(uploadFile.size / 1024 / 1024).toFixed(1)} MB)` : 'Klik untuk pilih file PDF, maks 10MB'}
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Tipe Konten</label>
                      <select 
                        value={uploadForm.type}
                        onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/10 focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm appearance-none"
                      >
                        <option>Catatan Kuliah</option>
                        <option>Kumpulan Soal</option>
                        <option>Buku Teks</option>
                        <option>Tips & Trik</option>
                        <option>Spreadsheet</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Mata Kuliah *</label>
                      <select 
                        required
                        value={uploadForm.rootFolderId}
                        onChange={(e) => setUploadForm({...uploadForm, rootFolderId: e.target.value, folderId: ''})}
                        className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/10 focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm appearance-none"
                      >
                        <option value="">Pilih Mata Kuliah...</option>
                        {rootFolders.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Subfolder (Opsional)</label>
                    <select 
                      disabled={!uploadForm.rootFolderId}
                      value={uploadForm.folderId}
                      onChange={(e) => setUploadForm({...uploadForm, folderId: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/10 focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm appearance-none disabled:opacity-50"
                    >
                      <option value="">{uploadForm.rootFolderId ? 'Pilih Subfolder...' : 'Pilih mata kuliah dulu'}</option>
                      {folders.filter(f => f.parentId === uploadForm.rootFolderId).map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Akses</label>
                    <div className="flex gap-6 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="access" 
                          checked={!uploadForm.isPremium}
                          onChange={() => setUploadForm({...uploadForm, isPremium: false})}
                          className="w-4 h-4 text-secondary border-outline-variant focus:ring-secondary" 
                        />
                        <span className="text-sm font-medium text-on-surface group-hover:text-secondary transition-colors">Gratis</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="access" 
                          checked={uploadForm.isPremium}
                          onChange={() => setUploadForm({...uploadForm, isPremium: true})}
                          className="w-4 h-4 text-secondary border-outline-variant focus:ring-secondary" 
                        />
                        <span className="text-sm font-medium text-on-surface group-hover:text-secondary transition-colors">Premium</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={closeUploadModal}
                    className="flex-1 py-4 rounded-xl text-sm font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 rounded-xl text-sm font-bold text-white bg-secondary hover:opacity-90 shadow-lg shadow-secondary/20 transition-all"
                  >
                    Simpan Dokumen
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-headline font-bold text-primary mb-2">Konfirmasi Hapus</h3>
              <p className="text-on-surface-variant text-sm mb-8">
                Apakah Anda yakin ingin menghapus {showDeleteConfirm.type === 'folder' ? 'folder ini' : 'dokumen ini'}? Tindakan ini tidak dapat dibatalkan.{showDeleteConfirm.type === 'folder' && ' Folder yang masih berisi dokumen atau subfolder tidak bisa dihapus.'}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Hapus
                </button>
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
    </main>
  );
}
