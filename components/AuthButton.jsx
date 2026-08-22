'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  LogIn,
  LogOut,
  ShieldCheck,
  Smartphone,
  Trophy,
  X,
  ChevronDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  signInWithGoogle,
  logoutUser,
  subscribeToAuthState,
} from '@/lib/authService';

export default function AuthButton() {
  const [authState, setAuthState] = useState({
    user: null,
    isConfigured: false,
    loading: true,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = subscribeToAuthState((state) => {
      setAuthState(state);
    });
    return () => unsubscribe();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setActionLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        setIsModalOpen(false);
        setIsDropdownOpen(false);
      }
    } catch (err) {
      console.error('Google Sign-in Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage('Tên miền localhost chưa được ủy quyền trong Firebase Auth. Hãy vào Firebase Console -> Authentication -> Settings -> Authorized Domains để kiểm tra.');
      } else {
        setErrorMessage(`Lỗi đăng nhập (${err.code || 'error'}): ${err.message || 'Vui lòng thử lại.'}`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    setActionLoading(true);
    try {
      await logoutUser();
      setIsDropdownOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const { user, loading } = authState;

  if (loading) {
    return (
      <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    );
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {user ? (
        /* Authenticated User Button */
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow transition-all group"
            title="Xem thông tin tài khoản & đồng bộ Cloud"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Avatar'}
                className="w-6 h-6 rounded-full ring-1 ring-indigo-500/30 object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}

            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 max-w-[70px] truncate hidden sm:inline">
              {user.displayName || 'Đã đăng nhập'}
            </span>

            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Đã kết nối Cloud Firestore" />
            <ChevronDown className={`w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      ) : (
        /* Unauthenticated Login Button */
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shadow-sm transition-all hover:scale-105 active:scale-95 group"
          title="Đăng nhập để đồng bộ dữ liệu đa thiết bị và lưu đám mây"
        >
          <LogIn className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-indigo-500 dark:text-indigo-400" />
          <span>Đăng nhập</span>
        </button>
      )}

      {/* User Dropdown Menu */}
      {user && isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2.5rem)] p-3 bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl backdrop-blur-2xl z-[9999] animate-fadeIn space-y-3 origin-top-right">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-9 h-9 rounded-full ring-2 ring-indigo-500/40 object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
                {user.displayName || 'Người dùng'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user.email || 'Đang lưu trữ qua Cloud Firestore'}
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-2 flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Tiến độ học đã được đồng bộ an toàn.</span>
          </div>

          <button
            onClick={handleLogout}
            disabled={actionLoading}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800/80 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
            <span>Đăng xuất</span>
          </button>
        </div>
      )}

      {/* Login Modal Portaled to Document Body */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-scaleUp">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 shadow-inner mb-1">
                <LogIn className="w-7 h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Đăng Nhập Easy English
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Lưu giữ tiến độ học tiếng Anh của bạn.
              </p>
            </div>

            {/* Prominent Google Sign-In Button */}
            <div className="pt-1">
              <button
                onClick={handleGoogleLogin}
                disabled={actionLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <div className="p-1 rounded-full bg-white flex items-center justify-center">
                    <GoogleIcon className="w-3.5 h-3.5" />
                  </div>
                )}
                <span>Đăng nhập với Google</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-xl flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Features list */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Smartphone className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span>Học trên Máy tính & Điện thoại cùng 1 tiến độ.</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Sẵn sàng tham gia Bảng Xếp Hạng học viên chăm chỉ.</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// Simple Google SVG Icon
function GoogleIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}
