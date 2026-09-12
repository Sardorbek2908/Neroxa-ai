import React, { useState } from 'react';
import { X, Sparkles, Shield, User, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminPortal?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onOpenAdminPortal }) => {
  const { login, register, demoLogin } = useAuth();
  const { language } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);
  const [lastSecretClick, setLastSecretClick] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({ email, password, name, preferredLanguage: language });
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: 'ADMIN' | 'USER') => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6">
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => {
              const now = Date.now();
              if (now - lastSecretClick < 1500) {
                const count = secretClicks + 1;
                if (count >= 3) {
                  setSecretClicks(0);
                  onClose();
                  if (onOpenAdminPortal) onOpenAdminPortal();
                } else {
                  setSecretClicks(count);
                }
              } else {
                setSecretClicks(1);
              }
              setLastSecretClick(now);
            }}
            title="NEXORA AI"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-lg tracking-wide">NEXORA AI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister
              ? 'Join NEXORA AI to generate multimedia presentations, images, and videos.'
              : 'Sign in to access your models, presentations, and creative workspaces.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Demo Fast Login for Creators */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => handleDemo('USER')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            <User className="w-4 h-4 text-sky-400" />
            <span>Mehmon sifatida tezkor kirish (Creator Demo)</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <div className="w-full border-t border-slate-800" />
          <span className="absolute bg-slate-900 px-3 text-[11px] text-slate-500 font-medium uppercase tracking-wider">
            Or continue with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Jasur Aliyev"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <span>{loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            {isRegister
              ? 'Already have an account? Sign in'
              : "Don't have an account yet? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};
