import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Scale, 
  ArrowUpDown, 
  Sparkles, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Calendar,
  Check,
  AlertCircle,
  Trash2,
  RotateCcw
} from 'lucide-react';

export function CandidateLeaderboard({ 
  candidates = [], 
  onSelectCandidate, 
  onUpdateStatus, 
  onDeleteCandidate,
  onClearAllCandidates,
  onOpenCompare,
  selectedForCompare = [],
  onToggleCompareSelect
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [fitFilter, setFitFilter] = useState('All'); // 'All' | 'Strong Fit' | 'Good Fit' | 'Potential' | 'Low Fit'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Shortlisted' | 'Under Review' | 'Interview Scheduled' | 'Rejected'
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'experience' | 'name'

  // Filtering & Sorting
  let filtered = candidates.filter(c => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (c.candidate_name || '').toLowerCase().includes(q);
      const matchEmail = (c.email || '').toLowerCase().includes(q);
      const matchSkill = (c.matched_skills || []).some(s => s.toLowerCase().includes(q));
      if (!matchName && !matchEmail && !matchSkill) return false;
    }

    // Fit Filter
    if (fitFilter !== 'All' && c.fit_tier !== fitFilter) {
      return false;
    }

    // Status Filter
    if (statusFilter !== 'All' && (c.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'score') return (b.overall_score || 0) - (a.overall_score || 0);
    if (sortBy === 'experience') return (b.total_experience_years || 0) - (a.total_experience_years || 0);
    if (sortBy === 'name') return (a.candidate_name || '').localeCompare(b.candidate_name || '');
    return 0;
  });

  const getBadgeTierColor = (tier) => {
    switch (tier) {
      case 'Strong Fit':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Good Fit':
        return 'bg-brand-500/15 text-brand-300 border-brand-500/30';
      case 'Potential':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/40';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Interview Scheduled':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'Rejected':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 65) return 'text-brand-400 bg-brand-500/10 border-brand-500/30';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search, Filters, Sort & Compare Action */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by candidate or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Fit Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-[11px]">
            <span className="px-2 text-slate-400 font-medium">Fit:</span>
            {['All', 'Strong', 'Good', 'Potential', 'Low Fit'].map((tier) => {
              const fullTier = tier === 'Strong' ? 'Strong Fit' : tier === 'Good' ? 'Good Fit' : tier;
              const isSelected = fitFilter === fullTier;
              return (
                <button
                  key={tier}
                  onClick={() => setFitFilter(fullTier)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tier}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium appearance-none pr-8 cursor-pointer"
            >
              <option value="score">Sort: Highest Match Score</option>
              <option value="experience">Sort: Years of Experience</option>
              <option value="name">Sort: Candidate Name (A-Z)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Compare Button */}
          {selectedForCompare.length > 0 && (
            <button
              onClick={onOpenCompare}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 transition flex items-center gap-1.5 animate-in fade-in"
            >
              <Scale className="w-4 h-4" />
              <span>Compare ({selectedForCompare.length})</span>
            </button>
          )}

          {/* Clear All Candidates for this Role Button */}
          {candidates.length > 0 && onClearAllCandidates && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all candidate records for this job role?')) {
                  onClearAllCandidates();
                }
              }}
              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition flex items-center gap-1.5"
              title="Delete all candidates for this role"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear List</span>
            </button>
          )}
        </div>
      </div>

      {/* Candidate List Rows */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-display font-semibold text-base text-white">
            {candidates.length === 0 ? 'No candidates screened for this role yet' : 'No candidates match the filter criteria'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {candidates.length === 0
              ? 'Upload candidate resumes (PDF, DOCX, TXT) above to evaluate them against this job description.'
              : 'Try clearing your search query or switching your fit filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((candidate, index) => {
            const isSelected = selectedForCompare.includes(candidate.id);
            const score = candidate.overall_score || 0;

            return (
              <div
                key={candidate.id}
                className={`glass-card p-4 sm:p-5 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden group ${
                  isSelected
                    ? 'border-brand-500/70 bg-brand-950/20 shadow-lg shadow-brand-500/10'
                    : 'border-slate-800/80 hover:border-slate-700/90'
                }`}
              >
                {/* Left Section: Checkbox & Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Compare Selection Checkbox */}
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleCompareSelect(candidate.id)}
                      className="w-4 h-4 rounded border-slate-700 text-brand-600 focus:ring-brand-500 cursor-pointer bg-slate-900"
                      title="Select for comparison matrix"
                    />
                  </div>

                  {/* Rank Number */}
                  <div className="w-6 h-6 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                    #{index + 1}
                  </div>

                  {/* Candidate Bio & Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        onClick={() => onSelectCandidate(candidate)}
                        className="font-display font-bold text-sm sm:text-base text-white hover:text-brand-400 cursor-pointer transition truncate"
                      >
                        {candidate.candidate_name}
                      </h3>

                      {/* Tier Badge */}
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getBadgeTierColor(candidate.fit_tier)}`}>
                        {candidate.fit_tier}
                      </span>

                      {/* Recruiter Status Badge */}
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${getStatusColor(candidate.status)}`}>
                        {candidate.status || 'Under Review'}
                      </span>
                    </div>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                        {candidate.total_experience_years || 0} yrs experience
                      </span>
                      {candidate.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {candidate.location}
                        </span>
                      )}
                      {candidate.email && (
                        <span className="text-slate-400 truncate max-w-[200px]">
                          {candidate.email}
                        </span>
                      )}
                    </div>

                    {/* Matched vs Missing Skills Preview */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                        Skills:
                      </span>
                      {(candidate.matched_skills || []).slice(0, 5).map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 rounded border border-emerald-500/30 flex items-center gap-0.5"
                        >
                          <Check className="w-2.5 h-2.5" /> {skill}
                        </span>
                      ))}
                      {(candidate.missing_skills || []).slice(0, 2).map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-[10px] font-medium bg-rose-500/10 text-rose-300 rounded border border-rose-500/25"
                        >
                          - {skill}
                        </span>
                      ))}
                      {((candidate.matched_skills || []).length > 5) && (
                        <span className="text-[10px] text-slate-500">
                          +{candidate.matched_skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right section: Score Radial / Gauge & Actions */}
                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-800/80">
                  {/* Score breakdown metrics */}
                  <div className="hidden lg:flex items-center gap-3 text-right text-xs">
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium">Tech Fit</p>
                      <p className="font-semibold text-slate-300">{candidate.technical_score || score}%</p>
                    </div>
                    <div className="w-px h-6 bg-slate-800" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium">Exp Fit</p>
                      <p className="font-semibold text-slate-300">{candidate.experience_score || score}%</p>
                    </div>
                  </div>

                  {/* Main Overall Match Score Gauge */}
                  <div className={`px-3 py-1.5 rounded-xl border flex flex-col items-center justify-center min-w-[78px] ${getScoreColor(score)}`}>
                    <span className="text-lg font-display font-extrabold tracking-tight leading-none">
                      {score}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 mt-0.5">
                      {(score / 10).toFixed(1)}/10 Fit
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectCandidate(candidate)}
                      className="px-3 py-2 rounded-lg bg-brand-600/90 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1"
                      title="View Full AI Evaluation Dossier"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Dossier</span>
                    </button>

                    {/* Quick Shortlist / Reject toggle */}
                    {candidate.status !== 'Shortlisted' ? (
                      <button
                        onClick={() => onUpdateStatus(candidate.id, 'Shortlisted')}
                        className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
                        title="Shortlist Candidate"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateStatus(candidate.id, 'Rejected')}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                        title="Reject Candidate"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}

                    {/* Individual Delete Candidate Button */}
                    {onDeleteCandidate && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove candidate "${candidate.candidate_name}" from this role's screening?`)) {
                            onDeleteCandidate(candidate.id);
                          }
                        }}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/40 transition"
                        title="Delete Candidate Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
