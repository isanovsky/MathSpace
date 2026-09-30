import Link from 'next/link';
import { Globe, Share2, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-teal/10 py-16 px-8 border-t border-teal/15">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <span className="text-xl font-bold tracking-tighter text-secondary font-headline">MathSpace</span>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">
            Study Together, Success Together.
          </p>
          <div className="flex gap-4 pt-2">
            <Mail className="w-5 h-5 text-outline hover:text-primary cursor-pointer transition-colors" />
            <Globe className="w-5 h-5 text-outline hover:text-primary cursor-pointer transition-colors" />
            <Share2 className="w-5 h-5 text-outline hover:text-primary cursor-pointer transition-colors" />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Tautan</h4>
          <ul className="space-y-2">
            <li><Link href="/dashboard" className="text-sm text-on-surface-variant hover:text-secondary transition-colors">Dasbor Saya</Link></li>
            <li><Link href="/library" className="text-sm text-on-surface-variant hover:text-secondary transition-colors">Jelajahi Konten</Link></li>
            <li><Link href="/pricing" className="text-sm text-on-surface-variant hover:text-secondary transition-colors">Harga & Layanan</Link></li>
            <li><Link href="/contact" className="text-sm text-on-surface-variant hover:text-secondary transition-colors">Kontak Developer</Link></li>
          </ul>
        </div>

        <div className="flex flex-col justify-between items-start md:items-end">
          <div className="text-right">
            <p className="text-sm font-medium text-primary">Departemen Matematika ITS</p>
            <p className="text-xs text-on-surface-variant mt-1">Surabaya, Jawa Timur 60111</p>
          </div>
          <p className="text-xs text-outline uppercase tracking-widest mt-8">
          </p>
        </div>
      </div>
    </footer>
  );
}