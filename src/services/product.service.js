import { productTemplate, productRequiredFields } from '../schemes/templates.js';
import { db} from '../firebaseConfig.js';
import { collection, addDoc, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { getImageUrl } from '../utils/imageHandler.js';




const productsCollection = collection(db, 'products');


export async function getProducts() {
    try {
        const querySnapshot = await getDocs(productsCollection);

        const products = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
                const data = doc.data();

                const imageUrl = data.image
                    ? await getImageUrl(data.image)
                    : null;
                console.log(imageUrl);
                return {
                    id: doc.uid,
                    ...data,
                    imageUrl
                };
            })
        );

        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

export async function addProduct(productData) {

    for (const field of productRequiredFields) {
        if (!productData[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    const newProductData = {
        ...productTemplate,
        ...productData
    };
    try {

        const newDoc = await addDoc(productsCollection, newProductData);
        console.log('Product added with ID:', newDoc.id);
        return newDoc.id;
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
}

export async function updateProduct(productId, updatedData) {
    try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, updatedData);
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
        console.log('Product deleted with ID:', productId);
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}


