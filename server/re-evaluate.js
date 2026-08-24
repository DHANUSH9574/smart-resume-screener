import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractSkillsFromText, heuristicResumeMatcher, heuristicResumeExtractor } from './src/services/llm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'smartresume_db.json');

const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Update jobs to ensure required_skills are populated from description
for (const job of data.jobs) {
  if (!job.required_skills || job.required_skills.length === 0) {
    job.required_skills = extractSkillsFromText(`${job.title} ${job.description}`);
  }
}

// 2. Update resumes to ensure skills are properly extracted
for (const resume of data.resumes) {
  const extracted = heuristicResumeExtractor(resume.raw_text);
  resume.skills = extracted.skills;
  resume.candidate_name = extracted.candidate_name || resume.candidate_name;
  resume.total_experience_years = extracted.total_experience_years || resume.total_experience_years;
}

// 3. Re-evaluate all screenings
const newScreenings = [];
for (const screening of data.screenings) {
  const job = data.jobs.find(j => j.id === screening.job_id);
  const resume = data.resumes.find(r => r.id === screening.resume_id);
  if (!job || !resume) continue;

  const evaluation = heuristicResumeMatcher(resume, job);
  
  newScreenings.push({
    ...screening,
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
    status: evaluation.overall_score >= 80 ? 'Shortlisted' : (evaluation.overall_score >= 55 ? 'Under Review' : 'Rejected')
  });
}

data.screenings = newScreenings;
fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');

console.log('✅ Successfully updated and re-evaluated existing candidate screenings:');
for (const s of newScreenings) {
  const job = data.jobs.find(j => j.id === s.job_id);
  const resume = data.resumes.find(r => r.id === s.resume_id);
  console.log(`- ${resume?.candidate_name} vs "${job?.title}": Score: ${s.overall_score}% (${s.fit_tier}) | Matched: ${s.matched_skills.length} skills`);
}
