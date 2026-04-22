import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCKUipga6B-J4fUhFyRu7SALowSrqIb9UQ",
  authDomain: "yuki-yume-sushi.firebaseapp.com",
  projectId: "yuki-yume-sushi",
  storageBucket: "yuki-yume-sushi.firebasestorage.app",
  messagingSenderId: "905355544721",
  appId: "1:905355544721:web:7242beb8379aa24dc49730"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;