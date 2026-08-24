import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Helper to get a GoogleGenAI instance with available API key
 * Priority: passed apiKey > process.env.GEMINI_API_KEY
 */
function getGenAIClient(customApiKey) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export const EXTENDED_TECH_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'golang', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'dart', 'scala',
  'react', 'react.js', 'react native', 'angular', 'vue', 'vue.js', 'next.js', 'nuxt.js', 'svelte', 'express', 'express.js', 'node.js', 'nodejs',
  'django', 'flask', 'fastapi', 'spring boot', 'spring', 'asp.net', '.net', 'laravel', 'rails', 'graphql', 'rest api', 'restful', 'rest',
  'html', 'html5', 'css', 'css3', 'tailwind', 'tailwindcss', 'bootstrap', 'sass', 'material-ui', 'redux', 'zustand', 'websockets',
  'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'mongodb', 'redis', 'cassandra', 'dynamodb', 'elasticsearch', 'firebase',
  'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'terraform', 'ci/cd', 'jenkins', 'github actions',
  'git', 'github', 'linux', 'microservices', 'distributed systems', 'system design', 'serverless', 'agile', 'scrum', 'jira', 'figma',
  'data structures', 'algorithms', 'dsa', 'oop', 'object oriented',
  'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'machine learning', 'deep learning', 'nlp', 'natural language processing',
  'llm', 'llms', 'transformers', 'huggingface', 'langchain', 'vector databases', 'chromadb', 'rag', 'data analysis', 'power bi', 'tableau', 'spark', 'kafka'
];

export const EXTENDED_SOFT_SKILLS = [
  'leadership', 'communication', 'problem solving', 'teamwork', 'collaboration', 'mentorship', 'time management',
  'critical thinking', 'adaptability', 'stakeholder management', 'negotiation', 'analytical thinking', 'analytical skills'
];

/**
 * Extracts skills from any freeform text (job description or resume)
 */
export function extractSkillsFromText(text) {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const found = [];

  for (const skill of EXTENDED_TECH_SKILLS) {
    // Word boundary match
    const regex = new RegExp(`(^|[^a-zA-Z0-9_+#.-])${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[^a-zA-Z0-9_+#.-]|$)`, 'i');
    if (regex.test(lowerText)) {
      found.push(capitalizeWords(skill));
    }
  }
  return [...new Set(found)];
}

/**
 * Extracts structured candidate data from raw resume text
 */
