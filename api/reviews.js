import { listReviews, createReview } from '../server/reviewStore.js';

async function readJsonBody(req) {
  if (req.body) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (!chunks.length) {
    return {};
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return { raw: rawBody };
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const reviews = await listReviews();
      return res.status(200).json(reviews);
    } catch (error) {
      console.error('[reviews] Unable to list reviews:', error);
      return res.status(500).json({ success: false, error: error.message || 'Unable to load reviews right now.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const payload = await readJsonBody(req);
      const review = await createReview(payload && typeof payload === 'object' ? payload : {});
      return res.status(201).json(review);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({ success: false, error: error.message || 'Unable to save review.' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ success: false, error: 'Method not allowed.' });
}
