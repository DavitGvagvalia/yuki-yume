import { createProduct, productDefaults } from '../schemes/templates.ts';
import {
  getProductSearchValues as getConfiguredProductSearchValues,
  normalizeConfiguredProductFields
} from '../config/productFields.js';
import { db } from '../firebaseConfig.js';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { attachImage } from '../utils/imageHandler.js';
import {
  getCategoryNameById,
  isPopularCategory,
  normalizeCategoryKey
} from './category.service.js';

const productsCollection = collection(db, 'products');
const productsCacheKeys = ['products', 'products_time'];

function clearProductsCache() {
  if (typeof localStorage === 'undefined') {
    return;
  }

  productsCacheKeys.forEach((key) => localStorage.removeItem(key));
}

function normalizeProductName(name) {
  return String(name || '').trim().toLowerCase();
}

function normalizeSortOrder(value) {
  const sortOrder = Number(value);

  return Number.isFinite(sortOrder) ? sortOrder : Number.MAX_SAFE_INTEGER;
}

export function normalizePromotionPercent(value) {
  const promotion = Number(value);

  if (!Number.isFinite(promotion)) {
    return 0;
  }

  return Math.min(Math.max(promotion, 0), 100);
}

function normalizePrice(value) {
  const price = Number(value);

  return Number.isFinite(price) ? price : 0;
}