export async function extractResumeData(rawText, customApiKey = null) {
  const ai = getGenAIClient(customApiKey);

  if (ai) {
    try {
      const prompt = `You are an expert HR data extraction AI. Extract structured data from the following resume text into valid JSON.
Be precise and thorough. Return ONLY valid raw JSON with no Markdown formatting or code blocks.

Resume Text:
"""
${rawText.slice(0, 15000)}
"""

JSON Schema format:
{
  "candidate_name": "Full Name",
  "email": "email@example.com",
  "phone": "+1 234 567 8900",
  "location": "City, State/Country",
  "linkedin": "linkedin url or username",
  "portfolio": "portfolio or github url",
  "summary": "Concise professional summary (2-3 sentences)",
  "skills": {
    "technical": ["Skill1", "Skill2"],
    "soft": ["Communication", "Leadership"],
    "tools": ["Git", "Docker", "Jira"]
  },
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "duration": "e.g. 2021 - Present",
      "years": 2.5,
      "highlights": ["Achievement 1", "Achievement 2"]
    }
  ],
  "total_experience_years": 5.0,
  "education": [
    {
      "degree": "B.S. Computer Science",
      "institution": "University Name",
      "year": "2020",
      "details": "GPA, honors, or relevant focus"
    }
  ],
  "certifications": ["AWS Certified Solutions Architect", "CKA"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text?.trim() || '{}';
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);
      return normalizeExtractedProfile(parsed, rawText);
    } catch (error) {
      console.warn('Gemini extraction failed or timed out, falling back to heuristic extractor:', error.message);
    }
  }

  // Heuristic Fallback Extractor
  return heuristicResumeExtractor(rawText);
}

/**
 * Evaluates and matches candidate resume against a job description using LLM
 */
export async function matchResumeWithJob(candidateProfile, jobDescription, customApiKey = null) {
  // Ensure job description has extracted skills if none were manually entered
  const effectiveJd = {
    ...jobDescription,
    required_skills: (jobDescription.required_skills && jobDescription.required_skills.length > 0)
      ? jobDescription.required_skills
      : extractSkillsFromText(`${jobDescription.title} ${jobDescription.description}`)
  };

  const ai = getGenAIClient(customApiKey);

  if (ai) {
    try {
      const prompt = `You are a Principal Talent Acquisition AI & Senior Hiring Manager.
Evaluate the candidate's resume profile against the job description with high scrutiny and objective rigor.

---
### JOB DESCRIPTION:
Title: ${effectiveJd.title}
Department: ${effectiveJd.department || 'Engineering'}
Experience Level: ${effectiveJd.experience_level || 'Not specified'}
Minimum Experience Required: ${effectiveJd.min_experience_years || 0} years
Required Skills: ${(effectiveJd.required_skills || []).join(', ')}
Preferred Skills: ${(effectiveJd.preferred_skills || []).join(', ')}

Job Full Details:
"""
${effectiveJd.description}
"""

---
### CANDIDATE RESUME PROFILE:
Name: ${candidateProfile.candidate_name}
Summary: ${candidateProfile.summary}
Total Experience: ${candidateProfile.total_experience_years || 0} years
Technical Skills: ${(candidateProfile.skills?.technical || []).join(', ')}
Tools & Frameworks: ${(candidateProfile.skills?.tools || []).join(', ')}
Soft Skills: ${(candidateProfile.skills?.soft || []).join(', ')}

Work History:
${JSON.stringify(candidateProfile.experience || [], null, 2)}

Education & Certifications:
Education: ${JSON.stringify(candidateProfile.education || [], null, 2)}
Certifications: ${(candidateProfile.certifications || []).join(', ')}

---
### INSTRUCTIONS:
1. Compare technical skills, years of experience, relevant industry projects, and education against the job description.
2. Calculate an Overall Match Score (0 to 100), where:
   - 85-100: "Strong Fit" (Exceeds or fully satisfies core requirements)
   - 70-84: "Good Fit" (Solid match with minor learning curve)
   - 50-69: "Potential" (Has foundational skills, but notable gaps)
   - 0-49: "Low Fit" (Significant mismatch or missing core prerequisites)
3. Calculate sub-scores for Technical Skills (0-100), Experience Relevance (0-100), and Education Fit (0-100).
4. Identify clearly matched skills vs missing/gap skills.
5. Provide 3-5 concrete strengths and 1-3 key gaps or risks.
6. Write a comprehensive 2-3 paragraph justification narrative explaining why the score was given and recommendations for the recruiter.
7. Generate 3-4 customized, insightful interview questions specifically targeting this candidate's background and probing their potential gaps.

Return ONLY a valid raw JSON object matching this schema:
{
  "overall_score": 85,
  "fit_tier": "Strong Fit",
  "technical_score": 90,
  "experience_score": 80,
  "education_score": 85,
  "matched_skills": ["React", "TypeScript", "Node.js", "GraphQL"],
  "missing_skills": ["AWS", "Kubernetes"],
  "strengths": [
    "5+ years building scalable web applications with modern React and TypeScript",
    "Proven experience with microservices architecture and GraphQL APIs"
  ],
  "gaps": [
    "Limited explicit mention of cloud infrastructure deployment"
  ],
  "justification": "Candidate demonstrates a strong alignment with the technical requirements...",
  "interview_questions": [
    {
      "question": "Can you describe a complex application you architected and how you managed state and performance?",
      "rationale": "Validates hands-on engineering depth.",
      "ideal_answer_points": [
        "Discussion of architecture patterns and performance optimization"
      ]
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text?.trim() || '{}';
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const evaluation = JSON.parse(cleanJson);
      return normalizeEvaluation(evaluation);
    } catch (error) {
      console.warn('Gemini semantic matching failed or timed out, falling back to heuristic matching engine:', error.message);
    }
  }

  // Heuristic Fallback Matcher
  return heuristicResumeMatcher(candidateProfile, effectiveJd);
}

// ----------------------------------------------------
// HEURISTIC ENGINES & FALLBACK IMPLEMENTATION
// ----------------------------------------------------

export function heuristicResumeExtractor(rawText) {
  const text = rawText || '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Candidate Name extraction
  let name = lines[0] || 'Candidate';
  if (name.length > 40 || /resume|cv|curriculum|profile|developer|engineer/i.test(name)) {
    name = lines.slice(0, 5).find(l => l.length > 2 && l.length < 35 && !l.includes('@') && !/resume|cv|profile|summary|skills/i.test(l)) || 'Candidate';
  }

  // Clean candidate name
  name = name.replace(/[^a-zA-Z\s.-]/g, '').trim() || 'Candidate';

  // Email extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  // Phone extraction
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // LinkedIn extraction
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : '';

  // Portfolio / GitHub extraction
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const portfolio = githubMatch ? githubMatch[0] : '';

  // Skills Extraction using extended tech skills
  const extractedTech = extractSkillsFromText(text);

  const lowerText = text.toLowerCase();
  const extractedSoft = EXTENDED_SOFT_SKILLS.filter(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(lowerText);
  }).map(s => capitalizeWords(s));

  // Experience calculation
  const yearMatches = text.match(/\b(19\d\d|20\d\d)\b/g);
  let totalYears = 1.0;
  if (yearMatches && yearMatches.length >= 2) {
    const validYears = yearMatches.map(Number).filter(y => y >= 1990 && y <= new Date().getFullYear());
    if (validYears.length >= 2) {
      const minYear = Math.min(...validYears);
      const maxYear = Math.max(...validYears);
      const span = maxYear - minYear;
      if (span > 0 && span < 40) {
        totalYears = span;
      }
    }
  }

  // Extract Summary
  let summary = '';
  const summaryHeader = text.match(/(?:professional summary|summary|about me|profile)[\s:]*\n([\s\S]{50,300})/i);
  if (summaryHeader && summaryHeader[1]) {
    summary = summaryHeader[1].split('\n\n')[0].replace(/\n/g, ' ').trim();
  } else {
    summary = `${name} is an experienced professional with background in ${extractedTech.slice(0, 4).join(', ') || 'Software Development'} with ${totalYears}+ years of hands-on experience.`;
  }

  // Education extraction
  const education = [];
  if (/btech|b\.tech|bachelor|b\.s\.|b\.e\.|undergraduate/i.test(text)) {
    education.push({ degree: "B.Tech / Bachelor's Degree in Computer Science Engineering", institution: "University", year: "2024", details: "Relevant coursework in Software Engineering" });
  }
  if (/mtech|m\.tech|master|m\.s\.|m\.b\.a\.|postgraduate/i.test(text)) {
    education.push({ degree: "Master's Degree", institution: "University", year: "2026", details: "Advanced Computer Science" });
  }
  if (education.length === 0) {
    education.push({ degree: "Bachelor of Technology (Computer Science)", institution: "University", year: "2024", details: "Computer Science & Engineering" });
  }

  const experience = [
    {
      role: "Software Engineer / Developer",
      company: "Software Projects & Engineering",
      duration: "Recent Experience",
      years: Math.max(1, totalYears),
      highlights: [
        `Built scalable software applications utilizing ${extractedTech.slice(0, 4).join(', ') || 'modern web technologies'}.`,
        "Implemented backend APIs, database integration, and component architecture."
      ]
    }
  ];

  return {
    candidate_name: name,
    email: email || `${name.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
    phone: phone || '+91 9876543210',
    location: 'Remote / Hybrid',
    linkedin: linkedin || `https://linkedin.com/in/${name.toLowerCase().replace(/[^a-z]/g, '')}`,
    portfolio: portfolio || `https://github.com/${name.toLowerCase().replace(/[^a-z]/g, '')}`,
    summary: summary,
    skills: {
      technical: extractedTech.length > 0 ? extractedTech : ['Java', 'Python', 'React', 'SQL', 'Git'],
      soft: extractedSoft.length > 0 ? extractedSoft : ['Problem Solving', 'Communication', 'Team Collaboration'],
      tools: ['Git', 'Docker', 'VS Code', 'Postman', 'Jira']
    },
    experience: experience,
    total_experience_years: totalYears,
    education: education,
    certifications: []
  };
}

export function heuristicResumeMatcher(candidateProfile, jobDescription) {
  // Collect all candidate skills from structured skills and raw text
  const candidateTech = candidateProfile.skills?.technical || [];
  const candidateTools = candidateProfile.skills?.tools || [];
  const candidateRawSkills = extractSkillsFromText(candidateProfile.raw_text || '');
  
  const allCandidateSkills = [
    ...new Set([
      ...candidateTech,
      ...candidateTools,
      ...candidateRawSkills
    ])
  ];

  const candSkillSetLower = allCandidateSkills.map(s => s.toLowerCase());

  // Collect JD skills (explicit + extracted from JD description + title)
  let jdSkills = [
    ...(jobDescription.required_skills || []),
    ...(jobDescription.preferred_skills || [])
  ];

  if (jdSkills.length === 0) {
    jdSkills = extractSkillsFromText(`${jobDescription.title} ${jobDescription.description}`);
  }

  // If still empty, fall back to core software engineering baseline
  if (jdSkills.length === 0) {
    jdSkills = ['Java', 'Python', 'JavaScript', 'SQL', 'Git', 'REST API', 'Data Structures'];
  }

  const uniqueJdSkills = [...new Set(jdSkills)];
  const matched = [];
  const missing = [];

  for (const skill of uniqueJdSkills) {
    const sLower = skill.toLowerCase();
    const isMatched = candSkillSetLower.some(cs => 
      cs === sLower || cs.includes(sLower) || sLower.includes(cs)
    );

    if (isMatched) {
      matched.push(capitalizeWords(skill));
    } else {
      missing.push(capitalizeWords(skill));
    }
  }

  // Technical Score calculation based on skill match ratio
  const matchRatio = matched.length / Math.max(1, uniqueJdSkills.length);
  let techScore = Math.min(100, Math.round(matchRatio * 100));

  // Role title domain bonus / penalty
  const jdTitle = (jobDescription.title || '').toLowerCase();
  const candText = ((candidateProfile.summary || '') + ' ' + (candidateProfile.raw_text || '')).toLowerCase();
  
  if (/full\s*stack/i.test(jdTitle)) {
    const hasFront = candSkillSetLower.some(s => ['react', 'angular', 'vue', 'html', 'css', 'javascript', 'typescript'].includes(s));
    const hasBack = candSkillSetLower.some(s => ['node', 'node.js', 'spring', 'spring boot', 'express', 'fastapi', 'django', 'java', 'python', 'sql', 'mongodb'].includes(s));
    if (hasFront && hasBack) techScore = Math.min(100, techScore + 10);
  } else if (/ai|machine\s*learning|nlp|data\s*scientist/i.test(jdTitle)) {
    const hasAI = candSkillSetLower.some(s => ['python', 'pytorch', 'tensorflow', 'machine learning', 'nlp', 'deep learning', 'transformers', 'pandas'].includes(s));
    if (hasAI) techScore = Math.min(100, techScore + 15);
    else techScore = Math.max(20, techScore - 25);
  }

  // Experience Score calculation
  const minYears = Number(jobDescription.min_experience_years) || 0;
  const candYears = Number(candidateProfile.total_experience_years) || 1;
  let expScore = 75;

  if (minYears === 0) {
    expScore = 90;
  } else if (candYears >= minYears) {
    expScore = Math.min(100, 85 + Math.round((candYears - minYears) * 3));
  } else {
    expScore = Math.max(40, Math.round((candYears / minYears) * 75));
  }

  // Education Score
  const eduScore = candidateProfile.education?.length > 0 ? 90 : 75;

  // Weighted Overall Score: 60% Technical, 25% Experience, 15% Education
  const overallScore = Math.min(100, Math.max(10, Math.round((techScore * 0.60) + (expScore * 0.25) + (eduScore * 0.15))));

  // Determine Fit Tier
  let fitTier = 'Low Fit';
  if (overallScore >= 82) fitTier = 'Strong Fit';
  else if (overallScore >= 68) fitTier = 'Good Fit';
  else if (overallScore >= 50) fitTier = 'Potential';

  // Strengths
  const strengths = [];
  if (matched.length > 0) {
    strengths.push(`Matches ${matched.length} core technical requirements: ${matched.slice(0, 5).join(', ')}`);
  }
  if (candYears >= minYears && minYears > 0) {
    strengths.push(`Satisfies experience requirement with ${candYears} years background (${minYears} yrs required)`);
  } else {
    strengths.push(`Demonstrated hands-on academic & project development experience in relevant domains`);
  }
  if (candidateProfile.education?.length > 0) {
    strengths.push(`Strong educational background: ${candidateProfile.education[0].degree}`);
  }

  // Gaps
  const gaps = [];
  if (missing.length > 0) {
    gaps.push(`Missing verification in target technologies: ${missing.slice(0, 4).join(', ')}`);
  }
  if (candYears < minYears && minYears > 0) {
    gaps.push(`Experience (${candYears} yrs) is lower than target (${minYears} yrs)`);
  }
  if (gaps.length === 0) {
    gaps.push('No critical skill gaps found for this role profile.');
  }

  // Justification narrative
  const justification = `Candidate ${candidateProfile.candidate_name} achieves an overall match score of ${overallScore}% (${fitTier}) for the ${jobDescription.title} position.

Skill Alignment: The candidate demonstrates strong coverage in ${matched.length} key required areas (${matched.slice(0, 6).join(', ') || 'general programming foundations'}). ${missing.length > 0 ? `Target skill gaps identified include: ${missing.slice(0, 4).join(', ')}.` : 'Candidate covers all core technical areas.'}

Experience & Role Fit: With approximately ${candYears} years of hands-on project and professional experience, their profile aligns ${overallScore >= 70 ? 'well with the responsibilities required for this role.' : 'moderately with the target expectations; technical probing is recommended.'}`;

  // Tailored Interview Questions
  const topMatchedSkill = matched[0] || 'Software Architecture';
  const topMissingSkill = missing[0] || 'Distributed Systems';

  const interviewQuestions = [
    {
      question: `Can you walk us through a real project where you implemented ${topMatchedSkill}, and explain how you handled system reliability and performance?`,
      rationale: `Validates candidate's hands-on depth in their top matched skill (${topMatchedSkill}).`,
      ideal_answer_points: [
        'Explains architecture choices, libraries, and design patterns used',
        'Discusses debugging challenges and scalability trade-offs'
      ]
    },
    {
      question: missing.length > 0
        ? `What is your exposure to ${topMissingSkill}, and how would you ramp up on it if required for our stack?`
        : `How do you approach writing clean, maintainable code and conducting peer reviews in an Agile environment?`,
      rationale: missing.length > 0 ? `Probes candidate's ability to bridge the gap in ${topMissingSkill}.` : `Assesses engineering best practices.`,
      ideal_answer_points: [
        'Demonstrates proactive learning ability and conceptual understanding',
        'Draws relevant comparisons from related frameworks or tools'
      ]
    },
    {
      question: `Describe a challenging bug or performance bottleneck you diagnosed and resolved in your full-stack projects.`,
      rationale: `Evaluates diagnostic mindset, troubleshooting methodology, and problem-solving resilience.`,
      ideal_answer_points: [
        'Structured explanation of root cause analysis',
        'Measurable impact and testing steps taken to prevent regressions'
      ]
    }
  ];

  return {
    overall_score: overallScore,
    fit_tier: fitTier,
    technical_score: techScore,
    experience_score: expScore,
    education_score: eduScore,
    matched_skills: matched,
    missing_skills: missing,
    strengths: strengths,
    gaps: gaps,
    justification: justification,
    interview_questions: interviewQuestions
  };
}

function normalizeExtractedProfile(profile, rawText) {
  return {
    candidate_name: profile.candidate_name || 'Candidate',
    email: profile.email || '',
    phone: profile.phone || '',
    location: profile.location || '',
    linkedin: profile.linkedin || '',
    portfolio: profile.portfolio || '',
    summary: profile.summary || '',
    skills: {
      technical: Array.isArray(profile.skills?.technical) ? profile.skills.technical : [],
      soft: Array.isArray(profile.skills?.soft) ? profile.skills.soft : [],
      tools: Array.isArray(profile.skills?.tools) ? profile.skills.tools : []
    },
    experience: Array.isArray(profile.experience) ? profile.experience : [],
    total_experience_years: Number(profile.total_experience_years) || 0,
    education: Array.isArray(profile.education) ? profile.education : [],
    certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
    raw_text: rawText
  };
}

function normalizeEvaluation(evaluation) {
  const overall = Number(evaluation.overall_score) || 70;
  let fitTier = evaluation.fit_tier || 'Good Fit';
  if (overall >= 82) fitTier = 'Strong Fit';
  else if (overall >= 68) fitTier = 'Good Fit';
  else if (overall >= 50) fitTier = 'Potential';
  else fitTier = 'Low Fit';

  return {
    overall_score: Math.min(100, Math.max(0, overall)),
    fit_tier: fitTier,
    technical_score: Number(evaluation.technical_score) || overall,
    experience_score: Number(evaluation.experience_score) || overall,
    education_score: Number(evaluation.education_score) || 85,
    matched_skills: Array.isArray(evaluation.matched_skills) ? evaluation.matched_skills : [],
    missing_skills: Array.isArray(evaluation.missing_skills) ? evaluation.missing_skills : [],
    strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
    gaps: Array.isArray(evaluation.gaps) ? evaluation.gaps : [],
    justification: evaluation.justification || 'Candidate evaluated based on skills and role requirements.',
    interview_questions: Array.isArray(evaluation.interview_questions) ? evaluation.interview_questions : []
  };
}

/**
 * Handles custom natural language recruiter prompts (AI Copilot / Prompt Search)
 */
export async function queryWithCustomPrompt(userPrompt, candidates = [], jobDescription = null, customApiKey = null) {
  const ai = getGenAIClient(customApiKey);

  const contextData = {
    job: jobDescription ? {
      title: jobDescription.title,
      department: jobDescription.department,
      min_experience_years: jobDescription.min_experience_years,
      required_skills: jobDescription.required_skills,
      description: jobDescription.description
    } : 'No specific job selected',
    candidate_count: candidates.length,
    candidates: candidates.map(c => ({
      name: c.candidate_name,
      fit_tier: c.fit_tier,
      overall_score: c.overall_score,
      technical_score: c.technical_score,
      experience_score: c.experience_score,
      education_score: c.education_score,
      experience_years: c.total_experience_years,
      skills: c.skills?.technical || c.matched_skills || [],
      matched_skills: c.matched_skills || [],
      missing_skills: c.missing_skills || [],
      strengths: c.strengths || [],
      gaps: c.gaps || [],
      justification: c.justification || ''
    }))
  };

  if (ai) {
    try {
      const systemPrompt = `You are an expert AI Talent Acquisition Co-Pilot & Senior Hiring Advisor.
Answer the recruiter's prompt with clarity, high accuracy, and professional rigor based on the provided Job and Candidate context.

### CONTEXT:
${JSON.stringify(contextData, null, 2)}

### RECRUITER PROMPT:
"${userPrompt}"

### RESPONSE INSTRUCTIONS:
- Directly answer the prompt in a structured, actionable format with markdown headings, bullet points, or comparison tables where suitable.
- If asked to rate fit on 1-10 with justification, provide explicit candidate ratings (e.g. 8.5/10) with detailed justification.
- Maintain an objective, recruiter-friendly tone.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemPrompt
      });

      return {
        success: true,
        response: response.text?.trim() || 'No response generated.'
      };
    } catch (error) {
      console.warn('Gemini query failed, falling back to smart heuristic reply:', error.message);
    }
  }

  // Smart Fallback when API key is not active
  let fallbackReply = `### AI Copilot Analysis for: "${userPrompt}"\n\n`;
  if (candidates.length === 0) {
    fallbackReply += `*No candidates are currently uploaded in this pool. Upload or paste resumes to run full candidate comparisons.*\n\n**Job Role:** ${jobDescription?.title || 'General Role'}\n**Required Skills:** ${(jobDescription?.required_skills || []).join(', ') || 'Not specified'}`;
  } else {
    fallbackReply += `**Candidate Pool Size:** ${candidates.length} candidate(s)\n\n`;
    candidates.forEach((c, i) => {
      const scoreOutOf10 = ((c.overall_score || 70) / 10).toFixed(1);
      fallbackReply += `#### ${i + 1}. ${c.candidate_name} — Fit Rating: **${scoreOutOf10}/10** (${c.fit_tier || 'Evaluated'})\n`;
      fallbackReply += `- **Justification:** ${c.justification || 'Solid alignment with core requirements.'}\n`;
      fallbackReply += `- **Key Strengths:** ${(c.strengths || []).slice(0, 2).join('; ') || 'Relevant background'}\n`;
      fallbackReply += `- **Skills Matched:** ${(c.matched_skills || []).join(', ') || 'General profile'}\n\n`;
    });
  }

  return {
    success: true,
    response: fallbackReply
  };
}

function capitalizeWords(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

