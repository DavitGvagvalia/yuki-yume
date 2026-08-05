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
			<span className="font-semibold text-slate-700">Categories</span>
			<div className="flex flex-wrap gap-2">
				{categories.length === 0 ? (
					<p className="text-xs text-slate-500">Create a category before assigning products.</p>
				) : categories.map((category) => (
					<label
						key={category.id}
						className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition ${
							selectedCategoryIds.includes(category.id)
								? 'bg-accent text-white'
								: 'bg-slate-100 text-slate-500 hover:bg-slate-200'
						}`}
					>
						<input
							type="checkbox"
							checked={selectedCategoryIds.includes(category.id)}
							onChange={() => toggleCategory(category.id)}
							className="sr-only"
						/>
						<span>{category.name}</span>
					</label>
				))}
			</div>
			<span className="text-xs text-slate-500">
				Products can only use categories that exist in the category table.
			</span>
		</div>
	);
}

export default CategorySelector;
