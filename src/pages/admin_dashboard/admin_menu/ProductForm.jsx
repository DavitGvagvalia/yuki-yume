import { useEffect, useState } from 'react';
import { getProductImagePath } from '../../../utils/imageHandler.js';
import CategorySelector from './CategorySelector.jsx';
import {
	getAdminBooleanFields,
	getProductFormFieldGroups
} from './adminMenuUtils.js';

const PLACEHOLDER_IMAGE = 'https://placehold.co/500x500?text=No+Image';

function ProductForm({
	form,
	mode,
	categories,
	submitting,
	imageFile,
	currentImageUrl,
	onChange,
	onImageChange,
	onSubmit,
	onDelete
}) {
	const fieldGroups = getProductFormFieldGroups();
	const booleanFields = getAdminBooleanFields();
	const [previewImage, setPreviewImage] = useState(currentImageUrl || PLACEHOLDER_IMAGE);
	let imageUploadPath = '';

	if (imageFile && form.name) {
		try {
			imageUploadPath = getProductImagePath(form.name, imageFile);
		} catch { }
	}

	useEffect(() => {
		if (!imageFile) {
			setPreviewImage(currentImageUrl || PLACEHOLDER_IMAGE);
			return undefined;
		}

		const objectUrl = URL.createObjectURL(imageFile);
		setPreviewImage(objectUrl);

		return () => URL.revokeObjectURL(objectUrl);
	}, [currentImageUrl, imageFile]);

	return (
		<form
			className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
			onSubmit={onSubmit}
		>
			<div className="mb-5 flex items-start justify-between gap-3">
				<div>
					<h2 className="text-xl font-bold text-slate-900">
						{mode === 'create' ? 'Add product' : 'Edit product'}
					</h2>
					<p className="text-sm text-slate-500">
						Upload an image to save it in Firebase Storage under products/.
					</p>
				</div>

				{mode === 'edit' && (
					<button
						type="button"
						className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200"
						disabled={submitting}
						onClick={onDelete}
					>
						Delete
					</button>
				)}
			</div>

			<div className="flex flex-col gap-6 lg:flex-row">
				<label className="group relative block h-56 w-full shrink-0 cursor-pointer overflow-hidden rounded-lg bg-slate-100 lg:w-56">
					<img
						src={previewImage}
						alt={form.name || 'Product image preview'}
						className="h-full w-full object-cover"
						onError={(event) => {
							event.currentTarget.src = PLACEHOLDER_IMAGE;
						}}
					/>
					<input
						type="file"
						accept="image/jpeg,image/png,image/webp,image/avif"
						onChange={onImageChange}
						className="sr-only"
					/>
					<span className="absolute inset-0 flex items-center justify-center bg-black/55 px-4 text-center text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
						Upload image
					</span>
				</label>

				<div className="min-w-0 flex-1">
					{fieldGroups.map((group) => (
						<section key={group.title} className="mb-5 flex flex-col gap-3 last:mb-0">
							<h3 className="text-sm font-semibold text-slate-700">{group.title}</h3>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								{group.fields.map((field) => (
									<label
										key={field.key}
										className={`flex flex-col gap-2 text-sm ${field.key === 'ingredients' ? 'md:col-span-2' : ''}`}
									>
										<span className="font-semibold text-slate-700">{field.label}</span>
										{field.key === 'ingredients' ? (
											<textarea
												value={form[field.key]}
												required={field.required}
												rows={3}
												onChange={(event) => onChange(field.key, event.target.value)}
												className="resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
											/>
										) : (
											<input
												type={field.inputType}
												value={form[field.key]}
												required={field.required}
												{...(field.inputProps || {})}
												onChange={(event) => onChange(field.key, event.target.value)}
												className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
											/>
										)}
									</label>
								))}
							</div>
						</section>
					))}

					<div className="mt-5">
						<CategorySelector
							selectedCategoryIds={form.categoryIds}
							categories={categories}
							onChange={(nextCategoryIds) => onChange('categoryIds', nextCategoryIds)}
						/>
					</div>

					{imageUploadPath && (
						<p className="mt-3 text-xs text-slate-500">
							Will upload as {imageUploadPath}
						</p>
					)}

					<div className="mt-5">
						<p className="mb-2 text-sm font-semibold text-slate-700">Statuses</p>
						<div className="flex flex-wrap gap-2">
							{booleanFields.map((field) => (
								<label
									key={field.key}
									className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition ${
										Boolean(form[field.key])
											? 'bg-emerald-100 text-emerald-700'
											: 'bg-slate-200 text-slate-500 hover:bg-slate-300'
									}`}
								>
									<input
										type="checkbox"
										checked={Boolean(form[field.key])}
										onChange={(event) => onChange(field.key, event.target.checked)}
										className="sr-only"
									/>
									<span>{field.label}</span>
								</label>
							))}
						</div>
					</div>

					<div className="mt-6 flex flex-wrap items-center gap-3">
						<button
							type="submit"
							disabled={submitting}
							className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{submitting
								? 'Saving...'
								: mode === 'create'
									? 'Create product'
									: 'Save changes'}
						</button>
					</div>
				</div>
			</div>
		</form>
	);
}

export default ProductForm;
