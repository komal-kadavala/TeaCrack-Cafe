import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 5000;

// Resolve path variables in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'reviews.json');

app.use(cors());
app.use(express.json());

// Helper function to read from the JSON database file
const loadReviews = () => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Seed initial sample database reviews
      const seedData = [
        {
          id: "seed-1",
          name: "Rahul Sharma",
          rating: 5,
          comment: "The Masala Chai is absolute perfection! It has the right amount of spices. Highly recommend the American Garden Pizza too.",
          date: "14 Jun 2026 at 04:30 PM",
          createdAt: new Date("2026-06-14T16:30:00").getTime()
        },
        {
          id: "seed-2",
          name: "Anjali Mehta",
          rating: 5,
          comment: "Warm seating arrangement and lovely background vibes. KitKat milkshake was extremely thick and delicious.",
          date: "28 May 2026 at 06:15 PM",
          createdAt: new Date("2026-05-28T18:15:00").getTime()
        }
      ];
      fs.writeFileSync(DB_PATH, JSON.stringify(seedData, null, 2), 'utf8');
      return seedData;
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database file:", error);
    return [];
  }
};

// Helper function to write to the JSON database file
const saveReviews = (reviews) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(reviews, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing database file:", error);
  }
};

// GET endpoint to retrieve reviews
app.get('/api/reviews', (req, res) => {
  const reviews = loadReviews();
  // Sort newest first
  reviews.sort((a, b) => b.createdAt - a.createdAt);
  res.json(reviews);
});

// POST endpoint to add a new review
app.post('/api/reviews', (req, res) => {
  const { name, rating, comment } = req.body;
  if (!name || !rating || !comment) {
    return res.status(400).json({ error: "Missing required inputs" });
  }

  const reviews = loadReviews();
  const dateObj = new Date();
  
  const formattedDateTime = `${dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })} at ${dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })}`;

  const newReview = {
    id: `rev-${Date.now()}`,
    name: name.trim(),
    rating: parseInt(rating),
    comment: comment.trim(),
    date: formattedDateTime,
    createdAt: Date.now()
  };

  reviews.unshift(newReview);
  saveReviews(reviews);

  res.status(201).json(newReview);
});

app.listen(PORT, () => {
  console.log(`Reviews API Server running on http://localhost:${PORT}`);
});
