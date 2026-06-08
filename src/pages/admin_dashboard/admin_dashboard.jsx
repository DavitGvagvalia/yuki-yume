import React, { useMemo } from 'react';
import { useOrder } from '../../hooks/useOrders.jsx';

const ORDER_STATUSES = {
	PENDING: 'pending',
	IN_PROGRESS: 'in progress',
	COMPLETED: 'completed',
	CANCELLED: 'cancelled',
	REJECTED: 'rejected'
};

const OrderButtons = ({ order }) => {
	const { changeStatus } = useOrder();

	if (order.status === ORDER_STATUSES.PENDING) {
		return (
			<div className="flex gap-2 mt-2">
				<button
					type="button"
					className="bg-green-500 text-white p-2 rounded"
					onClick={() => changeStatus(order.id, ORDER_STATUSES.IN_PROGRESS)}
				>
					<span className="text-sm">Accept</span>
				</button>

				<button
					type="button"
					className="bg-red-500 text-white p-2 rounded"
					onClick={() => changeStatus(order.id, ORDER_STATUSES.REJECTED)}
				>
					<span className="text-sm">Reject</span>
				</button>
			</div>
		);
	}

	if (order.status === ORDER_STATUSES.IN_PROGRESS) {
		return (
			<div className="flex gap-2 mt-2">
				<button
					type="button"
					className="bg-red-500 text-white p-2 rounded"
					onClick={() => changeStatus(order.id, ORDER_STATUSES.CANCELLED)}
				>
					<span className="text-sm">Cancel</span>
				</button>

				<button
					type="button"
					className="bg-blue-500 text-white p-2 rounded"
					onClick={() => changeStatus(order.id, ORDER_STATUSES.COMPLETED)}
				>
					<span className="text-sm">Complete</span>
				</button>
			</div>
		);
	}

	return null;
};

const OrderCard = ({ order }) => {
	return (
		<div className="flex flex-col gap-1 p-2 bg-card rounded min-w-[350px]">
			<h3 className="text-md font-bold">{order.name}</h3>

			<p className="text-sm text-gray-500">
				{order.date}
			</p>

			<p className="text-sm">
				Total: ${order.totalPrice}
			</p>

			<p className="text-sm capitalize">
				Status: {order.status}
			</p>

			<OrderButtons order={order} />
		</div>
	);
};

const StatusColumn = ({ orders, name }) => {
	return (
		<div className="flex flex-col gap-3 p-4 bg-surface rounded-lg w-full">
			<h2 className="text-xl font-bold">
				{name} ({orders.length})
			</h2>

			<div className="flex overflow-auto gap-3 p-4 bg-surface rounded h-full">
				{orders.length === 0 ? (
					<p className="text-sm text-gray-500">No orders</p>
				) : (
					orders.map(order => (
						<OrderCard key={order.id} order={order} />
					))
				)}
			</div>
		</div>
	);
};

const OrderTracker = ({ groupedOrders }) => {
	return (
		<section className="flex flex-col gap-5 w-full rounded-lg mt-40">
			<StatusColumn orders={groupedOrders.pending} name="Pending" />
			<StatusColumn orders={groupedOrders.inProgress} name="In Progress" />
			<StatusColumn orders={groupedOrders.completed} name="Completed" />
			<StatusColumn orders={groupedOrders.cancelled} name="Cancelled" />
			<StatusColumn orders={groupedOrders.rejected} name="Rejected" />
		</section>
	);
};

const OrderHistory = ({ orders }) => {
	return (
		<section className="flex flex-col gap-4 p-4 bg-surface rounded-lg w-full">
			<div className="flex gap-4 items-center">
				<h1 className="text-2xl font-bold">Order history</h1>

				<input
					type="date"
					aria-label="Filter orders by date"
					className="p-2 rounded border border-gray-300"
				/>
			</div>

			<div className="flex gap-4 overflow-auto">
				{orders.length === 0 ? (
					<p className="text-sm text-gray-500">No orders yet</p>
				) : (
					orders.map(order => (
						<OrderCard key={order.id} order={order} />
					))
				)}
			</div>
		</section>
	);
};

const AdminDashboard = () => {
	const {
		orderedProducts: orders = [],
		loading,
		error
	} = useOrder();

	const groupedOrders = useMemo(() => {
		return {
			pending: orders.filter(order => order.status === ORDER_STATUSES.PENDING),
			inProgress: orders.filter(order => order.status === ORDER_STATUSES.IN_PROGRESS),
			completed: orders.filter(order => order.status === ORDER_STATUSES.COMPLETED),
			cancelled: orders.filter(order => order.status === ORDER_STATUSES.CANCELLED),
			rejected: orders.filter(order => order.status === ORDER_STATUSES.REJECTED)
		};
	}, [orders]);

	if (loading) {
		return (
			<main className="min-h-screen p-4 flex justify-center items-center">
				<p className="text-lg">Loading orders...</p>
			</main>
		);
	}

	if (error) {
		return (
			<main className="min-h-screen p-4 flex justify-center items-center">
				<p className="text-lg text-red-500">
					Error loading orders.
				</p>
			</main>
		);
	}

	return (
		<main className="min-h-screen p-4 flex flex-col gap-15 justify-center items-center">
			<OrderTracker groupedOrders={groupedOrders} />
			<OrderHistory orders={orders} />
		</main>
	);
};

export default AdminDashboard;