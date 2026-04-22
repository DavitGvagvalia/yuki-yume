import { db } from '../firebaseConfig.js';
import { collection, getDocs } from 'firebase/firestore';

export const reviewsCollection = collection(db, 'reviews');


export const getReviews = async () => {
    try {
        const querySnapshot = await getDocs(reviewsCollection);
        const reviews = querySnapshot.docs.map(doc => ({ id: doc.uid, ...doc.data() }));
        return reviews;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error;
    }
};
