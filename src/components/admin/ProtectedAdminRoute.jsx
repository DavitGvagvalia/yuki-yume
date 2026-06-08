import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth.jsx';

function AdminAuthLoading() {
	return (
		<main className="min-h-screen p-4 flex justify-center items-center">
			<p className="text-lg text-text-secondary">Checking admin session...</p>
		</main>
	);
}

export default function ProtectedAdminRoute({ children }) {
	const location = useLocation();
	const { loading, isAdmin, error } = useAdminAuth();

	if (loading) {
		return <AdminAuthLoading />;
	}

	if (error || !isAdmin) {
		return (
			<Navigate
				to="/admin/login"
				replace
				state={{
					from: location.pathname,
					denied: Boolean(error)
				}}
			/>
		);
	}

	return children;
}
