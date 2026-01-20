import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/items', (req, res) => {
  const items = JSON.parse(
    fs.readFileSync('./data/items.json', 'utf-8')
  );
  res.json(items);
});

app.get('/reviews', (req, res) => {
  const reviews = JSON.parse(
    fs.readFileSync('./data/reviews.json', 'utf-8')
  );
  res.json(reviews);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});