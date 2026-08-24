import { v4 as uuidv4 } from 'uuid';

export const SAMPLE_JOBS = [
  {
    id: 'job-fullstack-sr',
    title: 'Senior Full Stack Engineer (React & Node.js)',
    department: 'Core Product Engineering',
    experience_level: 'Senior (5+ years)',
    min_experience_years: 5,
    required_skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST API', 'Git'],
    preferred_skills: ['Docker', 'AWS', 'GraphQL', 'Redis', 'CI/CD', 'Next.js'],
    description: `We are looking for a Senior Full Stack Engineer to lead architecture and development of our customer-facing web applications.

Responsibilities:
- Design and build robust, high-performance web applications using React, TypeScript, and Node.js.
- Architect scalable RESTful and GraphQL APIs backed by PostgreSQL and Redis.
- Collaborate with product managers and designers to deliver delightful user experiences.
- Lead code reviews, mentor junior and mid-level engineers, and drive best engineering practices.
- Implement CI/CD automation and containerized deployments on cloud infrastructure (AWS/Docker).

Qualifications:
- 5+ years of professional software engineering experience with modern JavaScript/TypeScript.
- Deep expertise with React (hooks, state management, performance optimization) and Node.js microservices.
- Strong knowledge of relational databases (PostgreSQL/MySQL) and query optimization.
- Familiarity with cloud technologies (AWS/GCP), Docker, and modern CI/CD pipelines.
- Bachelor's or Master's degree in Computer Science or equivalent practical experience.`
  },
  {
    id: 'job-aiml-eng',
    title: 'AI / Machine Learning Engineer',
    department: 'Applied AI Research',
    experience_level: 'Mid to Senior (3+ years)',
    min_experience_years: 3,
    required_skills: ['Python', 'PyTorch', 'Machine Learning', 'LLMs', 'FastAPI', 'Docker'],
    preferred_skills: ['LangChain', 'Vector Databases', 'HuggingFace', 'MLOps', 'AWS', 'Kubernetes'],
    description: `Join our Applied AI team to develop, fine-tune, and deploy state-of-the-art Generative AI and LLM-powered applications.

Key Responsibilities:
- Build production-ready AI services leveraging modern LLMs, embeddings, and vector databases.
- Develop and evaluate retrieval-augmented generation (RAG) pipelines and multi-agent systems.
- Fine-tune foundation models (open source & proprietary) for domain-specific NLP tasks.
- Deploy scalable low-latency inference APIs using FastAPI, Docker, and Kubernetes.

Requirements:
- 3+ years experience developing and deploying machine learning or NLP systems in Python.
- Strong proficiency with PyTorch, Transformers, HuggingFace, and modern LLM frameworks.
- Experience with vector search databases (Pinecone, Weaviate, Qdrant, ChromaDB).
- Hands-on cloud engineering experience on AWS or GCP.`
  },
  {
    id: 'job-devops-cloud',
    title: 'Senior DevOps & Cloud Infrastructure Engineer',
    department: 'Platform & Reliability',
    experience_level: 'Senior (4+ years)',
    min_experience_years: 4,
    required_skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'Linux'],
    preferred_skills: ['Prometheus', 'Grafana', 'Python', 'Go', 'Helm', 'Security Compliance'],
    description: `We are seeking an experienced DevOps / Platform Engineer to oversee our cloud infrastructure, security, and developer tooling.

Responsibilities:
- Manage multi-region AWS cloud infrastructure using Terraform (Infrastructure as Code).
- Operate and scale production Kubernetes (EKS) clusters with high availability.
- Design resilient CI/CD pipelines using GitHub Actions to accelerate release velocity.
- Implement observability, monitoring, alerting, and log aggregation with Prometheus and Grafana.

Requirements:
- 4+ years in DevOps, SRE, or Cloud Infrastructure roles.
- Deep expertise in AWS services (EKS, RDS, VPC, IAM, CloudFront).
- Advanced skills in Kubernetes, Docker, Helm, and Terraform.`
  }
];

