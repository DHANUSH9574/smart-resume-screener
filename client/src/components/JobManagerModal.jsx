import React, { useState } from 'react';
import { 
  X, 
  Briefcase, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  Layers,
  Clock,
  Code,
  Wand2
} from 'lucide-react';

const COMMON_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'dart',
  'react', 'react.js', 'react native', 'angular', 'vue', 'next.js', 'express', 'node.js', 'nodejs',
  'django', 'flask', 'fastapi', 'spring boot', 'spring', '.net', 'asp.net', 'graphql', 'rest api', 'restful',
  'html', 'html5', 'css', 'css3', 'tailwind', 'tailwindcss', 'bootstrap', 'redux', 'zustand',
  'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'mongodb', 'redis', 'cassandra', 'dynamodb', 'firebase',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd', 'git', 'github', 'linux', 'microservices',
  'data structures', 'algorithms', 'dsa', 'oop',
  'machine learning', 'deep learning', 'nlp', 'llm', 'pytorch', 'tensorflow', 'pandas', 'numpy', 'scikit-learn'
];

function quickExtractSkills(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = [];
  for (const s of COMMON_SKILLS) {
    const regex = new RegExp(`(^|[^a-zA-Z0-9_+#.-])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[^a-zA-Z0-9_+#.-]|$)`, 'i');
    if (regex.test(lower)) {
      found.push(s.charAt(0).toUpperCase() + s.slice(1));
    }
  }
  return [...new Set(found)];
}

