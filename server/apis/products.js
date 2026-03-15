// api/products.js
import express from 'express';
import { db } from '../firebase/firebase.js'; 
import { product_template,product_required_fields } from '../data_templates/product_template.js';
import { requiredfieldsHandler,errorhandler} from '../handlers/apiHandler.js';


const router = express.Router();
const collectionName = 'products';
const products = db.collection(collectionName)



router.get('/', async (req, res) => {
  try {
    console.log("Fetching all products...");
    const snapshot = await products.get();  
    res.status(200).json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    console.error("Error fetching data:", error);  // Log the error to help debug
    res.status(500).json({ message: 'Error fetching data', error: error.message });
  }
});

// Fetch a product by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Fetching product with ID: ${id}`);
    const doc = await products.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }
    console.log("Fetched product:", doc.data());
    res.status(200).json(doc.data());
  } catch (error) {
    console.error("Error fetching product:", error);  // Log the error
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// Add a new product
// API POST endpoint for adding a product
router.post('/', async (req, res) => {
    const body = req.body;
    const product = { ...product_template, ...body };
    const missingFields = requiredfieldsHandler(product, product_required_fields);

    if (missingFields) {
      return res.status(missingFields.status).json(missingFields.json);
    }

    try {
      const newProductRef = await products.add(product);
      res.status(201).json({ id: newProductRef.id, ...product });
    }
        catch (error) {
            const errorResponse = errorhandler(error,res);
            return res.status(errorResponse.status).json(errorResponse.json);
        }

});


// Update an existing product
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  console.log(`Updating product with ID: ${id}`, req.body);  // Log the incoming data
  try {
    await products.doc(id).update({
      name,
      description,
      price
    });
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error("Error updating product:", error);  // Log the error
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Deleting product with ID: ${id}`);
  try {
    await products.doc(id).delete();
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error("Error deleting product:", error);  // Log the error
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

router.post('/batch', async (req, res) => {
    if (Array.isArray(req.body)) {
        const productsData = req.body.map(item => ({ ...product_template, ...item }));
        const batch = db.batch();
        productsData.forEach((product) => {
            const docRef = products.doc(); // Generate a new document reference with an auto-generated ID
            batch.set(docRef, product); // Add the set operation to the batch
        });
        try {
            await batch.commit(); // Commit the batch operation
            res.status(200).json({ message: 'Products added successfully' });
        } catch (error) {
            console.error("Error adding products:", error);
            res.status(500).json({ message: 'Error adding products', error: error.message });
        }
    } else {
        res.status(400).json({ message: 'Invalid data format. Expected an array of products.' });
    }
})



export { router as itemsRoutes };
