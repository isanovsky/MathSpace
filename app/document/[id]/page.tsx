'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Download, Share2, Printer, ChevronRight, 
  Send, Sparkles, Bot, User, MessageSquare, 
  Maximize2, ZoomIn, ZoomOut, RotateCcw 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useParams, useRouter } from 'next/navigation';
import { getContentById, Document } from '@/lib/contentStore';
import Link from 'next/link';

export default function DocumentView() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;
  const [doc, setDoc] = useState<Document | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const found = getContentById(docId);
    setDoc(found || null);
    setIsInitialLoading(false);
  }, [docId]);

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
        body: JSON.stringify({ question: userMessage, documentTitle: doc?.title }),
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
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${doc?.title || 'document'}.${doc?.type.toLowerCase() || 'pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('Unduhan dimulai!');
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

  const handlePrint = () => {
    window.print();
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
                <button 
                  onClick={handlePrint}
                  className="p-2 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl border border-outline-variant/10 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulated PDF Page */}
            <div className="relative bg-white shadow-2xl min-h-[1100px] p-12 md:p-20 flex flex-col gap-12 group rounded-sm border border-outline-variant/10">
              <div className="absolute top-0 right-0 w-48 h-48 math-pattern opacity-10 pointer-events-none"></div>
              
              <div className="border-b border-outline-variant/20 pb-8 flex justify-between items-start">
                <div>
                  <p className="font-headline font-bold text-primary tracking-tighter text-xl">MATEMATIKA ITS</p>
                  <p className="text-[10px] text-on-surface-variant tracking-[0.2em] uppercase">Departemen Kalkulus Terapan</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">Kode Ujian: MTH202-A</p>
                  <p className="text-xs text-on-surface-variant">Semester Genap 2024</p>
                </div>
              </div>

              <div className="space-y-12">
                {/* Problem 1 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-primary text-white font-headline font-bold text-sm rounded-sm">01</span>
                    <p className="text-lg font-medium text-primary">Integrasi Parsial</p>
                  </div>
                  <p className="text-on-surface-variant italic">Evaluasi integral tak tentu dari x²eˣ dx.</p>
                  <div className="p-6 bg-surface-container-low rounded-xl border-l-4 border-secondary/40 font-mono text-sm leading-relaxed text-on-surface">
                    ∫ x²eˣ dx = x²eˣ - ∫ 2xeˣ dx <br/>
                    Misal u = x², dv = eˣdx ⇒ du = 2xdx, v = eˣ <br/>
                    Menerapkan rumus lagi untuk ∫ 2xeˣ dx... <br/>
                    <span className="text-secondary font-bold">Hasil: eˣ(x² - 2x + 2) + C</span>
                  </div>
                </div>

                {/* Problem 3 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-primary text-white font-headline font-bold text-sm rounded-sm">03</span>
                    <p className="text-lg font-medium text-primary">Ekspansi Deret Taylor</p>
                  </div>
                  <p className="text-on-surface-variant italic">Temukan deret Maclaurin untuk f(x) = sin(x) hingga suku derajat ke-5.</p>
                  <div className="p-6 bg-surface-container-low rounded-xl border-l-4 border-secondary/40 font-mono text-sm leading-relaxed text-on-surface">
                    sin(x) = &sum;_{'{'}n=0{'}'}^&infin; (-1)&sup2; x&sup2;&sup2;&sup1; / (2n+1)! <br/>
                    f(0) = 0, f&apos;(0) = 1, f&apos;&apos;(0) = 0, f&apos;&apos;&apos;(0) = -1... <br/>
                    <span className="text-secondary font-bold">Hasil: x - x&sup3;/3! + x&sup5;/5! - ...</span>
                  </div>
                </div>

                {/* Visual Aid */}
                <div className="relative w-full h-64 bg-surface-container-low rounded-2xl overflow-hidden group/img border border-outline-variant/10">
                  <div className="absolute inset-0 flex items-center justify-center text-outline opacity-20">
                    <Sparkles className="w-24 h-24" />
                  </div>
                  <div className="absolute bottom-4 left-6">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Gambar 2.1</p>
                    <p className="text-sm font-headline font-medium text-primary">Visualisasi luas di bawah kurva f(x) = sin(x)</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 text-[10px] text-center text-outline uppercase tracking-widest border-t border-outline-variant/10">
                Dokumen Rahasia • Hanya untuk Penggunaan Akademik • © 2024 Matematika ITS
              </div>
            </div>
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
