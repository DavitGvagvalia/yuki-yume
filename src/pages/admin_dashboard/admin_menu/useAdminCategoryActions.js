import { useState } from 'react';
import {
	addCategory,
	deleteCategory,
	normalizeCategoryName,
	renameCategory,
	sortCategories,
	updateCategoryOrder
} from '../../../services/category.service.js';

export function useAdminCategoryActions({
	categories,
	refreshCategories,
	setCategories,
	setMessage,
	setError
}) {
	const [creatingCategory, setCreatingCategory] = useState(false);
	const [orderingCategory, setOrderingCategory] = useState(null);
	const [renamingCategory, setRenamingCategory] = useState(null);
	const [deletingCategory, setDeletingCategory] = useState(null);

	function refreshCategoriesQuietly() {
		return refreshCategories({ useCache: false, showLoading: false });
	}

	async function moveCategory(categoryId, directionOrTargetCategoryId) {
		const currentIndex = categories.findIndex((category) => (
			category.id === categoryId
		));
		const nextIndex = typeof directionOrTargetCategoryId === 'number'
			? currentIndex + directionOrTargetCategoryId
			: categories.findIndex((category) => category.id === directionOrTargetCategoryId);

		if (currentIndex === -1 || nextIndex < 0 || nextIndex >= categories.length) {
			return;
		}

		const reorderedCategories = [...categories];
		const [movedCategory] = reorderedCategories.splice(currentIndex, 1);
		reorderedCategories.splice(nextIndex, 0, movedCategory);

		setOrderingCategory(categoryId);
		setMessage('');
		setError('');
		setCategories(reorderedCategories.map((category, index) => ({
			...category,
			sortOrder: index + 1
		})));

		try {
			await updateCategoryOrder(reorderedCategories);
			setMessage('Category order updated.');
			await refreshCategoriesQuietly();
		} catch (orderError) {
			await refreshCategoriesQuietly().catch(() => { });
			setError(orderError.message || 'Unable to update category order.');
		} finally {
			setOrderingCategory(null);
		}
	}

	async function createCategory(categoryName) {
		setCreatingCategory(true);
		setMessage('');
		setError('');

		try {
			const createdCategory = await addCategory(categoryName, categories);

			setCategories((currentCategories) => sortCategories([...currentCategories, createdCategory]));
			setMessage('Category created.');
			await refreshCategoriesQuietly();
		} catch (createError) {
			setError(createError.message || 'Unable to create category.');
		} finally {
			setCreatingCategory(false);
		}
	}

	async function renameSelectedCategory(categoryId, nextCategoryName) {
		setRenamingCategory(categoryId);
		setMessage('');
		setError('');

		try {
			const normalizedNextCategoryName = normalizeCategoryName(nextCategoryName, categories);

			await renameCategory(categoryId, normalizedNextCategoryName, categories);
			setCategories((currentCategories) => (
				currentCategories.map((category) => (
					category.id === categoryId
						? { ...category, name: normalizedNextCategoryName }
						: category
				))
			));
			setMessage('Category renamed.');
			await refreshCategoriesQuietly();
		} catch (renameError) {
			await refreshCategoriesQuietly().catch(() => { });
			setError(renameError.message || 'Unable to rename category.');
		} finally {
			setRenamingCategory(null);
		}
	}

	async function deleteSelectedCategory(category) {
		const confirmed = window.confirm(`Delete ${category.name}?`);

		if (!confirmed) {
			return;
		}

		setDeletingCategory(category.id);
		setMessage('');
		setError('');

		try {
			await deleteCategory(category.id);
			setCategories((currentCategories) => currentCategories.filter((item) => item.id !== category.id));
			setMessage('Category deleted.');
			await refreshCategoriesQuietly();
		} catch (deleteError) {
			setError(deleteError.message || 'Unable to delete category.');
		} finally {
			setDeletingCategory(null);
		}
	}

	return {
		creatingCategory,
		orderingCategory,
		renamingCategory,
		deletingCategory,
		moveCategory,
		createCategory,
		renameCategory: renameSelectedCategory,
		deleteCategory: deleteSelectedCategory
	};
}
