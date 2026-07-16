import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import addProduct, {
	batchAddProducts,
	deleteProduct,
	getProductCategoryLabel,
	getProductCategoryIds,
	getProductPriceInfo,
	getProductsMatchingCategory,
	getProductSearchValues,
	sortProductsByCategoryOrder,
	updateCategoryProductOrder,
	updateProduct
} from '../../services/product.service.js';
import {
	addCategory,
	deleteCategory,
	getCategoryIdsByNames,
	getUnknownCategoryNames,
	normalizeCategoryName,
	renameCategory,
	sortCategories,
	updateCategoryOrder
} from '../../services/category.service.js';
import {
	PRODUCT_FIELD_TYPES,
	adminProductFields,
	createProductFormDefaults,
	formValuesToProduct,
	productToFormValues
} from '../../config/productFields.js';
import { logoutAdmin } from '../../services/adminAuth.service.js';
import { useProducts } from '../../hooks/useProducts.jsx';
import { useCategories } from '../../hooks/useCategories.jsx';
import { parseXlsxProducts } from '../../utils/xlsxProductsParser.js';
import {
	createImageFileMap,
	createSafeImageName,
	getProductImagePath,
	uploadProductImage
} from '../../utils/imageHandler.js';

const POPULAR_CATEGORY = 'POPULAR';
const PRODUCT_FORM_FIELD_GROUPS = [
	{
		title: 'Basic details',
		fields: ['name', 'price', 'promotion', 'preparationTime', 'sortOrder', 'ingredients']
	},
	{
		title: 'Portion and nutrition',
		fields: ['weight', 'pieces', 'calories']
	}
];
const ADMIN_FIELDS_BY_KEY = new Map(
	adminProductFields.map((field) => [field.key, field])
);

function productToForm(product) {
	return productToFormValues(product, getProductCategoryIds);
}

function createEmptyForm() {
	return createProductFormDefaults();
}

function formToProduct(form) {
	const categoryIds = Array.isArray(form.categoryIds)
		? form.categoryIds.map((categoryId) => String(categoryId || '').trim()).filter(Boolean)
		: [];
	const productData = formValuesToProduct({
		...form,
		categoryIds
	});

	return {
		...productData,
		categoryIds
	};
}

