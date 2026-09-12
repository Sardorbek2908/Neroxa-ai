import React, { useState } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Image as ImageIcon,
  Video,
  Presentation,
  FolderHeart,
  Cpu,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Crown,
  Zap,
  Bot,
  Brain,
  Wand2,
  Flame,
  Layers,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { StudioSectionConfig, BrandingSettings } from '../../types';

export type AppView =
  | 'dashboard'
  | 'chat'
  | 'image'
  | 'video'
  | 'presentation'
  | 'presentation_editor'
  | 'creations'
  | 'models'
  | 'admin';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onNewChat?: () => void;
  onOpenSettings?: () => void;
  onOpenAuth?: () => void;
  onOpenAdminPortal?: () => void;
  onOpenSubscription?: () => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (val: boolean) => void;
  isImageStudioEnabled?: boolean;
  isVideoStudioEnabled?: boolean;
  isPresentationStudioEnabled?: boolean;
  imageStudioConfig?: StudioSectionConfig;
  videoStudioConfig?: StudioSectionConfig;
  presentationStudioConfig?: StudioSectionConfig;
  branding?: BrandingSettings;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onNewChat,
  onOpenSettings,
  onOpenAuth,
  onOpenAdminPortal,
  onOpenSubscription,
  isCollapsed = false,
  setIsCollapsed,
  isImageStudioEnabled = true,
  isVideoStudioEnabled = true,
  isPresentationStudioEnabled = true,
  imageStudioConfig,
  videoStudioConfig,
  presentationStudioConfig,
  branding,
  onCloseMobile,
}) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [secretClicks, setSecretClicks] = useState(0);
  const [lastSecretClick, setLastSecretClick] = useState(0);

  const handleLogoClick = () => {
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
    onNavigate('dashboard');
  };

  const appName = branding?.appName || t.brandName || 'NEXORA';
  const appSubtitle = branding?.appSubtitle || t.tagline || 'AI Studio';
  const logoUrl = branding?.logoUrl;

  const renderLogoIcon = () => {
    if (logoUrl) {
      return (
        <img
          src={logoUrl}
          alt={appName}
          className="w-full h-full object-cover rounded-xl"
        />
      );
    }
    const iconType = branding?.logoIcon || 'sparkles';
    switch (iconType) {
      case 'zap':
        return <Zap className="w-5 h-5 text-white" />;
      case 'bot':
        return <Bot className="w-5 h-5 text-white" />;
      case 'brain':
        return <Brain className="w-5 h-5 text-white" />;
      case 'wand':
        return <Wand2 className="w-5 h-5 text-white" />;
      case 'flame':
        return <Flame className="w-5 h-5 text-white" />;
      case 'layers':
        return <Layers className="w-5 h-5 text-white" />;
      default:
        return <Sparkles className="w-5 h-5 text-white" />;
    }
  };

  const isImageActive = (isImageStudioEnabled && imageStudioConfig?.enabled !== false) || user?.role === 'ADMIN';
  const isVideoActive = (isVideoStudioEnabled && videoStudioConfig?.enabled !== false) || user?.role === 'ADMIN';
  const isPresentationActive = (isPresentationStudioEnabled && presentationStudioConfig?.enabled !== false) || user?.role === 'ADMIN';

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'chat', label: t.nav.aiChat, icon: MessageSquare },
    ...(isImageActive
      ? [{
          id: 'image',
          label: imageStudioConfig?.name || t.nav.createImage,
          icon: ImageIcon,
          badge: imageStudioConfig?.badge,
        }]
      : []),
    ...(isVideoActive
      ? [{
          id: 'video',
          label: videoStudioConfig?.name || t.nav.createVideo,
          icon: Video,
          badge: videoStudioConfig?.badge,
        }]
      : []),
    ...(isPresentationActive
      ? [{
          id: 'presentation',
          label: presentationStudioConfig?.name || t.nav.createPresentation,
          icon: Presentation,
          badge: presentationStudioConfig?.badge,
        }]
      : []),
    { id: 'creations', label: t.nav.myCreations, icon: FolderHeart },
    { id: 'models', label: t.nav.models, icon: Cpu },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ id: 'admin', label: t.nav.adminPanel, icon: Shield });
  }

  return (
    <aside
      className={`relative flex flex-col bg-slate-950 border-r border-slate-800/80 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 justify-between border-b border-slate-800/80">
        {!isCollapsed && (
          <div
            id="brand-logo"
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer group select-none min-w-0"
          >
            <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform overflow-hidden">
              {renderLogoIcon()}
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent truncate">
                {appName}
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-tight truncate">
                {appSubtitle}
              </div>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div
            onClick={handleLogoClick}
            className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-indigo-400 flex items-center justify-center cursor-pointer shadow-lg shadow-indigo-500/20 select-none overflow-hidden"
            title={`${appName} - ${appSubtitle}`}
          >
            {renderLogoIcon()}
          </div>
        )}

        <button
          id="collapse-sidebar-btn"
          onClick={() => setIsCollapsed && setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
            title="Menyuni yopish"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Primary Action Button (New Chat) */}
      <div className="p-3">
        <button
          id="new-chat-btn"
          onClick={onNewChat}
          className={`w-full flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all ${
            isCollapsed ? 'px-0' : ''
          }`}
          title={t.nav.newChat}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span>{t.nav.newChat}</span>}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onNavigate(item.id as AppView)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {(item as any).badge && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex-shrink-0">
                      {(item as any).badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-3 border-t border-slate-800/80 space-y-1">
        <button
          id="settings-nav-btn"
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 font-medium text-sm transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={t.nav.settings}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>{t.nav.settings}</span>}
        </button>

        {user && !isCollapsed && onOpenSubscription && (
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-indigo-950/40 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold text-white">
                  {user.plan === 'PRO' ? 'PRO Obuna Faol' : 'NEXORA PRO'}
                </span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                  user.plan === 'PRO'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {user.plan === 'PRO' ? 'PRO' : 'FREE'}
              </span>
            </div>

            {user.userCode && (
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>ID:</span>
                <span className="font-bold text-amber-300">{user.userCode}</span>
              </div>
            )}

            <button
              onClick={onOpenSubscription}
              className={`w-full py-1.5 rounded-xl text-[11px] font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                user.plan === 'PRO'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950'
              }`}
            >
              <span>{user.plan === 'PRO' ? 'Obunani boshqarish' : "PRO rejasiga o'tish"}</span>
            </button>
          </div>
        )}

        {user ? (
          <div className="pt-1">
            {!isCollapsed ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                    <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                      <span>{user.role}</span>
                      <span>•</span>
                      <span className="text-emerald-400">Online</span>
                    </div>
                  </div>
                </div>
                <button
                  id="logout-btn"
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                  title={t.nav.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="logout-collapsed-btn"
                onClick={logout}
                className="w-full flex justify-center p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl"
                title={t.nav.logout}
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <button
            id="sign-in-sidebar-btn"
            onClick={onOpenAuth}
            className={`w-full flex items-center gap-2 px-3 py-2 text-center rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium transition-colors ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            {!isCollapsed ? 'Sign In / Register' : 'Login'}
          </button>
        )}
      </div>
    </aside>
  );
};
