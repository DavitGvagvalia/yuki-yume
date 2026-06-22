import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import addProduct, {
	deleteProduct,
	updateProduct
} from '../../services/product.service.js';
import { logoutAdmin } from '../../services/adminAuth.service.js';
import { useProducts } from '../../hooks/useProducts.jsx';

const EMPTY_FORM = {
	image: '',
	name: '',
	description: '',
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
		description: product.description || '',
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
		description: form.description.trim(),
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

function ProductList({ products, selectedProductId, onSelect, onCreate }) {
	return (
		<section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-xl font-bold">Products</h2>

				<button
					type="button"
					className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
					onClick={onCreate}
				>
					Add product
				</button>
			</div>

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
	onChange,
	onSubmit,
	onDelete
}) {
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
						Use a Firebase Storage path in the image field, for example products/item.avif.
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
				<span className="text-text-secondary">Image path</span>
				<input
					type="text"
					value={form.image}
					required
					onChange={(event) => onChange('image', event.target.value)}
					className="rounded border border-border bg-card p-3 text-text outline-none focus:border-accent"
				/>
			</label>

			<label className="flex flex-col gap-2 text-sm">
				<span className="text-text-secondary">Description</span>
				<textarea
					value={form.description}
					required
					rows="4"
					onChange={(event) => onChange('description', event.target.value)}
					className="rounded border border-border bg-card p-3 text-text outline-none focus:border-accent"
				/>
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
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	const categories = useMemo(() => {
		return [...new Set(products.map((product) => product.category).filter(Boolean))];
	}, [products]);

	function handleCreateMode() {
		setSelectedProduct(null);
		setForm(EMPTY_FORM);
		setMessage('');
		setError('');
	}

	function handleSelectProduct(product) {
		setSelectedProduct(product);
		setForm(productToForm(product));
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

			if (selectedProduct) {
				await updateProduct(selectedProduct.id, productData);
				setMessage('Product updated.');
			} else {
				await addProduct(productData);
				setMessage('Product created.');
				setForm(EMPTY_FORM);
			}

			await refreshProducts({ useCache: false });
		} catch (submitError) {
			setError(submitError.message || 'Unable to save product.');
		} finally {
			setSubmitting(false);
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
							products={products}
							selectedProductId={selectedProduct?.id}
							onSelect={handleSelectProduct}
							onCreate={handleCreateMode}
						/>

						<ProductForm
							form={form}
							mode={selectedProduct ? 'edit' : 'create'}
							categories={categories}
							submitting={submitting}
							onChange={updateField}
							onSubmit={handleSubmit}
							onDelete={handleDelete}
						/>
					</div>
				)}
			</div>
		</main>
	);
}
