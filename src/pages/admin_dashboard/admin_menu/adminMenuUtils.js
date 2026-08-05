import { getProductCategoryIds } from '../../../services/product.service.js';
import {
	PRODUCT_FIELD_TYPES,
	adminProductFields,
	createProductFormDefaults,
	formValuesToProduct,
	productToFormValues
} from '../../../config/productFields.js';

export const POPULAR_CATEGORY = 'POPULAR';

const MAX_UPLOAD_IMAGE_SIZE_BYTES = 300 * 1024;
const MAX_UPLOAD_IMAGE_SIZE_LABEL = '300 KB';
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

export function isImageFileTooLarge(file) {
	return file && file.size > MAX_UPLOAD_IMAGE_SIZE_BYTES;
}

export function getImageSizeError(file) {
	return `${file.name} is too large. Maximum image size is ${MAX_UPLOAD_IMAGE_SIZE_LABEL}.`;
}

export function productToForm(product) {
	return productToFormValues(product, getProductCategoryIds);
}

export function createEmptyForm() {
	return createProductFormDefaults();
}

export function formToProduct(form) {
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

export function getProductFormFieldGroups() {
	return PRODUCT_FORM_FIELD_GROUPS.map((group) => ({
		...group,
		fields: group.fields
			.map((fieldKey) => ADMIN_FIELDS_BY_KEY.get(fieldKey))
			.filter((field) => field && field.type !== PRODUCT_FIELD_TYPES.boolean)
			.map((field) => ({
				...field,
				inputType: field.type === PRODUCT_FIELD_TYPES.number ? 'number' : 'text'
			}))
	})).filter((group) => group.fields.length > 0);
}

export function getAdminBooleanFields() {
	return adminProductFields.filter((field) => (
		field.admin && field.type === PRODUCT_FIELD_TYPES.boolean
	));
}
