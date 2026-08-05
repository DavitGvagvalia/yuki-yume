import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutAdmin } from '../../services/adminAuth.service.js';
import { useProducts } from '../../hooks/useProducts.jsx';
import { useCategories } from '../../hooks/useCategories.jsx';
import PageUITemplate from './admin_menu/PageUITemplate.jsx';
import { useAdminCategoryActions } from './admin_menu/useAdminCategoryActions.js';
import { useAdminMenuFilters } from './admin_menu/useAdminMenuFilters.js';
import { useAdminProductActions } from './admin_menu/useAdminProductActions.js';

export default function AdminMenuPage() {
	const navigate = useNavigate();
	const {
		products,
		loading: productsLoading,
		refreshing,
		error: loadError,
		refreshProducts,
		setProducts
	} = useProducts();
	const {
		categories,
		loading: categoriesLoading,
		refreshing: refreshingCategories,
		error: categoriesLoadError,
		refreshCategories,
		setCategories
	} = useCategories();
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const loading = productsLoading || categoriesLoading;
	const filters = useAdminMenuFilters(products, categories);
	const productActions = useAdminProductActions({
		products,
		categories,
		productsByCategory: filters.productsByCategory,
		refreshProducts,
		setProducts,
		setMessage,
		setError
	});
	const categoryActions = useAdminCategoryActions({
		categories,
		refreshCategories,
		setCategories,
		setMessage,
		setError
	});

	async function handleLogout() {
		await logoutAdmin();
		navigate('/admin/login', { replace: true });
	}

	return (
		<PageUITemplate
			products={products}
			categories={categories}
			loading={loading}
			refreshing={refreshing || refreshingCategories}
			loadError={loadError || categoriesLoadError}
			error={error}
			message={message}
			filters={filters}
			productActions={productActions}
			categoryActions={categoryActions}
			onLogout={handleLogout}
		/>
	);
}
