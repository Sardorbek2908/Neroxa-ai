import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: () => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const { demoLogin } = useAuth();

  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('xuligansardorbek637@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot/Reset state
  const [recoveryEmail, setRecoveryEmail] = useState('xuligansardorbek637@gmail.com');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status state
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [masterCode, setMasterCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await api.adminLogin({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      setSuccessMsg("Administrator tizimiga muvaffaqiyatli kirdingiz!");
      setTimeout(() => {
        onClose();
        if (onSuccessLogin) onSuccessLogin();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Admin hisob ma'lumotlari noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      setError("Iltimos, admin elektron pochtangizni kiriting");
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await api.forgotPassword(recoveryEmail.trim());
      setGeneratedCode(res.recoveryCode || null);
      setMasterCode(res.masterAdminCode || 'NEXORA-ADMIN-2026');
      if (res.recoveryCode) {
        setRecoveryCode(res.recoveryCode);
      }
      setSuccessMsg("Tiklash kodi muvaffaqiyatli shakllantirildi. Uni quyidagi maydonga kiriting.");
      setMode('reset');
    } catch (err: any) {
      setError(err.message || "Admin hisob topilmadi");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode.trim() || !newPassword || !confirmPassword) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }

    if (newPassword.length < 6) {
      setError("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Yangi parollar mos kelmadi");
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await api.resetPassword({
        email: recoveryEmail.trim(),
        recoveryCode: recoveryCode.trim(),
        newPassword,
      });

      setSuccessMsg("Parol muvaffaqiyatli tiklandi va admin tizimiga kirildi!");
      setTimeout(() => {
        onClose();
        if (onSuccessLogin) onSuccessLogin();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Tiklash kodi noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleQuickAdminDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin('ADMIN');
      setSuccessMsg("Admin hisobiga kirdingiz!");
      setTimeout(() => {
        onClose();
        if (onSuccessLogin) onSuccessLogin();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Demo kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Glow accents */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/25">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>NEXORA AI Admin Portal</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-semibold border border-rose-500/30">
                  Xavfsiz Zona
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Administratorlar uchun alohida kirish va parolni tiklash
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Kirish</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(generatedCode ? 'reset' : 'forgot');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === 'forgot' || mode === 'reset'
                ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Parolni Tiklash</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE 1: ADMIN LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="admin@nexora.ai"
                  required
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Admin Paroli
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Parolni unutdingizmi?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Admin Boshqaruviga Kirish</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Option for safety */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Tezkor tekshirish uchun:</span>
              <button
                type="button"
                onClick={handleQuickAdminDemo}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Bir bosishda Admin demo</span>
              </button>
            </div>
          </form>
        )}

        {/* MODE 2: REQUEST RECOVERY CODE */}
        {mode === 'forgot' && (
          <form onSubmit={handleRequestRecoveryCode} className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl text-xs text-slate-300">
              Admin parolini unutgan bo'lsangiz, elektron pochtangizni kiriting. Tizim sizga 6 xonali tiklash kodi yaratib beradi.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Elektron Pochtasi (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={e => setRecoveryEmail(e.target.value)}
                  placeholder="admin@nexora.ai"
                  required
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Tiklash Kodini Yaratish</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Kirish oynasiga qaytish
              </button>
            </div>
          </form>
        )}

        {/* MODE 3: RESET PASSWORD WITH CODE */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Generated Code Badge Notification */}
            {generatedCode && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-300">
                    Sizning Xavfsizlik Tiklash Kodingiz:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(generatedCode)}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    {codeCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{codeCopied ? 'Nusxalandi' : 'Nusxa olish'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-xl">
                  <span className="font-mono text-lg font-extrabold tracking-widest text-emerald-400">
                    {generatedCode}
                  </span>
                  <span className="text-[10px] text-slate-400">Amal qilish muddati: 15 daqiqa</span>
                </div>
                {masterCode && (
                  <div className="text-[10px] text-slate-400">
                    Zaxira master admin kodi: <code className="text-indigo-300">{masterCode}</code>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tiklash Kodi
              </label>
              <input
                type="text"
                value={recoveryCode}
                onChange={e => setRecoveryCode(e.target.value)}
                placeholder="Masalan: 489201 yoki NEXORA-ADMIN-2026"
                required
                className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none font-mono transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Yangi Parol
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Kamida 6 belgi"
                  required
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Parolni Takrorlang
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Parolni qayta yozing"
                  required
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Parolni Yangilash va Admin Tizimiga Kirish</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Kirish oynasiga qaytish
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
