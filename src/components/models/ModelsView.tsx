import React, { useState, useEffect } from 'react';
import { Cpu, Sparkles, CheckCircle, Zap, Shield, Layers } from 'lucide-react';
import { api } from '../../services/api';
import { AIModelConfig } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const ModelsView: React.FC = () => {
  const { t } = useLanguage();
  const [models, setModels] = useState<AIModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    api.getModels().then(res => {
      setModels(res.models);
    }).catch(err => console.error(err)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? models : models.filter(m => m.type === filter);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto custom-scrollbar space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-indigo-400" />
            <span>AI Model Hub & Registry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise multi-model architecture. Select high-speed, deep-reasoning, or creative generative engines.
          </p>
        </div>

        <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto">
          {['all', 'multimodal', 'image', 'video'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filter === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(model => (
          <div
            key={model.id}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 flex flex-col justify-between transition-colors shadow-lg shadow-black/20"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-900 uppercase">
                  {model.type}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Active</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{model.name}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{model.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Provider:</span>
                  <span className="font-semibold">{model.provider}</span>
                </div>
                {model.limits?.maxTokens && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max Tokens:</span>
                    <span className="font-semibold">{model.limits.maxTokens.toLocaleString()} tokens</span>
                  </div>
                )}
                {model.limits?.rateLimitPerMin && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rate Limit:</span>
                    <span className="font-semibold">{model.limits.rateLimitPerMin} req/min</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
              {model.capabilities.map((cap, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-medium"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
