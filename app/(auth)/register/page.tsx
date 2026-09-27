'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  Calendar, 
  ChevronRight, 
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    department: '',
    year: '2023',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const passwordStrength = {
    length: formData.password.length >= 8,
    alphanumeric: /[a-zA-Z]/.test(formData.password) && /[0-9]/.test(formData.password)
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName) newErrors.fullName = 'Nama lengkap wajib diisi';
    if (!formData.department) newErrors.department = 'Jurusan wajib diisi';
    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    } else if (!passwordStrength.alphanumeric) {
      newErrors.password = 'Password harus mengandung huruf dan angka';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Anda harus menyetujui syarat dan ketentuan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    // TODO: Ganti dengan Supabase signUp saat backend siap
    setTimeout(() => {
      setIsLoading(false);
      const userData = {
        id: '1',
        name: formData.fullName,
        email: formData.email,
        role: 'user',
        status: 'unverified',
        angkatan: formData.year,
        jurusan: formData.department
      };
      localStorage.setItem('mathspace_user', JSON.stringify(userData));
      setSuccessMessage('Akun berhasil dibuat! Mengalihkan...');
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    }, 1500);
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
            Bergabung dengan <br/> Komunitas MathSpace.
          </h1>
          <p className="text-gray-400 text-lg max-w-md">
            Dapatkan akses penuh ke materi eksklusif dan tingkatkan pemahaman matematika kamu bersama ribuan mahasiswa ITS lainnya.
          </p>

          <div className="grid grid-cols-1 gap-6 pt-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-teal/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-teal-light" />
              </div>
              <span className="text-gray-300">Akses materi premium sepuasnya</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-teal/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-teal-light" />
              </div>
              <span className="text-gray-300">Bantuan AI 24/7 untuk tugas sulit</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-teal/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-teal-light" />
              </div>
              <span className="text-gray-300">Update berkala dokumen terbaru</span>
            </div>
          </div>
        </motion.div>

        <div className="absolute bottom-12 left-12 text-xs text-gray-500 uppercase tracking-widest">
          © 2024 ITS Mathematics Department
        </div>
      </div>

      {/* Kolom Kanan: Form Register */}
      <div className="w-full lg:w-1/2 bg-surface flex flex-col justify-start py-12 px-8 md:px-16 lg:px-24 overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="lg:hidden mb-8">
            <Link href="/" className="text-2xl font-bold tracking-tighter font-display text-navy">
              Math<span className="text-teal">Space</span>
            </Link>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-display font-bold text-navy">Buat Akun MathSpace</h2>
            <p className="text-gray-500">Mulai belajar lebih cerdas hari ini</p>
          </div>

          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 flex items-center gap-3">
              <Check className="w-5 h-5" />
              {successMessage}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Nama Lengkap */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-navy uppercase tracking-wider">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Nama sesuai KTM"
                  className={`w-full pl-11 pr-4 py-2.5 bg-white border ${errors.fullName ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all outline-none text-sm`}
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              {errors.fullName && <p className="text-[10px] text-red-500">{errors.fullName}</p>}
            </div>

            {/* Jurusan & Angkatan */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Jurusan</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Teknik Informatika"
                    className={`w-full pl-11 pr-4 py-2.5 bg-white border ${errors.department ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all outline-none text-sm`}
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  />
                </div>
                {errors.department && <p className="text-[10px] text-red-500">{errors.department}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Angkatan</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all outline-none text-sm appearance-none"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                  >
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-navy uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="Masukkan email kamu"
                  className={`w-full pl-11 pr-4 py-2.5 bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all outline-none text-sm`}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-navy uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-11 py-2.5 bg-white border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all outline-none text-sm`}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Checklist */}
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${passwordStrength.length ? 'bg-green-500' : 'bg-gray-200'}`}>
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className={`text-[10px] ${passwordStrength.length ? 'text-green-600' : 'text-gray-400'}`}>Min. 8 karakter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${passwordStrength.alphanumeric ? 'bg-green-500' : 'bg-gray-200'}`}>
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className={`text-[10px] ${passwordStrength.alphanumeric ? 'text-green-600' : 'text-gray-400'}`}>Huruf & Angka</span>
                </div>
              </div>
              {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-navy uppercase tracking-wider">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-11 py-2.5 bg-white border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all outline-none text-sm`}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[10px] text-red-500">{errors.confirmPassword}</p>}
            </div>

            {/* Terms Checkbox */}
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-0.5">
                  <input 
                    type="checkbox" 
                    className="peer sr-only"
                    checked={formData.agreeTerms}
                    onChange={(e) => setFormData({...formData, agreeTerms: e.target.checked})}
                  />
                  <div className="w-5 h-5 border-2 border-gray-200 rounded-md peer-checked:bg-teal peer-checked:border-teal transition-all group-hover:border-teal/50"></div>
                  <Check className="absolute left-1 top-1 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-xs text-gray-500 leading-relaxed">
                  Saya setuju dengan <Link href="/terms" className="text-teal font-bold hover:underline">syarat dan ketentuan</Link> MathSpace
                </span>
              </label>
              {errors.agreeTerms && <p className="text-[10px] text-red-500">{errors.agreeTerms}</p>}
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-teal text-white font-bold rounded-xl shadow-lg shadow-teal/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Buat Akun
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-gray-500 text-sm">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-teal font-bold hover:underline">Masuk di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
