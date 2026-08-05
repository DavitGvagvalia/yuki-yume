import { Link } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CategoryOrderPanel from './CategoryOrderPanel.jsx';
import ProductForm from './ProductForm.jsx';
import ProductList from './ProductList.jsx';
import { POPULAR_CATEGORY } from './adminMenuUtils.js';

function StatusMessage({ children, tone = 'neutral', role = 'status' }) {
	const toneClassNames = {
		danger: 'border-danger/40 bg-danger-soft text-danger',
		success: 'border-success/40 bg-success-soft text-success',
		neutral: 'border-border bg-control text-text-secondary'
	};

	return (
		<p className={`rounded-lg border p-3 text-sm ${toneClassNames[tone]}`} role={role}>
			{children}
		</p>
	);
}

function PageUITemplate({
	products,
	categories,
	loading,
	refreshing,
	loadError,
	error,
	message,
	filters,
	productActions,
	categoryActions,
	onLogout
}) {
	const selectedCategory = categories.find((category) => category.id === filters.orderCategory);
	const selectedCategoryName = filters.orderCategory === 'ALL'
		? 'All products'
		: filters.orderCategory === POPULAR_CATEGORY
			? 'Popular'
			: selectedCategory?.name || 'Admin menu';

	return (
		<DndProvider backend={HTML5Backend}>
			<div className="min-h-screen bg-slate-50 p-5 pt-24">
				<div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row">
					{loading ? (
						<p className="text-lg text-slate-500">Loading menu data...</p>
					) : (
						<>
							<CategoryOrderPanel
								categories={categories}
								products={products}
								selectedCategory={filters.orderCategory}
								orderingCategory={categoryActions.orderingCategory}
								renamingCategory={categoryActions.renamingCategory}
								deletingCategory={categoryActions.deletingCategory}
								creatingCategory={categoryActions.creatingCategory}
								onSelectCategory={filters.setOrderCategory}
								onMoveCategory={categoryActions.moveCategory}
								onRenameCategory={categoryActions.renameCategory}
								onCreateCategory={categoryActions.createCategory}
								onDeleteCategory={categoryActions.deleteCategory}
							/>

							<main className="min-w-0 flex-1">
								<header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
									<div>
										<h1 className="text-2xl font-bold text-slate-900">
											{selectedCategoryName}
										</h1>
										<p className="text-sm text-slate-500">
											Edit the selected product and save it to the customer menu.
										</p>
									</div>

									<div className="flex flex-wrap items-center gap-3">
										<span className="text-sm text-slate-500">
											{filters.filteredProducts.length} products
										</span>
										<Link
											to="/admin"
											className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-accent hover:text-accent"
										>
											Orders
										</Link>
										<button
											type="button"
											className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-accent hover:text-accent"
											onClick={onLogout}
										>
											Logout
										</button>
									</div>
								</header>

								<div className="mb-5 flex flex-col gap-2">
									{loadError && (
										<StatusMessage tone="danger" role="alert">
											Unable to load menu data.
										</StatusMessage>
									)}

									{error && (
										<StatusMessage tone="danger" role="alert">
											{error}
										</StatusMessage>
									)}

									{message && (
										<StatusMessage tone="success">
											{message}
										</StatusMessage>
									)}

									{refreshing && (
										<StatusMessage>
											Syncing latest menu data...
										</StatusMessage>
									)}
								</div>

								<div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(280px,360px)_1fr]">
									<ProductList
										products={filters.filteredProducts}
										totalProducts={products.length}
										categories={categories}
										orderCategory={filters.orderCategory}
										searchTerm={filters.searchTerm}
										selectedProductId={productActions.selectedProduct?.id}
										importing={productActions.importing}
										orderingProductId={productActions.orderingProductId}
										categoryOrderProductIds={filters.categoryOrderProductIds}
										onSearchChange={filters.setSearchTerm}
										onSelect={productActions.selectProduct}
										onCreate={productActions.startCreateProduct}
										onReorderProduct={productActions.reorderProduct}
										onBatchUpload={productActions.batchUpload}
									/>

									<ProductForm
										form={productActions.form}
										mode={productActions.selectedProduct ? 'edit' : 'create'}
										categories={categories}
										submitting={productActions.submitting}
										imageFile={productActions.imageFile}
										currentImageUrl={productActions.selectedProduct?.imageUrl}
										onChange={productActions.updateField}
										onImageChange={productActions.changeImage}
										onSubmit={productActions.submitProduct}
										onDelete={productActions.deleteSelectedProduct}
									/>
								</div>
							</main>
						</>
					)}
				</div>
			</div>
		</DndProvider>
	);
}

export default PageUITemplate;
