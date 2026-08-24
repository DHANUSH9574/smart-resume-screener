import React, { useState, useEffect } from 'react';
import { api } from './utils/api';
import { Navbar } from './components/Navbar';
import { AnalyticsOverview } from './components/AnalyticsOverview';
import { ResumeUploader } from './components/ResumeUploader';
import { CandidateLeaderboard } from './components/CandidateLeaderboard';
import { CandidateDetailModal } from './components/CandidateDetailModal';
import { CandidateCompareModal } from './components/CandidateCompareModal';
import { JobManagerModal } from './components/JobManagerModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AiPromptCopilot } from './components/AiPromptCopilot';
import { 
  Sparkles, 
  Briefcase, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  RefreshCw,
  FileCheck,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  
  // Configurable shortlist threshold (persisted in localStorage)
  const [shortlistThreshold, setShortlistThreshold] = useState(() => {
    const saved = localStorage.getItem('smartresume_shortlist_threshold');
    return saved ? Number(saved) : 80;
  });

  const handleThresholdChange = (newVal) => {
    const val = Math.min(100, Math.max(0, Number(newVal)));
    setShortlistThreshold(val);
    localStorage.setItem('smartresume_shortlist_threshold', String(val));
  };

  // Modals state
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Initial Data Load
  useEffect(() => {
    loadJobs();
  }, []);

  // When activeJob changes, reload candidates and clear selection
  useEffect(() => {
    setCandidates([]);
    setSelectedForCompare([]);
    if (activeJob?.id) {
      loadCandidates(activeJob.id);
    }
  }, [activeJob?.id]);

  const loadJobs = async () => {
    try {
      const fetchedJobs = await api.getJobs();
      setJobs(fetchedJobs);
      if (fetchedJobs.length > 0) {
        setActiveJob(prev => prev ? (fetchedJobs.find(j => j.id === prev.id) || fetchedJobs[0]) : fetchedJobs[0]);
      } else {
        setActiveJob(null);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    }
  };

  const loadCandidates = async (jobId) => {
    setIsLoadingCandidates(true);
    try {
      const list = await api.getScreenings(jobId);
      setCandidates(list);
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const handleCreateJob = async (jobData) => {
    const res = await api.createJob(jobData);
    if (res.success) {
      await loadJobs();
      setActiveJob(res.data);
      showToast(`Job "${res.data.title}" created successfully!`);
      return res.data;
    }
  };

  const handleDeleteJob = async (jobId) => {
    await api.deleteJob(jobId);
    await loadJobs();
    showToast('Job description deleted.');
  };

  const handleUpdateStatus = async (screeningId, status, notes) => {
    try {
      const res = await api.updateScreeningStatus(screeningId, status, notes);
      if (res.success) {
        if (activeJob?.id) {
          await loadCandidates(activeJob.id);
        }
        if (selectedCandidate?.id === screeningId) {
          setSelectedCandidate(res.data);
        }
        showToast(`Candidate status updated to "${status}"`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteCandidate = async (screeningId) => {
    try {
      const res = await api.deleteScreening(screeningId);
      if (res.success) {
        if (activeJob?.id) {
          await loadCandidates(activeJob.id);
        }
        showToast('Candidate record removed.');
      }
    } catch (err) {
      console.error('Error deleting candidate:', err);
    }
  };

  const handleClearAllCandidates = async () => {
    if (!activeJob?.id) return;
    try {
      const res = await api.clearScreeningsForJob(activeJob.id);
      if (res.success) {
        setCandidates([]);
        setSelectedForCompare([]);
        showToast('Cleared all candidate records for this role.');
      }
    } catch (err) {
      console.error('Error clearing candidates:', err);
    }
  };

  const handleToggleCompareSelect = (candidateId) => {
    setSelectedForCompare(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        if (prev.length >= 4) {
          showToast('You can compare up to 4 candidates at once.');
          return prev;
        }
        return [...prev, candidateId];
      }
    });
  };

  const handleOpenDetailModal = (cand) => {
    setSelectedCandidate(cand);
    setIsDetailModalOpen(true);
  };

  const compareCandidatesList = candidates.filter(c => selectedForCompare.includes(c.id));

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900/95 border border-brand-500/50 text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        jobs={jobs}
        activeJob={activeJob}
        onSelectJob={setActiveJob}
        onOpenJobModal={() => setIsJobModalOpen(true)}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        candidateCount={candidates.length}
        exportUrl={activeJob?.id ? api.getExportUrl(activeJob.id) : null}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Role Banner */}
        {activeJob ? (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl glass-card border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400">
                  Active Screening Job
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h1 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                {activeJob.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-0.5">
                <span>🏢 {activeJob.department}</span>
                <span>⏳ Min Experience: {activeJob.min_experience_years} years</span>
                <span>🎯 {activeJob.experience_level}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsJobModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
              >
                Switch / Manage Roles
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-6 rounded-2xl glass-card border border-brand-500/30 bg-brand-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-lg text-white">No Job Description Selected</h2>
              <p className="text-xs text-slate-400 mt-1">
                Create a new job description or select a role to begin screening resumes.
              </p>
            </div>
            <button
              onClick={() => setIsJobModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/25 transition shrink-0"
            >
              + Create / Select Job
            </button>
          </div>
        )}

        {/* Dashboard Analytics Bar */}
        <AnalyticsOverview
          candidates={candidates}
          activeJob={activeJob}
          shortlistThreshold={shortlistThreshold}
          onThresholdChange={handleThresholdChange}
        />

        {/* Interactive AI Copilot & Custom Prompt Bar */}
        <AiPromptCopilot
          activeJob={activeJob}
          candidates={candidates}
        />

        {/* Multi-Resume Parser & Screener Upload Hub */}
        <ResumeUploader
          activeJob={activeJob}
          onScreenCompleted={() => activeJob?.id && loadCandidates(activeJob.id)}
        />

        {/* Leaderboard Section Header */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-lg text-white">
              Screened Candidates Leaderboard
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-brand-300 border border-slate-700">
              {candidates.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {candidates.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Clear all candidates for this job role?')) {
                    handleClearAllCandidates();
                  }
                }}
                className="p-1.5 px-2.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition text-xs flex items-center gap-1.5"
                title="Clear all candidates for this role"
              >
                <span>Clear All</span>
              </button>
            )}

            <button
              onClick={() => activeJob?.id && loadCandidates(activeJob.id)}
              disabled={isLoadingCandidates}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs flex items-center gap-1"
              title="Refresh candidates"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCandidates ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Ranked Candidate Leaderboard */}
        <CandidateLeaderboard
          candidates={candidates}
          onSelectCandidate={handleOpenDetailModal}
          onUpdateStatus={handleUpdateStatus}
          onDeleteCandidate={handleDeleteCandidate}
          onClearAllCandidates={handleClearAllCandidates}
          onOpenCompare={() => setIsCompareModalOpen(true)}
          selectedForCompare={selectedForCompare}
          onToggleCompareSelect={handleToggleCompareSelect}
        />
      </main>

      {/* Modals */}
      <CandidateDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        candidate={selectedCandidate}
        onUpdateStatus={handleUpdateStatus}
      />

      <CandidateCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        candidates={compareCandidatesList}
        onViewCandidate={(cand) => {
          setIsCompareModalOpen(false);
          handleOpenDetailModal(cand);
        }}
        onUpdateStatus={handleUpdateStatus}
      />

      <JobManagerModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        jobs={jobs}
        activeJob={activeJob}
        onSelectJob={setActiveJob}
        onCreateJob={handleCreateJob}
        onDeleteJob={handleDeleteJob}
      />

      <ApiKeyModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onKeySaved={() => {
          showToast('Gemini API configuration updated');
        }}
      />

      {/* Modern Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/70 mt-16 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>SmartResume Screener • Powered by Gemini 2.5/3.7 Flash & Semantic Matching Engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Multi-format Parser (PDF, DOCX, TXT)</span>
            <span>•</span>
            <span>Persistent SQLite / JSON Store</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
