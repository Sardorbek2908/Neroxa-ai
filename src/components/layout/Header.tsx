import React, { useState } from 'react';
import { Globe, Menu, ShieldCheck, Zap, Sparkles, User, ChevronDown, Crown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { SupportedLanguage } from '../../locales/translations';
import { BrandingSettings } from '../../types';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onOpenAdminPortal?: () => void;
  onOpenSubscription?: () => void;
  branding?: BrandingSettings;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenAuth,
  onOpenSettings,
  onOpenAdminPortal,
  onOpenSubscription,
  branding,
}) => {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const { user, demoLogin, logout } = useAuth();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);
  const [lastSecretClick, setLastSecretClick] = useState(0);

  const handleSecretTrigger = () => {
    const now = Date.now();
    if (now - lastSecretClick < 1500) {
      const count = secretClicks + 1;
      if (count >= 3) {
        setSecretClicks(0);
        if (onOpenAdminPortal) onOpenAdminPortal();
      } else {
        setSecretClicks(count);
      }
    } else {
      setSecretClicks(1);
    }
    setLastSecretClick(now);
  };

  const currentLangObj = availableLanguages.find(l => l.code === language) || availableLanguages[0];

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between z-20">
      {/* Left: Mobile menu toggle + status */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="mobile-menu-btn"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 active:bg-slate-800 touch-manipulation cursor-pointer"
          title="Menyu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile brand title */}
        <div className="flex items-center gap-1.5 md:hidden">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="font-extrabold text-sm text-white tracking-tight">{branding?.appName || 'NEXORA'}</span>
        </div>

        <div
          onClick={handleSecretTrigger}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs cursor-pointer select-none"
          title={`${branding?.appName || 'NEXORA'} Multi-Model Engine`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">{branding?.appName || 'NEXORA'} Multi-Model Engine</span>
          <span className="text-slate-500">|</span>
          <span className="text-indigo-400 font-semibold">Gemini 3.8 & Veo Ready</span>
        </div>
      </div>

      {/* Right: Quick actions, Language switcher, Auth */}
      <div className="flex items-center gap-3">
        {/* If user is logged in as ADMIN, show a discreet Admin status indicator */}
        {user?.role === 'ADMIN' && onOpenAdminPortal && (
          <button
            id="admin-status-header-btn"
            onClick={onOpenAdminPortal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 text-rose-300 text-xs font-semibold transition-all shadow-sm"
            title="Administrator Boshqaruv Portali"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            id="language-selector-btn"
            onClick={() => {
              setLangMenuOpen(!langMenuOpen);
              setUserMenuOpen(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors"
          >
            <span className="text-sm">{currentLangObj.flag}</span>
            <span className="hidden sm:inline">{currentLangObj.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95">
              {availableLanguages.map(l => (
                <button
                  key={l.code}
                  id={`lang-select-${l.code}`}
                  onClick={() => {
                    setLanguage(l.code as SupportedLanguage);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    language === l.code
                      ? 'bg-indigo-600/20 text-indigo-300'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PRO Subscription Button */}
        {user && onOpenSubscription && (
          <button
            id="header-pro-subscription-btn"
            onClick={onOpenSubscription}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              user.plan === 'PRO'
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/20'
            }`}
            title="PRO Obunasi va Limitlarni ko'rish"
          >
            <Crown className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">{user.plan === 'PRO' ? 'PRO Faol' : 'PRO Obuna'}</span>
          </button>
        )}

        {/* User Account / Auth Trigger */}
        {user ? (
          <div className="relative">
            <button
              id="header-user-btn"
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setLangMenuOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline font-semibold text-white">{user.name}</span>
              {user.plan === 'PRO' && (
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px]">
                  PRO
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                <div className="px-3 py-2 border-b border-slate-800">
                  <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-400 border border-indigo-800">
                      {user.role}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        user.plan === 'PRO'
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {user.plan === 'PRO' ? 'PRO' : 'FREE'}
                    </span>
                    {user.userCode && (
                      <span className="font-mono text-[10px] text-amber-400 font-bold">
                        {user.userCode}
                      </span>
                    )}
                  </div>
                </div>
                {onOpenSubscription && (
                  <button
                    onClick={() => {
                      onOpenSubscription();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-amber-400 hover:bg-amber-950/20 flex items-center gap-2"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>PRO Obuna & Karta</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onOpenSettings();
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Settings & Security
                </button>
                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/30"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            id="header-sign-in-btn"
            onClick={onOpenAuth}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