export function JobManagerModal({ 
  isOpen, 
  onClose, 
  jobs = [], 
  activeJob, 
  onSelectJob, 
  onCreateJob, 
  onDeleteJob 
}) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    experience_level: 'Entry / Graduate (0-2 years)',
    min_experience_years: 0,
    required_skills: '',
    preferred_skills: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleDescriptionChange = (e) => {
    const desc = e.target.value;
    setFormData(prev => {
      const updated = { ...prev, description: desc };
      // If required skills is empty, auto extract from description
      if (!prev.required_skills.trim()) {
        const detected = quickExtractSkills(`${prev.title} ${desc}`);
        if (detected.length > 0) {
          updated.required_skills = detected.join(', ');
        }
      }
      return updated;
    });
  };

  const handleAutoDetectSkills = () => {
    const detected = quickExtractSkills(`${formData.title} ${formData.description}`);
    if (detected.length > 0) {
      setFormData(prev => ({
        ...prev,
        required_skills: detected.join(', ')
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    setIsSubmitting(true);
    try {
      let reqSkills = formData.required_skills.split(',').map(s => s.trim()).filter(Boolean);
      if (reqSkills.length === 0) {
        reqSkills = quickExtractSkills(`${formData.title} ${formData.description}`);
      }

      await onCreateJob({
        ...formData,
        min_experience_years: Number(formData.min_experience_years) || 0,
        required_skills: reqSkills,
        preferred_skills: formData.preferred_skills.split(',').map(s => s.trim()).filter(Boolean)
      });
      setActiveTab('list');
      setFormData({
        title: '',
        department: 'Engineering',
        experience_level: 'Entry / Graduate (0-2 years)',
        min_experience_years: 0,
        required_skills: '',
        preferred_skills: '',
        description: ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadPreset = (presetType) => {
    if (presetType === 'frontend') {
      setFormData({
        title: 'Lead Frontend Engineer (React / Next.js)',
        department: 'Product Experience',
        experience_level: 'Lead / Staff (6+ years)',
        min_experience_years: 6,
        required_skills: 'React, TypeScript, Next.js, Tailwind CSS, State Management, Web Performance',
        preferred_skills: 'GraphQL, WebSockets, Storybook, Jest/Cypress, CI/CD',
        description: `We are looking for a Lead Frontend Engineer to architect next-generation user interfaces and champion best web engineering practices.

Responsibilities:
- Drive the architectural evolution of our core web applications using React 19, TypeScript, and Next.js.
- Optimize web performance (Core Web Vitals) and ensure flawless responsive behavior.
- Build reusable UI component libraries and design tokens in collaboration with product designers.
- Mentor engineers and conduct high-quality code reviews.`
      });
    } else if (presetType === 'fullstack') {
      setFormData({
        title: 'Full Stack Software Developer',
        department: 'Engineering',
        experience_level: 'Mid-Level (2-4 years)',
        min_experience_years: 2,
        required_skills: 'Java, Python, JavaScript, React, Spring Boot, Node.js, SQL, MongoDB, Git, REST API',
        preferred_skills: 'Docker, AWS, Microservices, CI/CD',
        description: `Looking for a Full Stack Developer to build end-to-end web applications, RESTful APIs, and responsive UIs with database optimization.`
      });
    } else if (presetType === 'ai') {
      setFormData({
        title: 'AI / Machine Learning Engineer',
        department: 'Applied AI',
        experience_level: 'Mid-Level (2-4 years)',
        min_experience_years: 2,
        required_skills: 'Python, PyTorch, Machine Learning, NLP, LLM, Transformers, FastAPI, Vector Databases',
        preferred_skills: 'LangChain, Docker, AWS, HuggingFace',
        description: `Design, develop, and deploy scalable AI systems with a heavy focus on Natural Language Processing (NLP) and Machine Learning.`
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg text-white">
                Job Descriptions Manager
              </h2>
              <p className="text-xs text-slate-400">
                Select target role for candidate matching or define a custom job specification
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

        {/* Tab Switcher */}
        <div className="px-6 pt-3 flex gap-2 border-b border-slate-800/80 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === 'list'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Active Roles ({jobs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === 'create'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create New Job</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'list' ? (
            <div className="space-y-3">
              {jobs.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
                  <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-sm font-medium text-slate-300">No Job Descriptions created yet</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition"
                  >
                    + Create Your First Job Description
                  </button>
                </div>
              ) : (
                jobs.map((job) => {
                  const isActive = activeJob?.id === job.id;
                  return (
                    <div
                      key={job.id}
                      className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 cursor-pointer ${
                        isActive
                          ? 'bg-brand-950/40 border-brand-500/50 shadow-lg shadow-brand-500/10'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                      onClick={() => {
                        onSelectJob(job);
                        onClose();
                      }}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-semibold text-sm text-white">
                            {job.title}
                          </h3>
                          {isActive && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/40 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> Active Screening Target
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span>🏢 {job.department}</span>
                          <span>⏳ Min {job.min_experience_years} years</span>
                          <span>🎯 {job.experience_level}</span>
                        </div>

                        {/* Required Skills Chips */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(job.required_skills || []).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-[11px] font-medium bg-slate-800 text-slate-300 rounded-md border border-slate-700/60"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectJob(job);
                            onClose();
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                            isActive
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                          }`}
                        >
                          {isActive ? 'Selected' : 'Select'}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${job.title}" and its screening records?`)) {
                              onDeleteJob(job.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Presets Row */}
              <div className="flex items-center gap-2 p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
                <span className="text-xs text-slate-300 font-medium shrink-0">Quick Templates:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => loadPreset('fullstack')}
                    className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-brand-300 rounded-lg border border-slate-700 transition"
                  >
                    + Full Stack Dev
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('ai')}
                    className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-brand-300 rounded-lg border border-slate-700 transition"
                  >
                    + AI / ML Engineer
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('frontend')}
                    className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-brand-300 rounded-lg border border-slate-700 transition"
                  >
                    + Lead Frontend
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Developer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Engineering"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={formData.experience_level}
                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Entry / Graduate (0-2 years)">Entry / Graduate (0-2 years)</option>
                    <option value="Mid-Level (2-4 years)">Mid-Level (2-4 years)</option>
                    <option value="Senior (4-6 years)">Senior (4-6 years)</option>
                    <option value="Lead / Staff (6+ years)">Lead / Staff (6+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Minimum Years of Experience Required
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={formData.min_experience_years}
                    onChange={(e) => setFormData({ ...formData, min_experience_years: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Job Description & Responsibilities *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste or write the job description details here (required skills will be auto-detected)..."
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Required Core Skills (Auto-detected from description, comma-separated)
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoDetectSkills}
                    className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    <Wand2 className="w-3 h-3" /> Auto-Detect Skills
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Java, Python, JavaScript, React, SQL, Git"
                  value={formData.required_skills}
                  onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Preferred / Nice-to-Have Skills (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. AWS, Docker, Kubernetes, GraphQL"
                  value={formData.preferred_skills}
                  onChange={(e) => setFormData({ ...formData, preferred_skills: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-md shadow-brand-500/20 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Create & Save Job'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
