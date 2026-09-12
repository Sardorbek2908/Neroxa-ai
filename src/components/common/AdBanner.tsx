import React, { useState } from 'react';
import { Megaphone, ExternalLink, X, Sparkles } from 'lucide-react';
import { AdBannerSettings } from '../../types';

interface AdBannerProps {
  banner?: AdBannerSettings | null;
}

export const AdBanner: React.FC<AdBannerProps> = ({ banner }) => {
  const [dismissed, setDismissed] = useState(false);

  // Strictly invisible if banner is disabled, not provided, has no text, or was dismissed by user
  if (!banner || !banner.enabled || !banner.text?.trim() || dismissed) {
    return null;
  }

  return (
    <div
      id="nexora-ad-banner"
      className="relative z-20 w-full bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-sky-950/90 border-b border-indigo-500/30 text-white px-4 py-2.5 shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-top-2"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center flex-shrink-0 text-amber-300 shadow-inner">
            <Megaphone className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>

          <div className="min-w-0 flex-1 flex items-center gap-2.5 flex-wrap">
            {banner.badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-sm flex items-center gap-1 flex-shrink-0">
                <Sparkles className="w-3 h-3 text-slate-950" />
                <span>{banner.badge}</span>
              </span>
            )}
            {banner.title && (
              <strong className="font-bold text-xs sm:text-sm text-white flex-shrink-0">
                {banner.title}
              </strong>
            )}
            <p className="text-xs text-indigo-100/90 truncate sm:whitespace-normal leading-tight">
              {banner.text}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0 ml-auto">
          {banner.buttonUrl && banner.buttonText && (
            <a
              id="ad-banner-cta-link"
              href={banner.buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold shadow-md hover:shadow-amber-500/20 active:scale-95 transition-all"
            >
              <span>{banner.buttonText}</span>
              <ExternalLink className="w-3 h-3 text-slate-950" />
            </a>
          )}

          <button
            id="ad-banner-dismiss-btn"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
            title="Yopish"
            aria-label="Yopish"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
