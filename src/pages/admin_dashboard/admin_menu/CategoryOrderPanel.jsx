import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getProductsMatchingCategory } from '../../../services/product.service.js';
import { POPULAR_CATEGORY } from './adminMenuUtils.js';

const DRAG_TYPES = {
	category: 'admin-category'
};

function CategoryButton({
	category,
	index,
	selected,
	productCount,
	orderingCategory,
	onMoveCategory,
	onSelectCategory
}) {
	const itemRef = useRef(null);
	const isRealCategory = category.id !== 'ALL' && category.id !== POPULAR_CATEGORY;
	const [{ isDragging }, drag] = useDrag(() => ({
		type: DRAG_TYPES.category,
		item: { categoryId: category.id, index },
		canDrag: isRealCategory && orderingCategory !== category.id,
		collect: (monitor) => ({
			isDragging: monitor.isDragging()
		})
	}), [category.id, index, isRealCategory, orderingCategory]);
	const [{ isOver }, drop] = useDrop(() => ({
		accept: DRAG_TYPES.category,
		canDrop: () => isRealCategory,
		drop: (draggedItem) => {
			if (draggedItem.categoryId === category.id) {
				return;
			}

			onMoveCategory(draggedItem.categoryId, category.id);
		},
		collect: (monitor) => ({
			isOver: monitor.isOver({ shallow: true }) && monitor.canDrop()
		})
	}), [category.id, isRealCategory, onMoveCategory]);

	if (isRealCategory) {
		drag(drop(itemRef));
	}

	return (
		<button
			ref={itemRef}
			type="button"
			onClick={() => onSelectCategory(category.id)}
			className={`flex min-w-fit items-center justify-between gap-3 rounded-lg px-4 py-2 text-left text-sm font-semibold transition ${
				isRealCategory ? 'cursor-grab active:cursor-grabbing' : ''
			} ${
				selected
					? 'bg-accent text-white'
					: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
			} ${isOver ? 'ring-2 ring-accent/40' : ''} ${isDragging ? 'opacity-50' : ''}`}
		>
			<span className="flex min-w-0 items-center gap-2">
				<span className={selected ? 'text-white/60' : 'text-slate-400'} aria-hidden="true">⋮⋮</span>
				<span className="text-xs opacity-60">#{index + 1}</span>
				<span className="truncate">{category.name}</span>
			</span>
			<span className="text-xs opacity-75">{productCount}</span>
		</button>
	);
}

function CategoryOrderPanel({
	categories,
	products = [],
	selectedCategory = 'ALL',
	orderingCategory,
	renamingCategory,
	deletingCategory,
	creatingCategory,
	onSelectCategory,
	onMoveCategory,
	onRenameCategory,
	onCreateCategory,
	onDeleteCategory
}) {
	const [renameValue, setRenameValue] = useState('');
	const [categoryDraft, setCategoryDraft] = useState('');
	const selectedRealCategory = categories.find((category) => category.id === selectedCategory);
	const navigationCategories = [
		{ id: 'ALL', name: 'All products' },
		{ id: POPULAR_CATEGORY, name: 'Popular' },
		...categories
	];

	return (
		<aside className="h-fit w-full shrink-0 rounded-lg border border-slate-200 bg-white p-3 md:sticky md:top-24 md:w-60">
			<div className="mb-3 px-2">
				<h2 className="text-lg font-bold text-slate-900">Categories</h2>
				<p className="text-xs text-slate-500">Drag categories to change their order.</p>
			</div>

			<nav className="flex gap-2 overflow-x-auto md:flex-col">
				{navigationCategories.map((category, index) => {
					const productCount = category.id === 'ALL'
						? products.length
						: getProductsMatchingCategory(products, category.id).length;

					return (
						<CategoryButton
							key={category.id}
							category={category}
							index={index}
							selected={selectedCategory === category.id}
							productCount={productCount}
							orderingCategory={orderingCategory}
							onMoveCategory={onMoveCategory}
							onSelectCategory={onSelectCategory}
						/>
					);
				})}
			</nav>

			<div className="mt-4 border-t border-slate-200 pt-4">
				<form
					className="flex flex-col gap-2"
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
						className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
						onChange={(event) => setCategoryDraft(event.target.value)}
					/>
					<button
						type="submit"
						className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
						disabled={creatingCategory || !categoryDraft.trim()}
					>
						{creatingCategory ? 'Creating' : 'Create category'}
					</button>
				</form>

				{selectedRealCategory && (
					<form
						className="mt-3 flex flex-col gap-2"
						onSubmit={(event) => {
							event.preventDefault();
							onRenameCategory(selectedRealCategory.id, renameValue);
							setRenameValue('');
						}}
					>
						<input
							type="text"
							value={renameValue}
							placeholder={`Rename ${selectedRealCategory.name}`}
							className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
							onChange={(event) => setRenameValue(event.target.value)}
						/>
						<div className="flex gap-2">
							<button
								type="submit"
								className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
								disabled={renamingCategory === selectedRealCategory.id || !renameValue.trim()}
							>
								{renamingCategory === selectedRealCategory.id ? 'Saving' : 'Rename'}
							</button>
							<button
								type="button"
								className="flex-1 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-40"
								disabled={deletingCategory === selectedRealCategory.id}
								onClick={() => onDeleteCategory(selectedRealCategory)}
							>
								{deletingCategory === selectedRealCategory.id ? 'Deleting' : 'Delete'}
							</button>
						</div>
					</form>
				)}
			</div>
		</aside>
	);
}

export default CategoryOrderPanel;
