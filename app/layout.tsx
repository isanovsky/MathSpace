import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Kuasai Matematika dengan Pembahasan Soal-Soal | MathSpace',
  description: 'Platform berbagi dokumen akademik khusus untuk mahasiswa ITS.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body suppressHydrationWarning className="font-body antialiased bg-surface text-on-surface">
        {children}
      </body>
    </html>
  );
}
