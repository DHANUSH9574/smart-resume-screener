# 🚀 SmartResume AI - Intelligent Resume Screener & Candidate Matcher

Demo video link : https://drive.google.com/file/d/1-AwtlR8QMj7df4eMH8IbwsaWnVxOAtAE/view?usp=drive_link

[![Node.js Version](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS%203.4-38B2AC.svg)](https://tailwindcss.com/)
[![Gemini 2.5 Flash](https://img.shields.io/badge/LLM-Gemini%202.5%20%2F%203.7%20Flash-4285F4.svg)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An intelligent recruitment screening platform that automatically parses multi-format resumes (**PDF, DOCX, TXT**), extracts structured candidate data, and performs deep LLM semantic matching against target Job Descriptions. The platform generates an objective **0–100% match score**, **matched vs. missing skill matrices**, **recruiter justification narratives**, and **tailored interview questions**.

---

## 📑 Table of Contents
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [LLM Prompt Engineering & Guidance](#-llm-prompt-engineering--guidance)
- [Database Schema](#-database-schema)
- [REST API Reference](#-rest-api-reference)
- [Getting Started](#-getting-started)
- [Sample Testing & Demonstration](#-sample-testing--demonstration)
- [Evaluation Criteria & Scoring Engine](#-evaluation-criteria--scoring-engine)

---

## ✨ Key Features

1. **Multi-Format Resume Ingestion**:
   - Parses `.pdf` (via `pdf-parse`), `.docx` (via `mammoth`), `.txt`, `.md`, and direct text paste.
   - Batch drag-and-drop file upload with live progress animation.

2. **Structured LLM Extraction**:
   - Converts unstructured document text into structured JSON (Candidate Name, Contact, Skills categorized by Technical/Tools/Soft, Work Experience timeline, Education, and Certifications).

3. **Semantic Fit Scoring & LLM Justification**:
   - Evaluates multi-factor alignment: Technical Skills (50%), Experience Relevance (35%), Education Fit (15%).
   - Generates 2-3 paragraph recruiter justification explaining why the candidate was rated at their score.
   - Produces tailored interview questions with ideal answer signals to probe potential gaps.

4. **Executive Recruiter Dashboard**:
   - Ranked Candidate Leaderboard with glowing match gauges and fit tiers (`Strong Fit`, `Good Fit`, `Potential`, `Low Fit`).
   - Deep-Dive Candidate Dossier modal with skills radar, category progress bars, and PDF print/export.
   - Side-by-Side Comparison Matrix for 2–4 candidates.
   - Filter by score tier, status (`Shortlisted`, `Under Review`, `Interview Scheduled`, `Rejected`), and full-text search.
   - Export shortlisted candidate summaries as CSV.

5. **100% Offline & Hybrid Resilience**:
   - Out-of-the-box support for **Gemini 2.5 Flash / 3.7 Flash** (`@google/genai`) with in-UI or `.env` API key management.
   - Built-in heuristic NLP engine for instant zero-config testing even without an API key!

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 18 + Vite + TailwindCSS)"]
        UI_Nav[Navbar & Role Selector]
        UI_Upload[Batch Resume Dropzone (PDF/DOCX/TXT)]
        UI_Board[Ranked Candidate Leaderboard]
        UI_Dossier[AI Candidate Dossier Modal]
        UI_Matrix[Side-by-Side Comparison Matrix]
        UI_Export[CSV / PDF Exporter]
    end

    subgraph Backend ["Backend Server (Node.js + Express)"]
        Router[REST API Router /api/*]
        Parser[File Parser: pdf-parse & mammoth]
        LLM_Extract[LLM Resume Extractor]
        LLM_Match[LLM Semantic Matcher]
        DB[(Persistent SQLite / JSON Database)]
    end

    subgraph AI_Engine ["AI & LLM Services"]
        Gemini[Google Gemini 2.5/3.7 Flash]
        Heuristic[NLP Heuristic Fallback Engine]
    end

    UI_Upload -->|Upload Files + Select JD| Router
    Router --> Parser
    Parser --> LLM_Extract
    LLM_Extract -->|Extract Profile| Gemini
    LLM_Extract -->|Fallback| Heuristic
    LLM_Extract --> LLM_Match
    LLM_Match -->|Compute Semantic Fit| Gemini
    LLM_Match -->|Fallback| Heuristic
    LLM_Match --> DB
    DB --> Router
    Router --> UI_Board
    Router --> UI_Dossier
    Router --> UI_Matrix
```

---

## 🧠 LLM Prompt Engineering & Guidance

The application employs structured prompt engineering with strict JSON output schemas:

### 1. Resume Structured Profile Extraction Prompt
```
You are an expert HR data extraction AI. Extract structured data from the following resume text into valid JSON.
Be precise and thorough. Return ONLY valid raw JSON with no Markdown formatting.

Resume Text:
"""
{RESUME_RAW_TEXT}
"""

Schema:
{
  "candidate_name": "Full Name",
  "email": "email@example.com",
  "phone": "+1 234 567 8900",
  "location": "City, State/Country",
  "linkedin": "url",
  "portfolio": "url",
  "summary": "2-3 sentence summary",
  "skills": {
    "technical": ["Skill1", "Skill2"],
    "soft": ["Communication", "Leadership"],
    "tools": ["Git", "Docker"]
  },
  "experience": [
    {
      "role": "Title",
      "company": "Company",
      "duration": "2021 - Present",
      "years": 3.0,
      "highlights": ["Achievement 1", "Achievement 2"]
    }
  ],
  "total_experience_years": 5.0,
  "education": [
    { "degree": "B.S. Computer Science", "institution": "University", "year": "2020", "details": "Honors" }
  ],
  "certifications": ["AWS Certified Architect"]
}
```

### 2. Semantic Matching & Justification Prompt
```
You are a Principal Talent Acquisition AI & Senior Hiring Manager.
Evaluate the candidate's resume profile against the job description with high scrutiny and objective rigor.

---
### JOB DESCRIPTION:
Title: {JOB_TITLE}
Department: {DEPARTMENT}
Required Skills: {REQUIRED_SKILLS}
Preferred Skills: {PREFERRED_SKILLS}
Min Experience: {MIN_YEARS} years
Details: {JOB_DESCRIPTION_BODY}

---
### CANDIDATE RESUME PROFILE:
Name: {CANDIDATE_NAME}
Total Experience: {TOTAL_YEARS} years
Technical Skills: {TECHNICAL_SKILLS}
Work History: {EXPERIENCE_JSON}
Education: {EDUCATION_JSON}

---
### INSTRUCTIONS:
1. Compare technical skills, years of experience, relevant industry projects, and education against the job description.
2. Calculate Overall Match Score (0 to 100):
   - 85-100: "Strong Fit" (Exceeds or fully satisfies core requirements)
   - 70-84: "Good Fit" (Solid match with minor learning curve)
   - 50-69: "Potential" (Foundational skills with notable gaps)
   - 0-49: "Low Fit" (Significant mismatch or missing core prerequisites)
3. Calculate sub-scores for Technical (0-100), Experience (0-100), and Education (0-100).
4. Identify clearly matched skills vs missing/gap skills.
5. Provide 3-5 concrete strengths and 1-3 key gaps or risks.
6. Write a comprehensive 2-3 paragraph justification narrative explaining why the score was given.
7. Generate 3-4 customized, insightful interview questions specifically targeting this candidate's background and probing potential gaps.
```

---

## 🗄️ Database Schema

The system persists data using an ACID-compliant repository pattern (SQLite / file-backed persistent store):

| Table / Collection | Key Fields | Description |
|---|---|---|
| `jobs` | `id`, `title`, `department`, `experience_level`, `min_experience_years`, `required_skills`, `preferred_skills`, `description`, `created_at` | Stores all open job descriptions and requirements. |
| `resumes` | `id`, `filename`, `candidate_name`, `email`, `phone`, `location`, `linkedin`, `summary`, `skills_json`, `experience_json`, `total_experience_years`, `education_json`, `certifications_json`, `raw_text`, `created_at` | Stores parsed candidate profiles and raw documents. |
| `screenings` | `id`, `job_id`, `resume_id`, `overall_score`, `fit_tier`, `technical_score`, `experience_score`, `education_score`, `matched_skills`, `missing_skills`, `strengths`, `gaps`, `justification`, `interview_questions`, `status`, `recruiter_notes`, `created_at` | Stores LLM match evaluations, scores, justification, and recruiter notes. |

---

## 🔌 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/jobs` | Retrieve all job descriptions |
| `POST` | `/api/jobs` | Create a new job description |
| `DELETE` | `/api/jobs/:id` | Delete a job description and its evaluations |
| `POST` | `/api/screen` | Upload resumes (`multipart/form-data`) + match against `jobId` |
| `GET` | `/api/screenings?jobId=...` | List evaluated candidates with optional score/status filters |
| `GET` | `/api/screenings/:id` | Fetch full candidate AI Dossier |
| `PATCH` | `/api/screenings/:id/status` | Update candidate status (`Shortlisted`, `Rejected`, etc.) and notes |
| `POST` | `/api/compare` | Compare candidate array side-by-side (`{ ids: [...] }`) |
| `GET` | `/api/export/:jobId` | Export candidate shortlist as CSV file |
| `POST` | `/api/seed-samples` | 1-Click seed sample candidates for instant demo |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/smartresume.git
cd smartresume

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment (Optional)
Create a `.env` file in the `server/` directory:
```env
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key_here
```
*(Note: You can also enter your Gemini API key directly in the web UI under Settings!)*

### 3. Run the Application

In terminal 1 (Start Backend Server):
```bash
cd server
npm start
# Server runs on http://localhost:5000
```

In terminal 2 (Start Frontend Dev Server):
```bash
cd client
npm run dev
# App opens on http://localhost:5173
```

---

## 🧪 Sample Testing & Demonstration

1. **Instant 1-Click Demo**: Click the **"1-Click Demo"** button in the top navigation or **"Load Sample Candidates"** in the upload zone. It will load 5 diverse candidate profiles against the active job role and display ranked results immediately!
2. **Batch Upload**: Drag and drop the test files from the `sample_resumes/` folder (`.txt`, `.pdf`, `.docx`).
3. **Compare Candidates**: Check the boxes next to 2–4 candidates on the leaderboard and click **"Compare Selected"** to launch the side-by-side matrix!
4. **Export Report**: Click **"Export CSV"** to download the shortlist spreadsheet.

---

## 📊 Evaluation Criteria & Scoring Engine

| Fit Tier | Score Range | Definition | Action Recommendation |
|---|---|---|---|
| 🟢 **Strong Fit** | 85% – 100% | Satisfies all core requirements; strong domain background | Fast-track to technical interview |
| 🔵 **Good Fit** | 70% – 84% | Strong overlap with core skills; minor ramp-up expected | Proceed to phone screen |
| 🟡 **Potential** | 50% – 69% | Foundational skills present; notable experience or skill gaps | Review portfolio / second review |
| 🔴 **Low Fit** | 0% – 49% | Significant prerequisite skills missing or mismatched domain | Automated or polite rejection |
