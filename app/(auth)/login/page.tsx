'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validate = () => {
    let isValid = true;
    if (!email) {
      setEmailError('Email tidak boleh kosong');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (password.length < 6) {
      setPasswordError('Password minimal 6 karakter');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setError('');

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setIsLoading(false);
      setError('Email atau password salah.');
      return;
    }

    const res = await fetch('/api/me');
    const { profile } = await res.json();

    setIsLoading(false);
    window.location.href = profile?.role === 'admin' ? '/admin' : '/dashboard';
  };

  return (
    <div className="min-h-screen flex font-body">
      {/* Kolom Kiri: Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy relative overflow-hidden flex-col justify-center px-16 text-white">
        <div className="absolute inset-0 math-pattern opacity-10"></div>
        <div className="absolute top-12 left-12">
          <Link href="/" className="text-3xl font-bold tracking-tighter font-display flex items-center gap-2">
            <span className="text-white">Math</span>
            <span className="text-teal-light">Space</span>
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 space-y-8"
        >
          <h1 className="text-5xl font-display font-bold leading-tight">
            Pusat Pengetahuan <br/> Matematika ITS.
          </h1>
          <p className="text-gray-400 text-lg max-w-md">
            Akses ribuan dokumen akademik, pembahasan soal, dan bantuan AI dalam satu platform terintegrasi.
          </p>

          <div className="space-y-6 pt-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-teal-light" />
              </div>
              <div>
                <h4 className="font-bold">Repositori Lengkap</h4>
                <p className="text-sm text-gray-400">Pembahasan UTS, UAS, dan Quiz terverifikasi.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-teal-light" />
              </div>
              <div>
                <h4 className="font-bold">AI Math Assistant</h4>
                <p className="text-sm text-gray-400">Bantuan Gemini AI untuk memahami konsep sulit.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-teal-light" />
              </div>
              <div>
                <h4 className="font-bold">Akses Terjamin</h4>
                <p className="text-sm text-gray-400">Keamanan data dan hak akses eksklusif mahasiswa.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="absolute bottom-12 left-12 text-xs text-gray-500 uppercase tracking-widest">
          © 2024 ITS Mathematics Department
        </div>
      </div>

      {/* Kolom Kanan: Form Login */}
      <div className="w-full lg:w-1/2 bg-surface flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="lg:hidden mb-8">
            <Link href="/" className="text-2xl font-bold tracking-tighter font-display text-navy">
              Math<span className="text-teal">Space</span>
            </Link>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-display font-bold text-navy">Selamat Datang Kembali</h2>
            <p className="text-gray-500">Masuk ke akun MathSpace kamu</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-navy uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="Masukkan email kamu"
                  className={`w-full pl-12 pr-4 py-3 bg-white border ${emailError ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all outline-none`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-navy uppercase tracking-wider">Password</label>
                <button type="button" className="text-xs text-gray-400 hover:text-navy transition-colors">Lupa password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3 bg-white border ${passwordError ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all outline-none`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-teal text-white font-bold rounded-xl shadow-lg shadow-teal/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Masuk
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-gray-500 text-sm">
              Belum punya akun?{' '}
              <Link href="/register" className="text-teal font-bold hover:underline">Daftar sekarang</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}