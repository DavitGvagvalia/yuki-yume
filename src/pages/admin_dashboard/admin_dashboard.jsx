import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrders.jsx';
import { logoutAdmin } from '../../services/adminAuth.service.js';

const ORDER_STATUSES = {
	PENDING: 'pending',
	IN_PROGRESS: 'in progress',
	COMPLETED: 'completed',
	CANCELLED: 'cancelled',
	REJECTED: 'rejected'
};

function getOrderDate(order) {
	const orderDate = order.createdAt || order.date;

	if (!orderDate) {
		return null;
	}

	if (typeof orderDate.toDate === 'function') {
		return orderDate.toDate();
	}

	if (typeof orderDate.toMillis === 'function') {
		return new Date(orderDate.toMillis());
	}

	if (orderDate instanceof Date) {
		return orderDate;
	}

	const parsedDate = new Date(orderDate);

	return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function isOrderFromToday(order) {
	const orderDate = getOrderDate(order);

	if (!orderDate) {
		return false;
	}

	const today = new Date();

	return (
		orderDate.getFullYear() === today.getFullYear() &&
		orderDate.getMonth() === today.getMonth() &&
		orderDate.getDate() === today.getDate()
	);
}

function formatOrderDate(order) {
	const orderDate = getOrderDate(order);

	if (!orderDate) {
		return 'No date';
	}

	return orderDate.toLocaleString([], {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

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
		<div className="flex flex-col gap-2 p-3 bg-card border border-border rounded min-w-[280px]">
			<h3 className="text-md font-bold">{order.name}</h3>

			<p className="text-sm text-text-secondary">
				{formatOrderDate(order)}
			</p>

                {order.products.map(product => {
                    return <p key={product.id}>{product.name} x{product.quantity}</p>
                })}

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
		<div className="flex min-h-[420px] flex-col gap-3 rounded-lg border border-border bg-surface p-4">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-xl font-bold">
					{name}
				</h2>

				<span className="rounded bg-card px-2 py-1 text-sm font-semibold">
					{orders.length}
				</span>
			</div>

			<div className="flex flex-1 flex-col gap-3 overflow-auto rounded bg-background/40 p-3">
				{orders.length === 0 ? (
					<p className="text-sm text-text-secondary">No orders</p>
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
		<section className="grid w-full grid-cols-1 gap-5 lg:grid-cols-2">
			<StatusColumn orders={groupedOrders.pending} name="Pending" />
			<StatusColumn orders={groupedOrders.inProgress} name="In Progress" />
		</section>
	);
};

const ExpandableOrderRow = ({ orders, title, defaultOpen = false }) => {
	return (
		<details
			className="group rounded-lg border border-border bg-surface p-4"
			open={defaultOpen}
		>
			<summary className="flex cursor-pointer list-none items-center justify-between gap-3">
				<h2 className="text-xl font-bold">{title}</h2>

				<div className="flex items-center gap-3">
					<span className="rounded bg-card px-2 py-1 text-sm font-semibold">
						{orders.length}
					</span>

					<span className="text-sm text-text-secondary group-open:hidden">
						Expand
					</span>

					<span className="hidden text-sm text-text-secondary group-open:inline">
						Collapse
					</span>
				</div>
			</summary>

			<div className="mt-4 flex gap-4 overflow-auto pb-2">
				{orders.length === 0 ? (
					<p className="text-sm text-text-secondary">No orders yet</p>
				) : (
					orders.map(order => (
						<OrderCard key={order.id} order={order} />
					))
				)}
			</div>
		</details>
	);
};

const OrderHistory = ({ completedTodayOrders, historyOrders }) => {
	return (
		<section className="flex w-full flex-col gap-4">
			<ExpandableOrderRow
				orders={completedTodayOrders}
				title="Completed today"
				defaultOpen
			/>

			<ExpandableOrderRow
				orders={historyOrders}
				title="Order history"
			/>
		</section>
	);
};

const AdminDashboard = () => {
	const navigate = useNavigate();
	const {
		orderedProducts: orders = [],
		loading,
		error
	} = useOrder();

	async function handleLogout() {
		await logoutAdmin();
		navigate('/admin/login', { replace: true });
	}

	const groupedOrders = useMemo(() => {
		const historyStatuses = [
			ORDER_STATUSES.COMPLETED,
			ORDER_STATUSES.CANCELLED,
			ORDER_STATUSES.REJECTED
		];

		return {
			pending: orders.filter(order => order.status === ORDER_STATUSES.PENDING),
			inProgress: orders.filter(order => order.status === ORDER_STATUSES.IN_PROGRESS),
			completedToday: orders.filter(order => (
				order.status === ORDER_STATUSES.COMPLETED && isOrderFromToday(order)
			)),
			history: orders.filter(order => historyStatuses.includes(order.status))
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
		<main className="min-h-screen px-4 py-24">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
				<header className="flex w-full justify-end gap-3">
					<Link
						to="/admin/menu"
						className="px-4 py-2 rounded bg-card border border-border text-text transition hover:border-accent"
					>
						Menu
					</Link>

					<button
						type="button"
						className="px-4 py-2 rounded bg-card border border-border text-text transition hover:border-accent"
						onClick={handleLogout}
					>
						Logout
					</button>
				</header>

				<OrderTracker groupedOrders={groupedOrders} />

				<OrderHistory
					completedTodayOrders={groupedOrders.completedToday}
					historyOrders={groupedOrders.history}
				/>
			</div>
		</main>
	);
};

export default AdminDashboard;
