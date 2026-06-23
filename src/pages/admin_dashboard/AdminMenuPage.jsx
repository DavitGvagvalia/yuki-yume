import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import addProduct, {
	batchAddProducts,
	deleteProduct,
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
	category: '',
	available: true,
	spicy: false,
	vegetarian: false,
	preparationTime: '',
	ingredients: ''
};

function productToForm(product) {
	return {
		image: product.image || '',
		name: product.name || '',
		price: product.price ?? '',
		category: product.category || '',
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
	return {
		image: form.image.trim(),
		name: form.name.trim(),
		price: Number(form.price),
		category: form.category.trim(),
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
	searchTerm,
	selectedProductId,
	importing,
	onSearchChange,
	onSelect,
	onCreate,
	onBatchUpload
}) {
	return (
		<section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-xl font-bold">Products</h2>

				<div className="flex flex-wrap justify-end gap-2">
					<label className={`cursor-pointer rounded border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:border-accent ${
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
						className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
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
					className="rounded border border-border bg-card p-3 text-text outline-none focus:border-accent"
				/>
				<span className="text-xs text-text-secondary">
					Showing {products.length} of {totalProducts} products.
				</span>
			</label>

			<div className="flex max-h-[680px] flex-col gap-2 overflow-auto">
				{products.length === 0 ? (
					<p className="text-sm text-text-secondary">No products found.</p>
				) : (
					products.map((product) => (
						<button
							key={product.id}
							type="button"
							className={`flex items-center gap-3 rounded border p-3 text-left transition ${
								selectedProductId === product.id
									? 'border-accent bg-card'
									: 'border-border bg-background/40 hover:border-accent'
							}`}
							onClick={() => onSelect(product)}
						>
							<img
								src={product.imageUrl}
								alt={product.name}
								className="h-14 w-14 rounded object-cover"
							/>

							<span className="min-w-0 flex-1">
								<span className="block truncate font-semibold">{product.name}</span>
								<span className="block text-sm text-text-secondary">
									{product.category || 'No category'} · {product.price}₾
								</span>
							</span>

							<span className={`rounded px-2 py-1 text-xs ${
								product.available === false
									? 'bg-red-500/15 text-red-300'
									: 'bg-green-500/15 text-green-300'
							}`}>
								{product.available === false ? 'Hidden' : 'Available'}
							</span>
						</button>
					))
				)}
			</div>
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
			className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-4"
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
						className="rounded border border-red-500 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
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
						className="rounded border border-border bg-card p-3 text-text outline-none focus:border-accent"
					/>
				</label>

				<label className="flex flex-col gap-2 text-sm">
					<span className="text-text-secondary">Category</span>
					<input
						type="text"
						list="product-categories"
						value={form.category}
						required
						onChange={(event) => onChange('category', event.target.value)}
						className="rounded border border-border bg-card p-3 text-text outline-none focus:border-accent"
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
						className="rounded border border-border bg-card p-3 text-text outline-none focus:border-accent"
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
						className="rounded border border-border bg-card p-3 text-text outline-none focus:border-accent"
					/>
				</label>
			</div>

			<label className="flex flex-col gap-2 text-sm">
				<span className="text-text-secondary">Image file</span>
				<input
					type="file"
					accept="image/jpeg,image/png,image/webp,image/avif"
					onChange={onImageChange}
					className="rounded border border-border bg-card p-3 text-text outline-none focus:border-accent"
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
					className="rounded border border-border bg-card p-3 text-text outline-none focus:border-accent"
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
					className="rounded border border-border bg-card p-3 text-text outline-none focus:border-accent"
				/>
			</label>

			<div className="flex flex-wrap gap-4 text-sm">
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
				className="rounded bg-accent px-4 py-3 font-semibold text-white transition hover:bg-accent-hover disabled:bg-disabled disabled:cursor-not-allowed"
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

	const categories = useMemo(() => {
		return [...new Set(products.map((product) => product.category).filter(Boolean))];
	}, [products]);

	const filteredProducts = useMemo(() => {
		const query = searchTerm.trim().toLowerCase();

		if (!query) {
			return products;
		}

		return products.filter((product) => {
			const ingredients = Array.isArray(product.ingredients)
				? product.ingredients.join(' ')
				: '';
			const searchableValue = [
				product.name,
				product.category,
				ingredients,
				product.price
			]
				.filter((value) => value !== undefined && value !== null)
				.join(' ')
				.toLowerCase();

			return searchableValue.includes(query);
		});
	}, [products, searchTerm]);

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
							className="rounded border border-border bg-card px-4 py-2 text-sm transition hover:border-accent"
						>
							Orders
						</Link>

						<button
							type="button"
							className="rounded border border-border bg-card px-4 py-2 text-sm transition hover:border-accent"
							onClick={handleLogout}
						>
							Logout
						</button>
					</div>
				</header>

				{loadError && (
					<p className="rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300" role="alert">
						Unable to load products.
					</p>
				)}

				{error && (
					<p className="rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300" role="alert">
						{error}
					</p>
				)}

				{message && (
					<p className="rounded border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-300" role="status">
						{message}
					</p>
				)}

				{loading ? (
					<p className="text-lg text-text-secondary">Loading products...</p>
				) : (
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,380px)_1fr]">
						<ProductList
							products={filteredProducts}
							totalProducts={products.length}
							searchTerm={searchTerm}
							selectedProductId={selectedProduct?.id}
							importing={importing}
							onSearchChange={setSearchTerm}
							onSelect={handleSelectProduct}
							onCreate={handleCreateMode}
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
				)}
			</div>
		</main>
	);
}
