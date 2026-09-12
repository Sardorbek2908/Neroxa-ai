import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar, AppView } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { ChatWorkspace } from './components/chat/ChatWorkspace';
import { ImageWorkspace } from './components/image/ImageWorkspace';
import { VideoWorkspace } from './components/video/VideoWorkspace';
import { PresentationWorkspace } from './components/presentation/PresentationWorkspace';
import { PresentationEditor } from './components/presentation/PresentationEditor';
import { PresentationPresenter } from './components/presentation/PresentationPresenter';
import { CreationsGallery } from './components/creations/CreationsGallery';
import { ModelsView } from './components/models/ModelsView';
import { AdminView } from './components/admin/AdminView';
import { AdminPortalModal } from './components/admin/AdminPortalModal';
import { AuthModal } from './components/auth/AuthModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { SubscriptionModal } from './components/subscription/SubscriptionModal';
import { api } from './services/api';
import { Chat, Generation, Presentation } from './types';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const { effectiveTheme } = useTheme();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [editingPresentationId, setEditingPresentationId] = useState<string | null>(null);
  const [presentingPresentation, setPresentingPresentation] = useState<Presentation | null>(null);
  const [presentingSlideIdx, setPresentingSlideIdx] = useState<number>(0);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cross-view state (e.g. clicking prompt on Dashboard opens chat)
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');

  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [recentCreations, setRecentCreations] = useState<Generation[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>(null);

  useEffect(() => {
    // Load public system settings and branding
    api.getSystemConfig().then(res => {
      if (res) {
        setSystemConfig(res);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    // Secret entrance via URL hash or query: #admin or ?admin
    const checkSecretUrl = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash === '#admin' || hash === '#adminpanel' || search.includes('admin=true') || search.includes('secret=admin') || search.includes('?admin')) {
        if (user?.role === 'ADMIN') {
          setCurrentView('admin');
        } else {
          setIsAdminPortalOpen(true);
        }
      }
    };

    checkSecretUrl();
    window.addEventListener('hashchange', checkSecretUrl);

    // Secret keyboard shortcut: Ctrl+Shift+A, Cmd+Shift+A, or Alt+A
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && !e.ctrlKey && !e.metaKey;
      if (isInputFocused) return;

      if (((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) ||
          (e.altKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        if (user?.role === 'ADMIN') {
          setCurrentView('admin');
        } else {
          setIsAdminPortalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', checkSecretUrl);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [user]);

  useEffect(() => {
    // Load dashboard recents
    api.getChats().then(res => setRecentChats(res.chats)).catch(() => {});
    api.getCreations().then(res => setRecentCreations(res.creations)).catch(() => {});
  }, [currentView]);

  const handleSelectPrompt = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setCurrentView('chat');
  };

  const handleOpenEditor = (id: string) => {
    setEditingPresentationId(id);
    setCurrentView('presentation_editor');
  };

  const handlePresent = (presentation: Presentation, initialSlideIdx = 0) => {
    setPresentingPresentation(presentation);
    setPresentingSlideIdx(initialSlideIdx);
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-200 ${
      effectiveTheme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Responsive Left Sidebar */}
      <div
        className={`${
          isMobileMenuOpen ? 'block fixed inset-0 z-40 bg-black/60 md:static' : 'hidden'
        } md:block md:static flex-shrink-0`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className="h-full w-64 bg-slate-950"
          onClick={e => e.stopPropagation()}
        >
          <Sidebar
            currentView={currentView}
            onNavigate={view => {
              setCurrentView(view);
              setIsMobileMenuOpen(false);
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
            onOpenSubscription={() => setIsSubscriptionOpen(true)}
            isImageStudioEnabled={systemConfig?.isImageStudioEnabled ?? true}
            isVideoStudioEnabled={systemConfig?.isVideoStudioEnabled ?? true}
            isPresentationStudioEnabled={systemConfig?.isPresentationStudioEnabled ?? true}
            imageStudioConfig={systemConfig?.imageStudioConfig}
            videoStudioConfig={systemConfig?.videoStudioConfig}
            presentationStudioConfig={systemConfig?.presentationStudioConfig}
            branding={systemConfig?.branding}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />
        </div>
      </div>

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
          onOpenSubscription={() => setIsSubscriptionOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          branding={systemConfig?.branding}
        />

        {/* Dynamic View Mount */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {currentView === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentView}
              onSelectPrompt={handleSelectPrompt}
              recentChats={recentChats}
              recentCreations={recentCreations}
              onOpenAuth={() => setIsAuthOpen(true)}
              isImageStudioEnabled={systemConfig?.isImageStudioEnabled ?? true}
              isVideoStudioEnabled={systemConfig?.isVideoStudioEnabled ?? true}
              isPresentationStudioEnabled={systemConfig?.isPresentationStudioEnabled ?? true}
              imageStudioConfig={systemConfig?.imageStudioConfig}
              videoStudioConfig={systemConfig?.videoStudioConfig}
              presentationStudioConfig={systemConfig?.presentationStudioConfig}
              branding={systemConfig?.branding}
            />
          )}

          {currentView === 'chat' && (
            <ChatWorkspace
              initialPrompt={chatInitialPrompt}
              onClearInitialPrompt={() => setChatInitialPrompt('')}
              onOpenPresentation={topic => {
                setCurrentView('presentation');
              }}
              onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
            />
          )}

          {currentView === 'image' && (
            <ImageWorkspace config={systemConfig?.imageStudioConfig} />
          )}

          {currentView === 'video' && (
            <VideoWorkspace config={systemConfig?.videoStudioConfig} />
          )}

          {currentView === 'presentation' && (
            <PresentationWorkspace
              config={systemConfig?.presentationStudioConfig}
              onOpenEditor={handleOpenEditor}
              onPresent={p => handlePresent(p, 0)}
            />
          )}

          {currentView === 'presentation_editor' && editingPresentationId && (
            <PresentationEditor
              presentationId={editingPresentationId}
              onBack={() => setCurrentView('presentation')}
              onPresent={handlePresent}
            />
          )}

          {currentView === 'creations' && <CreationsGallery />}

          {currentView === 'models' && <ModelsView />}

          {currentView === 'admin' && (
            <AdminView
              onSystemSettingsUpdated={settings => {
                setSystemConfig((prev: any) => ({
                  ...prev,
                  ...settings,
                }));
              }}
            />
          )}
        </main>
      </div>

      {/* Fullscreen Presenter Mode */}
      {presentingPresentation && (
        <PresentationPresenter
          presentation={presentingPresentation}
          initialSlideIdx={presentingSlideIdx}
          onClose={() => setPresentingPresentation(null)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onOpenAdminPortal={() => {
          setIsAuthOpen(false);
          setIsAdminPortalOpen(true);
        }}
      />

      {/* Dedicated Admin Portal Modal with Password Recovery */}
      <AdminPortalModal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
        onSuccessLogin={() => {
          setCurrentView('admin');
        }}
      />

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* PRO Subscription & Payment Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
