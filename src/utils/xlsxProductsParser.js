const textDecoder = new TextDecoder('utf-8');

function readString(bytes) {
	return textDecoder.decode(bytes);
}

function findEndOfCentralDirectory(view) {
	for (let offset = view.byteLength - 22; offset >= 0; offset -= 1) {
		if (view.getUint32(offset, true) === 0x06054b50) {
			return offset;
		}
	}

	throw new Error('Invalid XLSX file.');
}

async function inflateRaw(bytes) {
	if (typeof DecompressionStream === 'undefined') {
		throw new Error('This browser cannot read compressed XLSX files.');
	}

	const stream = new Blob([bytes]).stream().pipeThrough(
		new DecompressionStream('deflate-raw')
	);

	return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function unzipXlsx(arrayBuffer) {
	const view = new DataView(arrayBuffer);
	const bytes = new Uint8Array(arrayBuffer);
	const directoryOffset = findEndOfCentralDirectory(view);
	const entryCount = view.getUint16(directoryOffset + 10, true);
	let offset = view.getUint32(directoryOffset + 16, true);
	const entries = new Map();

	for (let index = 0; index < entryCount; index += 1) {
		if (view.getUint32(offset, true) !== 0x02014b50) {
			throw new Error('Invalid XLSX directory.');
		}

		const compressionMethod = view.getUint16(offset + 10, true);
		const compressedSize = view.getUint32(offset + 20, true);
		const nameLength = view.getUint16(offset + 28, true);
		const extraLength = view.getUint16(offset + 30, true);
		const commentLength = view.getUint16(offset + 32, true);
		const localHeaderOffset = view.getUint32(offset + 42, true);
		const name = readString(bytes.slice(offset + 46, offset + 46 + nameLength));

		if (view.getUint32(localHeaderOffset, true) !== 0x04034b50) {
			throw new Error('Invalid XLSX entry.');
		}

		const localNameLength = view.getUint16(localHeaderOffset + 26, true);
		const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
		const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
		const data = bytes.slice(dataStart, dataStart + compressedSize);
		const content = compressionMethod === 0 ? data : await inflateRaw(data);

		entries.set(name, readString(content));
		offset += 46 + nameLength + extraLength + commentLength;
	}

	return entries;
}

function parseXml(xml) {
	return new DOMParser().parseFromString(xml, 'application/xml');
}

function getTextContent(node) {
	return Array.from(node.getElementsByTagName('t'))
		.map((textNode) => textNode.textContent || '')
		.join('');
}

function parseSharedStrings(xml) {
	if (!xml) {
		return [];
	}

	return Array.from(parseXml(xml).getElementsByTagName('si')).map(getTextContent);
}

function columnIndex(cellReference) {
	const letters = cellReference.replace(/\d/g, '');
	let index = 0;

	for (const letter of letters) {
		index = index * 26 + letter.toUpperCase().charCodeAt(0) - 64;
	}

	return index - 1;
}

function parseCellValue(cell, sharedStrings) {
	const type = cell.getAttribute('t');

	if (type === 'inlineStr') {
		return getTextContent(cell);
	}

	const valueNode = cell.getElementsByTagName('v')[0];
	const value = valueNode?.textContent || '';

	if (type === 's') {
		return sharedStrings[Number(value)] || '';
	}

	return value;
}

function parseRows(sheetXml, sharedStrings) {
	const sheet = parseXml(sheetXml);

	return Array.from(sheet.getElementsByTagName('row')).map((row) => {
		const values = [];

		Array.from(row.getElementsByTagName('c')).forEach((cell) => {
			const index = columnIndex(cell.getAttribute('r') || 'A1');
			values[index] = parseCellValue(cell, sharedStrings);
		});

		return values.map((value) => String(value || '').trim());
	});
}

function normalizeHeader(header) {
	const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');

	if (normalized === 'ingridients') {
		return 'ingredients';
	}

	return normalized;
}

function parseBoolean(value) {
	const normalized = String(value || '').trim().toLowerCase();

	return ['1', 'true', 'yes', 'y'].includes(normalized);
}

function parseNumber(value) {
	const normalized = String(value || '').replace(',', '.').trim();
	const number = Number(normalized);

	return Number.isFinite(number) ? number : 0;
}

function mapProduct(row, headers) {
	const data = {};

	headers.forEach((header, index) => {
		data[header] = row[index] || '';
	});

	const ingredients = data.ingredients || '';

	return {
		image: data.image || '',
		name: data.name || '',
		price: parseNumber(data.price),
		category: data.category || '',
		available: data.available ? parseBoolean(data.available) : true,
		spicy: parseBoolean(data.spicy),
		vegetarian: parseBoolean(data.vegetarian),
		preparationTime: parseNumber(data.preparationtime),
		ingredients: ingredients
			.split(',')
			.map((ingredient) => ingredient.trim())
			.filter(Boolean)
	};
}

export async function parseXlsxProducts(file) {
	const entries = await unzipXlsx(await file.arrayBuffer());
	const sheetName = Array.from(entries.keys()).find((name) => (
		name.startsWith('xl/worksheets/') && name.endsWith('.xml')
	));

	if (!sheetName) {
		throw new Error('No worksheet found in XLSX file.');
	}

	const rows = parseRows(
		entries.get(sheetName),
		parseSharedStrings(entries.get('xl/sharedStrings.xml'))
	).filter((row) => row.some(Boolean));

	if (rows.length < 2) {
		return [];
	}

	const headers = rows[0].map(normalizeHeader);

	return rows
		.slice(1)
		.map((row) => mapProduct(row, headers))
		.filter((product) => product.name);
}
