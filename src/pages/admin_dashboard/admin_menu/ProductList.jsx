import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import {
	getProductCategoryLabel,
	getProductPriceInfo
} from '../../../services/product.service.js';

const DRAG_TYPES = {
	product: 'admin-product'
};
const PLACEHOLDER_IMAGE = 'https://placehold.co/500x500?text=No+Image';

function DraggableProductRow({
	product,
	categories,
	orderIndex,
	canDragProduct,
	selected,
	orderingProductId,
	onSelect,
	onReorderProduct
}) {
	const itemRef = useRef(null);
	const isProductOrdering = orderingProductId === product.id;
	const priceInfo = getProductPriceInfo(product);
	const [{ isDragging }, drag] = useDrag(() => ({
		type: DRAG_TYPES.product,
		item: { productId: product.id },
		canDrag: canDragProduct && !isProductOrdering,
		collect: (monitor) => ({
			isDragging: monitor.isDragging()
		})
	}), [canDragProduct, isProductOrdering, product.id]);
	const [{ isOver }, drop] = useDrop(() => ({
		accept: DRAG_TYPES.product,
		drop: (draggedItem) => {
			if (!canDragProduct || draggedItem.productId === product.id) {
				return;
			}

			onReorderProduct(draggedItem.productId, product.id);
		},
		collect: (monitor) => ({
			isOver: monitor.isOver({ shallow: true })
		})
	}), [canDragProduct, onReorderProduct, product.id]);

	drag(drop(itemRef));

	return (
		<div
			ref={itemRef}
			role="button"
			tabIndex={0}
			aria-grabbed={isDragging}
			className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
				isOver
					? 'border-accent bg-white ring-2 ring-accent/40'
					: selected
						? 'border-accent bg-white shadow-sm'
						: 'border-slate-200 bg-white/75 hover:border-accent hover:bg-white'
			} ${canDragProduct ? 'cursor-grab active:cursor-grabbing' : ''} ${isDragging ? 'opacity-60' : ''}`}
			onClick={() => onSelect(product)}
			onKeyDown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					onSelect(product);
				}
			}}
		>
			{canDragProduct && (
				<span className="text-slate-400" aria-hidden="true">⋮⋮</span>
			)}

			{canDragProduct && (
				<span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
					#{orderIndex + 1}
				</span>
			)}

			<img
				src={product.imageUrl || PLACEHOLDER_IMAGE}
				alt={product.name}
				className="h-14 w-14 rounded-md object-cover"
				onError={(event) => {
					event.currentTarget.src = PLACEHOLDER_IMAGE;
				}}
			/>

			<span className="min-w-0 flex-1">
				<span className="block truncate font-semibold text-slate-900">{product.name}</span>
				<span className="block text-sm text-slate-500">
					{getProductCategoryLabel(product, categories) || 'No category'} ·{' '}
					{priceInfo.hasPromotion ? (
						<>
							{priceInfo.currentPriceLabel}₾{' '}
							<span className="line-through">{priceInfo.basePriceLabel}₾</span>{' '}
							<span className="text-emerald-600">-{priceInfo.promotion}%</span>
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

			{canDragProduct && (
				<span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500">
					{isProductOrdering ? 'Saving' : 'Drag'}
				</span>
			)}

			<span className={`rounded px-2 py-1 text-xs ${
				product.available === false
					? 'bg-red-100 text-red-700'
					: 'bg-emerald-100 text-emerald-700'
			}`}>
				{product.available === false ? 'Hidden' : 'Available'}
			</span>
		</div>
	);
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
	onSearchChange,
	onSelect,
	onCreate,
	onReorderProduct,
	onBatchUpload
}) {
	const hasSearch = Boolean(searchTerm.trim());
	const canReorderCategory = orderCategory !== 'ALL';
	const isOrdering = Boolean(orderingProductId);
	const canReorder = canReorderCategory && !hasSearch && !isOrdering;
	const orderingHint = !canReorderCategory
		? 'Select a category to reorder items.'
		: hasSearch
			? 'Clear search to reorder items.'
			: 'Drag items to change their order in this category.';

	return (
		<section className="flex flex-col gap-2">
			<div className="mb-2 rounded-lg border border-slate-200 bg-white p-3">
				<div className="flex flex-col gap-3">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<p className="text-xs text-slate-500">
							{orderingHint}
						</p>

						<div className="flex flex-wrap justify-end gap-2">
							<label className={`cursor-pointer rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 ${importing ? 'pointer-events-none opacity-60' : ''}`}>
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
								className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
								onClick={onCreate}
							>
								Add product
							</button>
						</div>
					</div>

					<label className="flex flex-col gap-2 text-sm">
						<input
							type="search"
							value={searchTerm}
							placeholder="Search by name, category, ingredients..."
							onChange={(event) => onSearchChange(event.target.value)}
							className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
						/>
						<span className="text-xs text-slate-500">
							Showing {products.length} of {totalProducts} products.
						</span>
					</label>
				</div>
			</div>

			<div className="flex max-h-[680px] flex-col gap-2 overflow-auto">
				{products.length === 0 ? (
					<div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
						No products found.
					</div>
				) : (
					products.map((product) => {
						const orderIndex = categoryOrderProductIds.indexOf(product.id);
						const canDragProduct = canReorder && orderIndex !== -1;

						return (
							<DraggableProductRow
								key={product.id}
								product={product}
								categories={categories}
								orderIndex={orderIndex}
								canDragProduct={canDragProduct}
								selected={selectedProductId === product.id}
								orderingProductId={orderingProductId}
								onSelect={onSelect}
								onReorderProduct={onReorderProduct}
							/>
						);
					})
				)}
			</div>
		</section>
	);
}

export default ProductList;
