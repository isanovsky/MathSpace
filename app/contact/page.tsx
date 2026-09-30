import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Github, MessageCircle } from 'lucide-react';

// TODO: ganti semua placeholder di bawah ini dengan info kamu sendiri.
const DEVELOPER_NAME = 'Nama Developer';
const DEVELOPER_EMAIL = 'developer@example.com';
const DEVELOPER_GITHUB = 'https://github.com/username';
const DEVELOPER_WHATSAPP = 'https://wa.me/62xxxxxxxxxx';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-8">
        <div className="max-w-2xl mx-auto space-y-10">
          <div>
            <h1 className="font-headline font-bold text-primary text-4xl lg:text-5xl leading-tight tracking-tighter mb-4">
              Kontak <span className="text-secondary italic">Developer</span>
            </h1>
            <p className="text-on-surface-variant">
              Ada bug, saran fitur, atau pertanyaan teknis seputar MathSpace? Hubungi lewat salah satu cara di bawah.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm p-8 md:p-10 space-y-6">
            <div className="flex items-center gap-3 pb-6 border-b border-outline-variant/10">
              <div className="w-14 h-14 rounded-full bg-navy flex items-center justify-center text-white text-xl font-bold">
                {DEVELOPER_NAME.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-primary">{DEVELOPER_NAME}</p>
                <p className="text-sm text-on-surface-variant">Pengembang MathSpace</p>
              </div>
            </div>

            <a
              href={`mailto:${DEVELOPER_EMAIL}`}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Email</p>
                <p className="text-sm text-on-surface-variant">{DEVELOPER_EMAIL}</p>
              </div>
            </a>

            <a
              href={DEVELOPER_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">WhatsApp</p>
                <p className="text-sm text-on-surface-variant">Chat langsung untuk respons lebih cepat</p>
              </div>
            </a>

            <a
              href={DEVELOPER_GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">GitHub</p>
                <p className="text-sm text-on-surface-variant">Laporkan bug atau lihat kode sumbernya</p>
              </div>
            </a>
          </div>

          <p className="text-xs text-on-surface-variant italic">
            Untuk pertanyaan akademik (materi, nilai, jadwal kuliah), hubungi Departemen Matematika ITS langsung, bukan lewat halaman ini.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
