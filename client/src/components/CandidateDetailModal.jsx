import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  ExternalLink, 
  FileText, 
  Award, 
  HelpCircle, 
  Check, 
  AlertTriangle, 
  Briefcase, 
  GraduationCap, 
  Printer, 
  Save,
  MessageSquare
} from 'lucide-react';

export function CandidateDetailModal({ 
  isOpen, 
  onClose, 
  candidate, 
  onUpdateStatus,
  onDelete 
}) {
  const [activeTab, setActiveTab] = useState('evaluation'); // 'evaluation' | 'profile' | 'raw'
  const [recruiterNotes, setRecruiterNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    if (candidate) {
      setRecruiterNotes(candidate.recruiter_notes || '');
    }
  }, [candidate]);

  if (!isOpen || !candidate) return null;

  const score = candidate.overall_score || 0;
  const techScore = candidate.technical_score || score;
  const expScore = candidate.experience_score || score;
  const eduScore = candidate.education_score || 85;

  const getScoreColor = (sc) => {
    if (sc >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (sc >= 70) return 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10';
    if (sc >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const getProgressBarColor = (sc) => {
    if (sc >= 85) return 'bg-emerald-500';
    if (sc >= 70) return 'bg-indigo-500';
    if (sc >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await onUpdateStatus(candidate.id, candidate.status, recruiterNotes);
    setIsSavingNotes(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-4xl rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Profile Section */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center shrink-0 ${getScoreColor(score)} shadow-lg`}>
              <span className="text-2xl font-display font-extrabold leading-none">{score}%</span>
              <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Match</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display font-bold text-xl text-white">
                  {candidate.candidate_name}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {candidate.fit_tier}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {candidate.status || 'Under Review'}
                </span>
              </div>

              {/* Contact meta */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                {candidate.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {candidate.email}
                  </span>
                )}
                {candidate.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {candidate.phone}
                  </span>
                )}
                {candidate.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {candidate.location}
                  </span>
                )}
                {candidate.linkedin && (
                  <a
                    href={candidate.linkedin.startsWith('http') ? candidate.linkedin : `https://${candidate.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-brand-400 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions / Close */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Print Dossier / Save as PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 flex gap-4 border-b border-slate-800/80 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'evaluation'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Evaluation & Justification</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Full Profile & Work History</span>
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'raw'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Extracted Resume Text</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'evaluation' && (
            <>
              {/* Category Breakdown Progress Bars */}
              <div className="glass-card p-4 rounded-xl border border-slate-800/90 space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Multi-Factor Match Breakdown
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Technical Fit */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Technical Skills Fit</span>
                      <span className="font-bold text-white">{techScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressBarColor(techScore)}`}
                        style={{ width: `${techScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Experience Fit */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Experience Alignment</span>
                      <span className="font-bold text-white">{expScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressBarColor(expScore)}`}
                        style={{ width: `${expScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Education Fit */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Education & Credentials</span>
                      <span className="font-bold text-white">{eduScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressBarColor(eduScore)}`}
                        style={{ width: `${eduScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Match Matrix (Emerald vs Rose) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Skills */}
                <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Matched Required Skills ({(candidate.matched_skills || []).length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(candidate.matched_skills || []).length > 0 ? (
                      candidate.matched_skills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-300 rounded-lg border border-emerald-500/30 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No direct skills matched</span>
                    )}
                  </div>
                </div>

                {/* Missing / Gap Skills */}
                <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Skill Gaps / Missing Keywords ({(candidate.missing_skills || []).length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(candidate.missing_skills || []).length > 0 ? (
                      candidate.missing_skills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 text-xs font-medium bg-rose-500/10 text-rose-300 rounded-lg border border-rose-500/25"
                        >
                          - {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-400/80">No skill gaps identified for this role</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Strengths & Potential Concerns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Key Candidate Strengths</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(candidate.strengths || []).map((st, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold mt-0.5">•</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gaps */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Areas to Probe / Risk Factors</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(candidate.gaps || []).map((gp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold mt-0.5">•</span>
                        <span>{gp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* LLM Justification Narrative */}
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <h4 className="text-xs font-semibold text-brand-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <span>Comprehensive Recruiter Justification Narrative</span>
                </h4>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {candidate.justification || 'No justification narrative available.'}
                </div>
              </div>

              {/* Custom Tailored Interview Questions */}
              <div className="p-5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
                <h4 className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>AI-Generated Tailored Interview Questions</span>
                </h4>
                <div className="space-y-3">
                  {(candidate.interview_questions || []).map((iq, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <p className="text-xs font-bold text-white">
                        {idx + 1}. {iq.question}
                      </p>
                      {iq.rationale && (
                        <p className="text-[11px] text-brand-300 italic">
                          Target Rationale: {iq.rationale}
                        </p>
                      )}
                      {iq.ideal_answer_points && iq.ideal_answer_points.length > 0 && (
                        <div className="text-[11px] text-slate-400 pt-1">
                          <span className="font-semibold text-slate-300">Ideal Answer Signals:</span>
                          <ul className="list-disc list-inside mt-0.5 space-y-0.5 pl-1 text-slate-400">
                            {iq.ideal_answer_points.map((pt, pIdx) => (
                              <li key={pIdx}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recruiter Notes & Decision Section */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-slate-300">
                  Recruiter Notes & Hiring Actions
                </h4>
                <textarea
                  rows={2}
                  placeholder="Add internal recruiter notes, interview scheduling feedback, or candidate observations..."
                  value={recruiterNotes}
                  onChange={(e) => setRecruiterNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateStatus(candidate.id, 'Shortlisted', recruiterNotes)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Shortlist
                    </button>
                    <button
                      onClick={() => onUpdateStatus(candidate.id, 'Interview Scheduled', recruiterNotes)}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" /> Schedule Interview
                    </button>
                    <button
                      onClick={() => onUpdateStatus(candidate.id, 'Rejected', recruiterNotes)}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>

                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Summary */}
              {candidate.candidate_summary && (
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                  <h4 className="text-xs font-semibold text-slate-300">Professional Summary</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{candidate.candidate_summary}</p>
                </div>
              )}

              {/* Work Experience */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-brand-400" />
                  <span>Work Experience</span>
                </h4>
                <div className="space-y-3">
                  {(candidate.experience || []).map((exp, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h5 className="font-bold text-sm text-white">{exp.role}</h5>
                        <span className="text-xs text-slate-400 font-medium">{exp.duration}</span>
                      </div>
                      <p className="text-xs text-brand-300 font-medium">{exp.company}</p>
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pt-1">
                          {exp.highlights.map((hl, hIdx) => (
                            <li key={hIdx}>{hl}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Education & Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-brand-400" />
                    <span>Education</span>
                  </h4>
                  {(candidate.education || []).map((edu, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                      <p className="font-bold text-xs text-white">{edu.degree}</p>
                      <p className="text-xs text-slate-400">{edu.institution} ({edu.year})</p>
                      {edu.details && <p className="text-[11px] text-slate-500">{edu.details}</p>}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Certifications</span>
                  </h4>
                  <div className="space-y-1.5">
                    {(candidate.certifications || []).length > 0 ? (
                      candidate.certifications.map((cert, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                          {cert}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">None explicitly listed</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {candidate.raw_text || 'No raw document text available.'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