function ProductList({
	products,
	totalProducts,
	categories,
	orderCategory,
	searchTerm,
	selectedProductId,
	importing,
	orderingProductId,
	categoryOrderProductIds,
	onOrderCategoryChange,
	onSearchChange,
	onSelect,
	onCreate,
	onReorderProduct,
	onBatchUpload
}) {
	const canReorder = orderCategory !== 'ALL' && !searchTerm.trim();
	const [draggedProductId, setDraggedProductId] = useState(null);
	const [dropTargetProductId, setDropTargetProductId] = useState(null);
	const isOrdering = Boolean(orderingProductId);

	function handleProductDragStart(event, productId) {
		if (!canReorder || isOrdering) {
			event.preventDefault();
			return;
		}

		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', productId);
		setDraggedProductId(productId);
	}

	function handleProductDragOver(event, productId) {
		if (!canReorder || isOrdering || draggedProductId === productId) {
			return;
		}

		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
		setDropTargetProductId(productId);
	}

	function handleProductDrop(event, targetProductId) {
		event.preventDefault();

		const sourceProductId = draggedProductId || event.dataTransfer.getData('text/plain');
		setDraggedProductId(null);
		setDropTargetProductId(null);

		if (!canReorder || isOrdering || !sourceProductId || sourceProductId === targetProductId) {
			return;
		}

		onReorderProduct(sourceProductId, targetProductId);
	}

	function handleProductDragEnd() {
		setDraggedProductId(null);
		setDropTargetProductId(null);
	}

	return (
		<section className="flex flex-col gap-4 rounded-lg border border-border bg-panel p-4">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-xl font-bold">Products</h2>

				<div className="flex flex-wrap justify-end gap-2">
					<label className={`cursor-pointer rounded border border-border bg-control px-4 py-2 text-sm font-semibold transition hover:border-accent hover:bg-control-hover ${
						importing ? 'pointer-events-none opacity-60' : ''
					}`}>
						<input
							type="file"
							accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png,image/webp,image/avif"
							className="sr-only"
							disabled={importing}
							multiple
							onChange={onBatchUpload}
						/>
						{importing ? 'Uploading...' : 'Upload XLSX + images'}
					</label>

					<button
						type="button"
						className="rounded bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition hover:bg-accent-hover"
						onClick={onCreate}
					>
						Add product
					</button>
				</div>
			</div>

			<label className="flex flex-col gap-2 text-sm">
				<span className="text-text-secondary">Search products</span>
				<input
					type="search"
					value={searchTerm}
					placeholder="Search by name, category, ingredients..."
					onChange={(event) => onSearchChange(event.target.value)}
					className="rounded border border-border bg-control p-3 text-text outline-none transition focus:border-accent"
				/>
				<span className="text-xs text-text-secondary">
					Showing {products.length} of {totalProducts} products.
				</span>
			</label>

			<label className="flex flex-col gap-2 text-sm">
				<span className="text-text-secondary">Order products in category</span>
				<select
					value={orderCategory}
					onChange={(event) => onOrderCategoryChange(event.target.value)}
					className="rounded border border-border bg-control p-3 text-text outline-none transition focus:border-accent"
				>
					<option value="ALL">All categories</option>
					<option value={POPULAR_CATEGORY}>{POPULAR_CATEGORY}</option>
					{categories.map((category) => (
						<option key={category.id} value={category.id}>{category.name}</option>
					))}
				</select>
				<span className="text-xs text-text-secondary">
					Choose a category, then drag products into the customer menu order.
				</span>
			</label>

			<div className="flex max-h-[680px] flex-col gap-2 overflow-auto">
				{products.length === 0 ? (
					<p className="text-sm text-text-secondary">No products found.</p>
				) : (
					products.map((product) => {
						const orderIndex = categoryOrderProductIds.indexOf(product.id);
						const canDragProduct = canReorder && orderIndex !== -1 && !isOrdering;
						const priceInfo = getProductPriceInfo(product);

						return (
							<div
								key={product.id}
								role="button"
								tabIndex={0}
								draggable={canDragProduct}
								aria-grabbed={draggedProductId === product.id}
								className={`flex items-center gap-3 rounded border p-3 text-left transition ${
									dropTargetProductId === product.id
										? 'border-accent bg-accent-soft'
										: selectedProductId === product.id
										? 'border-accent bg-control'
										: 'border-border bg-background/35 hover:border-accent hover:bg-control'
								} ${canDragProduct ? 'cursor-grab active:cursor-grabbing' : ''} ${
									draggedProductId === product.id ? 'opacity-60' : ''
								}`}
								onClick={() => onSelect(product)}
								onKeyDown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault();
										onSelect(product);
									}
								}}
								onDragStart={(event) => handleProductDragStart(event, product.id)}
								onDragOver={(event) => handleProductDragOver(event, product.id)}
								onDragLeave={() => {
									if (dropTargetProductId === product.id) {
										setDropTargetProductId(null);
									}
								}}
								onDrop={(event) => handleProductDrop(event, product.id)}
								onDragEnd={handleProductDragEnd}
							>
								{canReorder && (
									<span className="rounded bg-control px-2 py-1 text-xs text-text-secondary">
										#{orderIndex + 1}
									</span>
								)}

								<img
									src={product.imageUrl}
									alt={product.name}
									className="h-14 w-14 rounded object-cover"
								/>

								<span className="min-w-0 flex-1">
									<span className="block truncate font-semibold">{product.name}</span>
									<span className="block text-sm text-text-secondary">
										{getProductCategoryLabel(product, categories) || 'No category'} ·{' '}
										{priceInfo.hasPromotion ? (
											<>
												{priceInfo.currentPriceLabel}₾{' '}
												<span className="line-through">{priceInfo.basePriceLabel}₾</span>{' '}
												<span className="text-success">-{priceInfo.promotion}%</span>
											</>
										) : (
											<>{priceInfo.basePriceLabel}₾</>
										)}
										{product.popular && ' · popular'}
										{Number.isFinite(Number(product.sortOrder)) && (
											<> · #{Number(product.sortOrder)}</>
										)}
									</span>
								</span>

								{canReorder && (
									<span className="rounded border border-border bg-control px-2 py-1 text-xs text-text-secondary">
										{orderingProductId === product.id ? 'Saving' : 'Drag'}
									</span>
								)}

								<span className={`rounded px-2 py-1 text-xs ${
									product.available === false
										? 'bg-danger-soft text-danger'
										: 'bg-success-soft text-success'
								}`}>
									{product.available === false ? 'Hidden' : 'Available'}
								</span>
							</div>
						);
					})
				)}
			</div>
		</section>
	);
}

