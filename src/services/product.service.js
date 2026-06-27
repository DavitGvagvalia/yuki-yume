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

function normalizeSortOrder(value) {
  const sortOrder = Number(value);

  return Number.isFinite(sortOrder) ? sortOrder : Number.MAX_SAFE_INTEGER;
}

export function sortProductsByCategoryOrder(products) {
  return [...products].sort((firstProduct, secondProduct) => {
    const firstCategory = String(firstProduct.category || '');
    const secondCategory = String(secondProduct.category || '');
    const categoryComparison = firstCategory.localeCompare(secondCategory);

    if (categoryComparison !== 0) {
      return categoryComparison;
    }

    const orderComparison = normalizeSortOrder(firstProduct.sortOrder) -
      normalizeSortOrder(secondProduct.sortOrder);

    if (orderComparison !== 0) {
      return orderComparison;
    }

    return String(firstProduct.name || '').localeCompare(String(secondProduct.name || ''));
  });
}

export async function getProductsRaw() {
  const querySnapshot = await getDocs(productsCollection);

  return sortProductsByCategoryOrder(querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })));
}

export async function getProducts() {
  const rawProducts = await getProductsRaw();

  const productsWithImages = await Promise.all(rawProducts.map(attachImage));

  return sortProductsByCategoryOrder(productsWithImages);
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

export async function updateCategoryProductOrder(productsInOrder) {
    try {
        const batch = writeBatch(db);

        productsInOrder.forEach((product, index) => {
            const productRef = doc(db, 'products', product.id);
            batch.update(productRef, { sortOrder: index + 1 });
        });

        await batch.commit();
        clearProductsCache();
    } catch (error) {
        console.error('Error updating product order:', error);
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
    const categorySortCounts = new Map();

    existingProducts.forEach((product) => {
      const category = String(product.category || '').trim();
      const currentCount = categorySortCounts.get(category) || 0;
      const existingSortOrder = Number(product.sortOrder);
      const nextCount = Number.isFinite(existingSortOrder) && existingSortOrder > 0
        ? Math.max(currentCount, existingSortOrder)
        : currentCount + 1;

      categorySortCounts.set(category, nextCount);
    });

    products.forEach((product, index) => {
      const productName = normalizeProductName(product.name);
      const category = String(product.category || '').trim();
      const parsedSortOrder = Number(product.sortOrder);
      const sortOrder = Number.isFinite(parsedSortOrder) && parsedSortOrder > 0
        ? parsedSortOrder
        : (categorySortCounts.get(category) || 0) + 1;

      if (!productName) {
        invalid.push({ row: index + 2, reason: 'Missing product name' });
        return;
      }

      if (knownProductNames.has(productName)) {
        skipped.push(product.name);
        return;
      }

      knownProductNames.add(productName);
      categorySortCounts.set(category, Math.max(categorySortCounts.get(category) || 0, sortOrder));
      productsToAdd.push({
        ...productDefaults,
        ...product,
        name: product.name.trim(),
        category,
        sortOrder,
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
