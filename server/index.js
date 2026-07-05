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
    res.json(reviews);
  } catch (error) {
    console.error('Unable to list reviews:', error);
    res.status(500).json({ error: 'Unable to load reviews right now.' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const review = await createReview(req.body);
    res.status(201).json(review);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: error.message || 'Unable to save review.' });
  }
});

app.listen(PORT, () => {
  console.log(`Reviews API Server running on port ${PORT}`);
});
