import React, { useState } from 'react';
import { X, Lock, Mail, KeyRound, AlertCircle, Loader2, Eye, EyeOff, LogIn } from 'lucide-react';
import { auth, signInWithEmailAndPassword, googleProvider, signInWithPopup, signInAnonymously } from '../lib/firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email?.toLowerCase() === 'traveltix0@gmail.com') {
        onLoginSuccess();
        setEmail('');
        setPassword('');
        setErrorMsg('');
      } else {
        setErrorMsg(`الحساب (${user?.email || 'غير معروف'}) ليس لديه صلاحيات الإدارة.`);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setErrorMsg('حدث خطأ أثناء تسجيل الدخول باستخدام حساب جيمييل. يرجى المحاولة باستخدام البريد وكلمة المرور.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      // 1. Validate Admin Email Restriction
      if (cleanEmail !== 'traveltix0@gmail.com') {
        setErrorMsg('هذا البريد الإلكتروني ليس لديه صلاحيات الإدارة.');
        setIsLoading(false);
        return;
      }

      // 2. Attempt Firebase Authentication
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      } catch (fbError: any) {
        console.warn('Firebase Auth notice:', fbError?.message);
        // Fallback for custom credentials check if user isn't created in Firebase Console yet
        if (cleanEmail === 'traveltix0@gmail.com' && cleanPassword === 'Amd12345@123') {
          // Success fallback: sign in anonymously so Firestore has auth token
          if (!auth.currentUser) {
            await signInAnonymously(auth).catch(() => {});
          }
        } else {
          throw fbError;
        }
      }

      // Success
      onLoginSuccess();
      setEmail('');
      setPassword('');
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg('البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in dir-rtl">
      <div className="w-full max-w-md bg-[#11142b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#161938] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Readex_Pro',sans-serif]">
                تسجيل دخول الإدارة
              </h3>
              <p className="text-[11px] text-slate-400">
                منطقة محمية - خاصة بمدير النظام فقط
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 text-right">
          
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google / Gmail Auth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 border border-slate-200"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            )}
            <span>تسجيل الدخول باستخدام حساب Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#11142b] px-3 text-[11px] text-slate-400 font-medium shrink-0">
              أو بالبريد وكلمة المرور
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                البريد الإلكتروني:
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white text-xs focus:border-pink-500 focus:outline-none transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                كلمة المرور:
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white text-xs focus:border-pink-500 focus:outline-none transition-colors"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 text-slate-400 hover:text-slate-200 p-1 transition-colors cursor-pointer"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-xl shadow-pink-500/25 transition-all transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري تسجيل الدخول...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>تسجيل الدخول</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};
