import React from 'react';
import {
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Presentation,
  FileText,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppView } from '../layout/Sidebar';
import { Generation, Chat, StudioSectionConfig, BrandingSettings } from '../../types';

interface DashboardViewProps {
  onNavigate: (view: AppView) => void;
  onSelectPrompt: (prompt: string) => void;
  recentChats: Chat[];
  recentCreations: Generation[];
  onOpenAuth: () => void;
  isImageStudioEnabled?: boolean;
  isVideoStudioEnabled?: boolean;
  isPresentationStudioEnabled?: boolean;
  imageStudioConfig?: StudioSectionConfig;
  videoStudioConfig?: StudioSectionConfig;
  presentationStudioConfig?: StudioSectionConfig;
  branding?: BrandingSettings;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onSelectPrompt,
  recentChats,
  recentCreations,
  onOpenAuth,
  isImageStudioEnabled = true,
  isVideoStudioEnabled = true,
  isPresentationStudioEnabled = true,
  imageStudioConfig,
  videoStudioConfig,
  presentationStudioConfig,
  branding,
}) => {
  const { user, usage } = useAuth();
  const { t, language } = useLanguage();

  const isImageActive = (isImageStudioEnabled && imageStudioConfig?.enabled !== false) || user?.role === 'ADMIN';
  const isVideoActive = (isVideoStudioEnabled && videoStudioConfig?.enabled !== false) || user?.role === 'ADMIN';
  const isPresentationActive = (isPresentationStudioEnabled && presentationStudioConfig?.enabled !== false) || user?.role === 'ADMIN';

  const samplePrompts = [
    ...(isPresentationActive
      ? [
          {
            title: presentationStudioConfig?.name || "O'zbek tilida Prezentatsiya",
            desc: presentationStudioConfig?.description || 'Universitet uchun qayta tiklanuvchi energiya mavzusida 10 slaydlik prezentatsiya tayyorla',
            icon: Presentation,
            category: 'presentation',
            prompt: "Universitet uchun O'zbek tilida qayta tiklanuvchi energiya va ekologiya mavzusida 10 slaydlik professional prezentatsiya tayyorla",
          },
        ]
      : []),
    ...(isImageActive
      ? [
          {
            title: imageStudioConfig?.name || 'Cyberpunk Lamborghini',
            desc: imageStudioConfig?.description || 'Neon yoritilgan yomg‘irli shahar fonida futuristik superkar',
            icon: ImageIcon,
            category: 'image',
            prompt: 'Cyberpunk Lamborghini supercar on rain-slicked neon street at midnight, 8k resolution cinematic lighting',
          },
        ]
      : []),
    ...(isVideoActive
      ? [
          {
            title: videoStudioConfig?.name || 'Drone Cinematic Flyover',
            desc: videoStudioConfig?.description || 'Kelajak shahri bo‘ylab silliq parvoz qiluvchi kamera harakati',
            icon: Video,
            category: 'video',
            prompt: 'Cinematic drone flyover futuristic glowing city skyline at twilight with flying vehicles',
          },
        ]
      : []),
    {
      title: 'Code Review & Security Audit',
      desc: 'Kodingizni xavfsizlik va unumdorlik bo‘yicha tahlil qilish',
      icon: Cpu,
      category: 'chat',
      prompt: 'Analyze this TypeScript authentication middleware for potential security vulnerabilities and OWASP compliance',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-7xl mx-auto custom-scrollbar">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-sky-950/60 border border-slate-800/80 p-6 md:p-10 overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{branding?.appName || 'NEXORA'} {branding?.appSubtitle || 'AI Studio'}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {t.dashboard.welcome}{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200 bg-clip-text text-transparent">
              {user ? user.name : 'Creator'}
            </span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base mt-3 leading-relaxed">
            {t.dashboard.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {isPresentationActive && (
              <button
                onClick={() => onNavigate('presentation')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
              >
                <Presentation className="w-4 h-4" />
                <span>{presentationStudioConfig?.buttonText || presentationStudioConfig?.name || t.nav.createPresentation}</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('chat')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>{t.dashboard.chatWithAi}</span>
            </button>
            {!user && (
              <button
                onClick={onOpenAuth}
                className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-indigo-300 text-sm font-medium transition-all"
              >
                Sign In / Switch Demo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resource Usage Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          {t.dashboard.usageStats}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>{t.dashboard.presentationsMade}</span>
              <Presentation className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {usage ? usage.presentationsCount : 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">10-stage AI synthesis</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>{t.dashboard.imagesCreated}</span>
              <ImageIcon className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {usage ? usage.imagesCount : 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Photorealistic & artistic</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>{t.dashboard.videosGenerated}</span>
              <Video className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {usage ? usage.videosCount : 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Veo motion rendering</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>{t.dashboard.messagesUsed}</span>
              <MessageSquare className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {usage ? usage.messagesCount : 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Gemini 3.8 Multi-turn</div>
          </div>
        </div>
      </div>

      {/* Fast Prompt Starter Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t.dashboard.quickActions}
          </h2>
          <span className="text-xs text-indigo-400 font-medium">Click any chip to begin</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {samplePrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => {
                  if (item.category === 'presentation') {
                    onNavigate('presentation');
                  } else if (item.category === 'image') {
                    onNavigate('image');
                  } else if (item.category === 'video') {
                    onNavigate('video');
                  } else {
                    onSelectPrompt(item.prompt);
                  }
                }}
                className="group p-5 rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-lg shadow-black/20"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
                <div className="mt-4 flex items-center gap-1 text-[11px] text-indigo-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Start action</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dual Section: Recent Chats and Recent Creations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Chats */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>{t.dashboard.recentChats}</span>
            </h3>
            <button
              onClick={() => onNavigate('chat')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View all
            </button>
          </div>

          <div className="space-y-2">
            {recentChats.slice(0, 4).map(c => (
              <div
                key={c.id}
                onClick={() => onNavigate('chat')}
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <div className="text-xs font-semibold text-white truncate">{c.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Model: {c.model} • {new Date(c.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              </div>
            ))}

            {recentChats.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                No conversations yet. Start a chat with NEXORA Agent!
              </div>
            )}
          </div>
        </div>

        {/* Recent Creations */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>{t.dashboard.recentCreations}</span>
            </h3>
            <button
              onClick={() => onNavigate('creations')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View gallery
            </button>
          </div>

          <div className="space-y-2">
            {recentCreations.slice(0, 4).map(cr => (
              <div
                key={cr.id}
                onClick={() => onNavigate('creations')}
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <div className="text-xs font-semibold text-white truncate">{cr.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 capitalize">
                    {cr.type} • {cr.model} • {new Date(cr.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-400 border border-indigo-900 uppercase">
                  {cr.type}
                </span>
              </div>
            ))}

            {recentCreations.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                No creations yet. Generate images, videos or presentations!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