function roundPrice(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getProductDiscountedPrice(product) {
  const price = normalizePrice(product?.price);
  const promotion = normalizePromotionPercent(product?.promotion);

  if (promotion <= 0) {
    return roundPrice(price);
  }

  return roundPrice(price * (1 - promotion / 100));
}

export function getProductPriceInfo(product) {
  const basePrice = roundPrice(normalizePrice(product?.price));
  const promotion = normalizePromotionPercent(product?.promotion);
  const currentPrice = getProductDiscountedPrice(product);

  return {
    basePrice,
    currentPrice,
    promotion,
    hasPromotion: promotion > 0 && currentPrice < basePrice,
    basePriceLabel: basePrice.toFixed(2),
    currentPriceLabel: currentPrice.toFixed(2)
  };
}

function uniqueCategoryIds(values) {
  const categoryIds = [];

  (Array.isArray(values) ? values : []).forEach((value) => {
    const categoryId = String(value || '').trim();

    if (categoryId && !categoryIds.includes(categoryId)) {
      categoryIds.push(categoryId);
    }
  });

  return categoryIds;
}

export { isPopularCategory, normalizeCategoryKey };

export function getProductCategoryIds(product) {
  return uniqueCategoryIds(product.categoryIds);
}

export function productMatchesCategory(product, categoryId) {
  return getProductCategoryIds(product).includes(categoryId);
}

export function getProductCategoryLabel(product, categories = []) {
  return getProductCategoryIds(product)
    .map((categoryId) => getCategoryNameById(categories, categoryId) || categoryId)
    .join(' / ');
}

export function getProductSearchValues(product) {
  return getConfiguredProductSearchValues(product);
}

export function isProductVisible(product) {
  return product.available !== false;
}

export function normalizeProductForSave(product) {
  const {
    category,
    categories,
    categoryOrder,
    categoryOrders,
    _invalidReason,
    _productId,
    ...productFields
  } = product;

  return normalizeConfiguredProductFields({
    ...productFields,
    categoryIds: getProductCategoryIds(product)
  });
}

export function sortProductsForCategory(products, categoryId) {
  return products
    .filter((product) => productMatchesCategory(product, categoryId))
    .sort((firstProduct, secondProduct) => {
      const orderComparison = normalizeSortOrder(firstProduct.sortOrder) -
        normalizeSortOrder(secondProduct.sortOrder);

      if (orderComparison !== 0) {
        return orderComparison;
      }

      return String(firstProduct.name || '').localeCompare(String(secondProduct.name || ''));
    });
}

export function getProductsMatchingCategory(products, categoryId) {
  if (!categoryId || categoryId === 'ALL') {
    return products;
  }

  if (isPopularCategory(categoryId)) {
    return products
      .filter((product) => product.popular === true)
      .sort((firstProduct, secondProduct) => {
        const orderComparison = normalizeSortOrder(firstProduct.sortOrder) -
          normalizeSortOrder(secondProduct.sortOrder);

        if (orderComparison !== 0) {
          return orderComparison;
        }

        return String(firstProduct.name || '').localeCompare(String(secondProduct.name || ''));
      });
  }

  return sortProductsForCategory(products, categoryId);
}

function getPrimaryCategoryId(product) {
  return getProductCategoryIds(product)[0] || '';
}

export function sortProductsByCategoryOrder(products, categories = []) {
  const categoryOrderById = new Map(
    categories.map((category, index) => [category.id, Number(category.sortOrder) || index + 1])
  );

  return [...products].sort((firstProduct, secondProduct) => {
    const firstCategoryId = getPrimaryCategoryId(firstProduct);
    const secondCategoryId = getPrimaryCategoryId(secondProduct);
    const categoryOrderComparison = normalizeSortOrder(categoryOrderById.get(firstCategoryId)) -
      normalizeSortOrder(categoryOrderById.get(secondCategoryId));

    if (categoryOrderComparison !== 0) {
      return categoryOrderComparison;
    }

    const categoryComparison = firstCategoryId.localeCompare(secondCategoryId);

    if (categoryComparison !== 0) {
      return categoryComparison;
    }

    const orderComparison = normalizeSortOrder(firstProduct.sortOrder) -
      normalizeSortOrder(secondProduct.sortOrder);

    if (orderComparison !== 0) {
      return orderComparison;
    }

    return String(firstProduct.name || '').localeCompare(String(secondProduct.name || ''));
  });
}

function mergeProductWithCategoryFields(product) {
  return normalizeProductForSave(product);
}

export async function getProductsRaw() {
  const querySnapshot = await getDocs(productsCollection);

  return querySnapshot.docs.map((snapshot) => ({
    id: snapshot.id,
    ...normalizeProductForSave(snapshot.data())
  }));
}

export async function getProducts() {
  const rawProducts = await getProductsRaw();
  const productsWithImages = await Promise.all(rawProducts.map(attachImage));

  return sortProductsByCategoryOrder(productsWithImages);
}

export function createProductId() {
  return doc(productsCollection).id;
}

export default async function addProduct(productData, productId = '') {
  try {
    const product = createProduct(mergeProductWithCategoryFields(productData));

    if (productId) {
      await setDoc(doc(productsCollection, productId), product);
      clearProductsCache();
      console.log('Product added with ID:', productId);
      return productId;
    }

    const newDoc = await addDoc(productsCollection, product);

    clearProductsCache();
    console.log('Product added with ID:', newDoc.id);
    return newDoc.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

export async function updateProduct(productId, updatedData) {
  try {
    const productRef = doc(db, 'products', productId);

    await updateDoc(productRef, mergeProductWithCategoryFields(updatedData));
    clearProductsCache();
    console.log('Product updated with ID:', productId);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function updateCategoryProductOrder(productsInOrder) {
  try {
    const batch = writeBatch(db);

    productsInOrder.forEach((product, index) => {
      const productRef = doc(db, 'products', product.id);
      const normalizedProduct = normalizeProductForSave({
        ...product,
        sortOrder: index + 1
      });

      batch.update(productRef, {
        sortOrder: normalizedProduct.sortOrder,
        weight: normalizedProduct.weight,
        pieces: normalizedProduct.pieces,
        calories: normalizedProduct.calories
      });
    });

    await batch.commit();
    clearProductsCache();
  } catch (error) {
    console.error('Error updating product order:', error);
    throw error;
  }
}

export async function deleteProduct(productId) {
  try {
    const productRef = doc(db, 'products', productId);

    await deleteDoc(productRef);
    clearProductsCache();
    console.log('Product deleted with ID:', productId);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export async function batchAddProducts(products) {
  try {
    const existingProducts = await getProductsRaw();
    const knownProductNames = new Set(
      existingProducts.map((product) => normalizeProductName(product.name))
    );
    const skipped = [];
    const invalid = [];
    const productsToAdd = [];
    const categorySortCounts = new Map();

    existingProducts.forEach((product) => {
      getProductCategoryIds(product).forEach((categoryId) => {
        const currentCount = categorySortCounts.get(categoryId) || 0;
        const existingSortOrder = Number(product.sortOrder);
        const nextCount = Number.isFinite(existingSortOrder) && existingSortOrder > 0
          ? Math.max(currentCount, existingSortOrder)
          : currentCount + 1;

        categorySortCounts.set(categoryId, nextCount);
      });
    });

    products.forEach((product, index) => {
      if (product._invalidReason) {
        invalid.push({ row: index + 2, reason: product._invalidReason });
        return;
      }

      const normalizedInputProduct = normalizeProductForSave(product);
      const productName = normalizeProductName(normalizedInputProduct.name);
      const categoryIds = getProductCategoryIds(normalizedInputProduct);
      const parsedSortOrder = Number(normalizedInputProduct.sortOrder);
      const primaryCategoryId = categoryIds[0] || '';
      const sortOrder = Number.isFinite(parsedSortOrder) && parsedSortOrder > 0
        ? parsedSortOrder
        : (categorySortCounts.get(primaryCategoryId) || 0) + 1;

      if (!productName) {
        invalid.push({ row: index + 2, reason: 'Missing product name' });
        return;
      }

      if (categoryIds.length === 0) {
        invalid.push({ row: index + 2, reason: 'Missing known category' });
        return;
      }

      if (knownProductNames.has(productName)) {
        skipped.push(normalizedInputProduct.name);
        return;
      }

      knownProductNames.add(productName);
      categoryIds.forEach((categoryId) => {
        categorySortCounts.set(categoryId, Math.max(categorySortCounts.get(categoryId) || 0, sortOrder));
      });
      productsToAdd.push({
        id: String(product._productId || '').trim(),
        data: {
          ...productDefaults,
          ...normalizedInputProduct,
          name: normalizedInputProduct.name.trim(),
          categoryIds,
          sortOrder,
          image: String(normalizedInputProduct.image || '').trim()
        }
      });
    });

    for (let start = 0; start < productsToAdd.length; start += 500) {
      const batch = writeBatch(db);

      productsToAdd.slice(start, start + 500).forEach(({ id, data }) => {
        const productRef = id ? doc(productsCollection, id) : doc(productsCollection);

        batch.set(productRef, data);
      });

      await batch.commit();
    }

    if (productsToAdd.length > 0) {
      clearProductsCache();
    }

    return {
      added: productsToAdd.length,
      skipped,
      invalid,
      total: products.length
    };
  } catch (error) {
    console.error('Error batch adding products:', error);
    throw error;
  }
}
