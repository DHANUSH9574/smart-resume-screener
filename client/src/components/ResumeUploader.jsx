import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  File, 
  X, 
  Sparkles, 
  Play, 
  Check, 
  AlertCircle,
  FileCheck,
  ClipboardList,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function ResumeUploader({ activeJob, onScreenCompleted, onSeedDemo, isSeeding }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [pastedText, setPastedText] = useState('');
  const [pastedName, setPastedName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [autoReplace, setAutoReplace] = useState(true); // Auto-clear previous candidates on new screening
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(Array.from(e.target.files));
    }
  };

  const handleFilesAdded = (newFiles) => {
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt', '.md'];
    const filtered = newFiles.filter(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      return validExtensions.includes(ext);
    });

    if (filtered.length < newFiles.length) {
      setErrorMessage('Some files were ignored. Supported formats: PDF, DOCX, TXT.');
    } else {
      setErrorMessage('');
    }

    setSelectedFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name));
      const deduplicated = filtered.filter(f => !existingNames.has(f.name));
      return [...prev, ...deduplicated];
    });
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartScreening = async () => {
    if (!activeJob) {
      setErrorMessage('Please select or create a Job Description first.');
      return;
    }

    if (activeTab === 'upload' && selectedFiles.length === 0) {
      setErrorMessage('Please select at least one resume file to upload.');
      return;
    }

    if (activeTab === 'paste' && !pastedText.trim()) {
      setErrorMessage('Please paste resume text to evaluate.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    // Helper: fetch with automatic retry on connection errors
    const fetchWithRetry = async (url, options, maxRetries = 3) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const res = await fetch(url, options);
          return await res.json();
        } catch (err) {
          if (attempt < maxRetries) {
            setProgressStep(`Connection interrupted, retrying (${attempt}/${maxRetries})...`);
            await new Promise(r => setTimeout(r, 1500 * attempt));
          } else {
            throw err;
          }
        }
      }
    };

    try {
      setProgressStep('1/3 Extracting text and document structure...');
      await new Promise(r => setTimeout(r, 600));

      setProgressStep('2/3 Extracting candidate skills, experience & education...');
      await new Promise(r => setTimeout(r, 800));

      setProgressStep('3/3 Computing match score & recruiter justification...');

      const customKey = localStorage.getItem('smartresume_gemini_key');
      const headers = {};
      if (customKey) headers['x-gemini-api-key'] = customKey;

      let result;
      const threshold = localStorage.getItem('smartresume_shortlist_threshold') || '80';

      if (activeTab === 'upload') {
        const formData = new FormData();
        formData.append('jobId', activeJob.id);
        formData.append('shortlistThreshold', threshold);
        formData.append('clearPrevious', autoReplace ? 'true' : 'false');
        selectedFiles.forEach(f => formData.append('resumes', f));

        result = await fetchWithRetry('/api/screen', {
          method: 'POST',
          headers,
          body: formData
        });
      } else {
        const rawItem = {
          filename: pastedName.trim() ? `${pastedName.trim()}_Resume.txt` : 'Pasted_Candidate_Resume.txt',
          text: pastedText
        };

        const formData = new FormData();
        formData.append('jobId', activeJob.id);
        formData.append('shortlistThreshold', threshold);
        formData.append('clearPrevious', autoReplace ? 'true' : 'false');
        formData.append('rawTexts', JSON.stringify([rawItem]));

        result = await fetchWithRetry('/api/screen', {
          method: 'POST',
          headers,
          body: formData
        });
      }

      if (result.success) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        setSelectedFiles([]);
        setPastedText('');
        setPastedName('');
        if (onScreenCompleted) onScreenCompleted();
      } else {
        setErrorMessage(result.error || 'Screening failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Error connecting to backend. Please ensure the server is running on port 5000 and try again.');
    } finally {
      setIsProcessing(false);
      setProgressStep('');
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-5 mb-8 shadow-xl">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-base text-white">
              AI Resume Screening Hub
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/40 rounded-full">
              Multi-Format Parser
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Batch evaluate candidate resumes against <span className="text-brand-300 font-semibold">{activeJob ? `"${activeJob.title}"` : 'selected role'}</span>
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Resumes</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Text</span>
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      {activeTab === 'upload' ? (
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-brand-500 bg-brand-500/10 scale-[0.99]'
                : 'border-slate-700/80 hover:border-brand-500/60 bg-slate-900/40 hover:bg-slate-900/70'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept=".pdf,.docx,.doc,.txt,.md"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center mx-auto text-brand-400 mb-3 shadow-inner">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-sm text-white mb-1">
              Drop resumes here or <span className="text-brand-400 underline decoration-brand-500/50">browse files</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Supports <strong className="text-slate-300">PDF, DOCX, DOC, TXT</strong> (Up to 20 files at once)
            </p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Selected {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} ready to screen</span>
                <button
                  onClick={clearAllFiles}
                  className="text-rose-400 hover:text-rose-300 font-medium"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <File className="w-4 h-4 text-brand-400 shrink-0" />
                      <span className="font-medium truncate">{file.name}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Candidate Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Morgan"
              value={pastedName}
              onChange={(e) => setPastedName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:outline-none mb-2"
            />
            <textarea
              rows={5}
              placeholder="Paste complete raw text of the resume here (Experience, Skills, Education)..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
            />
          </div>
        </div>
      )}

      {/* Error display */}
      {errorMessage && (
        <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Processing Animation */}
      {isProcessing && (
        <div className="mt-4 p-4 rounded-xl bg-brand-950/40 border border-brand-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-300">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400 animate-spin" />
              <span>AI Screening in progress...</span>
            </span>
            <span className="text-[11px] text-slate-400">Processing with LLM</span>
          </div>
          <p className="text-xs text-slate-300">{progressStep}</p>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-indigo-400 animate-pulse rounded-full w-full" />
          </div>
        </div>
      )}

      {/* Bottom Controls: Auto-replace Checkbox & Trigger Button */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoReplace}
            onChange={(e) => setAutoReplace(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 text-brand-600 focus:ring-brand-500 cursor-pointer bg-slate-900"
          />
          <span>Auto-replace previous candidates for this role on new screening</span>
        </label>

        <button
          onClick={handleStartScreening}
          disabled={isProcessing || (activeTab === 'upload' && selectedFiles.length === 0) || (activeTab === 'paste' && !pastedText.trim())}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-brand-500/25 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {isProcessing ? 'Screening Candidates...' : `Screen Candidates (${activeTab === 'upload' ? selectedFiles.length : 1})`}
          </span>
        </button>
      </div>
    </div>
  );
}
