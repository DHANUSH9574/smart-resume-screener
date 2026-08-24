import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  TrendingUp,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

export function AnalyticsOverview({ candidates = [], activeJob, shortlistThreshold = 80, onThresholdChange }) {
  const total = candidates.length;
  const shortlisted = total > 0 ? candidates.filter(c => (c.overall_score || 0) >= shortlistThreshold).length : 0;
  const shortlistRate = total > 0 ? Math.round((shortlisted / total) * 100) : 0;

  const avgScore = total > 0
    ? Math.round(candidates.reduce((sum, c) => sum + (c.overall_score || 0), 0) / total)
    : 0;

  // Calculate most frequent matched skills
  const matchedSkillCounts = {};
  candidates.forEach(c => {
    (c.matched_skills || []).forEach(skill => {
      matchedSkillCounts[skill] = (matchedSkillCounts[skill] || 0) + 1;
    });
  });

  const topMatched = Object.entries(matchedSkillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-3 mb-6">
      {/* Shortlist Threshold Control */}
      <div className="glass-card p-4 rounded-xl border border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Shortlist Pass Threshold</p>
              <p className="text-[10px] text-slate-400">Candidates scoring at or above this % are auto-shortlisted</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
            <input
              type="range"
              min="30"
              max="100"
              step="5"
              value={shortlistThreshold}
              onChange={(e) => onThresholdChange(e.target.value)}
              className="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-brand-500
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-500 
                [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-brand-500/30
                [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-400
                [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="30"
                max="100"
                step="5"
                value={shortlistThreshold}
                onChange={(e) => onThresholdChange(e.target.value)}
                className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white 
                  text-center font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <span className="text-xs text-slate-400 font-medium">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Screened Card */}
        <div className="glass-card p-4 rounded-xl border border-slate-800/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-brand-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Evaluated</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-display font-bold text-white tracking-tight">{total}</span>
              <span className="text-[11px] text-slate-400">candidates</span>
            </div>
          </div>
        </div>

        {/* Average Match Score */}
        <div className="glass-card p-4 rounded-xl border border-slate-800/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Average Match Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-display font-bold text-indigo-300 tracking-tight">{avgScore}%</span>
              <span className="text-[11px] text-slate-400">pool quality</span>
            </div>
          </div>
        </div>

        {/* Shortlisted Rate */}
        <div className="glass-card p-4 rounded-xl border border-slate-800/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Shortlist Pass Rate</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-display font-bold text-emerald-400 tracking-tight">{shortlistRate}%</span>
              <span className="text-[11px] text-slate-400">({shortlisted} of {total} qualified ≥{shortlistThreshold}%)</span>
            </div>
          </div>
        </div>

        {/* Top Pool Skills */}
        <div className="glass-card p-4 rounded-xl border border-slate-800/80 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-400" /> Strongest Pool Skills
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            {topMatched.length > 0 ? (
              topMatched.map(([skill, count]) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 text-[10px] font-medium bg-brand-500/15 text-brand-300 rounded border border-brand-500/30"
                >
                  {skill} ({count})
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">No skill data</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
