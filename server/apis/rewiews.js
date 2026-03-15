// api/items.js
import express from 'express';
import { db } from '../firebase/firebase.js';  // Import Firestore setup

const router = express.Router();
const collectionName = 'reviews'; 

// Fetch all items
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection(collectionName).get();
    const items = snapshot.docs.map(doc => doc.data());
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

// Fetch an item by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection(collectionName).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(doc.data());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

// Add a new item
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  try {
    const newItemRef = await db.collection(collectionName).add({
      name,
      description,
    });
    res.status(201).json({ id: newItemRef.id, name, description });
  } catch (error) {
    res.status(500).json({ message: 'Error adding item', error });
  }
});

// Update an existing item
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    await db.collection(collectionName).doc(id).update({
      name,
      description,
    });
    res.status(200).json({ message: 'Item updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating item', error });
  }
});

// Delete an item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection(collectionName).doc(id).delete();
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item', error });
  }
});

export { router as itemsRoutes };