import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Download, Check, Copy } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  prompt?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  prompt,
}) => {
  const [scale, setScale] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
    }
  }, [isOpen, imageUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setScale(s => Math.min(s + 0.25, 3));
      if (e.key === '-') setScale(s => Math.max(s - 0.25, 0.5));
      if (e.key === '0') setScale(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${title || 'nexora-generated-image'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    const win = window.open();
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>${title || 'NEXORA AI Image'}</title>
            <style>
              body { margin: 0; background: #0b0f19; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
              img { max-width: 96vw; max-height: 96vh; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" alt="${title || 'Generated Image'}" />
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-white truncate max-w-md">
            {title || 'NEXORA AI Image Viewer'}
          </div>
          {prompt && (
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Promtni nusxalash"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Nusxalandi' : 'Promt'}</span>
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(s => Math.min(s + 0.25, 3))}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white transition-colors border border-slate-700"
            title="Kattalashtirish (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale(s => Math.max(s - 0.25, 0.5))}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white transition-colors border border-slate-700"
            title="Kichiklashtirish (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale(1)}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white transition-colors border border-slate-700"
            title="Dastlabki o'lcham (100%)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenNewTab}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white transition-colors border border-slate-700 flex items-center gap-1.5 text-xs font-medium px-3"
            title="Yangi oynada ochish"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Yangi oynada ochish</span>
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold px-3.5"
            title="Yuklab olish"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Yuklab olish</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-red-500/80 text-white transition-colors border border-slate-700 ml-2"
            title="Yopish (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image Center Viewport */}
      <div
        className="w-full h-full flex items-center justify-center overflow-auto p-8 cursor-grab active:cursor-grabbing select-none"
        onClick={e => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <img
          src={imageUrl}
          alt={title || 'Generated'}
          style={{
            transform: `scale(${scale})`,
            transition: 'transform 0.15s ease-out',
          }}
          className="max-h-[85vh] max-w-[85vw] object-contain rounded-xl shadow-2xl border border-slate-800 pointer-events-auto"
        />
      </div>

      {/* Footer prompt */}
      {prompt && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-2xl w-full px-4 text-center pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 truncate pointer-events-auto">
            <span className="text-slate-500 mr-2 font-semibold">Promt:</span>
            {prompt}
          </div>
        </div>
      )}
    </div>
  );
};
