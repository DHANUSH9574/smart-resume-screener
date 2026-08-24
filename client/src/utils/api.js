const API_BASE = '/api';

function getHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  const customKey = localStorage.getItem('smartresume_gemini_key');
  if (customKey) {
    headers['x-gemini-api-key'] = customKey;
  }
  return headers;
}

export const api = {
  // Jobs
  async getJobs() {
    const res = await fetch(`${API_BASE}/jobs`);
    const data = await res.json();
    return data.data || [];
  },

  async createJob(jobData) {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    return res.json();
  },

  async deleteJob(id) {
    const res = await fetch(`${API_BASE}/jobs/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Screening
  async screenResumes({ jobId, files = [], rawTexts = [] }) {
    const formData = new FormData();
    if (jobId) formData.append('jobId', jobId);

    files.forEach(file => {
      formData.append('resumes', file);
    });

    if (rawTexts.length > 0) {
      formData.append('rawTexts', JSON.stringify(rawTexts));
    }

    const res = await fetch(`${API_BASE}/screen`, {
      method: 'POST',
      headers: getHeaders(),
      body: formData
    });
    return res.json();
  },

  // Candidates & Leaderboard
  async getScreenings(jobId, filters = {}) {
    const params = new URLSearchParams({ jobId });
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.minScore) params.append('minScore', filters.minScore);
    if (filters.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/screenings?${params.toString()}`);
    const data = await res.json();
    return data.data || [];
  },

  async getScreeningDetail(id) {
    const res = await fetch(`${API_BASE}/screenings/${id}`);
    const data = await res.json();
    return data.data;
  },

  async updateScreeningStatus(id, status, notes) {
    const res = await fetch(`${API_BASE}/screenings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });
    return res.json();
  },

  async deleteScreening(id) {
    const res = await fetch(`${API_BASE}/screenings/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async clearScreeningsForJob(jobId) {
    const res = await fetch(`${API_BASE}/screenings/job/${jobId}`, { method: 'DELETE' });
    return res.json();
  },

  // Comparison
  async compareCandidates(ids) {
    const res = await fetch(`${API_BASE}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    const data = await res.json();
    return data.data || [];
  },

  // Custom AI Natural Language Prompt Query / Copilot
  async promptQuery({ prompt, jobId, candidateIds }) {
    try {
      const res = await fetch(`${API_BASE}/prompt-query`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ prompt, jobId, candidateIds })
      });
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Server error (${res.status}): ${errText || res.statusText}` };
      }
      return await res.json();
    } catch (err) {
      return { success: false, error: `Connection failed: ${err.message}. Ensure backend server is running on port 5000.` };
    }
  },

  // Export
  getExportUrl(jobId) {
    return `${API_BASE}/export/${jobId}`;
  }
};
