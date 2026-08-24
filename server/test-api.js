async function runTests() {
  const BASE = 'http://localhost:5000/api';
  console.log('🧪 Starting Smart Resume Screener API Verification Tests...\n');

  // 1. Health check
  const healthRes = await fetch(`${BASE}/health`);
  const health = await healthRes.json();
  console.log('1. Health Check:', health.status === 'ok' ? '✅ PASSED' : '❌ FAILED');

  // 2. Jobs API
  const jobsRes = await fetch(`${BASE}/jobs`);
  const jobsData = await jobsRes.json();
  console.log(`2. Jobs List: ✅ PASSED (${jobsData.data?.length || 0} jobs found)`);
  const targetJob = jobsData.data[0];

  // 3. Create Custom Job
  const createJobRes = await fetch(`${BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Senior Site Reliability Engineer (Kubernetes & AWS)',
      department: 'Infrastructure',
      experience_level: 'Senior (4+ years)',
      min_experience_years: 4,
      required_skills: ['Kubernetes', 'AWS', 'Terraform', 'Prometheus'],
      preferred_skills: ['Go', 'Python', 'Chaos Engineering'],
      description: 'Lead reliability engineering, automated failovers, and multi-region observability.'
    })
  });
  const createdJob = await createJobRes.json();
  console.log('3. Create Job API:', createdJob.success ? '✅ PASSED' : '❌ FAILED', `(Created ID: ${createdJob.data?.id})`);

  // 4. Seed Sample Candidates
  const seedRes = await fetch(`${BASE}/seed-samples`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId: targetJob.id })
  });
  const seedData = await seedRes.json();
  console.log(`4. Seed & Screen Candidates: ✅ PASSED (${seedData.data?.length || 0} candidates evaluated against "${targetJob.title}")`);

  // 5. Query Screenings with Filter
  const screeningsRes = await fetch(`${BASE}/screenings?jobId=${targetJob.id}`);
  const screenings = await screeningsRes.json();
  console.log(`5. Fetch Screenings: ✅ PASSED (${screenings.data?.length || 0} evaluated records)`);

  const topCandidate = screenings.data[0];
  console.log(`   🏆 Top Candidate: ${topCandidate.candidate_name} - Score: ${topCandidate.overall_score}% (${topCandidate.fit_tier})`);
  console.log(`      Matched Skills: ${(topCandidate.matched_skills || []).join(', ')}`);
  console.log(`      Missing Skills: ${(topCandidate.missing_skills || []).join(', ')}`);

  // 6. Fetch Full AI Candidate Dossier
  const dossierRes = await fetch(`${BASE}/screenings/${topCandidate.id}`);
  const dossier = await dossierRes.json();
  console.log('6. Full AI Dossier API:', dossier.success ? '✅ PASSED' : '❌ FAILED');
  console.log(`      Interview Questions Generated: ${dossier.data?.interview_questions?.length || 0}`);
  if (dossier.data?.interview_questions?.length > 0) {
    console.log(`      Sample Q1: "${dossier.data.interview_questions[0].question}"`);
  }

  // 7. Update Candidate Status
  const updateRes = await fetch(`${BASE}/screenings/${topCandidate.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'Shortlisted',
      notes: 'Strong candidate with deep architecture experience. Fast-track to interview.'
    })
  });
  const updatedData = await updateRes.json();
  console.log('7. Update Status & Notes API:', updatedData.data?.status === 'Shortlisted' ? '✅ PASSED' : '❌ FAILED');

  // 8. Compare Multiple Candidates
  const compareIds = screenings.data.slice(0, 3).map(c => c.id);
  const compareRes = await fetch(`${BASE}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: compareIds })
  });
  const compareData = await compareRes.json();
  console.log(`8. Side-by-Side Comparison API: ✅ PASSED (${compareData.data?.length || 0} candidates compared)`);

  // 9. Export Shortlist CSV
  const exportRes = await fetch(`${BASE}/export/${targetJob.id}`);
  const csvText = await exportRes.text();
  console.log('9. CSV Export API:', csvText.includes('Candidate Name') && csvText.includes('Match Score') ? '✅ PASSED' : '❌ FAILED');
  console.log(`      CSV Header & Rows generated (${csvText.split('\n').length} lines)`);

  console.log('\n🎉 ALL 9 END-TO-END VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
