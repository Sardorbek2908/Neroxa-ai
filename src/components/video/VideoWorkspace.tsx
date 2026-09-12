import React, { useState, useEffect } from 'react';
import {
  Video,
  Sparkles,
  Play,
  Download,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Film,
} from 'lucide-react';
import { api } from '../../services/api';
import { GenerationJob } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { StudioSectionConfig } from '../../types';

interface VideoWorkspaceProps {
  config?: StudioSectionConfig;
}

export const VideoWorkspace: React.FC<VideoWorkspaceProps> = ({ config }) => {
  const { t } = useLanguage();

  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [duration, setDuration] = useState(5);
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [model, setModel] = useState('veo-3.1-lite-generate-preview');

  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Poll active background job
  useEffect(() => {
    if (!activeJob || activeJob.status === 'completed' || activeJob.status === 'failed') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await api.getJob(activeJob.id);
        setActiveJob(res.job);
        if (res.job.status === 'completed' && res.job.result?.videoUrl) {
          setVideoUrl(res.job.result.videoUrl);
        }
      } catch (err) {
        console.error('Job polling error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeJob]);

  const handleStartJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setVideoUrl(null);

    try {
      const res = await api.generateVideo({
        prompt,
        aspectRatio,
        duration,
        resolution,
        model,
      });
      setActiveJob(res.job);
    } catch (err: any) {
      alert(`Failed to start video generation: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto custom-scrollbar space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Film className="w-6 h-6 text-purple-400" />
          <span>{config?.name || t.video.title}</span>
          {config?.badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {config.badge}
            </span>
          )}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {config?.description || 'High fidelity cinematic video synthesis powered by Veo & Gemini Video operations.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-5">
          <form onSubmit={handleStartJob} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Motion & Scene Description
              </label>
              <textarea
                rows={4}
                required
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={t.video.promptPlaceholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  { label: '🎬 Kinematik 35mm', tag: 'cinematic 35mm anamorphic film shot, real-world lighting, photorealistic, 8k resolution' },
                  { label: '🏎️ Giperrealizm', tag: 'hyperrealistic authentic photography, natural sunlight, physical textures, sharp focus' },
                  { label: '🚁 Dron Koʻrinishi', tag: 'aerial cinematic 4k drone push-in, stunning depth of field, real footage' },
                  { label: '🏙️ Tungi Neon', tag: 'night city cinematic reflections, 35mm lens, photorealism, award winning film still' },
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setPrompt(prev => prev.trim() ? `${prev}, ${p.tag}` : p.tag);
                    }}
                    className="text-[10px] px-2 py-1 rounded-md bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-white/5 transition-all"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Model & Aspect Ratio */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Model</label>
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="veo-3.1-lite-generate-preview">Veo 3.1 Lite (Fast)</option>
                  <option value="veo-3.1-generate-preview">Veo 3.1 Pro (Cinematic)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.video.aspectRatio}
                </label>
                <select
                  value={aspectRatio}
                  onChange={e => setAspectRatio(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Vertical)</option>
                </select>
              </div>
            </div>

            {/* Duration & Resolution */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.video.duration}
                </label>
                <select
                  value={duration}
                  onChange={e => setDuration(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={5}>5 Seconds</option>
                  <option value={10}>10 Seconds</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.video.resolution}
                </label>
                <select
                  value={resolution}
                  onChange={e => setResolution(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="720p">720p HD</option>
                  <option value="1080p">1080p Full HD</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !prompt.trim() || (activeJob && (activeJob.status === 'processing' || activeJob.status === 'queued'))}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.video.generate}</span>
            </button>
          </form>

          {/* Active Job Tracker */}
          {activeJob && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Async Job Tracker</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    activeJob.status === 'completed'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : activeJob.status === 'failed'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                  }`}
                >
                  {activeJob.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500"
                  style={{ width: `${activeJob.progress}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Progress: {activeJob.progress}%</span>
                <span>ID: {activeJob.id.slice(0, 12)}...</span>
              </div>

              {activeJob.error && (
                <div className="text-xs text-rose-400 flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{activeJob.error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[440px]">
          <div className="flex-1 flex items-center justify-center">
            {videoUrl ? (
              <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-auto max-h-[440px]"
                />
              </div>
            ) : activeJob && (activeJob.status === 'processing' || activeJob.status === 'queued') ? (
              <div className="text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center mx-auto animate-pulse">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <div>
                  <div className="text-base font-bold text-white">Synthesizing Video Frames</div>
                  <div className="text-xs text-slate-400 max-w-sm mt-1">
                    Veo motion operation is running. Progress: {activeJob.progress}%. Please wait...
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
                  <Video className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-300">No Video Rendered Yet</div>
                <div className="text-xs text-slate-500 max-w-sm">
                  Configure prompt, duration, and resolution on the left to render cinematic motion.
                </div>
              </div>
            )}
          </div>

          {videoUrl && (
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Resolution: {resolution} • Format: {aspectRatio}
              </div>
              <a
                href={videoUrl}
                download="nexora-cinematic-video.mp4"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Video</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
