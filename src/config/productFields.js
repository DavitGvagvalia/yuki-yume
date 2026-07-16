export const PRODUCT_FIELD_TYPES = {
	text: 'text',
	number: 'number',
	boolean: 'boolean',
	list: 'list'
};

function parseNumber(value) {
	const normalized = String(value ?? '').replace(',', '.').trim();
	const number = Number(normalized);

	return Number.isFinite(number) ? number : 0;
}

function parsePercentage(value) {
	const number = parseNumber(value);

	return Math.min(Math.max(number, 0), 100);
}

function formatNumber(value) {
	const number = Number(value);

	return Number.isFinite(number) && number !== 0 ? String(number) : '';
}

function parseList(value) {
	if (Array.isArray(value)) {
		return value.map((item) => String(item || '').trim()).filter(Boolean);
	}

	return String(value || '')
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
}

function formatList(value) {
	return Array.isArray(value) ? value.join(', ') : '';
}

export const productFieldDefinitions = [
	{
		key: 'name',
		label: 'Name',
		type: PRODUCT_FIELD_TYPES.text,
		defaultValue: '',
		required: true,
		admin: true,
		search: true,
		parse: (value) => String(value || '').trim(),
		format: (value) => String(value || '')
	},
	{
		key: 'price',
		label: 'Price',
		type: PRODUCT_FIELD_TYPES.number,
		defaultValue: 0,
		admin: true,
		search: true,
		inputProps: { min: '0', step: '0.01' },
		parse: parseNumber,
		format: formatNumber
	},
	{
		key: 'promotion',
		label: 'Promotion (%)',
		type: PRODUCT_FIELD_TYPES.number,
		defaultValue: 0,
		admin: true,
		search: true,
		inputProps: { min: '0', max: '100', step: '1' },
		parse: parsePercentage,
		format: formatNumber
	},
	{
		key: 'preparationTime',
		label: 'Preparation time',
		type: PRODUCT_FIELD_TYPES.number,
		defaultValue: 0,
		admin: true,
		inputProps: { min: '0', step: '1' },
		parse: parseNumber,
		format: formatNumber
	},
	{
		key: 'sortOrder',
		label: 'Order in category',
		type: PRODUCT_FIELD_TYPES.number,
		defaultValue: 0,
		admin: true,
		inputProps: { min: '0', step: '1' },
		parse: parseNumber,
		format: formatNumber
	},
	{
		key: 'weight',
		label: 'Weight',
		type: PRODUCT_FIELD_TYPES.number,
		defaultValue: 0,
		admin: true,
		detail: true,
		detailLabel: 'Weight',
		detailSuffix: ' g',
		inputProps: { min: '0', step: '1' },
		parse: parseNumber,
		format: formatNumber
	},
	{
		key: 'pieces',
		label: 'Pieces',
		type: PRODUCT_FIELD_TYPES.number,
		defaultValue: 0,
		admin: true,
		detail: true,
		detailLabel: 'Pieces',
		inputProps: { min: '0', step: '1' },
		parse: parseNumber,
		format: formatNumber
	},
	{
		key: 'calories',
		label: 'Calories',
		type: PRODUCT_FIELD_TYPES.number,
		defaultValue: 0,
		admin: true,
		detail: true,
		detailLabel: 'Calories',
		detailSuffix: ' kcal',
		inputProps: { min: '0', step: '1' },
		parse: parseNumber,
		format: formatNumber
	},
	{
		key: 'ingredients',
		label: 'Ingredients',
		type: PRODUCT_FIELD_TYPES.list,
		defaultValue: [],
		admin: true,
		search: true,
		parse: parseList,
		format: formatList
	},
	{
		key: 'popular',
		label: 'Popular',
		type: PRODUCT_FIELD_TYPES.boolean,
		defaultValue: false,
		admin: true,
		search: true,
		parse: Boolean,
		format: Boolean
	},
	{
		key: 'available',
		label: 'Available',
		type: PRODUCT_FIELD_TYPES.boolean,
		defaultValue: true,
		admin: true,
		parse: (value) => value !== false,
		format: (value) => value !== false
	},
	{
		key: 'spicy',
		label: 'Spicy',
		type: PRODUCT_FIELD_TYPES.boolean,
		defaultValue: false,
		admin: true,
		parse: Boolean,
		format: Boolean
	},
	{
		key: 'vegetarian',
		label: 'Vegetarian',
		type: PRODUCT_FIELD_TYPES.boolean,
		defaultValue: false,
		admin: true,
		parse: Boolean,
		format: Boolean
	}
];

export const adminProductFields = productFieldDefinitions.filter((field) => field.admin);
export const productDetailFields = productFieldDefinitions.filter((field) => field.detail);
export const searchableProductFields = productFieldDefinitions.filter((field) => field.search);

export function getProductFieldDefaults() {
	return productFieldDefinitions.reduce((defaults, field) => {
		defaults[field.key] = Array.isArray(field.defaultValue)
			? [...field.defaultValue]
			: field.defaultValue;
		return defaults;
	}, {});
}

export function createProductFormDefaults() {
	return adminProductFields.reduce((form, field) => {
		form[field.key] = field.type === PRODUCT_FIELD_TYPES.boolean
			? field.defaultValue
			: field.format(field.defaultValue);
		return form;
	}, {
		image: '',
		categoryIds: []
	});
}

export function productToFormValues(product, getCategories) {
	const form = createProductFormDefaults();

	adminProductFields.forEach((field) => {
		form[field.key] = field.type === PRODUCT_FIELD_TYPES.boolean
			? field.format(product[field.key])
			: field.format(product[field.key] ?? field.defaultValue);
	});

	return {
		...form,
		image: product.image || '',
		categoryIds: getCategories(product)
	};
}

export function formValuesToProduct(form) {
	const product = {};

	adminProductFields.forEach((field) => {
		product[field.key] = field.parse(form[field.key]);
	});

	return {
		...product,
		image: String(form.image || '').trim(),
		categoryIds: Array.isArray(form.categoryIds) ? form.categoryIds : []
	};
}

export function normalizeConfiguredProductFields(product) {
	return {
		...getProductFieldDefaults(),
		...product,
		...productFieldDefinitions.reduce((normalized, field) => {
			normalized[field.key] = field.parse(product[field.key] ?? field.defaultValue);
			return normalized;
		}, {})
	};
}

export function getProductSearchValues(product) {
	return searchableProductFields.map((field) => {
		const value = product[field.key];

		if (Array.isArray(value)) {
			return value.join(' ');
		}

		if (field.type === PRODUCT_FIELD_TYPES.boolean) {
			return value ? field.label : '';
		}

		return value;
	});
}

export function getProductDetailMetadata(product) {
	return productDetailFields
		.map((field) => {
			const value = Number(product[field.key]);

			if (!Number.isFinite(value) || value === 0) {
				return null;
			}

			return {
				key: field.key,
				label: field.detailLabel || field.label,
				value: `${value}${field.detailSuffix || ''}`
			};
		})
		.filter(Boolean);
}

export function parseProductFieldsFromData(data) {
	return productFieldDefinitions.reduce((product, field) => {
		if (Object.prototype.hasOwnProperty.call(data, field.key.toLowerCase())) {
			product[field.key] = field.parse(data[field.key.toLowerCase()]);
		}
		return product;
	}, {});
}
