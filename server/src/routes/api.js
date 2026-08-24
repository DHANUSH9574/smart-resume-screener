import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { extractTextFromFile } from '../services/parser.js';
import { extractResumeData, matchResumeWithJob, extractSkillsFromText } from '../services/llm.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15 MB limit
});

// ----------------------------------------------------
// JOB DESCRIPTIONS
// ----------------------------------------------------

// List all jobs
router.get('/jobs', (req, res) => {
  try {
    const jobs = db.getJobs();
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get job by ID
router.get('/jobs/:id', (req, res) => {
  try {
    const job = db.getJobById(req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new Job Description
router.post('/jobs', (req, res) => {
  try {
    const { title, department, experience_level, min_experience_years, required_skills, preferred_skills, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and description are required' });
    }

    let parsedRequired = Array.isArray(required_skills) ? required_skills : (typeof required_skills === 'string' ? required_skills.split(',').map(s => s.trim()).filter(Boolean) : []);
    let parsedPreferred = Array.isArray(preferred_skills) ? preferred_skills : (typeof preferred_skills === 'string' ? preferred_skills.split(',').map(s => s.trim()).filter(Boolean) : []);

    // If no skills were manually entered, auto-extract skills from job description!
    if (parsedRequired.length === 0) {
      parsedRequired = extractSkillsFromText(`${title} ${description}`);
    }

    const newJob = db.createJob({
      id: `job-${uuidv4().slice(0, 8)}`,
      title,
      department: department || 'Engineering',
      experience_level: experience_level || 'Mid-Level',
      min_experience_years: Number(min_experience_years) || 0,
      required_skills: parsedRequired,
      preferred_skills: parsedPreferred,
      description,
      created_at: new Date().toISOString()
    });

    res.status(201).json({ success: true, data: newJob });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete Job
router.delete('/jobs/:id', (req, res) => {
  try {
    db.deleteJob(req.params.id);
    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// RESUME SCREENING & MATCHING ENGINE
// ----------------------------------------------------

// Screen uploaded files or pasted text against a Job Description
router.post('/screen', upload.array('resumes', 20), async (req, res) => {
  try {
    const { jobId, customJob, rawTexts, shortlistThreshold: thresholdStr } = req.body;
    const customApiKey = req.headers['x-gemini-api-key'] || req.body.apiKey || null;
    const shortlistThreshold = Number(thresholdStr) || 80;

    let targetJob = null;
    if (jobId) {
      targetJob = db.getJobById(jobId);
    }
    if (!targetJob && customJob) {
      const parsedJob = typeof customJob === 'string' ? JSON.parse(customJob) : customJob;
      let reqSkills = parsedJob.required_skills || [];
      if (reqSkills.length === 0) {
        reqSkills = extractSkillsFromText(`${parsedJob.title || ''} ${parsedJob.description || ''}`);
      }
      targetJob = db.createJob({
        id: `job-${uuidv4().slice(0, 8)}`,
        ...parsedJob,
        required_skills: reqSkills
      });
    }

    if (!targetJob) {
      const jobs = db.getJobs();
      targetJob = jobs[0] || null;
    }

    if (!targetJob) {
      return res.status(400).json({ success: false, error: 'No active job description found. Please create a job description first.' });
    }

    // Optional clear previous candidates for this role
    if (req.body.clearPrevious === 'true' || req.body.clearPrevious === true) {
      db.deleteScreeningsByJob(targetJob.id);
    }

    // Ensure targetJob has required_skills populated
    if (!targetJob.required_skills || targetJob.required_skills.length === 0) {
      targetJob.required_skills = extractSkillsFromText(`${targetJob.title} ${targetJob.description}`);
      db.createJob(targetJob); // update in db
    }

    const files = req.files || [];
    const textList = rawTexts ? (Array.isArray(rawTexts) ? rawTexts : JSON.parse(rawTexts || '[]')) : [];

    if (files.length === 0 && textList.length === 0) {
      return res.status(400).json({ success: false, error: 'No resume files or text content provided' });
    }

    const processedResults = [];

    // Process file uploads
    for (const file of files) {
      try {
        const rawText = await extractTextFromFile(file.buffer, file.originalname, file.mimetype);
        if (!rawText.trim()) continue;

        // Extract structured candidate profile via LLM/Heuristic
        const profile = await extractResumeData(rawText, customApiKey);

        // Save resume record
        const resumeRecord = db.createResume({
          id: `res-${uuidv4().slice(0, 8)}`,
          filename: file.originalname,
          candidate_name: profile.candidate_name,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          linkedin: profile.linkedin,
          portfolio: profile.portfolio,
          summary: profile.summary,
          skills: profile.skills,
          experience: profile.experience,
          total_experience_years: profile.total_experience_years,
          education: profile.education,
          certifications: profile.certifications,
          raw_text: rawText
        });

        // Compute Match & Semantic Evaluation
        const evaluation = await matchResumeWithJob(profile, targetJob, customApiKey);

        // Save screening record
        const screeningRecord = db.createScreening({
          id: `scr-${uuidv4().slice(0, 8)}`,
          job_id: targetJob.id,
          resume_id: resumeRecord.id,
          overall_score: evaluation.overall_score,
          fit_tier: evaluation.fit_tier,
          technical_score: evaluation.technical_score,
          experience_score: evaluation.experience_score,
          education_score: evaluation.education_score,
          matched_skills: evaluation.matched_skills,
          missing_skills: evaluation.missing_skills,
          strengths: evaluation.strengths,
          gaps: evaluation.gaps,
          justification: evaluation.justification,
          interview_questions: evaluation.interview_questions,
          status: evaluation.overall_score >= shortlistThreshold ? 'Shortlisted' : (evaluation.overall_score >= Math.max(40, shortlistThreshold - 30) ? 'Under Review' : 'Rejected'),
          recruiter_notes: ''
        });

        processedResults.push(screeningRecord);
      } catch (err) {
        console.error(`Error processing file ${file.originalname}:`, err);
      }
    }

    // Process raw texts (if any)
    for (let i = 0; i < textList.length; i++) {
      const item = textList[i];
      const rawText = typeof item === 'string' ? item : (item.text || JSON.stringify(item));
      const filename = (typeof item === 'object' && item.filename) ? item.filename : `Pasted_Resume_${i + 1}.txt`;

      try {
        const profile = await extractResumeData(rawText, customApiKey);
        const resumeRecord = db.createResume({
          id: `res-${uuidv4().slice(0, 8)}`,
          filename: filename,
          candidate_name: profile.candidate_name,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          linkedin: profile.linkedin,
          portfolio: profile.portfolio,
          summary: profile.summary,
          skills: profile.skills,
          experience: profile.experience,
          total_experience_years: profile.total_experience_years,
          education: profile.education,
          certifications: profile.certifications,
          raw_text: rawText
        });

        const evaluation = await matchResumeWithJob(profile, targetJob, customApiKey);

        const screeningRecord = db.createScreening({
          id: `scr-${uuidv4().slice(0, 8)}`,
          job_id: targetJob.id,
          resume_id: resumeRecord.id,
          overall_score: evaluation.overall_score,
          fit_tier: evaluation.fit_tier,
          technical_score: evaluation.technical_score,
          experience_score: evaluation.experience_score,
          education_score: evaluation.education_score,
          matched_skills: evaluation.matched_skills,
          missing_skills: evaluation.missing_skills,
          strengths: evaluation.strengths,
          gaps: evaluation.gaps,
          justification: evaluation.justification,
          interview_questions: evaluation.interview_questions,
          status: evaluation.overall_score >= shortlistThreshold ? 'Shortlisted' : (evaluation.overall_score >= Math.max(40, shortlistThreshold - 30) ? 'Under Review' : 'Rejected'),
          recruiter_notes: ''
        });

        processedResults.push(screeningRecord);
      } catch (err) {
        console.error(`Error processing raw text item ${i}:`, err);
      }
    }

    res.json({
      success: true,
      job: targetJob,
      count: processedResults.length,
      data: processedResults
    });
  } catch (error) {
    console.error('Screening API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// CANDIDATE SCREENINGS & LEADERBOARD
// ----------------------------------------------------

// Get screenings for a specific job
router.get('/screenings', (req, res) => {
  try {
    const { jobId, status, minScore, search } = req.query;
    if (!jobId) {
      return res.status(400).json({ success: false, error: 'jobId query parameter is required' });
    }

    let results = db.getScreeningsByJob(jobId);

    if (status && status !== 'All') {
      results = results.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }

    if (minScore) {
      results = results.filter(r => r.overall_score >= Number(minScore));
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(r => 
        (r.candidate_name && r.candidate_name.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.matched_skills && r.matched_skills.some(s => s.toLowerCase().includes(q))) ||
        (r.candidate_summary && r.candidate_summary.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get full candidate dossier by screening ID
router.get('/screenings/:id', (req, res) => {
  try {
    const screening = db.getScreeningById(req.params.id);
    if (!screening) {
      return res.status(404).json({ success: false, error: 'Screening evaluation not found' });
    }
    res.json({ success: true, data: screening });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update candidate status and recruiter notes
router.patch('/screenings/:id/status', (req, res) => {
  try {
    const { status, notes } = req.body;
    const updated = db.updateScreeningStatus(req.params.id, status, notes);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Screening record not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete single screening record
router.delete('/screenings/:id', (req, res) => {
  try {
    db.deleteScreening(req.params.id);
    res.json({ success: true, message: 'Screening removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete all screenings for a job
router.delete('/screenings/job/:jobId', (req, res) => {
  try {
    db.deleteScreeningsByJob(req.params.jobId);
    res.json({ success: true, message: 'All candidate screenings for this job have been cleared' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// COMPARISON & ANALYTICS
// ----------------------------------------------------

// Compare multiple candidates side-by-side
router.post('/compare', (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'Array of screening ids is required' });
    }

    const candidates = ids.map(id => db.getScreeningById(id)).filter(Boolean);
    res.json({ success: true, count: candidates.length, data: candidates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export Shortlist CSV for a job
router.get('/export/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;
    const job = db.getJobById(jobId);
    const screenings = db.getScreeningsByJob(jobId);

    const headers = ['Candidate Name', 'Match Score (%)', 'Fit Tier', 'Technical Score', 'Experience Score', 'Education Score', 'Status', 'Email', 'Phone', 'Location', 'Matched Skills', 'Missing Skills', 'Recruiter Notes'];
    
    const rows = screenings.map(s => [
      `"${s.candidate_name || ''}"`,
      s.overall_score || 0,
      `"${s.fit_tier || ''}"`,
      s.technical_score || 0,
      s.experience_score || 0,
      s.education_score || 0,
      `"${s.status || ''}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.location || ''}"`,
      `"${(s.matched_skills || []).join('; ')}"`,
      `"${(s.missing_skills || []).join('; ')}"`,
      `"${(s.recruiter_notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="shortlist_${job ? job.title.replace(/[^a-z0-9]/gi, '_') : jobId}.csv"`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
