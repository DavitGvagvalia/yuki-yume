import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage } from '../firebaseConfig.js';

const IMAGE_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif'
};
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function createSafeImageName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getImageExtension(file) {
  const extension = IMAGE_EXTENSIONS[file.type];

  if (extension) {
    return extension;
  }

  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(fileExtension)) {
    return fileExtension === 'jpeg' ? 'jpg' : fileExtension;
  }

  return '';
}

export function getProductImagePath(productId, file, productName = '') {
  const safeProductId = String(productId || '').trim();
  const safeProductName = createSafeImageName(productName);
  const extension = getImageExtension(file);

  if (!safeProductId) {
    throw new Error('Product ID is required before uploading an image.');
  }

  if (safeProductId.includes('/')) {
    throw new Error('Product ID cannot contain slashes.');
  }

  if (!extension) {
    throw new Error('Unsupported image type. Use JPG, PNG, WEBP, or AVIF.');
  }

  return safeProductName
    ? `products/${safeProductId}-${safeProductName}.${extension}`
    : `products/${safeProductId}.${extension}`;
}

function validateImageFile(file) {
  if (!file) {
    throw new Error('Image file is required.');
  }

  if (!getImageExtension(file)) {
    throw new Error('Unsupported image type. Use JPG, PNG, WEBP, or AVIF.');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image file is too large. Maximum size is 5 MB.');
  }
}

export async function uploadProductImage(productId, file, metadata = {}) {
  validateImageFile(file);

  const path = getProductImagePath(productId, file, metadata.productName);
  const imageRef = ref(storage, path);
  const customMetadata = Object.entries({
    ...metadata,
    productId: String(productId || '').trim()
  }).reduce((values, [key, value]) => {
    if (value !== null && value !== undefined && String(value).trim()) {
      values[key] = String(value).trim();
    }

    return values;
  }, {});

  await uploadBytes(imageRef, file, {
    contentType: file.type || undefined,
    customMetadata
  });

  return path;
}

export function createImageFileMap(files) {
  return Array.from(files || []).reduce((map, file) => {
    validateImageFile(file);

    const baseName = file.name.replace(/\.[^.]+$/, '');
    const safeName = createSafeImageName(baseName);

    if (safeName) {
      map.set(safeName, file);
    }

    return map;
  }, new Map());
}

export async function getImageUrl(path) {
  const imageRef = ref(storage, path);
  return await getDownloadURL(imageRef);
}

export async function attachImage(product) {
  let imageUrl = null;

  if (product.image) {
    try {
      imageUrl = await getImageUrl(product.image);
    } catch {}
  }

  return {
    ...product,
    imageUrl
  };
}
