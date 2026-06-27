import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import addProduct, {
	batchAddProducts,
	deleteProduct,
	getProductCategoryLabel,
	getProductCategories,
	getOrderedCategories,
	getProductsMatchingCategory,
	updateCategoryOrder,
	updateCategoryProductOrder,
	updateProduct
} from '../../services/product.service.js';
import { logoutAdmin } from '../../services/adminAuth.service.js';
import { useProducts } from '../../hooks/useProducts.jsx';
import { parseXlsxProducts } from '../../utils/xlsxProductsParser.js';
import {
	createImageFileMap,
	createSafeImageName,
	getProductImagePath,
	uploadProductImage
} from '../../utils/imageHandler.js';

const EMPTY_FORM = {
	image: '',
	name: '',
	price: '',
	categories: '',
	sortOrder: '',
	popular: false,
	available: true,
	spicy: false,
	vegetarian: false,
	preparationTime: '',
	ingredients: ''
};

const POPULAR_CATEGORY = 'POPULAR';

function productToForm(product) {
	return {
		image: product.image || '',
		name: product.name || '',
		price: product.price ?? '',
		categories: getProductCategories(product).join(', '),
		sortOrder: product.sortOrder ?? '',
		popular: Boolean(product.popular),
		available: product.available ?? true,
		spicy: Boolean(product.spicy),
		vegetarian: Boolean(product.vegetarian),
		preparationTime: product.preparationTime ?? '',
		ingredients: Array.isArray(product.ingredients)
			? product.ingredients.join(', ')
			: ''
	};
}

