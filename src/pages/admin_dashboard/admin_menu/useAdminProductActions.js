import { useState } from 'react';
import addProduct, {
	batchAddProducts,
	createProductId,
	deleteProduct,
	getProductCategoryIds,
	sortProductsByCategoryOrder,
	updateCategoryProductOrder,
	updateProduct
} from '../../../services/product.service.js';
import {
	getCategoryIdsByNames,
	getUnknownCategoryNames
} from '../../../services/category.service.js';
import { parseXlsxProducts } from '../../../utils/xlsxProductsParser.js';
import {
	createImageFileMap,
	createSafeImageName,
	uploadProductImage
} from '../../../utils/imageHandler.js';
import {
	createEmptyForm,
	formToProduct,
	getImageSizeError,
	isImageFileTooLarge,
	productToForm
} from './adminMenuUtils.js';

export function useAdminProductActions({
	products,
	categories,
	productsByCategory,
	refreshProducts,
	setProducts,
	setMessage,
	setError
}) {
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [form, setForm] = useState(createEmptyForm);
	const [submitting, setSubmitting] = useState(false);
	const [importing, setImporting] = useState(false);
	const [imageFile, setImageFile] = useState(null);
	const [orderingProductId, setOrderingProductId] = useState(null);

	function updateProductsLocally(productsOrUpdater) {
		setProducts((currentProducts) => {
			const nextProducts = typeof productsOrUpdater === 'function'
				? productsOrUpdater(currentProducts)
				: productsOrUpdater;

			return sortProductsByCategoryOrder(nextProducts, categories);
		});
	}

	function refreshProductsQuietly() {
		return refreshProducts({ useCache: false, showLoading: false });
	}

	function startCreateProduct() {
		setSelectedProduct(null);
		setForm(createEmptyForm());
		setImageFile(null);
		setMessage('');
		setError('');
	}

	function selectProduct(product) {
		setSelectedProduct(product);
		setForm(productToForm(product));
		setImageFile(null);
		setMessage('');
		setError('');
	}

	function updateField(field, value) {
		setForm((currentForm) => ({
			...currentForm,
			[field]: value
		}));
	}

	function changeImage(event) {
		const selectedFile = event.target.files?.[0] || null;

		if (isImageFileTooLarge(selectedFile)) {
			setImageFile(null);
			setMessage('');
			setError(getImageSizeError(selectedFile));
			event.target.value = '';
			return;
		}

		setImageFile(selectedFile);
		setError('');
	}

	async function submitProduct(event) {
		event.preventDefault();
		setSubmitting(true);
		setMessage('');
		setError('');

		try {
			const productData = formToProduct(form);

			if (!productData.name) {
				throw new Error('Product name is required.');
			}

			if (productData.categoryIds.length === 0) {
				throw new Error('Choose at least one category.');
			}

			if (!selectedProduct && !form.sortOrder) {
				const matchingCategoryProducts = products.filter((product) => (
					getProductCategoryIds(product).includes(productData.categoryIds[0])
				));
				productData.sortOrder = matchingCategoryProducts.length + 1;
			}

			const normalizedProductData = productData;

			if (selectedProduct) {
				if (imageFile) {
					normalizedProductData.image = await uploadProductImage(selectedProduct.id, imageFile, {
						productName: normalizedProductData.name
					});
				}

				await updateProduct(selectedProduct.id, normalizedProductData);
				const updatedProduct = {
					...selectedProduct,
					...normalizedProductData,
					id: selectedProduct.id,
					imageUrl: selectedProduct.imageUrl
				};

				updateProductsLocally((currentProducts) => (
					currentProducts.map((product) => (
						product.id === selectedProduct.id ? updatedProduct : product
					))
				));
				setSelectedProduct(updatedProduct);
				setMessage('Product updated.');
			} else {
				const productId = createProductId();

				if (imageFile) {
					normalizedProductData.image = await uploadProductImage(productId, imageFile, {
						productName: normalizedProductData.name
					});
				}

				await addProduct(normalizedProductData, productId);
				updateProductsLocally((currentProducts) => ([
					...currentProducts,
					{
						...normalizedProductData,
						id: productId,
						imageUrl: null
					}
				]));
				setMessage('Product created.');
				setForm(createEmptyForm());
			}

			setImageFile(null);
			await refreshProductsQuietly();
		} catch (submitError) {
			setError(submitError.message || 'Unable to save product.');
		} finally {
			setSubmitting(false);
		}
	}

	async function batchUpload(event) {
		const files = Array.from(event.target.files || []);
		const file = files.find((selectedFile) => (
			selectedFile.name.toLowerCase().endsWith('.xlsx') ||
			selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		));
		const imageFiles = files.filter((selectedFile) => selectedFile !== file);
		const oversizedImage = imageFiles.find(isImageFileTooLarge);

		if (!file) {
			setError('Choose one XLSX file.');
			return;
		}

		if (oversizedImage) {
			setMessage('');
			setError(getImageSizeError(oversizedImage));
			event.target.value = '';
			return;
		}

		setImporting(true);
		setMessage('');
		setError('');

		try {
			const parsedProducts = await parseXlsxProducts(file);
			const productsForImport = parsedProducts.map((product) => {
				const sourceCategoryNames = Array.isArray(product.categories)
					? product.categories
					: String(product.category || '').split(',').map((category) => category.trim()).filter(Boolean);
				const unknownCategoryNames = getUnknownCategoryNames(sourceCategoryNames, categories);

				if (unknownCategoryNames.length > 0) {
					return {
						...product,
						_invalidReason: `Unknown category: ${unknownCategoryNames.join(', ')}`
					};
				}

				return {
					...product,
					categoryIds: getCategoryIdsByNames(sourceCategoryNames, categories)
				};
			});
			const imageFileMap = createImageFileMap(imageFiles);
			const knownProductNames = new Set(
				products.map((product) => createSafeImageName(product.name))
			);
			const uploadProductNames = new Set();
			let uploadedImages = 0;

			for (const product of productsForImport) {
				const safeProductName = createSafeImageName(product.name);
				const matchingImage = imageFileMap.get(safeProductName);

				if (
					product._invalidReason ||
					!safeProductName ||
					knownProductNames.has(safeProductName) ||
					uploadProductNames.has(safeProductName)
				) {
					continue;
				}

				uploadProductNames.add(safeProductName);

				if (matchingImage) {
					product._productId = createProductId();
					product.image = await uploadProductImage(product._productId, matchingImage, {
						productName: product.name
					});
					uploadedImages += 1;
				}
			}

			const result = await batchAddProducts(productsForImport);
			const skippedCount = result.skipped.length;
			const invalidCount = result.invalid.length;
			const unmatchedImages = Math.max(imageFiles.length - uploadedImages, 0);

			await refreshProductsQuietly();
			setMessage(
				`Batch upload complete. Added ${result.added} product${result.added === 1 ? '' : 's'}, uploaded ${uploadedImages} image${uploadedImages === 1 ? '' : 's'}, skipped ${skippedCount} duplicate${skippedCount === 1 ? '' : 's'}, invalid ${invalidCount} row${invalidCount === 1 ? '' : 's'}, unmatched images ${unmatchedImages}.`
			);
		} catch (uploadError) {
			setError(uploadError.message || 'Unable to upload XLSX file.');
		} finally {
			event.target.value = '';
			setImporting(false);
		}
	}

	async function deleteSelectedProduct() {
		if (!selectedProduct) {
			return;
		}

		const confirmed = window.confirm(`Delete ${selectedProduct.name}?`);

		if (!confirmed) {
			return;
		}

		setSubmitting(true);
		setMessage('');
		setError('');

		try {
			await deleteProduct(selectedProduct.id);
			updateProductsLocally((currentProducts) => (
				currentProducts.filter((product) => product.id !== selectedProduct.id)
			));
			startCreateProduct();
			setMessage('Product deleted.');
			await refreshProductsQuietly();
		} catch (deleteError) {
			setError(deleteError.message || 'Unable to delete product.');
		} finally {
			setSubmitting(false);
		}
	}

	async function reorderProduct(sourceProductId, targetProductId) {
		const currentIndex = productsByCategory.findIndex((product) => product.id === sourceProductId);
		const nextIndex = productsByCategory.findIndex((product) => product.id === targetProductId);

		if (currentIndex === -1 || nextIndex < 0 || nextIndex >= productsByCategory.length) {
			return;
		}

		if (currentIndex === nextIndex) {
			return;
		}

		const reorderedProducts = [...productsByCategory];
		const [movedProduct] = reorderedProducts.splice(currentIndex, 1);
		reorderedProducts.splice(nextIndex, 0, movedProduct);
		const sortOrdersById = new Map(
			reorderedProducts.map((product, index) => [product.id, index + 1])
		);

		setOrderingProductId(sourceProductId);
		setMessage('');
		setError('');
		updateProductsLocally((currentProducts) => (
			currentProducts.map((product) => (
				sortOrdersById.has(product.id)
					? { ...product, sortOrder: sortOrdersById.get(product.id) }
					: product
			))
		));

		try {
			await updateCategoryProductOrder(reorderedProducts);
			setMessage('Product order updated.');
			await refreshProductsQuietly();
		} catch (orderError) {
			await refreshProductsQuietly().catch(() => { });
			setError(orderError.message || 'Unable to update product order.');
		} finally {
			setOrderingProductId(null);
		}
	}

	return {
		selectedProduct,
		form,
		submitting,
		importing,
		imageFile,
		orderingProductId,
		startCreateProduct,
		selectProduct,
		updateField,
		changeImage,
		submitProduct,
		batchUpload,
		deleteSelectedProduct,
		reorderProduct
	};
}
