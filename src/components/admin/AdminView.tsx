import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Users,
  Activity,
  AlertTriangle,
  Layers,
  Trash2,
  CheckCircle,
  RefreshCw,
  Search,
  Crown,
  CreditCard,
  Save,
  Check,
  XCircle,
  UserCheck,
  Zap,
  Megaphone,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Video as VideoIcon,
  Sliders,
  ExternalLink,
  MessageCircle,
  X,
  Palette,
  Presentation,
  Sparkles,
  Bot,
  Brain,
  Wand2,
  Flame,
  Upload,
  RotateCcw,
  LayoutGrid,
} from 'lucide-react';
import { api } from '../../services/api';
import { PaymentSettings, PaymentRequest, SystemSettings, BrandingSettings, StudioSectionConfig } from '../../types';

interface AdminViewProps {
  onSystemSettingsUpdated?: (settings: SystemSettings) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onSystemSettingsUpdated }) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'studios' | 'subscriptions' | 'system' | 'overview' | 'users' | 'security' | 'audit' | 'jobs'>('branding');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Branding state (Logo, App Name, Subtitle, Accent Color)
  const [appName, setAppName] = useState('NEXORA');
  const [appSubtitle, setAppSubtitle] = useState('AI Studio');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoIcon, setLogoIcon] = useState<'sparkles' | 'zap' | 'bot' | 'brain' | 'wand' | 'flame' | 'layers'>('sparkles');
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [savingBranding, setSavingBranding] = useState(false);
  const [brandingSuccess, setBrandingSuccess] = useState('');
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Studios state (Rasm, Video, Prezentatsiya)
  const [imgStudioEnabled, setImgStudioEnabled] = useState(true);
  const [imgStudioName, setImgStudioName] = useState('Rasm Studiyasi');
  const [imgStudioDesc, setImgStudioDesc] = useState("AI yordamida fotorealistik va badiiy tasvirlar yarating hamda tahrirlang.");
  const [imgStudioBadge, setImgStudioBadge] = useState('HD 4K');
  const [imgStudioBtnText, setImgStudioBtnText] = useState('Rasm yaratish');

  const [vidStudioEnabled, setVidStudioEnabled] = useState(true);
  const [vidStudioName, setVidStudioName] = useState('Video Studiyasi');
  const [vidStudioDesc, setVidStudioDesc] = useState("Matn va tasvirlardan yuqori sifatli kinematik videolar hosil qiling.");
  const [vidStudioBadge, setVidStudioBadge] = useState('VEO 3.1');
  const [vidStudioBtnText, setVidStudioBtnText] = useState('Video yaratish');

  const [presStudioEnabled, setPresStudioEnabled] = useState(true);
  const [presStudioName, setPresStudioName] = useState('Prezentatsiya Generator');
  const [presStudioDesc, setPresStudioDesc] = useState("Akademik mustaqil ishlar, kurs ishlari va biznes taqdimotlari uchun professional slaydlar.");
  const [presStudioBadge, setPresStudioBadge] = useState('TALABA & BIZNES');
  const [presStudioBtnText, setPresStudioBtnText] = useState('Prezentatsiya tayyorlash');

  const [savingStudios, setSavingStudios] = useState(false);
  const [studiosSuccess, setStudiosSuccess] = useState('');

  // Subscription management state
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [editCardNumber, setEditCardNumber] = useState('');
  const [editCardHolder, setEditCardHolder] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editPrice, setEditPrice] = useState<number | string>(49000);
  const [editTelegram, setEditTelegram] = useState('@nexora_admin');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // System Settings & Ad Banner state
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [isImageStudioEnabled, setIsImageStudioEnabled] = useState(true);
  const [isVideoStudioEnabled, setIsVideoStudioEnabled] = useState(true);
  const [adBannerEnabled, setAdBannerEnabled] = useState(false);
  const [adBannerTitle, setAdBannerTitle] = useState('');
  const [adBannerText, setAdBannerText] = useState('');
  const [adBannerBadge, setAdBannerBadge] = useState('AKSIYA');
  const [adBannerBtnText, setAdBannerBtnText] = useState("Ko'rish");
  const [adBannerBtnUrl, setAdBannerBtnUrl] = useState('');
  const [savingSystemSettings, setSavingSystemSettings] = useState(false);
  const [systemSettingsSuccess, setSystemSettingsSuccess] = useState('');
  const [receiptModalUrl, setReceiptModalUrl] = useState<string | null>(null);

  // Manual PRO grant state
  const [grantIdentifier, setGrantIdentifier] = useState('');
  const [grantDays, setGrantDays] = useState(30);
  const [granting, setGranting] = useState(false);
  const [grantMsg, setGrantMsg] = useState('');
  const [grantError, setGrantError] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, secRes, auditRes, jobsRes, settingsRes, reqRes, sysRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminSubscriptionUsers().then(r => ({ users: r.users })).catch(() => api.getAdminUsers()),
        api.getAdminSecurityEvents(),
        api.getAdminAuditLogs(),
        api.getAdminJobs(),
        api.getAdminPaymentSettings().catch(() => null),
        api.getAdminPaymentRequests().catch(() => ({ requests: [] })),
        api.getAdminSystemSettings().catch(() => null),
      ]);
      setStats(statsRes.stats);
      setUsers(usersRes.users);
      setSecurityEvents(secRes.events);
      setAuditLogs(auditRes.logs);
      setJobs(jobsRes.jobs);
      if (settingsRes?.settings) {
        setPaymentSettings(settingsRes.settings);
        setEditCardNumber(settingsRes.settings.cardNumber);
        setEditCardHolder(settingsRes.settings.cardHolder);
        setEditBankName(settingsRes.settings.bankName);
        setEditPrice(settingsRes.settings.proPriceUzs);
        setEditTelegram(settingsRes.settings.telegramSupport || '@nexora_admin');
      }
      if (reqRes?.requests) {
        setPaymentRequests(reqRes.requests);
      }
      if (sysRes?.settings) {
        setSystemSettings(sysRes.settings);
        setIsImageStudioEnabled(sysRes.settings.isImageStudioEnabled ?? true);
        setIsVideoStudioEnabled(sysRes.settings.isVideoStudioEnabled ?? true);
        if (sysRes.settings.proPriceMonthlyUzs) {
          setEditPrice(sysRes.settings.proPriceMonthlyUzs);
        }
        if (sysRes.settings.telegramSupport) {
          setEditTelegram(sysRes.settings.telegramSupport);
        }
        if (sysRes.settings.cardNumber) {
          setEditCardNumber(sysRes.settings.cardNumber);
        }
        if (sysRes.settings.cardHolder) {
          setEditCardHolder(sysRes.settings.cardHolder);
        }
        if (sysRes.settings.bankName) {
          setEditBankName(sysRes.settings.bankName);
        }
        if (sysRes.settings.adBanner) {
          setAdBannerEnabled(sysRes.settings.adBanner.enabled ?? false);
          setAdBannerTitle(sysRes.settings.adBanner.title || '');
          setAdBannerText(sysRes.settings.adBanner.text || '');
          setAdBannerBadge(sysRes.settings.adBanner.badge || 'AKSIYA');
          setAdBannerBtnText(sysRes.settings.adBanner.buttonText || "Ko'rish");
          setAdBannerBtnUrl(sysRes.settings.adBanner.buttonUrl || '');
        }

        // Branding settings
        if (sysRes.settings.branding) {
          setAppName(sysRes.settings.branding.appName || 'NEXORA');
          setAppSubtitle(sysRes.settings.branding.appSubtitle || 'AI Studio');
          setLogoUrl(sysRes.settings.branding.logoUrl || '');
          setLogoIcon(sysRes.settings.branding.logoIcon || 'sparkles');
          setAccentColor(sysRes.settings.branding.accentColor || '#6366f1');
        }

        // Studios (Rasm, Video, Prezentatsiya)
        if (sysRes.settings.imageStudioConfig) {
          setImgStudioEnabled(sysRes.settings.imageStudioConfig.enabled ?? true);
          setImgStudioName(sysRes.settings.imageStudioConfig.name || 'Rasm Studiyasi');
          setImgStudioDesc(sysRes.settings.imageStudioConfig.description || '');
          setImgStudioBadge(sysRes.settings.imageStudioConfig.badge || 'HD 4K');
          setImgStudioBtnText(sysRes.settings.imageStudioConfig.buttonText || 'Rasm yaratish');
        }
        if (sysRes.settings.videoStudioConfig) {
          setVidStudioEnabled(sysRes.settings.videoStudioConfig.enabled ?? true);
          setVidStudioName(sysRes.settings.videoStudioConfig.name || 'Video Studiyasi');
          setVidStudioDesc(sysRes.settings.videoStudioConfig.description || '');
          setVidStudioBadge(sysRes.settings.videoStudioConfig.badge || 'VEO 3.1');
          setVidStudioBtnText(sysRes.settings.videoStudioConfig.buttonText || 'Video yaratish');
        }
        if (sysRes.settings.presentationStudioConfig) {
          setPresStudioEnabled(sysRes.settings.presentationStudioConfig.enabled ?? true);
          setPresStudioName(sysRes.settings.presentationStudioConfig.name || 'Prezentatsiya Generator');
          setPresStudioDesc(sysRes.settings.presentationStudioConfig.description || '');
          setPresStudioBadge(sysRes.settings.presentationStudioConfig.badge || 'TALABA & BIZNES');
          setPresStudioBtnText(sysRes.settings.presentationStudioConfig.buttonText || 'Prezentatsiya tayyorlash');
        }
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Logo fayli hajmi 3MB dan oshmasligi kerak!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setLogoUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetBranding = () => {
    setAppName('NEXORA');
    setAppSubtitle('AI Studio');
    setLogoUrl('');
    setLogoIcon('sparkles');
    setAccentColor('#6366f1');
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBranding(true);
    setBrandingSuccess('');
    try {
      const res = await api.updateAdminSystemSettings({
        branding: {
          appName: appName.trim() || 'NEXORA',
          appSubtitle: appSubtitle.trim() || 'AI Studio',
          logoUrl: logoUrl.trim(),
          logoIcon,
          accentColor,
        },
      });
      setSystemSettings(res.settings);
      onSystemSettingsUpdated?.(res.settings);
      setBrandingSuccess("✓ Logo va Brending muvaffaqiyatli saqlandi! Barcha bo'limlarda aks etdi.");
      setTimeout(() => setBrandingSuccess(''), 4500);
    } catch (err: any) {
      alert(`Xatolik: ${err.message}`);
    } finally {
      setSavingBranding(false);
    }
  };

  const handleSaveStudios = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStudios(true);
    setStudiosSuccess('');
    try {
      const res = await api.updateAdminSystemSettings({
        isImageStudioEnabled: imgStudioEnabled,
        isVideoStudioEnabled: vidStudioEnabled,
        isPresentationStudioEnabled: presStudioEnabled,
        imageStudioConfig: {
          enabled: imgStudioEnabled,
          name: imgStudioName.trim() || 'Rasm Studiyasi',
          description: imgStudioDesc.trim(),
          badge: imgStudioBadge.trim(),
          buttonText: imgStudioBtnText.trim() || 'Rasm yaratish',
        },
        videoStudioConfig: {
          enabled: vidStudioEnabled,
          name: vidStudioName.trim() || 'Video Studiyasi',
          description: vidStudioDesc.trim(),
          badge: vidStudioBadge.trim(),
          buttonText: vidStudioBtnText.trim() || 'Video yaratish',
        },
        presentationStudioConfig: {
          enabled: presStudioEnabled,
          name: presStudioName.trim() || 'Prezentatsiya Generator',
          description: presStudioDesc.trim(),
          badge: presStudioBadge.trim(),
          buttonText: presStudioBtnText.trim() || 'Prezentatsiya tayyorlash',
        },
      });
      setSystemSettings(res.settings);
      setIsImageStudioEnabled(imgStudioEnabled);
      setIsVideoStudioEnabled(vidStudioEnabled);
      onSystemSettingsUpdated?.(res.settings);
      setStudiosSuccess("✓ Studiyalar (Rasm, Video, Prezentatsiya) sozlamalari muvaffaqiyatli saqlandi!");
      setTimeout(() => setStudiosSuccess(''), 4500);
    } catch (err: any) {
      alert(`Xatolik: ${err.message}`);
    } finally {
      setSavingStudios(false);
    }
  };

  const handleSaveSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSystemSettings(true);
    setSystemSettingsSuccess('');
    const parsedPrice = parseInt(String(editPrice).replace(/\D/g, ''), 10) || 49000;
    try {
      const res = await api.updateAdminSystemSettings({
        isImageStudioEnabled,
        isVideoStudioEnabled,
        proPriceMonthlyUzs: parsedPrice,
        cardNumber: editCardNumber,
        cardHolder: editCardHolder,
        bankName: editBankName,
        telegramSupport: editTelegram,
        adBanner: {
          enabled: adBannerEnabled,
          title: adBannerTitle,
          text: adBannerText,
          badge: adBannerBadge,
          buttonText: adBannerBtnText,
          buttonUrl: adBannerBtnUrl,
          updatedAt: new Date().toISOString(),
        },
      });
      setSystemSettings(res.settings);
      onSystemSettingsUpdated?.(res.settings);
      setSystemSettingsSuccess("Tizim sozlamalari, panellar va reklama muvaffaqiyatli saqlandi!");
      setTimeout(() => setSystemSettingsSuccess(''), 4000);
    } catch (err: any) {
      alert(`Xatolik: ${err.message}`);
    } finally {
      setSavingSystemSettings(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess('');
    const parsedPrice = parseInt(String(editPrice).replace(/\D/g, ''), 10) || 49000;
    try {
      const res = await api.updateAdminPaymentSettings({
        cardNumber: editCardNumber,
        cardHolder: editCardHolder,
        bankName: editBankName,
        proPriceUzs: parsedPrice,
        telegramSupport: editTelegram,
      });
      setPaymentSettings(res.settings);
      setSettingsSuccess("To'lov sozlamalari muvaffaqiyatli saqlandi!");
      setTimeout(() => setSettingsSuccess(''), 3000);
    } catch (err: any) {
      alert(`Xatolik: ${err.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleManualGrantPro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantIdentifier.trim()) return;
    setGranting(true);
    setGrantMsg('');
    setGrantError('');
    try {
      const res = await api.grantProToUser(grantIdentifier.trim(), grantDays, 'PRO');
      setGrantMsg(res.message);
      setGrantIdentifier('');
      const updated = await api.getAdminSubscriptionUsers();
      setUsers(updated.users);
      setTimeout(() => setGrantMsg(''), 4000);
    } catch (err: any) {
      setGrantError(err.message || 'Xatolik yuz berdi');
    } finally {
      setGranting(false);
    }
  };

  const handleApproveRequest = async (reqId: string) => {
    try {
      await api.approvePaymentRequest(reqId, 30);
      setPaymentRequests(prev =>
        prev.map(r => (r.id === reqId ? { ...r, status: 'APPROVED' } : r))
      );
      const updated = await api.getAdminSubscriptionUsers();
      setUsers(updated.users);
      alert("To'lov tasdiqlandi va foydalanuvchiga 30 kun PRO berildi!");
    } catch (err: any) {
      alert(`Xatolik: ${err.message}`);
    }
  };

  const handleRejectRequest = async (reqId: string) => {
    try {
      await api.rejectPaymentRequest(reqId);
      setPaymentRequests(prev =>
        prev.map(r => (r.id === reqId ? { ...r, status: 'REJECTED' } : r))
      );
    } catch (err: any) {
      alert(`Rad etildi`);
    }
  };

  const handleToggleProForUser = async (userIdOrCode: string, currentPlan: string) => {
    const nextPlan = currentPlan === 'PRO' ? 'FREE' : 'PRO';
    const msg = nextPlan === 'PRO' ? '30 kun PRO faollashtirilsinmi?' : 'PRO bekor qilinsinmi?';
    if (!confirm(msg)) return;
    try {
      await api.grantProToUser(userIdOrCode, 30, nextPlan);
      const updated = await api.getAdminSubscriptionUsers();
      setUsers(updated.users);
    } catch (err: any) {
      alert(`Xatolik: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.deleteAdminUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleUpdateRole = async (userId: string, role: 'USER' | 'ADMIN') => {
    try {
      await api.updateAdminUser(userId, { role });
      setUsers(users.map(u => (u.id === userId ? { ...u, role } : u)));
    } catch (err: any) {
      alert(`Role update failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const filteredUsers = users.filter(
    u =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.userCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 max-w-7xl mx-auto custom-scrollbar space-y-6 w-full">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <span>NEXORA Security & Admin Panel</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            To'lovlar, Karta sozlamalari, PRO obunalar, Foydalanuvchilar va Xavfsizlik boshqaruvi.
          </p>
        </div>

        {/* Tab switcher: Universal responsive scrollable bar for phone, tablet, and desktop */}
        <div className="w-full sm:w-auto">
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto max-w-full touch-pan-x scrollbar-none shadow-inner">
            {[
              { id: 'branding', label: '🎨 Brending' },
              { id: 'studios', label: '🛠️ Studiyalar' },
              { id: 'subscriptions', label: `PRO & To'lovlar`, badge: paymentRequests.filter(r => r.status === 'PENDING').length },
              { id: 'system', label: '📢 Reklama' },
              { id: 'overview', label: 'Umumiy' },
              { id: 'users', label: `Foydalanuvchilar`, badge: users.length },
              { id: 'security', label: `Xavfsizlik`, badge: securityEvents.length },
              { id: 'audit', label: `Audit` },
              { id: 'jobs', label: `Jobs`, badge: jobs.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-1 ring-rose-400/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    activeTab === tab.id ? 'bg-white text-rose-600' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab: Logo & Branding Configuration */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-3">
            <Palette className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-sm">Logo, Brending va Tashqi Ko'rinish Sozlamalari</p>
              <p className="text-slate-300 mt-0.5">
                Bu yerdan siz ilovaning logotipi (rasm yoki zamonaviy vektor belgi), nomi, subtitri va aksent rangini to'liq o'zgartirishingiz mumkin. Barcha o'zgarishlar darhol sayt menyusida, sarlavhada va tizimda aks etadi.
              </p>
            </div>
          </div>

          {brandingSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-semibold">{brandingSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Branding Form (7 cols) */}
            <form onSubmit={handleSaveBranding} className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Brending Ma'lumotlari</h3>
                </div>
                <button
                  type="button"
                  onClick={handleResetBranding}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition-colors"
                  title="Standart qiymatlarga qaytarish"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Standartga qaytarish</span>
                </button>
              </div>

              {/* App Name & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Ilova Nomi (App Name):
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={e => setAppName(e.target.value)}
                    placeholder="NEXORA"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Menyuning yuqorisida va sarlavhada ko'rinadi</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Ilova Subtitri (Subtitle):
                  </label>
                  <input
                    type="text"
                    value={appSubtitle}
                    onChange={e => setAppSubtitle(e.target.value)}
                    placeholder="AI Studio"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Nom ostidagi qisqa belgi</span>
                </div>
              </div>

              {/* Logo Section */}
              <div className="space-y-3 pt-2">
                <label className="text-[11px] font-bold text-slate-200 block">
                  Ilova Logotipi (Rasm yoki Vektor Belgi):
                </label>

                {/* Option 1: Upload / URL for Custom Image */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                  <span className="text-[11px] font-semibold text-indigo-300 block">1-usul: Shaxsiy Logotip Rasmi (PNG, JPG, SVG, WebP)</span>
                  
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Rasm havolasi (URL):</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={logoUrl}
                        onChange={e => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png yoki bo'sh qoldiring"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                      />
                      {logoUrl && (
                        <button
                          type="button"
                          onClick={() => setLogoUrl('')}
                          className="px-2.5 py-1 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-xs transition-colors"
                          title="Rasmni olib tashlash"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <input
                      type="file"
                      ref={logoFileInputRef}
                      onChange={handleLogoFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-indigo-300 hover:text-white transition-all shadow-sm cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Qurilmadan rasm yuklash (Kompyuter / Telefon)</span>
                    </button>
                    <span className="text-[10px] text-slate-500 ml-2">Maks: 3MB (avtomatik Base64 saqlanadi)</span>
                  </div>
                </div>

                {/* Option 2: Fallback Vector Icon */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
                  <span className="text-[11px] font-semibold text-indigo-300 block">
                    2-usul: Standart Vektor Ikonka (Agar rasm qo'yilmasa)
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {[
                      { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
                      { id: 'zap', label: 'Zap', icon: Zap },
                      { id: 'bot', label: 'Bot', icon: Bot },
                      { id: 'brain', label: 'Brain', icon: Brain },
                      { id: 'wand', label: 'Wand', icon: Wand2 },
                      { id: 'flame', label: 'Flame', icon: Flame },
                      { id: 'layers', label: 'Layers', icon: Layers },
                    ].map(item => {
                      const Icon = item.icon;
                      const isSelected = logoIcon === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setLogoIcon(item.id as any)}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                            isSelected
                              ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                          <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Accent Color Swatches */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                  Aksent Rang (Brend Asosiy Rangi):
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {[
                    { color: '#6366f1', label: 'Indigo' },
                    { color: '#8b5cf6', label: 'Violet' },
                    { color: '#0ea5e9', label: 'Sky' },
                    { color: '#10b981', label: 'Emerald' },
                    { color: '#f43f5e', label: 'Rose' },
                    { color: '#f59e0b', label: 'Amber' },
                  ].map(swatch => (
                    <button
                      key={swatch.color}
                      type="button"
                      onClick={() => setAccentColor(swatch.color)}
                      className={`h-7 px-3 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border transition-all ${
                        accentColor.toLowerCase() === swatch.color.toLowerCase()
                          ? 'border-white text-white shadow-lg'
                          : 'border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                      style={{ backgroundColor: swatch.color + '25' }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: swatch.color }} />
                      <span>{swatch.label}</span>
                    </button>
                  ))}
                  <div className="flex items-center gap-1 ml-1">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={e => setAccentColor(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                      title="Maxsus rang tanlash"
                    />
                    <span className="text-[11px] font-mono text-slate-400">{accentColor}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={savingBranding}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
                >
                  {savingBranding ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saqlanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Brending O'zgarishlarini Saqlash</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Right Column: Live Interactive Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-sky-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Jonli Oldindan Ko'rish</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 font-bold">
                    Real-time
                  </span>
                </div>

                {/* Preview 1: Desktop Sidebar Brand Header */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">1. Menyu Tepasi (Sidebar):</span>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: accentColor }}
                    >
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={appName}
                          className="w-full h-full object-cover"
                          onError={() => {}}
                        />
                      ) : (
                        <span className="text-white">
                          {logoIcon === 'zap' && <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />}
                          {logoIcon === 'bot' && <Bot className="w-5 h-5 text-white" />}
                          {logoIcon === 'brain' && <Brain className="w-5 h-5 text-white" />}
                          {logoIcon === 'wand' && <Wand2 className="w-5 h-5 text-white" />}
                          {logoIcon === 'flame' && <Flame className="w-5 h-5 text-orange-300 fill-orange-300" />}
                          {logoIcon === 'layers' && <Layers className="w-5 h-5 text-white" />}
                          {(logoIcon === 'sparkles' || !logoIcon) && <Sparkles className="w-5 h-5 text-white" />}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm tracking-tight text-white truncate">
                          {appName || 'NEXORA'}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          PRO
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {appSubtitle || 'AI Studio'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preview 2: Top Header Bar Badge */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">2. Sarlavha Paneli (Top Header):</span>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-slate-300 font-medium">{appName || 'NEXORA'} Multi-Model Engine</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-indigo-400 font-semibold">Gemini 3.8 Ready</span>
                    </div>
                  </div>
                </div>

                {/* Preview 3: Small App Badge */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">3. Mobil / Kichik Ikonka:</span>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md overflow-hidden"
                      style={{ backgroundColor: accentColor }}
                    >
                      {logoUrl ? (
                        <img src={logoUrl} alt={appName} className="w-full h-full object-cover" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-xs text-slate-300 font-semibold">{appName || 'NEXORA'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Studios Configuration (Rasm, Video, Prezentatsiya) */}
      {activeTab === 'studios' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-3">
            <Sliders className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-sm">Rasm, Video va Prezentatsiya Bo'limlarini Boshqarish</p>
              <p className="text-slate-300 mt-0.5">
                Siz har bir bo'limni alohida yoqishingiz yoki oddiy foydalanuvchilardan yashirishingiz, shuningdek, ularning nomi, tavsifi, belgi (Badge) va harakat tugmasi matnini o'zgartirishingiz mumkin.
              </p>
            </div>
          </div>

          {studiosSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-semibold">{studiosSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveStudios} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Studio 1: Image Studio */}
              <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                imgStudioEnabled ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-950/60 border-slate-900 opacity-75'
              }`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${imgStudioEnabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Rasm Bo'limi</h4>
                        <span className="text-[10px] text-slate-400">Image Generation</span>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setImgStudioEnabled(!imgStudioEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        imgStudioEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          imgStudioEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Bo'lim Nomi (Menyudagi matn):
                      </label>
                      <input
                        type="text"
                        value={imgStudioName}
                        onChange={e => setImgStudioName(e.target.value)}
                        placeholder="Rasm Studiyasi"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Belgisi (Badge):
                      </label>
                      <input
                        type="text"
                        value={imgStudioBadge}
                        onChange={e => setImgStudioBadge(e.target.value)}
                        placeholder="HD 4K"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Tugma Matni:
                      </label>
                      <input
                        type="text"
                        value={imgStudioBtnText}
                        onChange={e => setImgStudioBtnText(e.target.value)}
                        placeholder="Rasm yaratish"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Bo'lim Tavsifi (Izoh):
                      </label>
                      <textarea
                        rows={3}
                        value={imgStudioDesc}
                        onChange={e => setImgStudioDesc(e.target.value)}
                        placeholder="AI yordamida fotorealistik va badiiy tasvirlar yarating hamda tahrirlang."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Mini Preview Chip */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block mb-1">Menyudagi ko'rinishi:</span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-semibold text-white">{imgStudioName || 'Rasm Studiyasi'}</span>
                    </div>
                    {imgStudioBadge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {imgStudioBadge}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Studio 2: Video Studio */}
              <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                vidStudioEnabled ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-950/60 border-slate-900 opacity-75'
              }`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${vidStudioEnabled ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-500'}`}>
                        <VideoIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Video Bo'limi</h4>
                        <span className="text-[10px] text-slate-400">Video Generation</span>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setVidStudioEnabled(!vidStudioEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        vidStudioEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          vidStudioEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Bo'lim Nomi (Menyudagi matn):
                      </label>
                      <input
                        type="text"
                        value={vidStudioName}
                        onChange={e => setVidStudioName(e.target.value)}
                        placeholder="Video Studiyasi"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Belgisi (Badge):
                      </label>
                      <input
                        type="text"
                        value={vidStudioBadge}
                        onChange={e => setVidStudioBadge(e.target.value)}
                        placeholder="VEO 3.1"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Tugma Matni:
                      </label>
                      <input
                        type="text"
                        value={vidStudioBtnText}
                        onChange={e => setVidStudioBtnText(e.target.value)}
                        placeholder="Video yaratish"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Bo'lim Tavsifi (Izoh):
                      </label>
                      <textarea
                        rows={3}
                        value={vidStudioDesc}
                        onChange={e => setVidStudioDesc(e.target.value)}
                        placeholder="Matn va tasvirlardan yuqori sifatli kinematik videolar hosil qiling."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Mini Preview Chip */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block mb-1">Menyudagi ko'rinishi:</span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <VideoIcon className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-semibold text-white">{vidStudioName || 'Video Studiyasi'}</span>
                    </div>
                    {vidStudioBadge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {vidStudioBadge}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Studio 3: Presentation Studio */}
              <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                presStudioEnabled ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-950/60 border-slate-900 opacity-75'
              }`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${presStudioEnabled ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-500'}`}>
                        <Presentation className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Prezentatsiya Bo'limi</h4>
                        <span className="text-[10px] text-slate-400">Presentation Studio</span>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setPresStudioEnabled(!presStudioEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        presStudioEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          presStudioEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Bo'lim Nomi (Menyudagi matn):
                      </label>
                      <input
                        type="text"
                        value={presStudioName}
                        onChange={e => setPresStudioName(e.target.value)}
                        placeholder="Prezentatsiya Generator"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Belgisi (Badge):
                      </label>
                      <input
                        type="text"
                        value={presStudioBadge}
                        onChange={e => setPresStudioBadge(e.target.value)}
                        placeholder="TALABA & BIZNES"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Tugma Matni:
                      </label>
                      <input
                        type="text"
                        value={presStudioBtnText}
                        onChange={e => setPresStudioBtnText(e.target.value)}
                        placeholder="Prezentatsiya tayyorlash"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Bo'lim Tavsifi (Izoh):
                      </label>
                      <textarea
                        rows={3}
                        value={presStudioDesc}
                        onChange={e => setPresStudioDesc(e.target.value)}
                        placeholder="Akademik mustaqil ishlar, kurs ishlari va biznes taqdimotlari uchun professional slaydlar."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Mini Preview Chip */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block mb-1">Menyudagi ko'rinishi:</span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Presentation className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-semibold text-white">{presStudioName || 'Prezentatsiya Generator'}</span>
                    </div>
                    {presStudioBadge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        {presStudioBadge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Studios Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={savingStudios}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
              >
                {savingStudios ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saqlanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Barcha Studiyalar (Rasm, Video, Prezentatsiya) Sozlamalarini Saqlash</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Subscriptions & Payment Management */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Payment Settings Form */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">To'lov va Karta Sozlamalari</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  Faol
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Bu yerdagi karta raqami va narx barcha foydalanuvchilarning to'lov oynasida ko'rinadi.
              </p>

              <form onSubmit={handleSaveSettings} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Karta Raqami:
                  </label>
                  <input
                    type="text"
                    value={editCardNumber}
                    onChange={e => setEditCardNumber(e.target.value)}
                    placeholder="8600 0000 0000 0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Karta Egasi (F.I.O):
                    </label>
                    <input
                      type="text"
                      value={editCardHolder}
                      onChange={e => setEditCardHolder(e.target.value)}
                      placeholder="Sardorbek ..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Bank Nomi:
                    </label>
                    <input
                      type="text"
                      value={editBankName}
                      onChange={e => setEditBankName(e.target.value)}
                      placeholder="Kapitalbank / TBC Bank"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5" />
                        <span>Oylik PRO Narxi (so'm):</span>
                      </label>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                        {Number(String(editPrice).replace(/\D/g, '') || 0).toLocaleString('uz-UZ')} so'm / oy
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={editPrice}
                        onChange={e => {
                          const cleaned = e.target.value.replace(/[^0-9]/g, '');
                          setEditPrice(cleaned);
                        }}
                        placeholder="49000"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3 pr-16 py-2.5 text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
                        required
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {String(editPrice).length > 0 && (
                          <button
                            type="button"
                            onClick={() => setEditPrice('')}
                            className="px-2 py-0.5 text-[11px] font-bold text-slate-400 hover:text-white bg-slate-800 rounded-md hover:bg-slate-700"
                            title="Tozalash"
                          >
                            ✕
                          </button>
                        )}
                        <span className="text-xs font-semibold text-slate-500 pr-1">UZS</span>
                      </div>
                    </div>

                    {/* Quick step & preset buttons for easy mobile tapping */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-medium">Qadam:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = parseInt(String(editPrice).replace(/\D/g, ''), 10) || 0;
                            setEditPrice(Math.max(5000, cur - 5000));
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          -5 000
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = parseInt(String(editPrice).replace(/\D/g, ''), 10) || 0;
                            setEditPrice(cur + 5000);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          +5 000
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = parseInt(String(editPrice).replace(/\D/g, ''), 10) || 0;
                            setEditPrice(cur + 10000);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          +10 000
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] text-slate-400 font-medium">Tayyor narxlar:</span>
                        {[29000, 39000, 49000, 59000, 69000, 99000].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setEditPrice(val)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                              String(editPrice).replace(/\D/g, '') === String(val)
                                ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            {(val / 1000)}k
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Telegram Qo'llab-quvvatlash:
                    </label>
                    <input
                      type="text"
                      value={editTelegram}
                      onChange={e => setEditTelegram(e.target.value)}
                      placeholder="@nexora_admin"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {settingsSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                    {settingsSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Saqlanmoqda...' : 'Karta va Narxni Saqlash'}</span>
                </button>
              </form>
            </div>

            {/* 2. Instant Manual PRO Grant by ID or Email */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Foydalanuvchi ID si orqali PRO Berish</h3>
              </div>
              <p className="text-xs text-slate-400">
                Foydalanuvchining ID raqamini (masalan <strong className="text-amber-400">NX-4821</strong>) yoki emailini yozib, 1 ta bosishda unga PRO faollashtiring.
              </p>

              <form onSubmit={handleManualGrantPro} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Foydalanuvchi ID (User Code) yoki Emaili:
                  </label>
                  <input
                    type="text"
                    value={grantIdentifier}
                    onChange={e => setGrantIdentifier(e.target.value)}
                    placeholder="Masalan: NX-4821 yoki user@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Amal qilish muddati (kun):
                  </label>
                  <select
                    value={grantDays}
                    onChange={e => setGrantDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={30}>30 Kun (1 Oy)</option>
                    <option value={60}>60 Kun (2 Oy)</option>
                    <option value={90}>90 Kun (3 Oy)</option>
                    <option value={365}>365 Kun (1 Yil)</option>
                  </select>
                </div>

                {grantMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                    {grantMsg}
                  </div>
                )}

                {grantError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                    {grantError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={granting}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{granting ? 'Aktivlashtirilmoqda...' : 'PRO Rejasini Faollashtirish'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* 3. Incoming Payment Requests */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Kelib tushgan to'lov so'rovlari</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {paymentRequests.length} ta
                </span>
              </h3>
            </div>

            {/* Mobile View: High-touch cards */}
            <div className="md:hidden space-y-3">
              {paymentRequests.map(req => (
                <div key={req.id} className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-400 text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                      {req.userCode}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : req.status === 'REJECTED'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {req.status === 'APPROVED' ? 'TASDIQLANDI' : req.status === 'REJECTED' ? 'RAD ETILDI' : 'KUTILMOQDA'}
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-white text-sm">{req.userName}</div>
                    <div className="text-xs text-slate-400">{req.userEmail}</div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Summa</span>
                      <span className="font-bold text-emerald-400 text-sm">{req.amount.toLocaleString('uz-UZ')} so'm</span>
                    </div>
                    {req.receiptImageUrl ? (
                      <button
                        type="button"
                        onClick={() => setReceiptModalUrl(req.receiptImageUrl!)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold"
                      >
                        <img src={req.receiptImageUrl} alt="Chek" className="w-5 h-5 object-cover rounded" />
                        <span>Chekni ko'rish</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">Chek yuklanmagan</span>
                    )}
                  </div>

                  {req.paymentProofNote && (
                    <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 block font-semibold mb-0.5">To'lov izohi:</span>
                      {req.paymentProofNote}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 flex justify-between items-center">
                    <span>{new Date(req.createdAt).toLocaleString()}</span>
                  </div>

                  {req.status === 'PENDING' ? (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => handleApproveRequest(req.id)}
                        className="w-full py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-lg"
                      >
                        <span>✓ Tasdiqlash</span>
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req.id)}
                        className="w-full py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 font-semibold text-xs"
                      >
                        Rad etish
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-1 text-xs text-slate-500 font-semibold bg-slate-900/40 rounded-lg">
                      Amaliyot yakunlangan
                    </div>
                  )}
                </div>
              ))}
              {paymentRequests.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-xs bg-slate-950/60 rounded-xl border border-slate-800">
                  Hozircha hech qanday to'lov so'rovlari kelib tushmagan.
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">User ID</th>
                    <th className="p-3">Foydalanuvchi</th>
                    <th className="p-3">Chek Rasmi</th>
                    <th className="p-3">Summa</th>
                    <th className="p-3">To'lov Izohi</th>
                    <th className="p-3">Vaqti</th>
                    <th className="p-3">Holat</th>
                    <th className="p-3 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {paymentRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-amber-400">{req.userCode}</td>
                      <td className="p-3">
                        <div className="font-semibold text-white">{req.userName}</div>
                        <div className="text-[11px] text-slate-400">{req.userEmail}</div>
                      </td>
                      <td className="p-3">
                        {req.receiptImageUrl ? (
                          <button
                            type="button"
                            onClick={() => setReceiptModalUrl(req.receiptImageUrl!)}
                            className="group flex items-center gap-1.5 p-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-[11px] text-sky-400 font-semibold"
                          >
                            <img
                              src={req.receiptImageUrl}
                              alt="Chek"
                              className="w-7 h-7 object-cover rounded border border-slate-600"
                            />
                            <span>Ko'rish</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Yuklanmagan</span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-emerald-400">
                        {req.amount.toLocaleString('uz-UZ')} so'm
                      </td>
                      <td className="p-3 text-slate-300 max-w-xs truncate">
                        {req.paymentProofNote || 'Izoh yozilmagan'}
                      </td>
                      <td className="p-3 text-slate-500">
                        {new Date(req.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'APPROVED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : req.status === 'REJECTED'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {req.status === 'APPROVED'
                            ? 'TASDIQLANDI'
                            : req.status === 'REJECTED'
                            ? 'RAD ETILDI'
                            : 'KUTILMOQDA'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2 whitespace-nowrap">
                        {req.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleApproveRequest(req.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow"
                            >
                              ✓ Tasdiqlash (PRO berish)
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs transition-colors"
                            >
                              Rad etish
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-semibold">Bajarildi</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paymentRequests.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-500 text-xs">
                        Hozircha hech qanday to'lov so'rovlari kelib tushmagan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: System Settings, Feature Toggles & Ad Banner */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-3">
            <Sliders className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-sm">Panellar, Funksiyalar va Reklama Sozlamalari</p>
              <p className="text-slate-300 mt-0.5">
                Bu yerda siz rasm/video studiyalari oddiy foydalanuvchilarga ko'rinishi yoki yashirilishini boshqarishingiz, ilovadagi reklama bannerini yoqib-o'chirishingiz va narxlarni yangilashingiz mumkin.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSystemSettings} className="space-y-6">
            {/* 1. Feature Panels Visibility (User explicitly requested: admin tomondan korinadigan/korinmaydigan funksiyasi) */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-sky-400" />
                  <h3 className="text-sm font-bold text-white">Funksiyalar va Studiyalar Ko'rinishi</h3>
                </div>
                <span className="text-[10px] text-slate-400">Barcha foydalanuvchilarga ta'sir qiladi</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Studio Toggle */}
                <div className={`p-4 rounded-xl border transition-all ${
                  isImageStudioEnabled
                    ? 'bg-slate-950/80 border-emerald-500/40'
                    : 'bg-slate-950/40 border-slate-800 opacity-80'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isImageStudioEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Rasm Studiyasi (Image Studio)</h4>
                        <span className="text-[10px] text-slate-400">AI rasm generatsiyasi paneli</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsImageStudioEnabled(!isImageStudioEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isImageStudioEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isImageStudioEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isImageStudioEnabled
                      ? '✓ Barcha foydalanuvchilar menyuda Rasm Studiyasini ko\'ra oladi va undan foydalana oladi.'
                      : '✗ Rasm Studiyasi menyudan yashirilgan. Oddiy foydalanuvchilar ko\'ra olmaydi.'}
                  </p>
                </div>

                {/* Video Studio Toggle */}
                <div className={`p-4 rounded-xl border transition-all ${
                  isVideoStudioEnabled
                    ? 'bg-slate-950/80 border-emerald-500/40'
                    : 'bg-slate-950/40 border-slate-800 opacity-80'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isVideoStudioEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        <VideoIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Video Studiyasi (Video Studio)</h4>
                        <span className="text-[10px] text-slate-400">AI video generatsiyasi paneli</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsVideoStudioEnabled(!isVideoStudioEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isVideoStudioEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isVideoStudioEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isVideoStudioEnabled
                      ? '✓ Barcha foydalanuvchilar menyuda Video Studiyasini ko\'ra oladi va undan foydalana oladi.'
                      : '✗ Video Studiyasi menyudan yashirilgan. Oddiy foydalanuvchilar ko\'ra olmaydi.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Reklama Paneli (User explicitly requested: reklama panel faqat reklama bogansa korinib qolgan foyti korinmasin joyi) */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Reklama va E'lonlar Paneli</h3>
                    <p className="text-[11px] text-slate-400">
                      Agar o'chirilgan bo'lsa, ilovada hech qanday bo'sh joy qoldirmasdan butunlay ko'rinmaydi.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${adBannerEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {adBannerEnabled ? 'Faol (Ko\'rinmoqda)' : 'O\'chirilgan (Yashirin)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAdBannerEnabled(!adBannerEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      adBannerEnabled ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        adBannerEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Banner Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Reklama Sarlavhasi (Title):
                  </label>
                  <input
                    type="text"
                    value={adBannerTitle}
                    onChange={e => setAdBannerTitle(e.target.value)}
                    placeholder="Masalan: Talabalar uchun 50% chegirma!"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nishon (Badge matni):
                  </label>
                  <input
                    type="text"
                    value={adBannerBadge}
                    onChange={e => setAdBannerBadge(e.target.value)}
                    placeholder="AKSIYA / YANGILIK / DIQQAT"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 placeholder-slate-500 focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Reklama Matni (Description):
                  </label>
                  <textarea
                    rows={2}
                    value={adBannerText}
                    onChange={e => setAdBannerText(e.target.value)}
                    placeholder="Masalan: NEXORA PRO rejasiga 1 oylik obunani chegirmali narxda oling va barcha imkoniyatlardan cheklovlarsiz foydalaning!"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tugma Matni:
                  </label>
                  <input
                    type="text"
                    value={adBannerBtnText}
                    onChange={e => setAdBannerBtnText(e.target.value)}
                    placeholder="Masalan: Batafsil ko'rish"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tugma Havolasi (URL yoki Telegram link):
                  </label>
                  <input
                    type="text"
                    value={adBannerBtnUrl}
                    onChange={e => setAdBannerBtnUrl(e.target.value)}
                    placeholder="https://t.me/kanal_nomi yoki /pricing"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Live Preview of Ad Banner */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Foydalanuvchilarga qanday ko'rinadi (Jonli ko'rinish):
                </span>
                {adBannerEnabled ? (
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-rose-600/20 border border-amber-500/30 p-4 backdrop-blur-md">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                            {adBannerBadge || 'AKSIYA'}
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            {adBannerTitle || 'Reklama sarlavhasi'}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {adBannerText || 'Reklama matni bu yerda ko\'rinadi...'}
                        </p>
                      </div>

                      {adBannerBtnText && (
                        <div className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md">
                          <span>{adBannerBtnText}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                    Reklama paneli hozir o'chirilgan — foydalanuvchilar ekranida butunlay ko'rinmaydi.
                  </div>
                )}
              </div>
            </div>

            {/* 3. PRO Narxi va Telegram Bog'lanish */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">PRO Narxlari va Aloqa Sozlamalari</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5" />
                      <span>Oylik PRO Narxi (so'm):</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                      {Number(String(editPrice).replace(/\D/g, '') || 0).toLocaleString('uz-UZ')} so'm
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editPrice}
                      onChange={e => {
                        const cleaned = e.target.value.replace(/[^0-9]/g, '');
                        setEditPrice(cleaned);
                      }}
                      placeholder="49000"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-3 pr-16 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                      required
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {String(editPrice).length > 0 && (
                        <button
                          type="button"
                          onClick={() => setEditPrice('')}
                          className="px-2 py-0.5 text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800 rounded-md hover:bg-slate-700"
                          title="Tozalash"
                        >
                          ✕
                        </button>
                      )}
                      <span className="text-[11px] font-semibold text-slate-500 pr-1">UZS</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-slate-400">Tezkor:</span>
                    {[29000, 39000, 49000, 59000, 79000, 99000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setEditPrice(val)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                          String(editPrice).replace(/\D/g, '') === String(val)
                            ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {(val / 1000)}k
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Talabalar va foydalanuvchilar uchun qulay</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Telegram Administrator (@username):
                  </label>
                  <input
                    type="text"
                    value={editTelegram}
                    onChange={e => setEditTelegram(e.target.value)}
                    placeholder="@nexora_admin"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-sky-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Foydalanuvchilar chekni shu telegramga ham yuborishi mumkin</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Bank Nomi:
                  </label>
                  <input
                    type="text"
                    value={editBankName}
                    onChange={e => setEditBankName(e.target.value)}
                    placeholder="Kapitalbank"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Karta Raqami:
                  </label>
                  <input
                    type="text"
                    value={editCardNumber}
                    onChange={e => setEditCardNumber(e.target.value)}
                    placeholder="8600 0000 0000 0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Karta Egasi (F.I.O):
                  </label>
                  <input
                    type="text"
                    value={editCardHolder}
                    onChange={e => setEditCardHolder(e.target.value)}
                    placeholder="Sardorbek ..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            {systemSettingsSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{systemSettingsSuccess}</span>
              </div>
            )}

            <button
              id="save-system-settings-btn"
              type="submit"
              disabled={savingSystemSettings}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{savingSystemSettings ? 'Saqlanmoqda...' : 'Barcha Tizim va Reklama Sozlamalarini Saqlash'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Modal for full size receipt view */}
      {receiptModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">To'lov cheki skrinshoti</h4>
              <button
                onClick={() => setReceiptModalUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-950 rounded-xl p-2">
              <img
                src={receiptModalUrl}
                alt="Chek to'liq hajmi"
                className="max-h-[70vh] object-contain rounded-lg shadow-xl"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setReceiptModalUrl(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 block">Jami Foydalanuvchilar</span>
              <span className="text-2xl font-black text-white">{stats.totalUsers}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 block">Generatsiyalar</span>
              <span className="text-2xl font-black text-white">{stats.totalGenerations}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 block">Taqdimotlar</span>
              <span className="text-2xl font-black text-white">{stats.totalPresentations}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 block">Xavfsizlik Voqealari</span>
              <span className="text-2xl font-black text-rose-400">{stats.totalSecurityEvents}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Tizim holati
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Prompt Injection Himoyasi</span>
                <span className="text-emerald-400 font-bold">Faol va Tekshiruvda</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Limitlar va Quota</span>
                <span className="text-emerald-400 font-bold">Avtomatik cheklov tizimi</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">To'lov va Karta integratsiyasi</span>
                <span className="text-emerald-400 font-bold">Tayyor & Dinamik</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ID, ism yoki email bo'yicha qidirish..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Mobile View: User cards for phones */}
          <div className="md:hidden space-y-3">
            {filteredUsers.map(u => (
              <div key={u.id} className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400 text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                    {u.userCode || 'NX-0000'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.plan === 'PRO'
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {u.plan === 'PRO' ? 'PRO' : 'FREE'}
                    </span>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded bg-slate-900 border border-slate-800"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-white text-sm">{u.name}</div>
                  <div className="text-xs text-slate-400">{u.email}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Rol:</span>
                    <select
                      value={u.role}
                      onChange={e => handleUpdateRole(u.id, e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs font-bold text-indigo-400"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">PRO Boshqarish:</span>
                    <button
                      onClick={() => handleToggleProForUser(u.userCode || u.email, u.plan || 'FREE')}
                      className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-colors shadow ${
                        u.plan === 'PRO'
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      }`}
                    >
                      {u.plan === 'PRO' ? 'Bekor qilish' : '+30 kun PRO'}
                    </button>
                  </div>
                </div>

                {u.usage && (
                  <div className="text-[10px] text-slate-500 bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
                    Ishlatilgan: {u.usage.messages} xabar · {u.usage.images} rasm · {u.usage.presentations} slayd
                  </div>
                )}
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="p-6 text-center text-slate-500 text-xs bg-slate-950/60 rounded-xl border border-slate-800">
                Foydalanuvchi topilmadi.
              </div>
            )}
          </div>

          {/* Desktop View: Full Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Foydalanuvchi</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Reja (Plan)</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Ishlatilgan</th>
                  <th className="p-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-amber-400">
                      {u.userCode || 'NX-0000'}
                    </td>
                    <td className="p-3 font-semibold text-white">{u.name}</td>
                    <td className="p-3 text-slate-400">{u.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.plan === 'PRO'
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {u.plan === 'PRO' ? 'PRO' : 'FREE'}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={e => handleUpdateRole(u.id, e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] font-bold text-indigo-400"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {u.usage ? `${u.usage.messages} msg / ${u.usage.images} img / ${u.usage.presentations} pres` : '-'}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggleProForUser(u.userCode || u.email, u.plan || 'FREE')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          u.plan === 'PRO'
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        }`}
                      >
                        {u.plan === 'PRO' ? 'PRO Bekor qilish' : '+30 kun PRO'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Security */}
      {activeTab === 'security' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Xavfsizlik Voqealari ({securityEvents.length})
          </h3>
          <div className="space-y-2">
            {securityEvents.map(ev => (
              <div
                key={ev.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-rose-400 uppercase">{ev.type}</span>
                  <div className="text-slate-400 mt-1">{ev.details}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">IP: {ev.ipAddress}</div>
                </div>
                <div className="text-slate-500 text-[11px]">
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {securityEvents.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                Xavfsizlik bo'yicha hech qanday xavf aniqlanmadi.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Tizim Audit Tarixi ({auditLogs.length})
          </h3>
          <div className="space-y-2">
            {auditLogs.map(log => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{log.action}</div>
                  <div className="text-[11px] text-slate-400">{log.details}</div>
                  <div className="text-[10px] text-slate-500">User ID: {log.userId} • IP: {log.ipAddress}</div>
                </div>
                <div className="text-slate-500 text-[11px]">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Background Jobs */}
      {activeTab === 'jobs' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Fon Jarayonlari ({jobs.length})
          </h3>
          <div className="space-y-2">
            {jobs.map(j => (
              <div
                key={j.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white capitalize">{j.type} Job</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-400 uppercase">
                      {j.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Progress: {j.progress}%</div>
                </div>
                <div className="text-slate-500 text-[11px]">
                  {new Date(j.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
