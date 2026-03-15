import { db } from '../firebase/firebase.js';

async function testFirestoreAdd() {
  try {
    const products = db.collection('products');
    const newProduct = await products.add({
      name: 'Test Product',
      description: 'This is a test product',
      price: 10.99,
    });

    console.log('Product added with ID:', newProduct.id);
  } catch (error) {
    console.error('Error adding product:', error);
  }
}

testFirestoreAdd();