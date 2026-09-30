'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, Menu, X, LogOut, Settings, History, ChevronDown, LayoutDashboard, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, isLoading: authLoading, isLoggedIn, isAdmin, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    fetch('/api/admin/payments/pending-count')
      .then((res) => (res.ok ? res.json() : { count: 0 }))
      .then((data) => {
        if (active) setPendingCount(data.count ?? 0);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isAdmin]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
  };

  // Close menus on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsUserDropdownOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const navLinks = [
    { name: 'Konten', href: '/library', show: true },
    { name: 'Harga', href: '/pricing', show: !isAdmin },
    { name: 'Dashboard', href: '/dashboard', show: isLoggedIn },
  ];

  const activeClass = "text-teal font-bold border-b-2 border-teal";
  const inactiveClass = "text-on-surface-variant hover:text-primary transition-colors";

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass-nav h-16 px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-primary font-display">
            Math<span className="text-teal">Space</span>
          </Link>
          
          <div className="hidden md:flex gap-6 items-center">
            {navLinks.filter(link => link.show).map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`text-sm font-medium h-16 flex items-center px-1 ${pathname === link.href ? activeClass : inactiveClass}`}
              >
                {link.name}
              </Link>
            ))}
            {isLoggedIn && isAdmin && (
              <Link 
                href="/admin" 
                className={`text-sm font-medium h-16 flex items-center px-1 ${pathname === '/admin' ? activeClass : inactiveClass}`}
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/library"
            className="p-2 rounded-full hover:bg-surface-container transition-colors hidden sm:block"
            title="Search Library"
          >
            <Search className="w-5 h-5 text-on-surface-variant" />
          </Link>

          {isAdmin && (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-full hover:bg-surface-container transition-colors"
                title="Notifikasi"
              >
                <Bell className="w-5 h-5 text-on-surface-variant" />
                {pendingCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <AnimatePresence>
                {isNotifOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-outline-variant/10 z-20 overflow-hidden"
                    >
                      <div className="p-4">
                        {pendingCount > 0 ? (
                          <Link
                            href="/admin/verifikasi"
                            onClick={() => setIsNotifOpen(false)}
                            className="block text-sm text-primary hover:text-secondary transition-colors"
                          >
                            <span className="font-bold">{pendingCount}</span> pengguna menunggu verifikasi pembayaran
                          </Link>
                        ) : (
                          <p className="text-sm text-on-surface-variant">Tidak ada permintaan verifikasi baru.</p>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {authLoading ? (
            <div className="w-8 h-8 rounded-full bg-surface-container animate-pulse"></div>
          ) : isLoggedIn ? (
            <div className="relative">
              <button 
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                disabled={isLoggingOut}
                className="flex items-center gap-2 p-1 pl-3 pr-2 rounded-full border border-outline-variant/30 hover:bg-surface-container transition-all disabled:opacity-50"
              >
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-xs font-bold text-navy leading-none">{user?.name}</span>
                  {isAdmin && (
                    <span className="text-[10px] text-teal font-bold uppercase tracking-tighter">Admin</span>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0)}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isUserDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-outline-variant/10 overflow-hidden py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-outline-variant/5">
                      <p className="text-sm font-bold text-navy">{user?.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                    </div>
                    
                    <div className="py-1">
                      <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> {isAdmin ? "Admin Panel" : "Dashboard"}
                      </Link>
                      <Link href="/profil" className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container transition-colors">
                        <User className="w-4 h-4" /> Profil Saya
                      </Link>
                    </div>

                    <div className="border-t border-outline-variant/5 mt-1 pt-1">
                      <button 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4" /> {isLoggingOut ? "Keluar..." : "Keluar"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login" className="text-sm font-bold text-navy px-4 py-2 rounded-xl hover:bg-surface-container transition-colors">
                Masuk
              </Link>
              <Link href="/register" className="text-sm font-bold bg-teal text-white px-5 py-2 rounded-xl shadow-lg shadow-teal/20 hover:opacity-90 transition-all">
                Daftar
              </Link>
            </div>
          )}

          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-full hover:bg-surface-container transition-colors"
          >
            <Menu className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-outline-variant/10">
                <Link href="/" className="text-2xl font-bold tracking-tighter text-primary font-display">
                  Math<span className="text-teal">Space</span>
                </Link>
                <div className="flex items-center gap-2">
                  <Link 
                    href="/library"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-surface-container transition-colors"
                    title="Search Library"
                  >
                    <Search className="w-5 h-5 text-on-surface-variant" />
                  </Link>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-surface-container transition-colors">
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {navLinks.filter(link => link.show).map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`flex items-center px-4 py-3 rounded-xl text-lg font-medium transition-all ${
                      pathname === link.href ? 'bg-teal/10 text-teal' : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                {isLoggedIn && isAdmin && (
                  <Link 
                    href="/admin"
                    className={`flex items-center px-4 py-3 rounded-xl text-lg font-medium transition-all ${
                      pathname === '/admin' ? 'bg-teal/10 text-teal' : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    Admin Panel
                  </Link>
                )}
              </div>

              <div className="p-6 border-t border-outline-variant/10 bg-surface-container-low">
                {isLoggedIn ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-white font-bold">
                        {user?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-navy leading-none">{user?.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant hover:bg-white rounded-lg transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> {isAdmin ? "Admin Panel" : "Dashboard"}
                      </Link>
                      <Link href="/profil" className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant hover:bg-white rounded-lg transition-colors">
                        <User className="w-4 h-4" /> Profil Saya
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Keluar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <Link href="/login" className="w-full py-3 text-center font-bold text-navy border border-outline-variant rounded-xl hover:bg-white transition-colors">
                      Masuk
                    </Link>
                    <Link href="/register" className="w-full py-3 text-center font-bold bg-teal text-white rounded-xl shadow-lg shadow-teal/20 hover:opacity-90 transition-all">
                      Daftar
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}