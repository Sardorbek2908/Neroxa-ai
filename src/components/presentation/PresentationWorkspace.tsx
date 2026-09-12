import React, { useState, useEffect } from 'react';
import {
  Presentation as PresentationIcon,
  Sparkles,
  Plus,
  FileText,
  Trash2,
  ExternalLink,
  Upload,
  Layers,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Building2,
  CheckCircle2,
  Play,
  Edit3,
} from 'lucide-react';
import { api } from '../../services/api';
import { Presentation } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { StudioSectionConfig } from '../../types';

interface PresentationWorkspaceProps {
  onOpenEditor: (presentationId: string) => void;
  onPresent?: (presentation: Presentation) => void;
  presetTopic?: string;
  config?: StudioSectionConfig;
}

const TOP_UNIVERSITIES = [
  { short: 'TATU', full: 'TATU - Muhammad al-Xorazmiy nomidagi Toshkent Axborot Texnologiyalari Universiteti' },
  { short: "O'zMU", full: "O'zMU - Mirzo Ulug'bek nomidagi O'zbekiston Milliy Universiteti" },
  { short: 'TDIU', full: 'TDIU - Toshkent Davlat Iqtisodiyot Universiteti' },
  { short: 'SamDU', full: 'SamDU - Samarqand Davlat Universiteti' },
  { short: 'TDTU', full: 'TDTU - Islom Karimov nomidagi Toshkent Davlat Texnika Universiteti' },
  { short: 'FarDU', full: "FarDU - Farg'ona Davlat Universiteti" },
  { short: 'ToshDavYUU', full: 'ToshDavYUU - Toshkent Davlat Yuridik Universiteti' },
  { short: 'TMA', full: 'TMA - Toshkent Tibbiyot Akademiyasi' },
  { short: "O'zDJTU", full: "O'zDJTU - O'zbekiston Davlat Jahon Tillari Universiteti" },
];

const WORK_TYPES = [
  'Mustaqil ish',
  'Kurs ishi taqdimoti',
  'Prezentatsiya / Maqola',
  'BMI (Bitiruv ishi)',
  'Referat taqdimoti',
];

const POPULAR_TOPICS = [
  "Sun'iy intellekt va kiberxavfsizlik asoslari",
  "Raqamli iqtisodiyot va IT sohasining rivoji",
  "Biotexnologiya va zamonaviy genetika yutuqlari",
  "Bulutli texnologiyalar va dasturiy injiniring",
  "O'zbekistonning investitsion jozibadorligi",
  "Yashil energetika va ekologik muammolar yechimi",
];

