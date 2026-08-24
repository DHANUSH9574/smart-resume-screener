import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';

export function ApiKeyModal({ isOpen, onClose, onKeySaved }) {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existing = localStorage.getItem('smartresume_gemini_key') || '';
      setApiKey(existing);
      setIsSaved(Boolean(existing));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('smartresume_gemini_key', apiKey.trim());
      setIsSaved(true);
    } else {
      localStorage.removeItem('smartresume_gemini_key');
      setIsSaved(false);
    }
    if (onKeySaved) onKeySaved();
    setTimeout(() => onClose(), 400);
  };

  const handleClear = () => {
    localStorage.removeItem('smartresume_gemini_key');
    setApiKey('');
    setIsSaved(false);
    if (onKeySaved) onKeySaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Key className="w-4 h-4" />
            </div>
            <h2 className="font-display font-semibold text-base text-white">
              AI Engine & API Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Google Gemini API Key (Optional)
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder:font-sans focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Power deep candidate analysis with <strong className="text-slate-200">Gemini 2.5 Flash</strong>. Get a free API key at{' '}
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 hover:underline inline-flex items-center gap-0.5"
              >
                Google AI Studio <ExternalLink className="w-2.5 h-2.5" />
              </a>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
              <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Smart Hybrid Mode</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              If an API key is not provided, the screener seamlessly operates using its built-in NLP semantic heuristic engine, ensuring 100% offline resilience and instant evaluation!
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            {isSaved ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-rose-400 hover:text-rose-300 transition"
              >
                Clear Saved Key
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-md shadow-brand-500/20 transition"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
