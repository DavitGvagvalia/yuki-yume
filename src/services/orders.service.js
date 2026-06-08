import { createOrder } from '../schemes/templates.ts';
import { db } from '../firebaseConfig.js';

import {
	collection,
	addDoc,
	getDocs,
	doc,
	deleteDoc,
	updateDoc,
	onSnapshot,
} from 'firebase/firestore';

const ordersCollection = collection(db, 'orders');

function getOrderTimestamp(order) {
	const orderDate = order.createdAt || order.date;

	if (!orderDate) {
		return 0;
	}

	if (typeof orderDate.toMillis === 'function') {
		return orderDate.toMillis();
	}

	if (orderDate instanceof Date) {
		return orderDate.getTime();
	}

	return new Date(orderDate).getTime() || 0;
}

function mapOrderDoc(orderDoc) {
	return {
		id: orderDoc.id,
		...orderDoc.data()
	};
}

function sortOrdersByNewest(orders) {
	return [...orders].sort((firstOrder, secondOrder) => (
		getOrderTimestamp(secondOrder) - getOrderTimestamp(firstOrder)
	));
}

export async function getOrders() {
	const querySnapshot = await getDocs(ordersCollection);

	return sortOrdersByNewest(querySnapshot.docs.map(mapOrderDoc));
}

export function listenToOrders(callback, onError) {
	const unsubscribe = onSnapshot(
		ordersCollection,
		(snapshot) => {
			const orders = sortOrdersByNewest(snapshot.docs.map(mapOrderDoc));

			callback(orders);
		},
		(error) => {
			console.error('Error listening to orders:', error);

			if (onError) {
				onError(error);
			}
		}
	);

	return unsubscribe;
}

export async function addOrder(orderData) {
	try {
		const order = createOrder(orderData);

		const newDoc = await addDoc(ordersCollection, order);

		console.log('Order added with ID:', newDoc.id);
		return newDoc.id;
	} catch (error) {
		console.error('Error adding order:', error);
		throw error;
	}
}

export async function changeOrderStatus(orderId, newStatus) {
	try {
		const orderRef = doc(db, 'orders', orderId);

		await updateDoc(orderRef, {
			status: newStatus
		});

		console.log('Order status updated with ID:', orderId);
	} catch (error) {
		console.error('Error updating order status:', error);
		throw error;
	}
}

export async function updateOrder(orderId, updatedData) {
	try {
		const orderRef = doc(db, 'orders', orderId);

		await updateDoc(orderRef, updatedData);

		console.log('Order updated with ID:', orderId);
	} catch (error) {
		console.error('Error updating order:', error);
		throw error;
	}
}

export async function deleteOrder(orderId) {
	try {
		const orderRef = doc(db, 'orders', orderId);

		await deleteDoc(orderRef);

		console.log('Order deleted with ID:', orderId);
	} catch (error) {
		console.error('Error deleting order:', error);
		throw error;
	}
}
