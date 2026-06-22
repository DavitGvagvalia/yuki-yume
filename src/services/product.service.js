import { createProduct, productDefaults } from '../schemes/templates.ts';
import { db} from '../firebaseConfig.js';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { attachImage } from '../utils/imageHandler.js';

const productsCollection = collection(db, 'products');
const productsCacheKeys = ['products', 'products_time'];

function clearProductsCache() {
  if (typeof localStorage === 'undefined') {
    return;
  }

  productsCacheKeys.forEach((key) => localStorage.removeItem(key));
}

function normalizeProductName(name) {
  return String(name || '').trim().toLowerCase();
}

export async function getProductsRaw() {
  const querySnapshot = await getDocs(productsCollection);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getProducts() {
  const rawProducts = await getProductsRaw();

  return Promise.all(rawProducts.map(attachImage));
}

export default async function addProduct(productData) {
  try {
    const product = createProduct(productData);

    const newDoc = await addDoc(productsCollection, product);

    clearProductsCache();
    console.log("Product added with ID:", newDoc.id);
    return newDoc.id;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
}

export async function updateProduct(productId, updatedData) {
    try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, updatedData);
        clearProductsCache();
        console.log('Product updated with ID:', productId);
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

export async function deleteProduct(productId) {
    try {
        const productRef = doc(db, 'products', productId);
        await deleteDoc(productRef);
        clearProductsCache();
        console.log('Product deleted with ID:', productId);
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

export async function batchAddProducts(products) {
  try {
    const existingProducts = await getProductsRaw();
    const knownProductNames = new Set(
      existingProducts.map((product) => normalizeProductName(product.name))
    );
    const skipped = [];
    const invalid = [];
    const productsToAdd = [];

    products.forEach((product, index) => {
      const productName = normalizeProductName(product.name);

      if (!productName) {
        invalid.push({ row: index + 2, reason: 'Missing product name' });
        return;
      }

      if (knownProductNames.has(productName)) {
        skipped.push(product.name);
        return;
      }

      knownProductNames.add(productName);
      productsToAdd.push({
        ...productDefaults,
        ...product,
        name: product.name.trim(),
        category: String(product.category || '').trim(),
        description: String(product.description || '').trim(),
        image: String(product.image || '').trim(),
        price: Number(product.price) || 0,
        preparationTime: Number(product.preparationTime) || 0,
        ingredients: Array.isArray(product.ingredients) ? product.ingredients : [],
        available: product.available ?? true,
        spicy: Boolean(product.spicy),
        vegetarian: Boolean(product.vegetarian)
      });
    });

    for (let start = 0; start < productsToAdd.length; start += 500) {
      const batch = writeBatch(db);

      productsToAdd.slice(start, start + 500).forEach((product) => {
        batch.set(doc(productsCollection), product);
      });

      await batch.commit();
    }

    if (productsToAdd.length > 0) {
      clearProductsCache();
    }

    return {
      added: productsToAdd.length,
      skipped,
      invalid,
      total: products.length
    };
  } catch (error) {
    console.error('Error batch adding products:', error);
    throw error;
  }
}
