import { createContext, useContext, useEffect, useState } from 'react';
import {
	listenToOrders,
	changeOrderStatus,
	addOrder,
	deleteOrder,
	updateOrder
} from '../services/orders.service';

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
	const [orderedProducts, setOrderedProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const unsubscribe = listenToOrders(
			(orders) => {
				setOrderedProducts(orders);
				setLoading(false);
				setError(null);
			},
			(err) => {
				console.error('Error listening to orders:', err);
				setError(err);
				setLoading(false);
			}
		);

		return () => unsubscribe();
	}, []);

	const createNewOrder = async (orderData) => {
		try {
			return await addOrder(orderData);
		} catch (err) {
			console.error('Error adding order:', err);
			setError(err);
			throw err;
		}
	};

	const changeStatus = async (orderId, newStatus) => {
		try {
			await changeOrderStatus(orderId, newStatus);
		} catch (err) {
			console.error('Error changing order status:', err);
			setError(err);
			throw err;
		}
	};

	const editOrder = async (orderId, updatedData) => {
		try {
			await updateOrder(orderId, updatedData);
		} catch (err) {
			console.error('Error updating order:', err);
			setError(err);
			throw err;
		}
	};

	const removeOrder = async (orderId) => {
		try {
			await deleteOrder(orderId);
		} catch (err) {
			console.error('Error deleting order:', err);
			setError(err);
			throw err;
		}
	};

	return (
		<OrderContext.Provider
			value={{
				orderedProducts,
				loading,
				error,
				createNewOrder,
				changeStatus,
				editOrder,
				removeOrder
			}}
		>
			{children}
		</OrderContext.Provider>
	);
};

export const useOrder = () => {
	const context = useContext(OrderContext);

	if (!context) {
		throw new Error('useOrder must be used within an OrderProvider');
	}

	return context;
};
