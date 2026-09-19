import { executeJudge } from '../src/server/judgeService';

/**
 * Vercel Serverless Function endpoint: /api/judge
 * Compatible with Vercel Node runtime deployment.
 */
export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Phương thức không được hỗ trợ. Vui lòng sử dụng POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        return res.status(400).json({ error: 'Định dạng JSON trong Request Body không hợp lệ.' });
      }
    }

    const result = await executeJudge(body);
    return res.status(result.status).json(result.data);
  } catch (err: any) {
    console.error('[Vercel Serverless /api/judge] Unhandled exception:', err);
    return res.status(500).json({ error: 'Lỗi máy chủ nội bộ trong quá trình xử lý chấm bài.' });
  }
}
