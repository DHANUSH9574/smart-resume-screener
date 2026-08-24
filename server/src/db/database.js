import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonDbFilePath = path.join(__dirname, '../../smartresume_db.json');

// Initialize in-memory / persistent JSON database
let memoryData = {
  jobs: [],
  resumes: [],
  screenings: []
};

// Load existing database if available
if (fs.existsSync(jsonDbFilePath)) {
  try {
    const raw = fs.readFileSync(jsonDbFilePath, 'utf8');
    memoryData = JSON.parse(raw);
    if (!memoryData.jobs) memoryData.jobs = [];
    if (!memoryData.resumes) memoryData.resumes = [];
    if (!memoryData.screenings) memoryData.screenings = [];
  } catch (err) {
    console.error('Error reading database file, starting with empty store:', err.message);
  }
} else {
  saveDb();
}

function saveDb() {
  try {
    fs.writeFileSync(jsonDbFilePath, JSON.stringify(memoryData, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing database to disk:', err.message);
  }
}

export const db = {
  // JOBS
  getJobs() {
    return (memoryData.jobs || []).map(j => ({
      ...j,
      required_skills: j.required_skills || [],
      preferred_skills: j.preferred_skills || []
    })).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  },

  getJobById(id) {
    const j = (memoryData.jobs || []).find(job => job.id === id);
    if (!j) return null;
    return {
      ...j,
      required_skills: j.required_skills || [],
      preferred_skills: j.preferred_skills || []
    };
  },

  createJob(job) {
    const existingIndex = memoryData.jobs.findIndex(j => j.id === job.id);
    const newJob = {
      ...job,
      department: job.department || 'Engineering',
      experience_level: job.experience_level || 'Mid-Level',
      min_experience_years: Number(job.min_experience_years) || 0,
      required_skills: job.required_skills || [],
      preferred_skills: job.preferred_skills || [],
      created_at: job.created_at || new Date().toISOString()
    };

    if (existingIndex >= 0) {
      memoryData.jobs[existingIndex] = newJob;
    } else {
      memoryData.jobs.push(newJob);
    }
    saveDb();
    return newJob;
  },

  deleteJob(id) {
    memoryData.screenings = (memoryData.screenings || []).filter(s => s.job_id !== id);
    memoryData.jobs = (memoryData.jobs || []).filter(j => j.id !== id);
    saveDb();
    return true;
  },

  // RESUMES
  getResumes() {
    return (memoryData.resumes || []).map(r => ({
      ...r,
      skills: r.skills || { technical: [], soft: [], tools: [] },
      experience: r.experience || [],
      education: r.education || [],
      certifications: r.certifications || []
    })).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  },

  getResumeById(id) {
    const r = (memoryData.resumes || []).find(res => res.id === id);
    if (!r) return null;
    return {
      ...r,
      skills: r.skills || { technical: [], soft: [], tools: [] },
      experience: r.experience || [],
      education: r.education || [],
      certifications: r.certifications || []
    };
  },

  createResume(resume) {
    // Check if resume with same email or filename already exists to prevent duplicate candidate records
    let existingIndex = -1;
    if (resume.email && resume.email.trim()) {
      existingIndex = memoryData.resumes.findIndex(r => r.email && r.email.toLowerCase() === resume.email.toLowerCase());
    }
    if (existingIndex < 0 && resume.filename && resume.filename !== 'resume.pdf') {
      existingIndex = memoryData.resumes.findIndex(r => r.filename === resume.filename);
    }
    if (existingIndex < 0 && resume.id) {
      existingIndex = memoryData.resumes.findIndex(r => r.id === resume.id);
    }

    const assignedId = existingIndex >= 0 ? memoryData.resumes[existingIndex].id : (resume.id || `res-${Math.random().toString(36).substring(2, 10)}`);

    const newResume = {
      ...resume,
      id: assignedId,
      email: resume.email || '',
      phone: resume.phone || '',
      location: resume.location || '',
      linkedin: resume.linkedin || '',
      portfolio: resume.portfolio || '',
      summary: resume.summary || '',
      skills: resume.skills || { technical: [], soft: [], tools: [] },
      experience: resume.experience || [],
      total_experience_years: Number(resume.total_experience_years) || 0,
      education: resume.education || [],
      certifications: resume.certifications || [],
      created_at: existingIndex >= 0 ? memoryData.resumes[existingIndex].created_at : (resume.created_at || new Date().toISOString())
    };

    if (existingIndex >= 0) {
      memoryData.resumes[existingIndex] = newResume;
    } else {
      memoryData.resumes.push(newResume);
    }
    saveDb();
    return newResume;
  },

  // SCREENINGS
  createScreening(screening) {
    const targetResume = memoryData.resumes.find(r => r.id === screening.resume_id);
    const targetEmail = targetResume?.email?.toLowerCase();
    const targetName = targetResume?.candidate_name?.toLowerCase();

    // Deduplicate: Remove any existing evaluation for the exact same job and candidate
    memoryData.screenings = (memoryData.screenings || []).filter(s => {
      if (s.job_id !== screening.job_id) return true;
      if (s.resume_id === screening.resume_id) return false;
      
      const sResume = memoryData.resumes.find(r => r.id === s.resume_id);
      if (targetEmail && sResume?.email?.toLowerCase() === targetEmail) return false;
      if (targetName && targetName !== 'candidate' && sResume?.candidate_name?.toLowerCase() === targetName) return false;
      
      return true;
    });

    const newScreening = {
      ...screening,
      overall_score: Number(screening.overall_score) || 0,
      technical_score: Number(screening.technical_score) || 0,
      experience_score: Number(screening.experience_score) || 0,
      education_score: Number(screening.education_score) || 0,
      matched_skills: screening.matched_skills || [],
      missing_skills: screening.missing_skills || [],
      strengths: screening.strengths || [],
      gaps: screening.gaps || [],
      interview_questions: screening.interview_questions || [],
      status: screening.status || 'Under Review',
      recruiter_notes: screening.recruiter_notes || '',
      created_at: new Date().toISOString()
    };

    memoryData.screenings.push(newScreening);
    saveDb();
    return this.getScreeningById(newScreening.id);
  },

  getScreeningById(id) {
    const s = (memoryData.screenings || []).find(sc => sc.id === id);
    if (!s) return null;
    const r = (memoryData.resumes || []).find(res => res.id === s.resume_id) || {};
    const j = (memoryData.jobs || []).find(jb => jb.id === s.job_id) || {};

    return {
      ...s,
      candidate_name: r.candidate_name || 'Candidate',
      email: r.email || '',
      phone: r.phone || '',
      location: r.location || '',
      linkedin: r.linkedin || '',
      portfolio: r.portfolio || '',
      candidate_summary: r.summary || '',
      skills: r.skills || { technical: [], soft: [], tools: [] },
      experience: r.experience || [],
      total_experience_years: r.total_experience_years || 0,
      education: r.education || [],
      certifications: r.certifications || [],
      filename: r.filename || 'resume.pdf',
      raw_text: r.raw_text || '',
      job_title: j.title || 'Position',
      job_department: j.department || 'Engineering',
      job_level: j.experience_level || 'Mid-Level',
      job_required_skills: j.required_skills || []
    };
  },

  getScreeningsByJob(jobId) {
    const matched = (memoryData.screenings || []).filter(s => s.job_id === jobId);
    
    // Additional safeguard: ensure unique candidates in result list
    const seenEmails = new Set();
    const seenNames = new Set();
    const uniqueList = [];

    for (const s of matched) {
      const r = (memoryData.resumes || []).find(res => res.id === s.resume_id) || {};
      const emailKey = r.email?.toLowerCase();
      const nameKey = r.candidate_name?.toLowerCase();

      if (emailKey && seenEmails.has(emailKey)) continue;
      if (nameKey && nameKey !== 'candidate' && seenNames.has(nameKey)) continue;

      if (emailKey) seenEmails.add(emailKey);
      if (nameKey && nameKey !== 'candidate') seenNames.add(nameKey);

      uniqueList.push({
        ...s,
        candidate_name: r.candidate_name || 'Candidate',
        email: r.email || '',
        phone: r.phone || '',
        location: r.location || '',
        linkedin: r.linkedin || '',
        portfolio: r.portfolio || '',
        candidate_summary: r.summary || '',
        skills: r.skills || { technical: [], soft: [], tools: [] },
        experience: r.experience || [],
        total_experience_years: r.total_experience_years || 0,
        education: r.education || [],
        certifications: r.certifications || [],
        filename: r.filename || 'resume.pdf'
      });
    }

    return uniqueList.sort((a, b) => b.overall_score - a.overall_score);
  },

  updateScreeningStatus(id, status, notes) {
    const s = (memoryData.screenings || []).find(sc => sc.id === id);
    if (s) {
      if (status !== undefined) s.status = status;
      if (notes !== undefined) s.recruiter_notes = notes;
      saveDb();
    }
    return this.getScreeningById(id);
  },

  deleteScreening(id) {
    memoryData.screenings = (memoryData.screenings || []).filter(s => s.id !== id);
    saveDb();
    return true;
  },

  deleteScreeningsByJob(jobId) {
    memoryData.screenings = (memoryData.screenings || []).filter(s => s.job_id !== jobId);
    saveDb();
    return true;
  }
};