export const PresentationWorkspace: React.FC<PresentationWorkspaceProps> = ({
  onOpenEditor,
  onPresent,
  presetTopic,
  config,
}) => {
  const { t, language } = useLanguage();

  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState<string>('');

  // Student mode toggle
  const [isStudentMode, setIsStudentMode] = useState(true);

  // Student specific metadata
  const [institution, setInstitution] = useState('TATU - Muhammad al-Xorazmiy nomidagi Toshkent Axborot Texnologiyalari Universiteti');
  const [fieldOfStudy, setFieldOfStudy] = useState("Dasturiy injiniring va sun'iy intellekt");
  const [group, setGroup] = useState('412-22 guruh');
  const [studentName, setStudentName] = useState('Sardorbek Mahmudov');
  const [advisor, setAdvisor] = useState("dots. Karimov Sh.A.");
  const [workType, setWorkType] = useState('Mustaqil ish');
  const [cityAndYear, setCityAndYear] = useState('Toshkent - 2026');

  // Creation form state
  const [topic, setTopic] = useState(presetTopic || '');
  const [slideCount, setSlideCount] = useState(10);
  const [presentationLang, setPresentationLang] = useState("O'zbek tili");
  const [audience, setAudience] = useState('Universitet kafedrasi va talabalar');
  const [style, setStyle] = useState('Academic & University');
  const [theme, setTheme] = useState('Dark Modern');
  const [includeImages, setIncludeImages] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSpeakerNotes, setIncludeSpeakerNotes] = useState(true);

  // Document upload for file-to-presentation
  const [uploadedDoc, setUploadedDoc] = useState<File | null>(null);

  useEffect(() => {
    loadPresentations();
  }, []);

  const loadPresentations = async () => {
    setLoading(false);
    try {
      const res = await api.getPresentations();
      setPresentations(res.presentations);
    } catch (err) {
      console.error('Failed to load presentations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || generating) return;

    setGenerationError(null);
    setGenerating(true);
    setGenerationStep("Slaydlar strukturasi va reja tayyorlanmoqda...");

    try {
      let sourceContent: string | undefined;

      // If document attached, upload first
      if (uploadedDoc) {
        setGenerationStep("Hujjat yuklanmoqda va tahlil qilinmoqda...");
        const fileRes = await api.uploadFile(uploadedDoc);
        const analysisRes = await api.analyzeFile(fileRes.file.id);
        sourceContent = analysisRes.analysis;
      }

      setGenerationStep("AI professional slaydlar va ma'lumotlarni yaratmoqda...");
      const res = await api.generatePresentation({
        topic: topic.trim(),
        slideCount,
        language: presentationLang,
        audience: isStudentMode ? 'Universitet kafedrasi, talabalar va o‘qituvchilar' : audience,
        style: isStudentMode ? 'Academic & University' : style,
        theme,
        includeImages,
        includeCharts,
        includeSpeakerNotes,
        sourceContent,
        studentInfo: isStudentMode ? {
          institution: institution.trim() || "Oliy Ta'lim Muassasasi",
          fieldOfStudy: fieldOfStudy.trim() || "Axborot texnologiyalari",
          group: group.trim() || "401-guruh",
          studentName: studentName.trim() || "Sardorbek Mahmudov",
          advisor: advisor.trim() || "Ilmiy rahbar",
          workType: workType || 'Mustaqil ish',
          cityAndYear: cityAndYear.trim() || 'Toshkent - 2026',
        } : undefined,
      });

      setPresentations(prev => [res.presentation, ...prev]);
      onOpenEditor(res.presentation.id);
    } catch (err: any) {
      console.error('Presentation generation error:', err);
      setGenerationError(err.message || "Taqdimot yaratishda xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setGenerating(false);
      setGenerationStep('');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await api.deletePresentation(id);
      setPresentations(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setGenerationError(`O'chirishda xatolik: ${err.message}`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto custom-scrollbar space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <PresentationIcon className="w-6 h-6 text-indigo-400" />
          <span>{config?.name || t.presentation.title}</span>
          {config?.badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {config.badge}
            </span>
          )}
        </h1>
        <p className="text-xs text-slate-400 mt-1">{config?.description || t.presentation.subtitle}</p>
      </div>

      {/* Generation Form Box */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleGenerate} className="space-y-6 relative z-10">
          {/* Mode Selector */}
          <div className="flex flex-wrap items-center gap-3 p-1.5 bg-slate-950/80 border border-slate-800/90 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => {
                setIsStudentMode(true);
                setStyle('Academic & University');
                setPresentationLang("O'zbek tili");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isStudentMode
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>🎓 Talabalar rejimi (Universitet / Mustaqil ish)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsStudentMode(false)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                !isStudentMode
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Umumiy / Biznes rejimi</span>
            </button>
          </div>

          {/* Student Mode Specific Details */}
          {isStudentMode && (
            <div className="bg-slate-950/70 border border-indigo-900/40 rounded-2xl p-4 md:p-6 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  OTM va Talaba Ma'lumotlari (1-slayd uchun rasmiy rekvizitlar)
                </span>
                <span className="text-[11px] text-slate-400">O'zbekiston OTM standartlariga mos</span>
              </div>

              {/* Quick University chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Tezkor universitet tanlash:</label>
                <div className="flex flex-wrap gap-1.5">
                  {TOP_UNIVERSITIES.map(u => (
                    <button
                      key={u.short}
                      type="button"
                      onClick={() => setInstitution(u.full)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        institution === u.full
                          ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {u.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Type selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Ish turi (Topshiriq shakli):</label>
                <div className="flex flex-wrap gap-2">
                  {WORK_TYPES.map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWorkType(w)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        workType === w
                          ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">OTM / Universitet nomi</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={e => setInstitution(e.target.value)}
                    placeholder="Masalan: TATU yoki O'zMU"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Fakultet va Yo'nalish</label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={e => setFieldOfStudy(e.target.value)}
                    placeholder="Masalan: Dasturiy injiniring"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Guruh raqami</label>
                  <input
                    type="text"
                    value={group}
                    onChange={e => setGroup(e.target.value)}
                    placeholder="Masalan: 412-22 guruh"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Talaba F.I.O (Bajardi)</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    placeholder="Masalan: Sardorbek Mahmudov"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">O'qituvchi / Ilmiy rahbar (Qabul qildi)</label>
                  <input
                    type="text"
                    value={advisor}
                    onChange={e => setAdvisor(e.target.value)}
                    placeholder="Masalan: dots. Karimov Sh.A."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Shahar va Yil</label>
                  <input
                    type="text"
                    value={cityAndYear}
                    onChange={e => setCityAndYear(e.target.value)}
                    placeholder="Toshkent - 2026"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                {isStudentMode ? "Taqdimot mavzusi (Mavzu sarlavhasi)" : "Presentation Topic or Lecture Title"}
              </label>
              <span className="text-[11px] text-indigo-400 font-semibold">Tezkor mavzular mavjud</span>
            </div>

            <input
              type="text"
              required
              value={topic}
              onChange={e => {
                setTopic(e.target.value);
                if (generationError) setGenerationError(null);
              }}
              placeholder={isStudentMode ? "Masalan: Kiberxavfsizlik asoslari va ma'lumotlar shifrlash usullari" : t.presentation.topicPlaceholder}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            />

            {/* Quick 1-tap topic suggestions */}
            <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-slate-500 mr-1">Tavsiya:</span>
              {POPULAR_TOPICS.map((pt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTopic(pt);
                    if (generationError) setGenerationError(null);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    topic === pt
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {pt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Slide Count */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t.presentation.slideCount}: <span className="text-indigo-400 font-bold">{slideCount}</span>
              </label>
              <input
                type="range"
                min={4}
                max={18}
                value={slideCount}
                onChange={e => setSlideCount(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t.presentation.language}
              </label>
              <select
                value={presentationLang}
                onChange={e => setPresentationLang(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="O'zbek tili">O'zbek tili (Lotin)</option>
                <option value="English">English</option>
                <option value="Русский">Русский язык</option>
                <option value="Türkçe">Türkçe</option>
                <option value="Қазақша">Қазақ тілі</option>
                <option value="العربية">العربية</option>
              </select>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t.presentation.theme}
              </label>
              <select
                value={theme}
                onChange={e => setTheme(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Dark Modern">Dark Modern (Slate & Indigo)</option>
                <option value="Midnight Cyber">Midnight Cyber (Sky Blue)</option>
                <option value="Emerald Clean">Emerald Clean (Bio Green)</option>
                <option value="Obsidian Gold">Obsidian Gold (Luxury Gold)</option>
                <option value="Azure Tech">Azure Tech (Deep Blue)</option>
                <option value="Light Corporate">Light Corporate (Clean White)</option>
              </select>
            </div>

            {/* Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t.presentation.style}
              </label>
              <select
                value={style}
                onChange={e => setStyle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Academic & University">Academic & Formal</option>
                <option value="Modern & Cinematic">Modern & Cinematic</option>
                <option value="Executive Business">Executive Business</option>
                <option value="Minimal Clean">Minimal Clean</option>
                <option value="Tech Keynote">Tech Keynote</option>
              </select>
            </div>
          </div>

          {/* Feature Toggles & Document Upload */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeImages}
                  onChange={e => setIncludeImages(e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                <span>Mavzuga oid rasmlar</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={e => setIncludeCharts(e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                <span>Diagramma va grafiklar</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeSpeakerNotes}
                  onChange={e => setIncludeSpeakerNotes(e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                <span>Spiker izohlari (Matn)</span>
              </label>
            </div>

            {/* Optional Source Document */}
            <div>
              <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>{uploadedDoc ? uploadedDoc.name : 'Fayl yuklash (PDF/Word)'}</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={e => setUploadedDoc(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={generating || !topic.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{isStudentMode ? "Universitet taqdimoti va REJA shakllantirilmoqda..." : t.presentation.generatingBtn}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isStudentMode ? "🎓 OTM uchun taqdimot yaratish (PPTX / Reja / Slaydlar)" : t.presentation.generateBtn}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Presentations List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Mening taqdimotlarim ({presentations.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {presentations.map(pres => (
            <div
              key={pres.id}
              onClick={() => onOpenEditor(pres.id)}
              className="group p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer flex flex-col justify-between transition-all duration-200 shadow-lg shadow-black/20"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-900">
                    {pres.slides.length} Slayd
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(pres.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {pres.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {pres.description || pres.topic}
                </p>
                {pres.studentInfo && (
                  <div className="mt-2 text-[11px] text-indigo-400/90 font-medium bg-indigo-950/40 border border-indigo-800/40 rounded-lg px-2 py-1">
                    🎓 {pres.studentInfo.institution || 'OTM'} • {pres.studentInfo.group || 'Guruh'}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 text-[11px] truncate max-w-[130px]">{pres.language} • {pres.theme}</span>
                <div className="flex items-center gap-1.5 ml-auto">
                  {onPresent && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onPresent(pres);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold flex items-center gap-1 transition-colors active:scale-95 cursor-pointer text-[11px]"
                      title="Namoyish qilish"
                    >
                      <Play className="w-3 h-3 fill-emerald-300" />
                      <span>Namoyish</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onOpenEditor(pres.id);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold flex items-center gap-1 transition-colors active:scale-95 cursor-pointer text-[11px]"
                    title="Tahrirlash va ko'rish"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Tahrirlash</span>
                  </button>
                  <button
                    type="button"
                    onClick={e => handleDelete(pres.id, e)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Taqdimotni o'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {presentations.length === 0 && !loading && (
            <div className="col-span-full text-center py-12 text-slate-500 text-xs">
              Hozircha taqdimotlar mavjud emas. Yuqoridagi shakldan foydalanib yangi taqdimot yarating!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
