
import { ref,getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig.js';



export async function getImageUrl(path) {
  const imageRef = ref(storage, path);
  return await getDownloadURL(imageRef);
}

export async function attachImage(product) {
  let imageUrl = null;

  if (product.image) {
    try {
      imageUrl = await getImageUrl(product.image);
    } catch {}
  }

  return {
    ...product,
    imageUrl
  };
}