function CategoryOrderPanel({
	categories,
	orderingCategory,
	renamingCategory,
	deletingCategory,
	creatingCategory,
	onMoveCategory,
	onRenameCategory,
	onCreateCategory,
	onDeleteCategory
}) {
	const [renameValues, setRenameValues] = useState({});
	const [categoryDraft, setCategoryDraft] = useState('');

	return (
		<section className="flex flex-col gap-4 rounded-lg border border-border bg-panel p-4">
			<div>
				<h2 className="text-xl font-bold">Category order</h2>
				<p className="text-sm text-text-secondary">
					This controls the order of category tabs in the customer catalog.
				</p>
			</div>

			<form
				className="flex flex-col gap-2 sm:flex-row"
				onSubmit={(event) => {
					event.preventDefault();
					onCreateCategory(categoryDraft);
					setCategoryDraft('');
				}}
			>
				<input
					type="text"
					value={categoryDraft}
					placeholder="New category"
					className="min-w-0 flex-1 rounded border border-border bg-control px-3 py-2 text-sm text-text outline-none transition focus:border-accent"
					onChange={(event) => setCategoryDraft(event.target.value)}
				/>
				<button
					type="submit"
					className="rounded border border-border bg-control px-4 py-2 text-sm transition hover:border-accent hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-40"
					disabled={creatingCategory || !categoryDraft.trim()}
				>
					{creatingCategory ? 'Creating' : 'Create category'}
				</button>
			</form>

			{categories.length === 0 ? (
				<p className="text-sm text-text-secondary">No categories found.</p>
			) : (
				<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
					{categories.map((category, index) => (
						<div
							key={category.id}
							className="flex flex-col gap-3 rounded border border-border bg-background/35 p-3"
						>
							<div className="flex items-center gap-3">
								<span className="rounded bg-control px-2 py-1 text-xs text-text-secondary">
									#{index + 1}
								</span>
								<span className="min-w-0 flex-1 truncate font-semibold">
									{category.name}
								</span>
								<div className="flex gap-1">
									<button
										type="button"
										className="rounded border border-border bg-control px-2 py-1 text-xs transition hover:border-accent hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-40"
										disabled={index === 0 || orderingCategory === category.id}
										onClick={() => onMoveCategory(category.id, -1)}
									>
										Up
									</button>
									<button
										type="button"
										className="rounded border border-border bg-control px-2 py-1 text-xs transition hover:border-accent hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-40"
										disabled={index === categories.length - 1 || orderingCategory === category.id}
										onClick={() => onMoveCategory(category.id, 1)}
									>
										Down
									</button>
								</div>
							</div>

							<form
								className="flex gap-2"
								onSubmit={(event) => {
									event.preventDefault();
									onRenameCategory(category.id, renameValues[category.id] || '');
									setRenameValues((currentValues) => ({
										...currentValues,
										[category.id]: ''
									}));
								}}
							>
								<input
									type="text"
									value={renameValues[category.id] || ''}
									placeholder="Rename category"
									className="min-w-0 flex-1 rounded border border-border bg-control px-2 py-1 text-sm text-text outline-none transition focus:border-accent"
									onChange={(event) => setRenameValues((currentValues) => ({
										...currentValues,
										[category.id]: event.target.value
									}))}
								/>
								<button
									type="submit"
									className="rounded border border-border bg-control px-2 py-1 text-xs transition hover:border-accent hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-40"
									disabled={renamingCategory === category.id || !String(renameValues[category.id] || '').trim()}
								>
									{renamingCategory === category.id ? 'Saving' : 'Rename'}
								</button>
								<button
									type="button"
									className="rounded border border-danger px-2 py-1 text-xs text-danger transition hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-40"
									disabled={deletingCategory === category.id}
									onClick={() => onDeleteCategory(category)}
								>
									{deletingCategory === category.id ? 'Deleting' : 'Delete'}
								</button>
							</form>
							</div>
					))}
				</div>
			)}
		</section>
	);
}

