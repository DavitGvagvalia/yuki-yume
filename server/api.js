import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const get_reviews = (req, res) => {
  const filePath = path.join(__dirname, 'data', 'reviews.json');

  const reviews = JSON.parse(
    fs.readFileSync(filePath, 'utf-8')
  );

  res.json(reviews);
};


export const get_products = (req, res) => {
    const filePath = path.join(__dirname, 'data', 'products.json');

    const products = JSON.parse(
      fs.readFileSync(filePath, 'utf-8')
    );

    res.json(products);
  };

