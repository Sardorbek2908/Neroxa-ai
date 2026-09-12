import React, { useState, useEffect } from 'react';
import { X, User, Lock, Globe, Shield, Smartphone, Check, AlertCircle, Sun, Moon, Laptop, Palette } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { SupportedLanguage } from '../../locales/translations';
import { api } from '../../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, usage } = useAuth();
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const { themeMode, effectiveTheme, setThemeMode } = useTheme();

  const [activeTab, setActiveTab] = useState<'account' | 'theme' | 'language' | 'security' | 'sessions'>('account');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && activeTab === 'sessions') {
      api.getSessions().then(res => setSessions(res.sessions)).catch(() => {});
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: res.message || 'Password updated successfully' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]">
        {/* Settings Left Tab Menu */}
        <div className="w-full md:w-56 bg-slate-950 p-4 border-b md:border-b-0 md:border-r border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">{t.settings.title}</h3>
          </div>

          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'account'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t.settings.account}</span>
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'theme'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Interfeys (Tema)</span>
            </button>
            <button
              onClick={() => setActiveTab('language')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'language'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>{t.settings.language}</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'security'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>{t.settings.security}</span>
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'sessions'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{t.settings.sessions}</span>
            </button>
          </div>
        </div>

        {/* Settings Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-white capitalize">{activeTab} Settings</h4>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center font-bold text-white text-lg">
                    {user?.name.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{user?.name || 'Guest'}</div>
                    <div className="text-xs text-slate-400">{user?.email || 'Not logged in'}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800">
                      {user?.role || 'GUEST'}
                    </span>
                  </div>
                </div>

                {usage && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Resource Usage (Today)
                    </h5>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">AI Messages:</span>
                        <span className="font-bold text-white text-sm">{usage.messagesCount}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Images Created:</span>
                        <span className="font-bold text-white text-sm">{usage.imagesCount}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Videos Rendered:</span>
                        <span className="font-bold text-white text-sm">{usage.videosCount}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Presentations:</span>
                        <span className="font-bold text-white text-sm">{usage.presentationsCount}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Theme / Interfeys Tab */}
            {activeTab === 'theme' && (
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-bold text-white mb-1">Tizim va Telefon foni moslashuvi</h5>
                  <p className="text-xs text-slate-400">
                    Telefoningiz yoki qurilmangizning asosiy foni qanday bo'lsa (oq yoki qora), NEXORA AI avtomatik shunga moslashadi. Shuningdek o'zingiz doimiy oq yoki qora rejimni tanlab qo'yishingiz mumkin.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* System Auto option */}
                  <button
                    onClick={() => setThemeMode('system')}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all ${
                      themeMode === 'system'
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-600/10'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-900 text-indigo-400 border border-slate-800">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                          <span>Avtomatik (Telefon / Tizim rejimi)</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 font-medium border border-indigo-700">Tavsiya etiladi</span>
                        </div>
                        <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                          Telefoningiz oq bo'lsa oq, qora bo'lsa qora rejim avtomatik yoqiladi
                        </div>
                      </div>
                    </div>
                    {themeMode === 'system' && <Check className="w-5 h-5 text-indigo-400 flex-shrink-0" />}
                  </button>

                  {/* Light Mode option */}
                  <button
                    onClick={() => setThemeMode('light')}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all ${
                      themeMode === 'light'
                        ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-900 text-amber-400 border border-slate-800">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">Oq rejim (Yorug' tema)</div>
                        <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                          Kunduzgi yorug'likda o'qish uchun toza oq fon va yuqori kontrast
                        </div>
                      </div>
                    </div>
                    {themeMode === 'light' && <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />}
                  </button>

                  {/* Dark Mode option */}
                  <button
                    onClick={() => setThemeMode('dark')}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all ${
                      themeMode === 'dark'
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-600/10'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-900 text-indigo-400 border border-slate-800">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white">Qora rejim (Tungi tema)</div>
                        <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                          Ko'zga qulay, batareyani tejovchi premium to'q ranglar
                        </div>
                      </div>
                    </div>
                    {themeMode === 'dark' && <Check className="w-5 h-5 text-indigo-400 flex-shrink-0" />}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Hozirgi faol rejim:</span>
                  <span className="font-bold text-slate-200 capitalize">
                    {effectiveTheme === 'dark' ? 'Qora rejim (Dark)' : 'Oq rejim (Light)'}
                  </span>
                </div>
              </div>
            )}

            {/* Language Tab */}
            {activeTab === 'language' && (
              <div>
                <p className="text-xs text-slate-400 mb-4">
                  Select your interface language. NEXORA AI adapts prompts, responses, presentation slides, and navigation dynamically.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {availableLanguages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code as SupportedLanguage)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                        language === l.code
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-600/10'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{l.flag}</span>
                        <span>{l.label}</span>
                      </div>
                      {language === l.code && <Check className="w-4 h-4 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h5 className="text-xs font-bold text-slate-300 mb-3">{t.settings.changePassword}</h5>

                {passwordMsg && (
                  <div
                    className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                      passwordMsg.type === 'success'
                        ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                    }`}
                  >
                    {passwordMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">New Password (min 6 chars)</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div>
                <p className="text-xs text-slate-400 mb-4">{t.settings.activeSessions}</p>
                <div className="space-y-2">
                  {sessions.map(s => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{s.ipAddress}</span>
                          {s.isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                              Current Device
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 text-[11px] truncate max-w-sm mt-0.5">{s.userAgent}</div>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {sessions.length === 0 && (
                    <div className="text-xs text-slate-500 text-center py-4">No other active sessions detected.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-800 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
