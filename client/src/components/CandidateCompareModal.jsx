import React from 'react';
import { X, Scale, Check, AlertTriangle, CheckCircle2, XCircle, Eye } from 'lucide-react';

export function CandidateCompareModal({ 
  isOpen, 
  onClose, 
  candidates = [], 
  onViewCandidate,
  onUpdateStatus 
}) {
  if (!isOpen || candidates.length === 0) return null;

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 70) return 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-6xl rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-base text-white">
                Side-by-Side Candidate Comparison Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Comparing {candidates.length} candidates against role requirements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid Table */}
        <div className="p-6 overflow-x-auto overflow-y-auto flex-1">
          <div className="min-w-[700px] divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
            {/* Candidate Header Cards */}
            <div className="grid grid-cols-4 bg-slate-950/70 p-4 gap-4">
              <div className="font-semibold text-xs text-slate-400 uppercase tracking-wider self-center">
                Candidate
              </div>
              {candidates.map((c) => (
                <div key={c.id} className="space-y-2 text-center">
                  <div className="font-bold text-sm text-white truncate">{c.candidate_name}</div>
                  <div className={`inline-block px-3 py-1 rounded-xl border text-sm font-bold ${getScoreColor(c.overall_score || 0)}`}>
                    {c.overall_score}% {c.fit_tier}
                  </div>
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {c.status || 'Under Review'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Score Breakdown Row */}
            <div className="grid grid-cols-4 p-4 gap-4 text-xs">
              <div className="font-medium text-slate-400">
                Sub-Scores
              </div>
              {candidates.map((c) => (
                <div key={c.id} className="space-y-1 text-center">
                  <p className="text-slate-300">Tech: <strong className="text-white">{c.technical_score || 0}%</strong></p>
                  <p className="text-slate-300">Exp: <strong className="text-white">{c.experience_score || 0}%</strong></p>
                  <p className="text-slate-300">Edu: <strong className="text-white">{c.education_score || 0}%</strong></p>
                </div>
              ))}
            </div>

            {/* Experience Row */}
            <div className="grid grid-cols-4 p-4 gap-4 text-xs">
              <div className="font-medium text-slate-400">
                Experience Years
              </div>
              {candidates.map((c) => (
                <div key={c.id} className="text-center font-semibold text-white">
                  {c.total_experience_years || 0} years
                </div>
              ))}
            </div>

            {/* Matched Skills */}
            <div className="grid grid-cols-4 p-4 gap-4 text-xs">
              <div className="font-medium text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Matched Skills
              </div>
              {candidates.map((c) => (
                <div key={c.id} className="flex flex-wrap justify-center gap-1">
                  {(c.matched_skills || []).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 text-[10px] bg-emerald-500/15 text-emerald-300 rounded border border-emerald-500/30">
                      {s}
                    </span>
                  ))}
                </div>
              ))}
            </div>

            {/* Missing Skills */}
            <div className="grid grid-cols-4 p-4 gap-4 text-xs">
              <div className="font-medium text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Missing Skills
              </div>
              {candidates.map((c) => (
                <div key={c.id} className="flex flex-wrap justify-center gap-1">
                  {(c.missing_skills || []).length > 0 ? (
                    c.missing_skills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 text-[10px] bg-rose-500/10 text-rose-300 rounded border border-rose-500/25">
                        - {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-emerald-400">None</span>
                  )}
                </div>
              ))}
            </div>

            {/* Strengths */}
            <div className="grid grid-cols-4 p-4 gap-4 text-xs">
              <div className="font-medium text-slate-400">
                Top Strengths
              </div>
              {candidates.map((c) => (
                <div key={c.id} className="space-y-1 text-[11px] text-slate-300 text-left">
                  {(c.strengths || []).slice(0, 3).map((st, i) => (
                    <p key={i}>• {st}</p>
                  ))}
                </div>
              ))}
            </div>

            {/* Actions Row */}
            <div className="grid grid-cols-4 p-4 gap-4 text-xs bg-slate-950/40 items-center">
              <div className="font-medium text-slate-400">
                Quick Action
              </div>
              {candidates.map((c) => (
                <div key={c.id} className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      onViewCandidate(c);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" /> View
                  </button>
                  <button
                    onClick={() => onUpdateStatus(c.id, 'Shortlisted')}
                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    title="Shortlist"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onUpdateStatus(c.id, 'Rejected')}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
