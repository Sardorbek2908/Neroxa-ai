import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Download,
  FileDown,
  Play,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Wand2,
  FileText,
  Save,
  Check,
  BarChart3,
  Table as TableIcon,
  Maximize,
} from 'lucide-react';
import { api } from '../../services/api';
import { Presentation, PresentationSlide } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface PresentationEditorProps {
  presentationId: string;
  onBack: () => void;
  onPresent: (presentation: Presentation, initialSlideIdx?: number) => void;
}

export const PresentationEditor: React.FC<PresentationEditorProps> = ({
  presentationId,
  onBack,
  onPresent,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isPro = user?.plan === 'PRO' || user?.role === 'ADMIN';

  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [selectedSlideIdx, setSelectedSlideIdx] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportingPptx, setExportingPptx] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [customRegenText, setCustomRegenText] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [activeMobileTab, setActiveMobileTab] = useState<'canvas' | 'slides' | 'ai'>('canvas');

  useEffect(() => {
    loadPresentation();
  }, [presentationId]);

  const loadPresentation = async () => {
    setLoading(true);
    try {
      const res = await api.getPresentation(presentationId);
      if (res?.presentation) {
        setPresentation(res.presentation);
      } else {
        throw new Error('Taqdimot topilmadi');
      }
    } catch (err: any) {
      console.error('Failed to load presentation:', err);
      alert(`Taqdimotni yuklab bo'lmadi: ${err.message || 'Xatolik'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4 bg-slate-950">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Taqdimot yuklanmoqda...</p>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-slate-950 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Taqdimot ochilmadi</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">Taqdimot ma'lumotlari topilmadi yoki o'chirilgan bo'lishi mumkin.</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Orqaga qaytish</span>
        </button>
      </div>
    );
  }

  const currentSlide: PresentationSlide | undefined = presentation.slides[selectedSlideIdx];

  const handleUpdateSlide = (updated: Partial<PresentationSlide>) => {
    if (!currentSlide) return;
    const newSlides = [...presentation.slides];
    newSlides[selectedSlideIdx] = { ...currentSlide, ...updated };
    setPresentation({ ...presentation, slides: newSlides });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updatePresentation(presentation.id, {
        title: presentation.title,
        slides: presentation.slides,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPptx = async () => {
    setExportingPptx(true);
    try {
      await api.exportPptx(presentation.id, `${presentation.title}.pptx`);
    } catch (err: any) {
      alert(`PPTX export failed: ${err.message}`);
    } finally {
      setExportingPptx(false);
    }
  };

  const handleExportPdf = () => {
    const url = api.getPdfExportUrl(presentation.id);
    window.open(url, '_blank');
  };

  const handleRegenerate = async (action: string) => {
    if (!currentSlide || regenerating) return;
    setRegenerating(true);
    try {
      const res = await api.regenerateSlide(
        presentation.id,
        currentSlide.id,
        action,
        customRegenText
      );
      const newSlides = [...presentation.slides];
      newSlides[selectedSlideIdx] = res.slide;
      setPresentation({ ...presentation, slides: newSlides });
      setCustomRegenText('');
    } catch (err: any) {
      alert(`Regeneration failed: ${err.message}`);
    } finally {
      setRegenerating(false);
    }
  };

  const handleAddSlide = () => {
    const newSlide: PresentationSlide = {
      id: `sld_${Date.now()}`,
      order: presentation.slides.length + 1,
      title: 'New Slide Title',
      subtitle: 'Optional subtitle',
      layout: 'content',
      bulletPoints: ['First key insight', 'Second supporting argument', 'Conclusion point'],
      speakerNotes: 'Notes for the presenter regarding this new slide.',
    };
    const newSlides = [...presentation.slides, newSlide];
    setPresentation({ ...presentation, slides: newSlides });
    setSelectedSlideIdx(newSlides.length - 1);
  };

  const handleDeleteSlide = (idx: number) => {
    if (presentation.slides.length <= 1) {
      alert('A presentation must have at least one slide.');
      return;
    }
    const newSlides = presentation.slides.filter((_, i) => i !== idx);
    setPresentation({ ...presentation, slides: newSlides });
    setSelectedSlideIdx(Math.max(0, idx - 1));
  };

  const handleDuplicateSlide = (idx: number) => {
    const original = presentation.slides[idx];
    const duplicated: PresentationSlide = {
      ...original,
      id: `sld_${Date.now()}`,
      order: presentation.slides.length + 1,
      title: `${original.title} (Copy)`,
    };
    const newSlides = [...presentation.slides];
    newSlides.splice(idx + 1, 0, duplicated);
    setPresentation({ ...presentation, slides: newSlides });
    setSelectedSlideIdx(idx + 1);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {/* Top Action Toolbar */}
      <div className="min-h-14 border-b border-slate-800 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 bg-slate-950/90 backdrop-blur-md z-10 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors flex-shrink-0"
            title="Orqaga qaytish"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={presentation.title}
              onChange={e => setPresentation({ ...presentation, title: e.target.value })}
              className="w-full bg-transparent font-bold text-xs sm:text-sm text-white focus:outline-none focus:bg-slate-900 px-2 py-1 rounded-lg border border-transparent focus:border-slate-700 truncate"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden xs:inline">{savedSuccess ? 'Saqlandi' : 'Saqlash'}</span>
          </button>

          {/* Export PPTX */}
          <button
            onClick={handleExportPptx}
            disabled={exportingPptx}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
            title="PowerPoint (.pptx) formatida yuklab olish"
          >
            {exportingPptx ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>PPTX</span>
          </button>

          {/* Export PDF */}
          <button
            onClick={handleExportPdf}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="PDF formatda ochish va chop etish"
          >
            <FileDown className="w-3.5 h-3.5 text-sky-400" />
            <span>PDF</span>
          </button>

          {/* Present Slideshow */}
          <button
            onClick={() => onPresent(presentation, selectedSlideIdx)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            title="Namoyish (To'liq ekran)"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">Namoyish</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher (Visible only on mobile/tablet screens < lg) */}
      <div className="lg:hidden flex items-center border-b border-slate-800/80 bg-slate-950 px-2 py-1.5 gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => setActiveMobileTab('canvas')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeMobileTab === 'canvas'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          <span>🖼️ Slayd ({selectedSlideIdx + 1}/{presentation.slides.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab('slides')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeMobileTab === 'slides'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          <span>📋 Barcha slaydlar</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab('ai')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeMobileTab === 'ai'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>AI Tahrir</span>
        </button>
      </div>

      {/* Main 3-Column Studio Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Left Slide Thumbnails */}
        <div
          className={`w-full lg:w-64 border-r border-slate-800/80 bg-slate-950 flex flex-col flex-shrink-0 ${
            activeMobileTab === 'slides' ? 'flex flex-1' : 'hidden lg:flex'
          }`}
        >
          <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Slaydlar ({presentation.slides.length})
            </span>
            <button
              onClick={handleAddSlide}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Yangi slayd qo'shish"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Qo'shish</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar">
            {presentation.slides.map((s, idx) => (
              <div
                key={s.id || idx}
                onClick={() => {
                  setSelectedSlideIdx(idx);
                  // On mobile switch to canvas view when selecting a slide
                  setActiveMobileTab('canvas');
                }}
                className={`group relative p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedSlideIdx === idx
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-600/10'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-400">
                    #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDuplicateSlide(idx);
                      }}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      title="Nusxa olish"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteSlide(idx);
                      }}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs font-semibold text-white truncate">{s.title}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {s.layout} • {s.bulletPoints?.length || 0} ta band
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Center Slide Canvas */}
        <div
          className={`flex-1 bg-slate-900/40 p-3 sm:p-6 md:p-8 flex flex-col justify-between overflow-y-auto custom-scrollbar ${
            activeMobileTab === 'canvas' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="flex-1 flex items-center justify-center">
            {currentSlide && (
              <div
                className="w-full max-w-4xl min-h-0 md:min-h-[440px] md:aspect-[16/9] rounded-2xl p-4 sm:p-7 md:p-10 shadow-2xl flex flex-col justify-between transition-all relative overflow-y-auto custom-scrollbar my-auto"
                style={{
                  backgroundColor: currentSlide.themeCustomization?.backgroundColor || '#0b0f19',
                  color: currentSlide.themeCustomization?.textColor || '#f8fafc',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {/* Brand watermark - Only show branding for non-PRO */}
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold tracking-widest uppercase mb-3">
                  {!isPro ? (
                    <span className="truncate max-w-[220px] text-indigo-400 flex items-center gap-1.5">
                      <span>NEXORA AI • {presentation.topic}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">Reklama</span>
                    </span>
                  ) : (
                    <span className="truncate max-w-[220px] text-slate-400 font-medium">{presentation.topic}</span>
                  )}
                  <span className="flex-shrink-0 text-slate-400">Slayd {selectedSlideIdx + 1} / {presentation.slides.length}</span>
                </div>

                {/* Content Box */}
                <div className="my-auto space-y-4">
                  {/* Title & Subtitle */}
                  <div>
                    <input
                      type="text"
                      value={currentSlide.title}
                      onChange={e => handleUpdateSlide({ title: e.target.value })}
                      className="w-full bg-transparent font-extrabold text-lg sm:text-2xl md:text-3xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"
                    />
                    {currentSlide.subtitle && (
                      <input
                        type="text"
                        value={currentSlide.subtitle}
                        onChange={e => handleUpdateSlide({ subtitle: e.target.value })}
                        className="w-full bg-transparent text-xs sm:text-sm md:text-base text-slate-400 italic mt-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"
                      />
                    )}
                  </div>

                  {/* Academic Title Slide Info Card for Students */}
                  {(selectedSlideIdx === 0 || currentSlide.layout === 'title') && presentation.studentInfo && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 md:p-5 backdrop-blur-sm space-y-2 sm:space-y-3 shadow-inner">
                      <div className="text-center border-b border-white/10 pb-2">
                        <span className="text-[10px] sm:text-xs uppercase tracking-widest font-extrabold text-indigo-400">
                          {presentation.studentInfo.workType || 'Mustaqil ish'}
                        </span>
                        <div className="text-xs sm:text-sm font-semibold text-slate-200 mt-1">
                          {presentation.studentInfo.institution}
                        </div>
                        {presentation.studentInfo.fieldOfStudy && (
                          <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                            Yo'nalish: {presentation.studentInfo.fieldOfStudy}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs pt-1">
                        <div>
                          <div className="text-slate-400 text-[11px]">Bajardi (Talaba):</div>
                          <div className="font-bold text-white text-xs sm:text-sm">
                            {presentation.studentInfo.studentName || 'Talaba'}
                          </div>
                          <div className="text-indigo-400 font-medium text-[11px]">
                            Guruh: {presentation.studentInfo.group}
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <div className="text-slate-400 text-[11px]">Qabul qildi (O'qituvchi):</div>
                          <div className="font-bold text-white text-xs sm:text-sm">
                            {presentation.studentInfo.advisor || 'Ilmiy rahbar'}
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {presentation.studentInfo.cityAndYear || 'Toshkent - 2026'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Slide Content: Table Layout vs Standard Graphic/Bullets Layout */}
                  {(currentSlide.layout === 'table' || (currentSlide.table && currentSlide.table.headers && currentSlide.table.headers.length > 0)) && currentSlide.table ? (
                    <div className="space-y-4">
                      {/* Explanatory Lead Text */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1.5 focus-within:border-indigo-500/50 transition-colors">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-400">
                          <span>Jadval bo'yicha tushuntirish va xulosalar:</span>
                          <span className="text-[10px] text-slate-400">Tahrirlash mumkin</span>
                        </div>
                        <textarea
                          rows={2}
                          value={currentSlide.bodyText || ''}
                          onChange={e => handleUpdateSlide({ bodyText: e.target.value })}
                          placeholder="Jadval ma'lumotlari tahlili..."
                          className="w-full bg-transparent focus:outline-none rounded text-xs sm:text-sm text-slate-300 leading-relaxed resize-y placeholder-slate-500"
                        />
                      </div>

                      {/* Interactive Table View */}
                      <div className="overflow-x-auto rounded-xl border border-white/15 bg-white/5 shadow-lg">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-indigo-600 text-white text-xs sm:text-sm">
                              {currentSlide.table.headers.map((h, i) => (
                                <th key={i} className="py-2.5 px-3 sm:px-4 font-bold border-b border-white/20">
                                  <input
                                    type="text"
                                    value={h}
                                    onChange={e => {
                                      const newHeaders = [...currentSlide.table!.headers];
                                      newHeaders[i] = e.target.value;
                                      handleUpdateSlide({
                                        table: { ...currentSlide.table!, headers: newHeaders },
                                      });
                                    }}
                                    className="bg-transparent text-white font-bold w-full focus:outline-none focus:bg-indigo-700/50 rounded px-1"
                                  />
                                </th>
                              ))}
                              <th className="w-8 py-2.5 px-2 text-center text-indigo-200">#</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10 text-xs sm:text-sm text-slate-200">
                            {currentSlide.table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.06]'}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="py-2 px-3 sm:px-4">
                                    <input
                                      type="text"
                                      value={cell}
                                      onChange={e => {
                                        const newRows = currentSlide.table!.rows.map((r, ri) =>
                                          ri === rIdx
                                            ? r.map((c, ci) => (ci === cIdx ? e.target.value : c))
                                            : [...r]
                                        );
                                        handleUpdateSlide({
                                          table: { ...currentSlide.table!, rows: newRows },
                                        });
                                      }}
                                      className="bg-transparent text-slate-200 w-full focus:outline-none focus:bg-white/10 rounded px-1"
                                    />
                                  </td>
                                ))}
                                <td className="py-2 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newRows = currentSlide.table!.rows.filter((_, ri) => ri !== rIdx);
                                      handleUpdateSlide({
                                        table: { ...currentSlide.table!, rows: newRows },
                                      });
                                    }}
                                    className="text-slate-500 hover:text-rose-400 text-xs p-1"
                                    title="Qatorni o'chirish"
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <button
                          type="button"
                          onClick={() => {
                            const emptyRow = currentSlide.table!.headers.map(() => 'Yangi ko‘rsatkich');
                            handleUpdateSlide({
                              table: {
                                ...currentSlide.table!,
                                rows: [...currentSlide.table!.rows, emptyRow],
                              },
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-300 font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <span>+ Qator qo'shish</span>
                        </button>
                        <span className="text-[11px] text-slate-500 italic">Jadval slaydda to'liq formatda aks etadi</span>
                      </div>
                    </div>
                  ) : (
                    /* Body & Graphic / Chart Layout - Mobile-safe stacked, Desktop side-by-side */
                    <div className="flex flex-col md:grid md:grid-cols-12 gap-4 sm:gap-6 items-start">
                      {/* Content Section: Both Rich Body Text AND Structured Bullet Points */}
                      <div className={currentSlide.imageUrl || currentSlide.chart ? 'w-full md:col-span-7 space-y-4' : 'w-full md:col-span-12 space-y-4'}>
                        {/* Explanatory Body Text Overview */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1.5 focus-within:border-indigo-500/50 transition-colors">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-400">
                            <span>Batafsil ma'lumot va ilmiy tahlil:</span>
                            <span className="text-[10px] text-slate-400">Tahrirlash mumkin</span>
                          </div>
                          <textarea
                            rows={3}
                            value={currentSlide.bodyText || ''}
                            onChange={e => handleUpdateSlide({ bodyText: e.target.value })}
                            placeholder="Slayd bo'yicha batafsil tushuntirish va ilmiy matn..."
                            className="w-full bg-transparent focus:outline-none rounded text-xs sm:text-sm text-slate-300 leading-relaxed resize-y placeholder-slate-500"
                          />
                        </div>

                        {/* Structured Bullet Points */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                            <span>Asosiy faktlar va bandlar ({currentSlide.bulletPoints?.length || 0}):</span>
                            <button
                              type="button"
                              onClick={() => {
                                const points = currentSlide.bulletPoints || [];
                                handleUpdateSlide({ bulletPoints: [...points, 'Yangi ilmiy-amaliy fakt'] });
                              }}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                            >
                              + Band qo'shish
                            </button>
                          </div>

                          {currentSlide.bulletPoints && currentSlide.bulletPoints.length > 0 ? (
                            <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
                              {currentSlide.bulletPoints.map((bp, i) => (
                                <div key={i} className="flex items-start gap-2 group">
                                  <span className="text-indigo-400 mt-1 font-bold">•</span>
                                  <input
                                    type="text"
                                    value={bp}
                                    onChange={e => {
                                      const newPoints = [...currentSlide.bulletPoints];
                                      newPoints[i] = e.target.value;
                                      handleUpdateSlide({ bulletPoints: newPoints });
                                    }}
                                    className="w-full bg-transparent focus:outline-none focus:bg-white/5 rounded px-1.5 py-0.5 text-slate-200 border-b border-transparent focus:border-indigo-500/40 transition-colors"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newPoints = currentSlide.bulletPoints.filter((_, idx) => idx !== i);
                                      handleUpdateSlide({ bulletPoints: newPoints });
                                    }}
                                    title="O'chirish"
                                    className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-xs cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500 italic py-1">
                              Bandlar mavjud emas.{' '}
                              <button
                                type="button"
                                onClick={() => handleUpdateSlide({ bulletPoints: ['Asosiy tamoyil yoki amaliy natija'] })}
                                className="text-indigo-400 underline cursor-pointer"
                              >
                                Band qo'shish
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Visual Graphic or Chart */}
                      {(currentSlide.imageUrl || currentSlide.chart) && (
                        <div className="w-full md:col-span-5 flex flex-col items-center justify-center gap-2 mt-2 md:mt-0 flex-shrink-0">
                          {currentSlide.imageUrl && (
                            <div className="relative group w-full flex flex-col items-center">
                              <img
                                src={currentSlide.imageUrl}
                                alt="Slide Visual"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=960&q=80&auto=format&fit=crop';
                                }}
                                className="max-h-44 sm:max-h-52 md:max-h-60 rounded-xl shadow-lg border border-white/10 object-cover w-full"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newSeed = Math.floor(Math.random() * 99999);
                                  const newUrl = `/api/presentations/slide-image?q=${encodeURIComponent(currentSlide.title + ' ' + presentation.topic)}&seed=${newSeed}`;
                                  handleUpdateSlide({ imageUrl: newUrl });
                                }}
                                className="mt-2 text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                              >
                                <Sparkles className="w-3 h-3 text-indigo-400" />
                                <span>Rasmni yangilash (HD)</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer notes indicator */}
                <div className="pt-3 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] sm:text-xs text-slate-400">
                  <span>Layout: {currentSlide.layout}</span>
                  <span className="truncate max-w-[180px] sm:max-w-xs">{currentSlide.speakerNotes ? `Izoh: ${currentSlide.speakerNotes.slice(0, 35)}...` : 'Izohsiz'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Pagination controls with large touch targets for mobile */}
          <div className="mt-4 flex items-center justify-center gap-3 sm:gap-4 text-xs text-slate-400 py-1">
            <button
              onClick={() => setSelectedSlideIdx(Math.max(0, selectedSlideIdx - 1))}
              disabled={selectedSlideIdx === 0}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center gap-1 min-h-[40px] px-3 touch-manipulation cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Oldingi</span>
            </button>
            <span className="font-semibold text-slate-200">
              {selectedSlideIdx + 1} / {presentation.slides.length}
            </span>
            <button
              onClick={() => setSelectedSlideIdx(Math.min(presentation.slides.length - 1, selectedSlideIdx + 1))}
              disabled={selectedSlideIdx === presentation.slides.length - 1}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center gap-1 min-h-[40px] px-3 touch-manipulation cursor-pointer"
            >
              <span className="hidden sm:inline">Keyingi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Column 3: Right Inspector & AI Regeneration Actions */}
        <div
          className={`w-full lg:w-80 border-l border-slate-800/80 bg-slate-950 p-4 flex flex-col justify-between flex-shrink-0 overflow-y-auto custom-scrollbar ${
            activeMobileTab === 'ai' ? 'flex flex-1' : 'hidden lg:flex'
          }`}
        >
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Slide Refinement</span>
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Transform this specific slide instantly using NEXORA multi-model intelligence:
              </p>

              {/* 6 AI Quick Refine Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleRegenerate('improve')}
                  disabled={regenerating}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-700/50 text-slate-200 text-xs font-medium text-left transition-colors"
                >
                  <div className="font-semibold text-white">{t.presentation.improveSlide}</div>
                  <div className="text-[10px] text-slate-400">Polish tone & impact</div>
                </button>

                <button
                  onClick={() => handleRegenerate('rewrite')}
                  disabled={regenerating}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-700/50 text-slate-200 text-xs font-medium text-left transition-colors"
                >
                  <div className="font-semibold text-white">{t.presentation.rewriteSlide}</div>
                  <div className="text-[10px] text-slate-400">Fresh angle & style</div>
                </button>

                <button
                  onClick={() => handleRegenerate('simpler')}
                  disabled={regenerating}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-700/50 text-slate-200 text-xs font-medium text-left transition-colors"
                >
                  <div className="font-semibold text-white">{t.presentation.simplerSlide}</div>
                  <div className="text-[10px] text-slate-400">Concise, sharp bullets</div>
                </button>

                <button
                  onClick={() => handleRegenerate('professional')}
                  disabled={regenerating}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-700/50 text-slate-200 text-xs font-medium text-left transition-colors"
                >
                  <div className="font-semibold text-white">{t.presentation.professionalSlide}</div>
                  <div className="text-[10px] text-slate-400">Executive academic</div>
                </button>

                <button
                  onClick={() => handleRegenerate('more_details')}
                  disabled={regenerating}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-700/50 text-slate-200 text-xs font-medium text-left transition-colors"
                >
                  <div className="font-semibold text-white">{t.presentation.moreDetails}</div>
                  <div className="text-[10px] text-slate-400">In-depth explanations</div>
                </button>

                <button
                  onClick={() => handleRegenerate('better_visuals')}
                  disabled={regenerating}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-700/50 text-slate-200 text-xs font-medium text-left transition-colors"
                >
                  <div className="font-semibold text-white">{t.presentation.betterVisuals}</div>
                  <div className="text-[10px] text-slate-400">Regenerate artwork</div>
                </button>
              </div>
            </div>

            {/* Custom AI Instruction */}
            <div className="pt-3 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Custom AI Instruction
              </label>
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={customRegenText}
                  onChange={e => setCustomRegenText(e.target.value)}
                  placeholder="e.g. Add 2 concrete Uzbek market examples..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleRegenerate('custom')}
                  disabled={regenerating || !customRegenText.trim()}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  {regenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  <span>Apply Instruction</span>
                </button>
              </div>
            </div>

            {/* Speaker Notes Editor */}
            {currentSlide && (
              <div className="pt-3 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.presentation.speakerNotes}</span>
                </label>
                <textarea
                  rows={3}
                  value={currentSlide.speakerNotes || ''}
                  onChange={e => handleUpdateSlide({ speakerNotes: e.target.value })}
                  placeholder="Presenter talking points for this slide..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