function CategorySelector({ selectedCategoryIds, categories, onChange }) {
	function toggleCategory(categoryId) {
		if (selectedCategoryIds.includes(categoryId)) {
			onChange(selectedCategoryIds.filter((selectedCategoryId) => selectedCategoryId !== categoryId));
			return;
		}

		onChange([...selectedCategoryIds, categoryId]);
	}

	return (
		<div className="flex flex-col gap-2 text-sm">
			<span className="text-text-secondary">Categories</span>
			<div className="grid grid-cols-1 gap-2 rounded border border-border bg-control p-3 sm:grid-cols-2">
				{categories.length === 0 ? (
					<p className="text-xs text-text-secondary">Create a category before assigning products.</p>
				) : categories.map((category) => (
					<label key={category.id} className="flex items-center gap-2 rounded bg-background/30 px-2 py-1">
						<input
							type="checkbox"
							checked={selectedCategoryIds.includes(category.id)}
							onChange={() => toggleCategory(category.id)}
						/>
						<span>{category.name}</span>
					</label>
				))}
			</div>
			<span className="text-xs text-text-secondary">
				Products can only use categories that exist in the category table.
			</span>
		</div>
	);
}

function ProductForm({
	form,
	mode,
	categories,
	submitting,
	imageFile,
	onChange,
	onImageChange,
	onSubmit,
	onDelete
}) {
	const fieldGroups = PRODUCT_FORM_FIELD_GROUPS.map((group) => ({
		...group,
		fields: group.fields
			.map((fieldKey) => ADMIN_FIELDS_BY_KEY.get(fieldKey))
			.filter((field) => field && field.type !== PRODUCT_FIELD_TYPES.boolean)
	})).filter((group) => group.fields.length > 0);
	const booleanFields = adminProductFields.filter((field) => (
		field.admin && field.type === PRODUCT_FIELD_TYPES.boolean
	));
	let imageUploadPath = '';

	if (imageFile && form.name) {
		try {
			imageUploadPath = getProductImagePath(form.name, imageFile);
		} catch {}
	}

	return (
		<form
			className="flex flex-col gap-5 rounded-lg border border-border bg-panel p-4"
			onSubmit={onSubmit}
		>
			<div className="flex items-start justify-between gap-3">
				<div>
					<h2 className="text-xl font-bold">
						{mode === 'create' ? 'Add product' : 'Edit product'}
					</h2>
					<p className="text-sm text-text-secondary">
						Upload an image to save it in Firebase Storage under products/.
					</p>
				</div>

				{mode === 'edit' && (
					<button
						type="button"
						className="rounded border border-danger px-4 py-2 text-sm font-semibold text-danger transition hover:bg-danger-soft"
						disabled={submitting}
						onClick={onDelete}
					>
						Delete
					</button>
				)}
			</div>

			{fieldGroups.map((group) => (
				<section key={group.title} className="flex flex-col gap-3">
					<h3 className="text-sm font-semibold text-text-secondary">{group.title}</h3>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{group.fields.map((field) => (
							<label key={field.key} className="flex flex-col gap-2 text-sm">
								<span className="text-text-secondary">{field.label}</span>
								<input
									type={field.type === PRODUCT_FIELD_TYPES.number ? 'number' : 'text'}
									value={form[field.key]}
									required={field.required}
									{...(field.inputProps || {})}
									onChange={(event) => onChange(field.key, event.target.value)}
									className="rounded border border-border bg-control p-3 text-text outline-none transition focus:border-accent"
								/>
							</label>
						))}
					</div>
				</section>
			))}

			<CategorySelector
				selectedCategoryIds={form.categoryIds}
				categories={categories}
				onChange={(nextCategoryIds) => onChange('categoryIds', nextCategoryIds)}
			/>

			<label className="flex flex-col gap-2 text-sm">
				<span className="text-text-secondary">Image file</span>
				<input
					type="file"
					accept="image/jpeg,image/png,image/webp,image/avif"
					onChange={onImageChange}
					className="rounded border border-border bg-control p-3 text-text outline-none transition focus:border-accent"
				/>
				{imageUploadPath && (
					<span className="text-xs text-text-secondary">
						Will upload as {imageUploadPath}
					</span>
				)}
			</label>

			<div className="flex flex-wrap gap-4 text-sm">
				{booleanFields.map((field) => (
					<label key={field.key} className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={Boolean(form[field.key])}
							onChange={(event) => onChange(field.key, event.target.checked)}
						/>
						<span>{field.label}</span>
					</label>
				))}
			</div>

			<button
				type="submit"
				disabled={submitting}
				className="rounded bg-accent px-4 py-3 font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-disabled disabled:text-muted"
			>
				{submitting
					? 'Saving...'
					: mode === 'create'
						? 'Create product'
						: 'Save changes'}
			</button>
		</form>
	);
}

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
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [form, setForm] = useState(createEmptyForm);
	const [submitting, setSubmitting] = useState(false);
	const [importing, setImporting] = useState(false);
	const [creatingCategory, setCreatingCategory] = useState(false);
	const [imageFile, setImageFile] = useState(null);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [orderCategory, setOrderCategory] = useState('ALL');
	const [orderingProductId, setOrderingProductId] = useState(null);
	const [orderingCategory, setOrderingCategory] = useState(null);
	const [renamingCategory, setRenamingCategory] = useState(null);
	const [deletingCategory, setDeletingCategory] = useState(null);
	const orderedCategories = categories;
	const loading = productsLoading || categoriesLoading;

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

	function handleCreateMode() {
		setSelectedProduct(null);
		setForm(createEmptyForm());
		setImageFile(null);
		setMessage('');
		setError('');
	}

	function handleSelectProduct(product) {
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

	function refreshCategoriesQuietly() {
		return refreshCategories({ useCache: false, showLoading: false });
	}

	async function handleLogout() {
		await logoutAdmin();
		navigate('/admin/login', { replace: true });
	}

	async function handleSubmit(event) {
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

			if (imageFile) {
				productData.image = await uploadProductImage(productData.name, imageFile);
			}

			if (!selectedProduct && !form.sortOrder) {
				const matchingCategoryProducts = products.filter((product) => (
					getProductCategoryIds(product).includes(productData.categoryIds[0])
				));
				productData.sortOrder = matchingCategoryProducts.length + 1;
			}

			const normalizedProductData = productData;

			if (selectedProduct) {
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
				const productId = await addProduct(normalizedProductData);
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

	async function handleBatchUpload(event) {
		const files = Array.from(event.target.files || []);
		const file = files.find((selectedFile) => (
			selectedFile.name.toLowerCase().endsWith('.xlsx') ||
			selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		));
		const imageFiles = files.filter((selectedFile) => selectedFile !== file);

		if (!file) {
			setError('Choose one XLSX file.');
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
					product.image = await uploadProductImage(product.name, matchingImage);
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

	async function handleDelete() {
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
			handleCreateMode();
			setMessage('Product deleted.');
			await refreshProductsQuietly();
		} catch (deleteError) {
			setError(deleteError.message || 'Unable to delete product.');
		} finally {
			setSubmitting(false);
		}
	}

	async function handleReorderProduct(sourceProductId, targetProductId) {
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
			await refreshProductsQuietly().catch(() => {});
			setError(orderError.message || 'Unable to update product order.');
		} finally {
			setOrderingProductId(null);
		}
	}

	async function handleMoveCategory(categoryId, direction) {
		const currentIndex = orderedCategories.findIndex((category) => (
			category.id === categoryId
		));
		const nextIndex = currentIndex + direction;

		if (currentIndex === -1 || nextIndex < 0 || nextIndex >= orderedCategories.length) {
			return;
		}

		const reorderedCategories = [...orderedCategories];
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
			await refreshCategoriesQuietly().catch(() => {});
			setError(orderError.message || 'Unable to update category order.');
		} finally {
			setOrderingCategory(null);
		}
	}

	async function handleCreateCategory(categoryName) {
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

	async function handleRenameCategory(categoryId, nextCategoryName) {
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
			await refreshCategoriesQuietly().catch(() => {});
			setError(renameError.message || 'Unable to rename category.');
		} finally {
			setRenamingCategory(null);
		}
	}

	async function handleDeleteCategory(category) {
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

	return (
		<main className="min-h-screen px-4 py-24">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
				<header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-3xl font-bold">Admin menu</h1>
						<p className="text-sm text-text-secondary">
							Create, edit, and remove products shown in the customer menu.
						</p>
					</div>

					<div className="flex flex-wrap gap-3">
						<Link
							to="/admin"
							className="rounded border border-border bg-control px-4 py-2 text-sm transition hover:border-accent hover:bg-control-hover"
						>
							Orders
						</Link>

						<button
							type="button"
							className="rounded border border-border bg-control px-4 py-2 text-sm transition hover:border-accent hover:bg-control-hover"
							onClick={handleLogout}
						>
							Logout
						</button>
					</div>
				</header>

				{(loadError || categoriesLoadError) && (
					<p className="rounded border border-danger/40 bg-danger-soft p-3 text-sm text-danger" role="alert">
						Unable to load menu data.
					</p>
				)}

				{error && (
					<p className="rounded border border-danger/40 bg-danger-soft p-3 text-sm text-danger" role="alert">
						{error}
					</p>
				)}

				{message && (
					<p className="rounded border border-success/40 bg-success-soft p-3 text-sm text-success" role="status">
						{message}
					</p>
				)}

				{(refreshing || refreshingCategories) && (
					<p className="rounded border border-border bg-control p-3 text-sm text-text-secondary" role="status">
						Syncing latest menu data...
					</p>
				)}

				{loading ? (
					<p className="text-lg text-text-secondary">Loading products...</p>
				) : (
					<div className="flex flex-col gap-6">
						<CategoryOrderPanel
							categories={orderedCategories}
							orderingCategory={orderingCategory}
							renamingCategory={renamingCategory}
							deletingCategory={deletingCategory}
							creatingCategory={creatingCategory}
							onMoveCategory={handleMoveCategory}
							onRenameCategory={handleRenameCategory}
							onCreateCategory={handleCreateCategory}
							onDeleteCategory={handleDeleteCategory}
						/>

						<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,380px)_1fr]">
							<ProductList
								products={filteredProducts}
								totalProducts={products.length}
								categories={categories}
								orderCategory={orderCategory}
								searchTerm={searchTerm}
								selectedProductId={selectedProduct?.id}
								importing={importing}
								orderingProductId={orderingProductId}
								categoryOrderProductIds={productsByCategory.map((product) => product.id)}
								onOrderCategoryChange={setOrderCategory}
								onSearchChange={setSearchTerm}
								onSelect={handleSelectProduct}
								onCreate={handleCreateMode}
								onReorderProduct={handleReorderProduct}
								onBatchUpload={handleBatchUpload}
							/>

							<ProductForm
								form={form}
								mode={selectedProduct ? 'edit' : 'create'}
								categories={categories}
								submitting={submitting}
								imageFile={imageFile}
								onChange={updateField}
								onImageChange={(event) => setImageFile(event.target.files?.[0] || null)}
								onSubmit={handleSubmit}
								onDelete={handleDelete}
							/>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
