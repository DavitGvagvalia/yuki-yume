// server.js
import express from 'express';
import { itemsRoutes } from './apis/products.js';
import cors from 'cors';
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json()); 


app.get('/', (req, res) => {
  res.send('Firestore Express App is Running!');
});

app.use('/api/products',itemsRoutes);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});