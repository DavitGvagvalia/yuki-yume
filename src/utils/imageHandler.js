
import { ref,getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig.js';



export async function getImageUrl(path) {
  const imageRef = ref(storage, path);
  return await getDownloadURL(imageRef);
}