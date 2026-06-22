import { createProduct } from '../schemes/templates.ts';
import { db} from '../firebaseConfig.js';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { attachImage } from '../utils/imageHandler.js';

const productsCollection = collection(db, 'products');
const productsCacheKeys = ['products', 'products_time'];

function clearProductsCache() {
  if (typeof localStorage === 'undefined') {
    return;
  }

  productsCacheKeys.forEach((key) => localStorage.removeItem(key));
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

