'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Download, Share2, ChevronRight, 
  Send, Sparkles, Bot, User, MessageSquare, 
  Maximize2, ZoomIn, ZoomOut, RotateCcw, FileText, AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useParams, useRouter } from 'next/navigation';
import type { CatalogDocument } from '@/lib/types/catalog';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function DocumentView() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;
  const { isLoggedIn } = useAuth();
  const [doc, setDoc] = useState<CatalogDocument | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch(`/api/documents/${docId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        setDoc(data?.document ?? null);
        setIsInitialLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setDoc(null);
        setIsInitialLoading(false);
      });

    return () => {
      active = false;
    };
  }, [docId]);

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    if (!doc || !doc.hasFile) return;
    let active = true;

    fetch(`/api/documents/${docId}/file`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (active) setFileUrl(data.url);
      })
      .catch(() => {
        if (active) setFileError('Gagal memuat file. Coba muat ulang halaman.');
      });

    return () => {
      active = false;
    };
  }, [doc, docId]);

  const [messages, setMessages] = useState([
    { role: 'ai', content: `Halo! Saya asisten AI Anda untuk MathSpace. Saya telah memindai ${doc?.title || 'dokumen'}. Apa yang bisa saya bantu hari ini?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage, documentId: docId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');

      setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'ai', content: "Maaf, saya mengalami kesalahan. Silakan periksa kunci API Anda atau coba lagi nanti." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!fileUrl) {
      alert(fileError || 'File belum siap diunduh.');
      return;
    }
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `${doc?.title || 'document'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: doc?.title,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Tautan disalin ke papan klip!');
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <Navbar />
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-primary">Dokumen Tidak Ditemukan</h1>
          <Link href="/library" className="text-secondary hover:underline">Kembali ke Perpustakaan</Link>
        </div>
      </div>
    );
  }

  // The server decided this (login + premium/admin rule); the page only shows it.
  if (!doc.canAccess) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16 flex items-center justify-center px-6">
          <div className="text-center space-y-4 max-w-md">
            <h1 className="text-2xl font-bold text-primary">
              {isLoggedIn ? 'Konten Premium' : 'Login Diperlukan'}
            </h1>
            <p className="text-on-surface-variant">
              {isLoggedIn
                ? 'Dokumen ini khusus anggota premium. Upgrade untuk membukanya.'
                : 'Silakan masuk terlebih dahulu untuk membuka dokumen ini.'}
            </p>
            <Link
              href={isLoggedIn ? '/pricing' : '/login'}
              className="inline-block bg-secondary text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all"
            >
              {isLoggedIn ? 'Lihat Paket Premium' : 'Masuk'}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16 flex flex-col md:flex-row overflow-hidden">
        {/* PDF Viewer Section */}
        <section className="flex-1 bg-surface-container-low overflow-y-auto p-6 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Breadcrumbs & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  <Link href="/library" className="hover:text-secondary transition-colors">Perpustakaan</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-primary">{doc.subject}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-secondary">{doc.category}</span>
                </nav>
                <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">
                  {doc.title} <span className="font-light text-on-surface-variant">Pembahasan</span>
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl border border-outline-variant/10 text-sm font-medium shadow-sm"
                >
                  <Download className="w-4 h-4" /> Unduh
                </button>
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl border border-outline-variant/10 text-sm font-medium shadow-sm"
                >
                  <Share2 className="w-4 h-4" /> Bagikan
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            {!doc.hasFile ? (
              <div className="bg-white rounded-sm border border-outline-variant/10 shadow-2xl min-h-[500px] flex flex-col items-center justify-center text-center p-12 gap-3">
                <FileText className="w-12 h-12 text-on-surface-variant/30" />
                <p className="text-on-surface-variant font-medium">Dokumen ini belum memiliki file.</p>
                <p className="text-on-surface-variant text-sm">Hubungi admin untuk mengunggah file PDF-nya.</p>
              </div>
            ) : fileError ? (
              <div className="bg-white rounded-sm border border-outline-variant/10 shadow-2xl min-h-[500px] flex flex-col items-center justify-center text-center p-12 gap-3">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <p className="text-on-surface-variant font-medium">{fileError}</p>
              </div>
            ) : !fileUrl ? (
              <div className="bg-white rounded-sm border border-outline-variant/10 shadow-2xl min-h-[500px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary"></div>
              </div>
            ) : (
              <iframe
                src={fileUrl}
                title={doc.title}
                className="w-full min-h-[1100px] rounded-sm border border-outline-variant/10 shadow-2xl bg-white"
              />
            )}
          </div>
        </section>

        {/* AI Chatbot Sidebar */}
        <aside className="w-full md:w-96 bg-white border-l border-outline-variant/10 flex flex-col h-[calc(100vh-4rem)] sticky top-16 shadow-2xl">
          <div className="p-6 border-b border-outline-variant/10 bg-surface-container-low/50">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-headline font-bold text-primary">Tanya Gemini</h2>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Asisten Akademik AI</p>
              </div>
            </div>
          </div>

          {/* Chat History */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                    msg.role === 'ai' ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary text-white'
                  }`}>
                    {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`space-y-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'ai' 
                        ? 'bg-surface-container-low rounded-tl-none text-on-surface' 
                        : 'bg-primary text-white rounded-tr-none'
                    }`}>
                      {msg.content}
                    </div>
                    <p className="text-[10px] text-outline px-1">Baru saja</p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Bot className="w-4 h-4 text-on-secondary-container" />
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-outline-variant/10 bg-white">
            <div className="relative">
              <textarea 
                className="w-full p-4 pr-12 bg-surface-container-low border-none rounded-2xl text-sm focus:ring-2 focus:ring-secondary/20 resize-none shadow-inner" 
                placeholder="Ketik pertanyaan Anda..."
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button 
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="absolute bottom-3 right-3 w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-container transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
              <span className="text-[10px] text-outline uppercase tracking-[0.1em] font-bold">Gemini Pro terhubung</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
