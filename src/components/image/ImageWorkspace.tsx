import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Sliders,
  Image as ImageIcon,
  Wand2,
  RefreshCw,
  Copy,
  Check,
  Upload,
  Layers,
  Maximize2,
} from 'lucide-react';
import { api } from '../../services/api';
import { Generation } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { ImageLightbox } from '../common/ImageLightbox';
import { StudioSectionConfig } from '../../types';

interface ImageWorkspaceProps {
  config?: StudioSectionConfig;
}

export const ImageWorkspace: React.FC<ImageWorkspaceProps> = ({ config }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');

  // Generation state
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.1-flash-lite-image' | 'gemini-3.1-flash-image' | 'gemini-3-pro-image'>('gemini-3.1-flash-lite-image');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [resolution, setResolution] = useState<'512px' | '1K' | '2K'>('1K');
  const [style, setStyle] = useState('Cinematic');
  const [generating, setGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<Generation | null>(null);
  const [recentImages, setRecentImages] = useState<Generation[]>([]);
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Edit state
  const [editPrompt, setEditPrompt] = useState('');
  const [editSourceBase64, setEditSourceBase64] = useState<string | null>(null);
  const [editMimeType, setEditMimeType] = useState('image/png');
  const [editing, setEditing] = useState(false);

  const styleOptions = [
    'None',
    'Realistic',
    'Cinematic',
    '3D Render',
    'Cyberpunk',
    'Anime',
    'Digital Art',
    'Oil Painting',
    'Isometric',
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    try {
      const res = await api.generateImage({
        prompt,
        model: selectedModel,
        aspectRatio,
        resolution,
        style,
      });
      setCurrentImage(res.generation);
      setRecentImages(prev => [res.generation, ...prev]);
    } catch (err: any) {
      alert(`Image generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim() || !editSourceBase64 || editing) return;

    setEditing(true);
    try {
      const res = await api.editImage({
        prompt: editPrompt,
        imageBase64: editSourceBase64,
        mimeType: editMimeType,
      });
      setCurrentImage(res.generation);
      setRecentImages(prev => [res.generation, ...prev]);
    } catch (err: any) {
      alert(`Image editing failed: ${err.message}`);
    } finally {
      setEditing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setEditSourceBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const downloadImage = (url: string, filename = 'nexora-creation.png') => {
    const isSvg = url.includes('image/svg+xml');
    const safeBaseName = filename.replace(/\.[^/.]+$/, '');
    const finalFilename = isSvg ? `${safeBaseName}.svg` : `${safeBaseName}.png`;
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto custom-scrollbar space-y-6">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 flex-shrink-0" />
            <span>{config?.name || t.image.title}</span>
            {config?.badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {config.badge}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {config?.description || 'Generate photorealistic illustrations, architectural models, and apply intelligent edits using Gemini & Imagen.'}
          </p>
        </div>

        <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'generate'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.image.generate}
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.image.edit}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Controls */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-5">
          {activeTab === 'generate' ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Creative Prompt
                </label>
                <textarea
                  rows={3}
                  required
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder={t.image.promptPlaceholder}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                {/* Mobile-friendly quick inspiration chips */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    { label: '🐕 Qora mashina & kuchukcha', val: 'Qora mashina oldida turgan kuchukcha quyosh botishi' },
                    { label: '🏎️ Poyga avtomobili', val: 'Tog yo\'lida tez ketayotgan qora sport mashinasi' },
                    { label: '👑 Sardorbek logotipi', val: 'Sardorbek ismiga zamonaviy tilla monogram logo' },
                    { label: '🚀 Kosmonavt mushuk', val: 'Ochiq koinotda yulduzlar orasida skafandrdagi mushukcha' },
                    { label: '🦅 Qoyadagi burgut', val: 'Qorli tog cho\'qqisida o\'tirgan ulug\'vor oltin burgut' },
                  ].map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setPrompt(item.val)}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-slate-700/60 transition-all text-left"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {t.image.aspectRatio}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(['1:1', '16:9', '9:16', '4:3', '3:4'] as const).map(ratio => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 text-center rounded-xl text-xs font-bold border transition-colors ${
                        aspectRatio === ratio
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Model (Nano Banana) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    AI Tasvir Modeli
                  </label>
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Nano Banana Faol
                  </span>
                </div>
                <select
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="gemini-3.1-flash-lite-image">
                    ⚡ Nano Banana Lite (Gemini 3.1 Flash Lite) — Oddiy va tezkor rasm
                  </option>
                  <option value="gemini-3.1-flash-image">
                    🌟 Nano Banana 2 (Gemini 3.1 Flash) — 1K/2K HD fotorealizm
                  </option>
                  <option value="gemini-3-pro-image">
                    💎 Nano Banana Pro (Gemini 3 Pro) — Studio darajasi
                  </option>
                </select>
              </div>

              {/* Resolution & Style */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t.image.resolution}
                  </label>
                  <select
                    value={resolution}
                    onChange={e => setResolution(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="512px">512px (Fast)</option>
                    <option value="1K">1K (High Quality)</option>
                    <option value="2K">2K (Ultra Sharp)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t.image.style}
                  </label>
                  <select
                    value={style}
                    onChange={e => setStyle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {styleOptions.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={generating || !prompt.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t.image.generating}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t.image.generate}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Edit Tab */
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Source Image
                </label>
                <div className="relative border-2 border-dashed border-slate-800 hover:border-indigo-500/60 rounded-xl p-4 text-center cursor-pointer bg-slate-950 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {editSourceBase64 ? (
                    <img
                      src={`data:${editMimeType};base64,${editSourceBase64}`}
                      alt="Source"
                      className="max-h-36 mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="py-4 space-y-1">
                      <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                      <div className="text-xs text-slate-300 font-medium">Upload Image to Edit</div>
                      <div className="text-[10px] text-slate-500">PNG, JPG, WEBP up to 20MB</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Editing Instruction
                </label>
                <textarea
                  rows={3}
                  required
                  value={editPrompt}
                  onChange={e => setEditPrompt(e.target.value)}
                  placeholder="e.g. Remove the background and replace with neon cyber skyline..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={editing || !editPrompt.trim() || !editSourceBase64}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {editing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Applying Edits...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Process Image Edit</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Area: Display & Canvas */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[440px]">
          <div className="flex-1 flex items-center justify-center">
            {currentImage ? (
              <div
                onClick={() => setLightboxOpen(true)}
                className="relative group max-w-full cursor-pointer overflow-hidden rounded-xl"
                title="To'liq o'lchamda ochish uchun bosing"
              >
                <img
                  src={currentImage.outputUrl}
                  alt={currentImage.title}
                  className="max-h-[460px] rounded-xl object-contain shadow-2xl border border-slate-800 group-hover:scale-[1.02] transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-indigo-600/90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>To'liq ochish</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-300">No Image Generated Yet</div>
                <div className="text-xs text-slate-500 max-w-sm">
                  Write a prompt or select a style on the left, then click Generate to render in real-time.
                </div>
              </div>
            )}
          </div>

          {currentImage && (
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate max-w-md">
                  {currentImage.title}
                </div>
                <div className="text-[11px] text-slate-400">
                  Model: {currentImage.model} • Ratio: {currentImage.aspectRatio || '1:1'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
                  title="To'liq hajmda ko'rish"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="hidden sm:inline">To'liq ochish</span>
                </button>
                <button
                  onClick={() => copyPrompt(currentImage.prompt)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
                  title="Copy prompt"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => downloadImage(currentImage.outputUrl, `${currentImage.title}.png`)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.image.download}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Strip */}
      {recentImages.length > 0 && (
        <div className="pt-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            {t.image.recentImages}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {recentImages.map(img => (
              <div
                key={img.id}
                onClick={() => {
                  setCurrentImage(img);
                  setLightboxOpen(true);
                }}
                className="aspect-square rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500 cursor-pointer bg-slate-900 transition-all group relative"
              >
                <img src={img.outputUrl} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {currentImage && (
        <ImageLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          imageUrl={currentImage.outputUrl}
          title={currentImage.title}
          prompt={currentImage.prompt}
        />
      )}
    </div>
  );
};
