import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../services/adminAuth.service.js';
import { useAdminAuth } from '../../hooks/useAdminAuth.jsx';

function AdminLogin() {
	const navigate = useNavigate();
	const location = useLocation();
	const { loading, isAdmin } = useAdminAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');

	const from = location.state?.from || '/admin';

	async function handleSubmit(event) {
		event.preventDefault();
		setError('');
		setSubmitting(true);

		try {
			await loginAdmin(email, password);
			navigate(from, { replace: true });
		} catch (loginError) {
			setError(loginError.message || 'Unable to sign in.');
		} finally {
			setSubmitting(false);
		}
	}

	if (loading) {
		return (
			<main className="min-h-screen p-4 flex justify-center items-center">
				<p className="text-lg text-text-secondary">Checking admin session...</p>
			</main>
		);
	}

	if (isAdmin) {
		return <Navigate to={from} replace />;
	}

	return (
		<main className="min-h-screen px-4 py-28 flex items-center justify-center">
			<section className="w-full max-w-md flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<h1 className="text-3xl font-bold">Admin login</h1>
					<p className="text-sm text-text-secondary">
						Sign in with an authorized admin account.
					</p>
				</div>

				<form
					className="flex flex-col gap-4 p-5 bg-surface border border-border rounded-lg"
					onSubmit={handleSubmit}
				>
					<label className="flex flex-col gap-2 text-sm">
						<span className="text-text-secondary">Email</span>
						<input
							type="email"
							autoComplete="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							required
							className="w-full p-3 rounded bg-card border border-border text-text outline-none focus:border-accent"
						/>
					</label>

					<label className="flex flex-col gap-2 text-sm">
						<span className="text-text-secondary">Password</span>
						<input
							type="password"
							autoComplete="current-password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							required
							className="w-full p-3 rounded bg-card border border-border text-text outline-none focus:border-accent"
						/>
					</label>

					{error && (
						<p className="text-sm text-red-400" role="alert">
							{error}
						</p>
					)}

					<button
						type="submit"
						disabled={submitting}
						className="w-full p-3 rounded bg-accent text-white font-semibold transition hover:bg-accent-hover disabled:bg-disabled disabled:cursor-not-allowed"
					>
						{submitting ? 'Signing in...' : 'Sign in'}
					</button>
				</form>
			</section>
		</main>
	);
}

export default AdminLogin;