export const SAMPLE_RESUMES = [
  {
    filename: 'Elena_Rostova_Principal_Fullstack.pdf',
    candidate_name: 'Elena Rostova',
    email: 'elena.rostova.dev@example.com',
    phone: '+1 (415) 890-1234',
    location: 'San Francisco, CA (Remote)',
    linkedin: 'https://linkedin.com/in/elena-rostova-tech',
    portfolio: 'https://github.com/erostova',
    summary: 'Lead Full Stack Architect with 8+ years building mission-critical enterprise applications. Proven expertise in React, TypeScript, Node.js, distributed microservices, and AWS cloud systems. Passionate about code quality, system performance, and engineering leadership.',
    skills: {
      technical: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'GraphQL', 'Next.js', 'REST API', 'JavaScript', 'SQL', 'Redis'],
      tools: ['Docker', 'AWS', 'Kubernetes', 'Git', 'GitHub Actions', 'Jest', 'Postman', 'Webpack'],
      soft: ['Technical Leadership', 'System Architecture', 'Mentorship', 'Agile/Scrum', 'Cross-functional Collaboration']
    },
    experience: [
      {
        role: 'Staff / Lead Full Stack Engineer',
        company: 'Vanguard Cloud Technologies',
        duration: '2021 - Present',
        years: 4.5,
        highlights: [
          'Spearheaded the redesign of the core web platform using React, Next.js, and TypeScript, reducing page load times by 42%.',
          'Architected high-throughput Node.js microservices processing 15M+ daily requests with 99.99% uptime.',
          'Migrated legacy relational workflows to PostgreSQL and Redis caching, improving query response by 3x.',
          'Mentored a team of 9 engineers and instituted rigorous CI/CD testing standards.'
        ]
      },
      {
        role: 'Senior Software Engineer',
        company: 'Apex Digital Systems',
        duration: '2018 - 2021',
        years: 3.5,
        highlights: [
          'Built responsive web dashboards using React, Redux, and GraphQL APIs.',
          'Developed Node.js backend services integrated with AWS DynamoDB and S3.',
          'Collaborated with product designers to implement an internal component design system.'
        ]
      }
    ],
    total_experience_years: 8.0,
    education: [
      {
        degree: 'B.S. in Computer Science (Summa Cum Laude)',
        institution: 'University of California, Berkeley',
        year: '2018',
        details: 'Dean\'s Honor List, Specialization in Distributed Computing'
      }
    ],
    certifications: ['AWS Certified Solutions Architect – Associate', 'Node.js Application Developer (OpenJS)']
  },
  {
    filename: 'Marcus_Chen_Fullstack_Dev.pdf',
    candidate_name: 'Marcus Chen',
    email: 'marcus.chen.code@example.com',
    phone: '+1 (206) 456-7890',
    location: 'Seattle, WA',
    linkedin: 'https://linkedin.com/in/marcus-chen-dev',
    portfolio: 'https://github.com/mchen-dev',
    summary: 'Full Stack Software Engineer with 4 years of experience building modern web applications. Strong background in React, JavaScript, Node.js, and relational databases. Dedicated to building smooth UI and reliable APIs.',
    skills: {
      technical: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'PostgreSQL', 'Express', 'HTML5', 'CSS3', 'REST API'],
      tools: ['Git', 'Docker', 'Postman', 'VS Code', 'Jira', 'Webpack'],
      soft: ['Problem Solving', 'Communication', 'Teamwork', 'Quick Learner']
    },
    experience: [
      {
        role: 'Full Stack Software Engineer',
        company: 'Cascade Web Labs',
        duration: '2022 - Present',
        years: 3.0,
        highlights: [
          'Developed core features for SaaS platform using React, Node.js, and Express.',
          'Created RESTful endpoints connected to PostgreSQL database.',
          'Refactored frontend codebase to TypeScript, reducing runtime UI bugs by 25%.'
        ]
      },
      {
        role: 'Junior Frontend Developer',
        company: 'InnoTech Solutions',
        duration: '2021 - 2022',
        years: 1.0,
        highlights: [
          'Developed responsive React UI components according to Figma wireframes.',
          'Integrated third-party APIs and improved frontend test coverage using Jest.'
        ]
      }
    ],
    total_experience_years: 4.0,
    education: [
      {
        degree: 'B.S. in Software Engineering',
        institution: 'University of Washington',
        year: '2021',
        details: 'GPA 3.7/4.0'
      }
    ],
    certifications: ['Meta Front-End Developer Certificate']
  },
  {
    filename: 'Aria_Patel_Junior_Frontend.docx',
    candidate_name: 'Aria Patel',
    email: 'aria.patel@example.com',
    phone: '+1 (512) 345-6789',
    location: 'Austin, TX',
    linkedin: 'https://linkedin.com/in/ariapatel-web',
    portfolio: 'https://github.com/ariapatel',
    summary: 'Enthusiastic Junior Web Developer with 1.5 years of experience building responsive frontend interfaces using React, JavaScript, and Tailwind CSS. Eager to expand full stack capabilities in Node.js and cloud environments.',
    skills: {
      technical: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Git', 'REST API'],
      tools: ['VS Code', 'GitHub', 'Figma', 'Postman', 'npm'],
      soft: ['Curiosity', 'Communication', 'Attention to Detail', 'Adaptability']
    },
    experience: [
      {
        role: 'Associate Frontend Developer',
        company: 'BrightStar Media',
        duration: '2023 - Present',
        years: 1.5,
        highlights: [
          'Built modular landing pages and user profile flows using React and Tailwind CSS.',
          'Fixed cross-browser UI glitches and improved mobile accessibility standards.',
          'Participated in daily standups and agile sprint reviews.'
        ]
      }
    ],
    total_experience_years: 1.5,
    education: [
      {
        degree: 'B.S. in Information Technology',
        institution: 'Texas A&M University',
        year: '2023',
        details: 'Focus on Web Application Development'
      }
    ],
    certifications: []
  },
  {
    filename: 'Dr_Sophia_Rodriguez_AI_Scientist.pdf',
    candidate_name: 'Dr. Sophia Rodriguez',
    email: 'sophia.rodriguez.ai@example.com',
    phone: '+1 (617) 555-0199',
    location: 'Boston, MA',
    linkedin: 'https://linkedin.com/in/sophia-rodriguez-ai',
    portfolio: 'https://github.com/sophia-ai-labs',
    summary: 'Lead AI & Machine Learning Scientist with 7+ years researching and deploying deep learning, LLMs, and computer vision systems. Published author with hands-on expertise in PyTorch, Transformers, RAG architectures, and FastAPI MLOps pipelines.',
    skills: {
      technical: ['Python', 'PyTorch', 'Machine Learning', 'LLMs', 'Transformers', 'FastAPI', 'Docker', 'NLP', 'Vector Databases', 'LangChain'],
      tools: ['HuggingFace', 'Docker', 'AWS', 'Kubernetes', 'MLflow', 'Git', 'ChromaDB', 'Weights & Biases'],
      soft: ['Research Leadership', 'Technical Strategy', 'Public Speaking', 'Analytical Thinking']
    },
    experience: [
      {
        role: 'Staff Machine Learning Scientist',
        company: 'Cognitive Dynamics AI',
        duration: '2021 - Present',
        years: 4.0,
        highlights: [
          'Architected and deployed custom LLM RAG pipelines delivering 94% domain retrieval accuracy.',
          'Fine-tuned open-source LLM foundation models using LoRA and QLoRA on multi-GPU AWS clusters.',
          'Engineered low-latency FastAPI inference microservices containerized with Docker and Kubernetes.'
        ]
      },
      {
        role: 'Machine Learning Engineer',
        company: 'NeuroTech Solutions',
        duration: '2018 - 2021',
        years: 3.0,
        highlights: [
          'Trained deep learning classification models in PyTorch achieving 96% validation F1 score.',
          'Built automated model retraining pipelines integrated with MLflow.'
        ]
      }
    ],
    total_experience_years: 7.0,
    education: [
      {
        degree: 'Ph.D. in Computer Science (Artificial Intelligence)',
        institution: 'MIT',
        year: '2018',
        details: 'Dissertation on Deep Representation Learning for Natural Language'
      }
    ],
    certifications: ['AWS Certified Machine Learning – Specialty']
  },
  {
    filename: 'David_Miller_Data_Analyst.txt',
    candidate_name: 'David Miller',
    email: 'david.miller.analytics@example.com',
    phone: '+1 (312) 789-0123',
    location: 'Chicago, IL',
    linkedin: 'https://linkedin.com/in/david-miller-data',
    portfolio: 'https://github.com/dmiller-analytics',
    summary: 'Data Analyst with 3 years of experience generating actionable business intelligence, ETL scripts, and executive dashboards using SQL, Python, Tableau, and Excel.',
    skills: {
      technical: ['SQL', 'Python', 'Data Analysis', 'Tableau', 'Power BI', 'Pandas', 'Excel'],
      tools: ['Jupyter', 'Git', 'Snowflake', 'DBeaver'],
      soft: ['Data Storytelling', 'Stakeholder Communication', 'Critical Thinking']
    },
    experience: [
      {
        role: 'Business Data Analyst',
        company: 'Midwest Financial Group',
        duration: '2022 - Present',
        years: 3.0,
        highlights: [
          'Created automated reporting dashboards in Tableau tracking $50M in quarterly revenue.',
          'Wrote complex SQL queries in Snowflake to extract transaction metrics.',
          'Developed Python scripts using Pandas for monthly financial reconciliations.'
        ]
      }
    ],
    total_experience_years: 3.0,
    education: [
      {
        degree: 'B.S. in Economics & Statistics',
        institution: 'University of Illinois',
        year: '2021',
        details: 'Minor in Informatics'
      }
    ],
    certifications: ['Tableau Desktop Specialist']
  }
];

export function createRawTextFromCandidate(candidate) {
  return `
=====================================================
${candidate.candidate_name}
${candidate.email} | ${candidate.phone} | ${candidate.location}
LinkedIn: ${candidate.linkedin} | Portfolio: ${candidate.portfolio}
=====================================================

PROFESSIONAL SUMMARY:
${candidate.summary}

CORE SKILLS:
Technical: ${(candidate.skills?.technical || []).join(', ')}
Tools & Platforms: ${(candidate.skills?.tools || []).join(', ')}
Soft Skills: ${(candidate.skills?.soft || []).join(', ')}

WORK EXPERIENCE:
${(candidate.experience || []).map(exp => `
${exp.role} | ${exp.company}
Duration: ${exp.duration} (${exp.years} years)
${(exp.highlights || []).map(h => `- ${h}`).join('\n')}
`).join('\n')}

EDUCATION:
${(candidate.education || []).map(edu => `
${edu.degree} - ${edu.institution} (${edu.year})
${edu.details}
`).join('\n')}

CERTIFICATIONS:
${(candidate.certifications || []).map(c => `- ${c}`).join('\n') || 'None'}
`.trim();
}
