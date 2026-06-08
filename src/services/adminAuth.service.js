import { doc, getDoc } from 'firebase/firestore';
import {
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut
} from 'firebase/auth';
import { auth, db } from '../firebaseConfig.js';

export function watchAuthState(callback) {
	return onAuthStateChanged(auth, callback);
}

export async function isAuthorizedAdmin(user) {
	if (!user) {
		return false;
	}

	const token = await user.getIdTokenResult();

	if (token.claims.admin === true) {
		return true;
	}

	const adminDoc = await getDoc(doc(db, 'admins', user.uid));

	return adminDoc.exists();
}

export async function loginAdmin(email, password) {
	const { user } = await signInWithEmailAndPassword(auth, email, password);
	const isAdmin = await isAuthorizedAdmin(user);

	if (!isAdmin) {
		await signOut(auth);
		throw new Error('This account is not authorized for admin access.');
	}

	return user;
}

export async function logoutAdmin() {
	await signOut(auth);
}
