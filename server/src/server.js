import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-api-key']
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Root Landing Route
app.get('/', (req, res) => {
  res.json({
    name: 'Smart Resume Screener Backend API',
    status: 'online',
    version: '1.0.0',
    frontend_url: 'http://localhost:5173',
    documentation: {
      health: 'GET /api/health',
      jobs: 'GET /api/jobs',
      screenings: 'GET /api/screenings?jobId={jobId}',
      screen_resumes: 'POST /api/screen',
      compare_candidates: 'POST /api/compare',
      export_csv: 'GET /api/export/{jobId}'
    }
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Smart Resume Screener API'
  });
});

// API Routes
app.use('/api', apiRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Smart Resume Screener Backend running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});
