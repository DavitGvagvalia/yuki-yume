import { useMemo, useState } from 'react';
import {
	getProductCategoryLabel,
	getProductsMatchingCategory,
	getProductSearchValues
} from '../../../services/product.service.js';

export function useAdminMenuFilters(products, categories) {
	const [searchTerm, setSearchTerm] = useState('');
	const [orderCategory, setOrderCategory] = useState('ALL');

	const productsByCategory = useMemo(() => {
		return getProductsMatchingCategory(products, orderCategory);
	}, [products, orderCategory]);

	const filteredProducts = useMemo(() => {
		const query = searchTerm.trim().toLowerCase();
		const categoryProducts = orderCategory === 'ALL'
			? products
			: getProductsMatchingCategory(products, orderCategory);

		if (!query) {
			return categoryProducts;
		}

		return categoryProducts.filter((product) => {
			const ingredients = Array.isArray(product.ingredients)
				? product.ingredients.join(' ')
				: '';
			const searchableValue = [
				product.name,
				getProductCategoryLabel(product, categories),
				product.popular ? 'popular' : '',
				ingredients,
				...getProductSearchValues(product)
			]
				.filter((value) => value !== undefined && value !== null)
				.join(' ')
				.toLowerCase();

			return searchableValue.includes(query);
		});
	}, [products, categories, orderCategory, searchTerm]);

	const categoryOrderProductIds = useMemo(() => {
		return productsByCategory.map((product) => product.id);
	}, [productsByCategory]);

	return {
		searchTerm,
		setSearchTerm,
		orderCategory,
		setOrderCategory,
		productsByCategory,
		filteredProducts,
		categoryOrderProductIds
	};
}