function formToProduct(form) {
	const categories = form.categories
		.split(',')
		.map((category) => category.trim())
		.filter((category) => category.toLowerCase() !== 'popular')
		.filter(Boolean);

	return {
		image: form.image.trim(),
		name: form.name.trim(),
		price: Number(form.price),
		category: categories[0] || '',
		categories,
		sortOrder: Number(form.sortOrder || 0),
		popular: form.popular,
		available: form.available,
		spicy: form.spicy,
		vegetarian: form.vegetarian,
		preparationTime: Number(form.preparationTime || 0),
		ingredients: form.ingredients
			.split(',')
			.map((ingredient) => ingredient.trim())
			.filter(Boolean)
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
	onMoveProduct,
	onBatchUpload
}) {
	const canReorder = orderCategory !== 'ALL' && !searchTerm.trim();

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
						<option key={category} value={category}>{category}</option>
					))}
				</select>
				<span className="text-xs text-text-secondary">
					Choose a category and use the arrows to set the customer menu order.
				</span>
			</label>

			<div className="flex max-h-[680px] flex-col gap-2 overflow-auto">
				{products.length === 0 ? (
					<p className="text-sm text-text-secondary">No products found.</p>
				) : (
					products.map((product) => {
						const orderIndex = categoryOrderProductIds.indexOf(product.id);
						const canMoveProduct = canReorder && orderIndex !== -1;

						return (
							<div
								key={product.id}
								role="button"
								tabIndex={0}
								className={`flex items-center gap-3 rounded border p-3 text-left transition ${
									selectedProductId === product.id
										? 'border-accent bg-control'
										: 'border-border bg-background/35 hover:border-accent hover:bg-control'
								}`}
								onClick={() => onSelect(product)}
								onKeyDown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault();
										onSelect(product);
									}
								}}
							>
								<img
									src={product.imageUrl}
									alt={product.name}
									className="h-14 w-14 rounded object-cover"
								/>

								<span className="min-w-0 flex-1">
									<span className="block truncate font-semibold">{product.name}</span>
									<span className="block text-sm text-text-secondary">
										{getProductCategoryLabel(product) || 'No category'} · {product.price}₾
										{product.popular && ' · popular'}
										{Number.isFinite(Number(product.sortOrder)) && (
											<> · #{Number(product.sortOrder)}</>
										)}
									</span>
								</span>

								{canMoveProduct && (
									<span className="flex flex-col gap-1" aria-label={`Move ${product.name}`}>
										<button
											type="button"
											className="rounded border border-border bg-control px-2 py-1 text-xs transition hover:border-accent hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-40"
											disabled={orderIndex === 0 || orderingProductId === product.id}
											onClick={(event) => {
												event.stopPropagation();
												onMoveProduct(product.id, -1);
											}}
										>
											Up
										</button>
										<button
											type="button"
											className="rounded border border-border bg-control px-2 py-1 text-xs transition hover:border-accent hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-40"
											disabled={
												orderIndex === categoryOrderProductIds.length - 1 ||
												orderingProductId === product.id
											}
											onClick={(event) => {
												event.stopPropagation();
												onMoveProduct(product.id, 1);
											}}
										>
											Down
										</button>
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
	onMoveCategory
}) {
	return (
		<section className="flex flex-col gap-4 rounded-lg border border-border bg-panel p-4">
			<div>
				<h2 className="text-xl font-bold">Category order</h2>
				<p className="text-sm text-text-secondary">
					This controls the order of category tabs in the customer catalog.
				</p>
			</div>

			{categories.length === 0 ? (
				<p className="text-sm text-text-secondary">No categories found.</p>
			) : (
				<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
					{categories.map((category, index) => (
						<div
							key={category.name}
							className="flex items-center gap-3 rounded border border-border bg-background/35 p-3"
						>
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
									disabled={index === 0 || orderingCategory === category.name}
									onClick={() => onMoveCategory(category.name, -1)}
								>
									Up
								</button>
								<button
									type="button"
									className="rounded border border-border bg-control px-2 py-1 text-xs transition hover:border-accent hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-40"
									disabled={index === categories.length - 1 || orderingCategory === category.name}
									onClick={() => onMoveCategory(category.name, 1)}
								>
									Down
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</section>
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

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<label className="flex flex-col gap-2 text-sm">
					<span className="text-text-secondary">Name</span>
					<input
						type="text"
						value={form.name}
						required
						onChange={(event) => onChange('name', event.target.value)}
						className="rounded border border-border bg-control p-3 text-text outline-none transition focus:border-accent"
					/>
				</label>

				<label className="flex flex-col gap-2 text-sm">
					<span className="text-text-secondary">Categories</span>
					<input
						type="text"
						list="product-categories"
						value={form.categories}
						required
						placeholder="Sushi, Rolls, Sets"
						onChange={(event) => onChange('categories', event.target.value)}
						className="rounded border border-border bg-control p-3 text-text outline-none transition focus:border-accent"
					/>
					<datalist id="product-categories">
						{categories.map((category) => (
							<option key={category} value={category} />
						))}
					</datalist>
				</label>

				<label className="flex flex-col gap-2 text-sm">
					<span className="text-text-secondary">Price</span>
					<input
						type="number"
						min="0"
						step="0.01"
						value={form.price}
						required
						onChange={(event) => onChange('price', event.target.value)}
						className="rounded border border-border bg-control p-3 text-text outline-none transition focus:border-accent"
					/>
				</label>

				<label className="flex flex-col gap-2 text-sm">
					<span className="text-text-secondary">Preparation time</span>
					<input
						type="number"
						min="0"
						step="1"
						value={form.preparationTime}
						onChange={(event) => onChange('preparationTime', event.target.value)}
						className="rounded border border-border bg-control p-3 text-text outline-none transition focus:border-accent"
					/>
				</label>

				<label className="flex flex-col gap-2 text-sm">
					<span className="text-text-secondary">Order in category</span>
					<input
						type="number"
						min="0"
						step="1"
						value={form.sortOrder}
						onChange={(event) => onChange('sortOrder', event.target.value)}
						className="rounded border border-border bg-control p-3 text-text outline-none transition focus:border-accent"
					/>
				</label>
			</div>

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

			<label className="flex flex-col gap-2 text-sm">
				<span className="text-text-secondary">Image path</span>
				<input
					type="text"
					value={form.image}
					required={!imageFile}
					onChange={(event) => onChange('image', event.target.value)}
					className="rounded border border-border bg-control p-3 text-text outline-none transition focus:border-accent"
				/>
				<span className="text-xs text-text-secondary">
					This is filled automatically after upload. Existing paths can still be edited manually.
				</span>
			</label>

			<label className="flex flex-col gap-2 text-sm">
				<span className="text-text-secondary">Ingredients</span>
				<input
					type="text"
					value={form.ingredients}
					placeholder="Rice, salmon, avocado"
					onChange={(event) => onChange('ingredients', event.target.value)}
					className="rounded border border-border bg-control p-3 text-text outline-none transition focus:border-accent"
				/>
			</label>

			<div className="flex flex-wrap gap-4 text-sm">
				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={form.popular}
						onChange={(event) => onChange('popular', event.target.checked)}
					/>
					<span>Popular</span>
				</label>

				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={form.available}
						onChange={(event) => onChange('available', event.target.checked)}
					/>
					<span>Available</span>
				</label>

				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={form.spicy}
						onChange={(event) => onChange('spicy', event.target.checked)}
					/>
					<span>Spicy</span>
				</label>

				<label className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={form.vegetarian}
						onChange={(event) => onChange('vegetarian', event.target.checked)}
					/>
					<span>Vegetarian</span>
				</label>
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
		loading,
		error: loadError,
		refreshProducts
	} = useProducts();
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [form, setForm] = useState(EMPTY_FORM);
	const [submitting, setSubmitting] = useState(false);
	const [importing, setImporting] = useState(false);
	const [imageFile, setImageFile] = useState(null);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [orderCategory, setOrderCategory] = useState('ALL');
	const [orderingProductId, setOrderingProductId] = useState(null);
	const [orderingCategory, setOrderingCategory] = useState(null);

	const orderedCategories = useMemo(() => {
		return getOrderedCategories(products);
	}, [products]);

	const categories = useMemo(() => (
		orderedCategories.map((category) => category.name)
	), [orderedCategories]);

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
				getProductCategoryLabel(product),
				product.popular ? 'popular' : '',
				ingredients,
				product.price
			]
				.filter((value) => value !== undefined && value !== null)
				.join(' ')
				.toLowerCase();

			return searchableValue.includes(query);
		});
	}, [products, orderCategory, searchTerm]);

	function handleCreateMode() {
		setSelectedProduct(null);
		setForm(EMPTY_FORM);
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

	function getCategoryOrderForName(categoryName) {
		const existingCategory = orderedCategories.find((category) => (
			category.name === categoryName
		));

		if (existingCategory) {
			return Number.isFinite(Number(existingCategory.categoryOrder))
				? Number(existingCategory.categoryOrder)
				: orderedCategories.indexOf(existingCategory) + 1;
		}

		return orderedCategories.length + 1;
	}

	function getCategoryOrdersForNames(categoryNames) {
		return categoryNames.reduce((categoryOrders, categoryName) => {
			categoryOrders[categoryName] = getCategoryOrderForName(categoryName);
			return categoryOrders;
		}, {});
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

			if (imageFile) {
				productData.image = await uploadProductImage(productData.name, imageFile);
			}

			if (!selectedProduct && !form.sortOrder) {
				const matchingCategoryProducts = products.filter((product) => (
					getProductCategories(product).includes(productData.category)
				));
				productData.sortOrder = matchingCategoryProducts.length + 1;
			}

			productData.categoryOrders = getCategoryOrdersForNames(productData.categories);
			productData.categoryOrder = productData.category
				? productData.categoryOrders[productData.category] || 0
				: 0;

			if (selectedProduct) {
				await updateProduct(selectedProduct.id, productData);
				setMessage('Product updated.');
			} else {
				await addProduct(productData);
				setMessage('Product created.');
				setForm(EMPTY_FORM);
			}

			setImageFile(null);
			await refreshProducts({ useCache: false });
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
			const imageFileMap = createImageFileMap(imageFiles);
			const knownProductNames = new Set(
				products.map((product) => createSafeImageName(product.name))
			);
			const uploadProductNames = new Set();
			let uploadedImages = 0;

			for (const product of parsedProducts) {
				const safeProductName = createSafeImageName(product.name);
				const matchingImage = imageFileMap.get(safeProductName);

				if (
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

			const result = await batchAddProducts(parsedProducts);
			const skippedCount = result.skipped.length;
			const invalidCount = result.invalid.length;
			const unmatchedImages = Math.max(imageFiles.length - uploadedImages, 0);

			await refreshProducts({ useCache: false });
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
			await refreshProducts({ useCache: false });
			handleCreateMode();
			setMessage('Product deleted.');
		} catch (deleteError) {
			setError(deleteError.message || 'Unable to delete product.');
		} finally {
			setSubmitting(false);
		}
	}

	async function handleMoveProduct(productId, direction) {
		const currentIndex = productsByCategory.findIndex((product) => product.id === productId);
		const nextIndex = currentIndex + direction;

		if (currentIndex === -1 || nextIndex < 0 || nextIndex >= productsByCategory.length) {
			return;
		}

		const reorderedProducts = [...productsByCategory];
		const [movedProduct] = reorderedProducts.splice(currentIndex, 1);
		reorderedProducts.splice(nextIndex, 0, movedProduct);

		setOrderingProductId(productId);
		setMessage('');
		setError('');

		try {
			await updateCategoryProductOrder(reorderedProducts);
			await refreshProducts({ useCache: false });
			setMessage('Product order updated.');
		} catch (orderError) {
			setError(orderError.message || 'Unable to update product order.');
		} finally {
			setOrderingProductId(null);
		}
	}

	async function handleMoveCategory(categoryName, direction) {
		const currentIndex = orderedCategories.findIndex((category) => (
			category.name === categoryName
		));
		const nextIndex = currentIndex + direction;

		if (currentIndex === -1 || nextIndex < 0 || nextIndex >= orderedCategories.length) {
			return;
		}

		const reorderedCategories = [...orderedCategories];
		const [movedCategory] = reorderedCategories.splice(currentIndex, 1);
		reorderedCategories.splice(nextIndex, 0, movedCategory);

		setOrderingCategory(categoryName);
		setMessage('');
		setError('');

		try {
			await updateCategoryOrder(reorderedCategories, products);
			await refreshProducts({ useCache: false });
			setMessage('Category order updated.');
		} catch (orderError) {
			setError(orderError.message || 'Unable to update category order.');
		} finally {
			setOrderingCategory(null);
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

				{loadError && (
					<p className="rounded border border-danger/40 bg-danger-soft p-3 text-sm text-danger" role="alert">
						Unable to load products.
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

				{loading ? (
					<p className="text-lg text-text-secondary">Loading products...</p>
				) : (
					<div className="flex flex-col gap-6">
						<CategoryOrderPanel
							categories={orderedCategories}
							orderingCategory={orderingCategory}
							onMoveCategory={handleMoveCategory}
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
								onMoveProduct={handleMoveProduct}
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
