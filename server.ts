import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { executeJudgeB01 } from './src/server/judgeService';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON body parser with 5MB limit
  app.use(express.json({ limit: '5mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Judge API V1 endpoint
  app.post('/api/judge', async (req, res) => {
    try {
      const result = await executeJudgeB01(req.body);
      return res.status(result.status).json(result.data);
    } catch (err: any) {
      console.error('[Server /api/judge] Internal server error:', err);
      return res.status(500).json({ error: 'Không thể chấm bài lúc này. Vui lòng thử lại.' });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] App running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
