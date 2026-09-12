import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Presentation } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface PresentationPresenterProps {
  presentation: Presentation;
  initialSlideIdx?: number;
  onClose: () => void;
}

export const PresentationPresenter: React.FC<PresentationPresenterProps> = ({
  presentation,
  initialSlideIdx = 0,
  onClose,
}) => {
  const { user } = useAuth();
  const isPro = user?.plan === 'PRO' || user?.role === 'ADMIN';
  const [currentIdx, setCurrentIdx] = useState(initialSlideIdx);
  const [showNotes, setShowNotes] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const total = presentation.slides.length;
  const slide = presentation.slides[currentIdx];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        setCurrentIdx(prev => Math.min(total - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentIdx(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [total, onClose]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Minimum swipe threshold 45px
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        // Swiped Left -> Next Slide
        setCurrentIdx(prev => Math.min(total - 1, prev + 1));
      } else {
        // Swiped Right -> Prev Slide
        setCurrentIdx(prev => Math.max(0, prev - 1));
      }
    }
    setTouchStartX(null);
  };

  if (!slide) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none animate-in fade-in touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Floating Control Bar */}
      <div className="h-14 px-3 sm:px-6 flex items-center justify-between bg-black/80 backdrop-blur-md border-b border-white/10 z-20 flex-shrink-0">
        <div className="text-white text-xs font-semibold tracking-wider truncate max-w-[200px] sm:max-w-md">
          {!isPro ? (
            <>
              <span className="text-indigo-400 font-bold">NEXORA</span> • {presentation.title}
            </>
          ) : (
            <span>{presentation.title}</span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showNotes ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Spiker izohi</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Chiqish (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Display with Responsive Dimensions */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-6 md:p-10 relative overflow-y-auto custom-scrollbar">
        <div
          className="w-full max-w-5xl min-h-0 md:min-h-[460px] md:aspect-[16/9] rounded-2xl md:rounded-3xl p-4 sm:p-8 md:p-12 shadow-2xl flex flex-col justify-between border border-white/10 transition-all duration-300 relative overflow-y-auto custom-scrollbar my-auto"
          style={{
            backgroundColor: slide.themeCustomization?.backgroundColor || '#0b0f19',
            color: slide.themeCustomization?.textColor || '#f8fafc',
          }}
        >
          {/* Header watermark */}
          <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2 sm:mb-4">
            <span className="truncate max-w-[200px] sm:max-w-[320px]">
              {!isPro ? `NEXORA AI • ${presentation.topic}` : presentation.topic}
            </span>
            <span className="flex-shrink-0">Slayd {currentIdx + 1} / {total}</span>
          </div>

          {/* Slide Content */}
          <div className="my-auto space-y-3 sm:space-y-5">
            <div>
              <h1 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <h2 className="text-xs sm:text-sm md:text-xl text-slate-400 italic mt-1 sm:mt-2">
                  {slide.subtitle}
                </h2>
              )}
            </div>

            {/* Academic Student Title Details in Fullscreen Slideshow */}
            {(currentIdx === 0 || slide.layout === 'title') && presentation.studentInfo && (
              <div className="bg-white/5 border border-white/15 rounded-2xl md:rounded-3xl p-3 sm:p-5 md:p-7 backdrop-blur-md max-w-3xl mx-auto w-full space-y-2 sm:space-y-4 shadow-2xl">
                <div className="text-center border-b border-white/10 pb-2 sm:pb-3">
                  <span className="text-[10px] sm:text-xs uppercase tracking-widest font-extrabold text-indigo-400">
                    {presentation.studentInfo.workType || 'Mustaqil ish'}
                  </span>
                  <div className="text-xs sm:text-sm md:text-lg font-bold text-slate-100 mt-0.5">
                    {presentation.studentInfo.institution}
                  </div>
                  {presentation.studentInfo.fieldOfStudy && (
                    <div className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                      Yo'nalish: {presentation.studentInfo.fieldOfStudy}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs">
                  <div>
                    <div className="text-slate-400 text-[10px] sm:text-[11px]">Bajardi (Talaba):</div>
                    <div className="font-bold text-white text-xs sm:text-sm md:text-base">
                      {presentation.studentInfo.studentName || 'Talaba'}
                    </div>
                    <div className="text-indigo-400 font-semibold text-[11px] sm:text-xs">
                      Guruh: {presentation.studentInfo.group}
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-slate-400 text-[10px] sm:text-[11px]">Qabul qildi (O'qituvchi):</div>
                    <div className="font-bold text-white text-xs sm:text-sm md:text-base">
                      {presentation.studentInfo.advisor || 'Ilmiy rahbar'}
                    </div>
                    <div className="text-slate-400 text-[10px] sm:text-xs mt-0.5">
                      {presentation.studentInfo.cityAndYear || 'Toshkent - 2026'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Table Slide Layout */}
            {(slide.layout === 'table' || (slide.table && slide.table.headers && slide.table.headers.length > 0)) && slide.table ? (
              <div className="space-y-4 my-auto">
                {slide.bodyText && (
                  <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                    {slide.bodyText}
                  </p>
                )}
                <div className="overflow-x-auto rounded-xl border border-white/15 bg-white/5 shadow-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-indigo-600 text-white text-xs sm:text-sm md:text-base">
                        {slide.table.headers.map((h, i) => (
                          <th key={i} className="py-2.5 sm:py-3.5 px-3 sm:px-5 font-bold border-b border-white/20">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-xs sm:text-sm md:text-base text-slate-200">
                      {slide.table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.06]'}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-2.5 sm:py-3 px-3 sm:px-5">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Standard Body Text & Graphic Layout - Mobile-safe stacked, Desktop side-by-side */
              <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-8 items-start">
                <div className={slide.imageUrl ? 'w-full md:col-span-7 space-y-3 sm:space-y-4' : 'w-full md:col-span-12 space-y-3 sm:space-y-4'}>
                  {/* Explanatory Paragraph Overview */}
                  {slide.bodyText && (
                    <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
                      {slide.bodyText}
                    </p>
                  )}

                  {/* Structured Detailed Points */}
                  {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                    <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm md:text-base leading-relaxed">
                      {slide.bulletPoints.map((bp, i) => (
                        <li key={i} className="flex items-start gap-2 sm:gap-3 text-slate-300">
                          <span className="text-indigo-400 font-bold mt-0.5">•</span>
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {slide.imageUrl && (
                  <div className="w-full md:col-span-5 flex items-center justify-center mt-2 md:mt-0 flex-shrink-0">
                    <img
                      src={slide.imageUrl}
                      alt="Slide Graphic"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=960&q=80&auto=format&fit=crop';
                      }}
                      className="max-h-48 sm:max-h-56 md:max-h-72 rounded-xl sm:rounded-2xl shadow-xl border border-white/15 object-cover w-full"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer watermark - Only shown for non-PRO */}
          <div className="text-[10px] sm:text-xs text-slate-500 flex justify-between border-t border-white/10 pt-2 sm:pt-3 mt-3 sm:mt-4">
            {!isPro ? (
              <span className="flex items-center gap-1 font-semibold text-indigo-400">
                <span>NEXORA AI Studio</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">Reklama</span>
              </span>
            ) : (
              <span className="text-slate-500 font-normal">{presentation.topic}</span>
            )}
            <span>{presentation.language || "O'zbekcha"}</span>
          </div>
        </div>

        {/* Floating Slide Navigation Arrows (Desktop / Tablet) */}
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white disabled:opacity-20 border border-white/10 transition-colors cursor-pointer"
          title="Oldingi slayd"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentIdx(Math.min(total - 1, currentIdx + 1))}
          disabled={currentIdx === total - 1}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white disabled:opacity-20 border border-white/10 transition-colors cursor-pointer"
          title="Keyingi slayd"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Speaker Notes Overlay Drawer */}
      {showNotes && (
        <div className="bg-slate-900/95 border-t border-slate-800 p-4 max-h-48 overflow-y-auto text-xs text-slate-300 z-20">
          <div className="max-w-4xl mx-auto">
            <div className="font-bold text-white mb-1 uppercase tracking-wider text-[11px] text-indigo-400">
              Spiker izohi (Slayd {currentIdx + 1}):
            </div>
            <p className="leading-relaxed">
              {slide.speakerNotes || "Ushbu slayd uchun maxsus izoh yo'q."}
            </p>
          </div>
        </div>
      )}

      {/* Mobile Floating Bottom Controls Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 bg-black/90 border-t border-white/10 z-20">
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="p-2 rounded-xl bg-white/10 text-white disabled:opacity-20 flex items-center gap-1 text-xs active:bg-white/20 touch-manipulation"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Oldingi</span>
        </button>
        <div className="text-xs text-slate-300 font-semibold">
          {currentIdx + 1} / {total}
        </div>
        <button
          onClick={() => setCurrentIdx(Math.min(total - 1, currentIdx + 1))}
          disabled={currentIdx === total - 1}
          className="p-2 rounded-xl bg-indigo-600 text-white disabled:opacity-20 flex items-center gap-1 text-xs active:bg-indigo-500 touch-manipulation"
        >
          <span>Keyingi</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Progress Bar */}
      <div className="w-full bg-white/10 h-1 flex-shrink-0">
        <div
          className="bg-indigo-500 h-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
};
