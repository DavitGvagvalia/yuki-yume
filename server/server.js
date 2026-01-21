import express from 'express';
import cors from 'cors';
import { get_reviews, get_products } from './api.js';
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/get/products', get_products);

app.get('/get/reviews', get_reviews);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});