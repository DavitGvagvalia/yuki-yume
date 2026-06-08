import { useEffect, useState } from 'react';
import {
	isAuthorizedAdmin,
	watchAuthState
} from '../services/adminAuth.service.js';

export function useAdminAuth() {
	const [authState, setAuthState] = useState({
		user: null,
		isAdmin: false,
		loading: true,
		error: null
	});

	useEffect(() => {
		let active = true;

		const unsubscribe = watchAuthState(async (user) => {
			if (!user) {
				if (active) {
					setAuthState({
						user: null,
						isAdmin: false,
						loading: false,
						error: null
					});
				}

				return;
			}

			try {
				const admin = await isAuthorizedAdmin(user);

				if (active) {
					setAuthState({
						user,
						isAdmin: admin,
						loading: false,
						error: null
					});
				}
			} catch (error) {
				if (active) {
					setAuthState({
						user,
						isAdmin: false,
						loading: false,
						error
					});
				}
			}
		});

		return () => {
			active = false;
			unsubscribe();
		};
	}, []);

	return authState;
}
