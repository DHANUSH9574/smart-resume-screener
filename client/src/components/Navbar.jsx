import React from 'react';
import { 
  Sparkles, 
  Briefcase, 
  Settings, 
  PlusCircle, 
  Play, 
  Download, 
  FileCheck,
  ChevronDown
} from 'lucide-react';

export function Navbar({ 
  jobs = [], 
  activeJob, 
  onSelectJob, 
  onOpenJobModal, 
  onOpenApiModal, 
  onSeedDemo, 
  isSeeding,
  exportUrl,
  candidateCount = 0
}) {
  const hasCustomKey = Boolean(localStorage.getItem('smartresume_gemini_key'));

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 p-0.5 shadow-lg shadow-brand-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-surface-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg tracking-tight text-white">
                Smart<span className="text-brand-400">Resume</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full">
                AI Screener
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              LLM Semantic Matching & Automated Shortlisting
            </p>
          </div>
        </div>

        {/* Active Job Selector Dropdown */}
        <div className="flex-1 max-w-md hidden md:flex items-center gap-2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Briefcase className="w-4 h-4 text-brand-400" />
            </div>
            <select
              value={activeJob?.id || ''}
              onChange={(e) => {
                const selected = jobs.find(j => j.id === e.target.value);
                if (selected) onSelectJob(selected);
              }}
              className="w-full pl-9 pr-8 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition cursor-pointer appearance-none truncate"
            >
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.department})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <button
            onClick={onOpenJobModal}
            title="Create or Manage Job Descriptions"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5 text-xs font-medium shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-brand-400" />
            <span>New Job</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Create Job Mobile Button */}
          <button
            onClick={onOpenJobModal}
            className="md:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1 text-xs font-medium"
          >
            <PlusCircle className="w-4 h-4 text-brand-400" />
            <span>Job</span>
          </button>

          {/* Export Shortlist CSV */}
          {candidateCount > 0 && exportUrl && (
            <a
              href={exportUrl}
              download
              className="p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5 text-xs font-medium"
              title="Download Shortlist Report as CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">Export CSV</span>
            </a>
          )}

          {/* AI Settings / API Key */}
          <button
            onClick={onOpenApiModal}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition relative"
            title="Configure Gemini API Settings"
          >
            <Settings className="w-4 h-4" />
            {hasCustomKey && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
