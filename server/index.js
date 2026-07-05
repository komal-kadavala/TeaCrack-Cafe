import express from 'express';
import cors from 'cors';
import { listReviews, createReview } from './reviewStore.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await listReviews();
    return res.json(reviews);
  } catch (error) {
    console.error('[reviews] Unable to list reviews:', error);
    return res.status(500).json({ success: false, error: error.message || 'Unable to load reviews right now.' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const review = await createReview(req.body && typeof req.body === 'object' ? req.body : {});
    return res.status(201).json(review);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, error: error.message || 'Unable to save review.' });
  }
});

app.listen(PORT, () => {
  console.log(`Reviews API Server running on port ${PORT}`);
});
