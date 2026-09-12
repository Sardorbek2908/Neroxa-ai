import React, { useState, useEffect } from 'react';
import {
  FolderHeart,
  Image as ImageIcon,
  Video,
  Presentation as PresentationIcon,
  Download,
  Trash2,
  ExternalLink,
  Eye,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { Generation } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const CreationsGallery: React.FC = () => {
  const { t } = useLanguage();

  const [creations, setCreations] = useState<Generation[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState<Generation | null>(null);

  useEffect(() => {
    loadCreations();
  }, [filter]);

  const loadCreations = async () => {
    setLoading(true);
    try {
      const type = filter === 'all' ? undefined : filter;
      const res = await api.getCreations(type);
      setCreations(res.creations);
    } catch (err) {
      console.error('Failed to load creations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this creation?')) return;

    try {
      await api.deleteCreation(id);
      setCreations(prev => prev.filter(c => c.id !== id));
      if (previewItem?.id === id) setPreviewItem(null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'image':
      case 'edited_image':
        return <ImageIcon className="w-4 h-4 text-sky-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-purple-400" />;
      case 'presentation':
        return <PresentationIcon className="w-4 h-4 text-indigo-400" />;
      default:
        return <FolderHeart className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto custom-scrollbar space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderHeart className="w-6 h-6 text-indigo-400" />
            <span>{t.creations.title}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            All your generated images, videos, presentations, and AI deliverables stored securely.
          </p>
        </div>

        <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto">
          {[
            { id: 'all', label: t.creations.all },
            { id: 'image', label: t.creations.images },
            { id: 'video', label: t.creations.videos },
            { id: 'presentation', label: t.creations.presentations },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {creations.map(item => (
          <div
            key={item.id}
            onClick={() => setPreviewItem(item)}
            className="group rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-200 shadow-lg shadow-black/20"
          >
            {/* Visual Preview */}
            <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
              {item.type === 'video' ? (
                <video
                  src={item.outputUrl}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
              ) : item.outputUrl.startsWith('data:image') || item.outputUrl.startsWith('http') ? (
                <img
                  src={item.outputUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <PresentationIcon className="w-8 h-8 text-indigo-400" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Presentation Deck</span>
                </div>
              )}

              {/* Type Badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] font-bold text-white uppercase flex items-center gap-1">
                {getIcon(item.type)}
                <span>{item.type}</span>
              </div>
            </div>

            {/* Meta */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-white text-xs truncate group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {item.prompt}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={e => handleDelete(item.id, e)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {creations.length === 0 && !loading && (
          <div className="col-span-full text-center py-16 text-slate-500 text-xs">
            {t.creations.empty}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base truncate max-w-lg">
                  {previewItem.title}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Type: {previewItem.type} • Model: {previewItem.model}
                </div>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Content */}
            <div className="max-h-[60vh] flex items-center justify-center bg-slate-950 rounded-2xl overflow-hidden mb-4 border border-slate-800">
              {previewItem.type === 'video' ? (
                <video
                  src={previewItem.outputUrl}
                  controls
                  autoPlay
                  className="max-h-[60vh] w-auto"
                />
              ) : (
                <img
                  src={previewItem.outputUrl}
                  alt={previewItem.title}
                  className="max-h-[60vh] object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 italic truncate max-w-lg">
                Prompt: "{previewItem.prompt}"
              </span>
              <a
                href={previewItem.outputUrl}
                download={`${previewItem.title}.png`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Media</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
