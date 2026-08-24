import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  MessageSquare, 
  Bot, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp,
  X,
  Target,
  Search,
  HelpCircle
} from 'lucide-react';
import { api } from '../utils/api';

const QUICK_PROMPTS = [
  {
    label: '🎯 1–10 Fit Rating & Justification',
    prompt: 'Compare the candidate resumes with this job description and rate each candidate fit on 1–10 with clear justification.'
  },
  {
    label: '🏆 Who is the #1 Candidate?',
    prompt: 'Analyze all evaluated candidates for this job and explain who the #1 top candidate is and why.'
  },
  {
    label: '⚠️ Identify Key Candidate Gaps',
    prompt: 'Identify the top 3 critical skill or experience gaps across the current candidate pool for this role.'
  },
  {
    label: '❓ Generate Interview Questions',
    prompt: 'Generate 4 challenging, role-specific technical interview questions to ask the highest scoring candidate.'
  },
  {
    label: '✉️ Draft Shortlist Email',
    prompt: 'Draft a polite and professional candidate interview invitation email for the top shortlisted applicant.'
  }
];

export function AiPromptCopilot({ activeJob, candidates = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeQuery, setActiveQuery] = useState('');

  const handleRunPrompt = async (customText) => {
    const textToRun = (typeof customText === 'string' ? customText : prompt).trim();
    if (!textToRun) return;

    setLoading(true);
    setActiveQuery(textToRun);
    setResponse('');
    if (!isOpen) setIsOpen(true);

    try {
      const res = await api.promptQuery({
        prompt: textToRun,
        jobId: activeJob?.id || null,
        candidateIds: candidates.map(c => c.id)
      });

      if (res.success) {
        setResponse(res.response);
      } else {
        setResponse(`Error: ${res.error || 'Failed to generate response'}`);
      }
    } catch (err) {
      setResponse(`Request error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card mb-6 rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-950/40 via-slate-900/60 to-indigo-950/40 p-4 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-sm sm:text-base text-white">
                Interactive AI Copilot & Custom Prompt Search
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Gemini LLM
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ask natural language questions or run custom screening prompts against your candidate pool
            </p>
          </div>
        </div>

        {response && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="self-start sm:self-center text-xs text-brand-300 hover:text-white flex items-center gap-1 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isOpen ? 'Collapse Response' : 'View Response'}</span>
          </button>
        )}
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <Target className="w-3 h-3 text-brand-400" /> Example Prompts:
        </span>
        {QUICK_PROMPTS.map((qp, i) => (
          <button
            key={i}
            onClick={() => {
              setPrompt(qp.prompt);
              handleRunPrompt(qp.prompt);
            }}
            disabled={loading}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/90 hover:bg-brand-600/30 hover:border-brand-500/50 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center gap-1 disabled:opacity-50"
          >
            <span>{qp.label}</span>
          </button>
        ))}
      </div>

      {/* Input Search / Prompt Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRunPrompt();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Bot className="w-4 h-4 text-brand-400" />
          </div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g., "Compare the following resume with this job description and rate fit on 1–10 with justification."'
            disabled={loading}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/90 focus:border-brand-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition shadow-inner"
          />
          {prompt && (
            <button
              type="button"
              onClick={() => setPrompt('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-brand-500/20 transition flex items-center gap-1.5 disabled:opacity-50 shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Ask AI</span>
            </>
          )}
        </button>
      </form>

      {/* Collapsible Response Box */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-brand-300">Prompt:</span>
              <span className="text-xs text-slate-300 italic truncate max-w-lg">
                "{activeQuery}"
              </span>
            </div>
            {response && (
              <button
                onClick={handleCopy}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 transition"
                title="Copy AI output"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto font-sans">
            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
                <p className="text-xs">Gemini AI is analyzing candidates and formatting response...</p>
              </div>
            ) : (
              response || 'No response generated.'
            )}
          </div>
        </div>
      )}
    </div>
  );
}
