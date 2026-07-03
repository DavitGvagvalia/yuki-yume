import { createProduct, productDefaults } from '../schemes/templates.ts';
import {
  getProductSearchValues as getConfiguredProductSearchValues,
  normalizeConfiguredProductFields
} from '../config/productFields.js';
import { db} from '../firebaseConfig.js';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { attachImage } from '../utils/imageHandler.js';

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

function normalizeCategoryOrder(value) {
  const categoryOrder = Number(value);

  return Number.isFinite(categoryOrder) ? categoryOrder : Number.MAX_SAFE_INTEGER;
}

export function normalizeCategoryKey(categoryName) {
  return String(categoryName || '').trim().toLowerCase();
}

export function isPopularCategory(categoryName) {
  return String(categoryName || '').trim().toLowerCase() === 'popular';
}

function toTitleCase(value) {
  return String(value || '')
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function normalizeCategoryName(categoryName, existingCategories = []) {
  const trimmedCategory = String(categoryName || '').trim();

  if (!trimmedCategory || isPopularCategory(trimmedCategory)) {
    return '';
  }

  const matchingCategory = existingCategories.find((existingCategory) => (
    normalizeCategoryKey(existingCategory) === normalizeCategoryKey(trimmedCategory)
  ));

  return matchingCategory || toTitleCase(trimmedCategory);
}

function uniqueCategories(values, existingCategories = []) {
  const categoriesByKey = new Map();

  values.forEach((value) => {
    const category = normalizeCategoryName(value, [
      ...existingCategories,
      ...categoriesByKey.values()
    ]);
    const key = normalizeCategoryKey(category);

    if (category && !categoriesByKey.has(key)) {
      categoriesByKey.set(key, category);
    }
  });

  return Array.from(categoriesByKey.values());
}

function findValueByCategoryKey(valuesByCategory, categoryName) {
  if (!valuesByCategory || typeof valuesByCategory !== 'object') {
    return undefined;
  }

  const categoryKey = normalizeCategoryKey(categoryName);
  const matchingKey = Object.keys(valuesByCategory).find((key) => (
    normalizeCategoryKey(key) === categoryKey
  ));

  return matchingKey ? valuesByCategory[matchingKey] : undefined;
}

export function getProductCategories(product) {
  if (Array.isArray(product.categories)) {
    const categories = uniqueCategories(product.categories);

    if (categories.length > 0) {
      return categories;
    }
  }

  const legacyCategory = String(product.category || '').trim();

  return legacyCategory && !isPopularCategory(legacyCategory) ? [legacyCategory] : [];
}

export function productMatchesCategory(product, categoryName) {
  const targetCategoryKey = normalizeCategoryKey(categoryName);

  return getProductCategories(product).some((category) => (
    normalizeCategoryKey(category) === targetCategoryKey
  ));
}

export function getProductCategoryLabel(product) {
  return getProductCategories(product).join(' / ');
}

export function getProductSearchValues(product) {
  return getConfiguredProductSearchValues(product);
}

export function isProductVisible(product) {
  return product.available !== false;
}

function getProductCategoryOrder(product, categoryName) {
  const categoryOrders = product.categoryOrders && typeof product.categoryOrders === 'object'
    ? product.categoryOrders
    : {};
  const categorySpecificOrder = Number(findValueByCategoryKey(categoryOrders, categoryName));

  if (Number.isFinite(categorySpecificOrder)) {
    return categorySpecificOrder;
  }

  if (normalizeCategoryKey(product.category) === normalizeCategoryKey(categoryName)) {
    return normalizeCategoryOrder(product.categoryOrder);
  }

  return Number.MAX_SAFE_INTEGER;
}

function getPrimaryCategory(product) {
  return getProductCategories(product)[0] || '';
}

function getPrimaryCategoryOrder(product) {
  const primaryCategory = getPrimaryCategory(product);

  if (!primaryCategory) {
    return Number.MAX_SAFE_INTEGER;
  }

  return getProductCategoryOrder(product, primaryCategory);
}

export function buildCategoryOrders(categories, getCategoryOrder) {
  return categories.reduce((categoryOrders, categoryName) => {
    categoryOrders[categoryName] = getCategoryOrder(categoryName);
    return categoryOrders;
  }, {});
}

function normalizeProductCategoryFields(product, getCategoryOrder) {
  const categories = getProductCategories(product);
  const categoryOrders = buildCategoryOrders(categories, (categoryName) => {
    const categoryOrder = typeof getCategoryOrder === 'function'
      ? getCategoryOrder(categoryName)
      : getProductCategoryOrder(product, categoryName);

    return normalizeCategoryOrder(categoryOrder) === Number.MAX_SAFE_INTEGER ? 0 : categoryOrder;
  });
  const primaryCategory = categories[0] || '';

  return {
    ...product,
    category: primaryCategory,
    categories,
    categoryOrders,
    categoryOrder: primaryCategory ? categoryOrders[primaryCategory] || 0 : 0
  };
}

export function normalizeProductForSave(product, getCategoryOrder = () => 0) {
  return normalizeConfiguredProductFields(
    normalizeProductCategoryFields(product, getCategoryOrder)
  );
}

export function sortProductsForCategory(products, categoryName) {
  return products
    .filter((product) => productMatchesCategory(product, categoryName))
    .sort((firstProduct, secondProduct) => {
      const orderComparison = normalizeSortOrder(firstProduct.sortOrder) -
        normalizeSortOrder(secondProduct.sortOrder);

      if (orderComparison !== 0) {
        return orderComparison;
      }

      return String(firstProduct.name || '').localeCompare(String(secondProduct.name || ''));
    });
}

export function getProductsMatchingCategory(products, categoryName) {
  if (!categoryName || categoryName === 'ALL') {
    return products;
  }

  if (isPopularCategory(categoryName)) {
    return products.filter((product) => product.popular === true);
  }

  return products.filter((product) => productMatchesCategory(product, categoryName));
}

export function createCategoryOrderMap(products) {
  const categoryOrderMap = new Map();

  getOrderedCategories(products).forEach((category, index) => {
    categoryOrderMap.set(category.name, index + 1);
  });

  return categoryOrderMap;
}

function mergeProductWithCategoryFields(product) {
  const orderedCategoryMap = createCategoryOrderMap([product]);

  return normalizeProductForSave(product, (categoryName) => {
    const existingCategoryOrders = product.categoryOrders && typeof product.categoryOrders === 'object'
      ? product.categoryOrders
      : {};
    const categoryOrder = Number(findValueByCategoryKey(existingCategoryOrders, categoryName));

    if (Number.isFinite(categoryOrder) && categoryOrder > 0) {
      return categoryOrder;
    }

    if (normalizeCategoryKey(product.category) === normalizeCategoryKey(categoryName)) {
      const legacyCategoryOrder = Number(product.categoryOrder);

      if (Number.isFinite(legacyCategoryOrder) && legacyCategoryOrder > 0) {
        return legacyCategoryOrder;
      }
    }

    return orderedCategoryMap.get(categoryName) || 0;
  });
}

export function getOrderedCategories(products) {
  const categoriesByName = new Map();

  products.forEach((product) => {
    getProductCategories(product).forEach((name) => {
      const categoryKey = normalizeCategoryKey(name);
      const currentCategory = categoriesByName.get(categoryKey);
      const categoryOrder = getProductCategoryOrder(product, name);

      if (!currentCategory || categoryOrder < currentCategory.categoryOrder) {
        categoriesByName.set(categoryKey, {
          name,
          categoryOrder
        });
      }
    });
  });

  const orderedCategories = Array.from(categoriesByName.values()).sort((firstCategory, secondCategory) => {
    const orderComparison = normalizeCategoryOrder(firstCategory.categoryOrder) -
      normalizeCategoryOrder(secondCategory.categoryOrder);

    if (orderComparison !== 0) {
      return orderComparison;
    }

    return firstCategory.name.localeCompare(secondCategory.name);
  });

  return orderedCategories.map((category, index) => ({
    ...category,
    categoryOrder: normalizeCategoryOrder(category.categoryOrder) === Number.MAX_SAFE_INTEGER
      ? index + 1
      : category.categoryOrder
  }));
}

export function getCategoryOrderForName(categoriesInOrder, categoryName) {
  const categoryIndex = categoriesInOrder.findIndex((category) => (
    normalizeCategoryKey(category.name) === normalizeCategoryKey(categoryName)
  ));

  return categoryIndex === -1 ? 0 : categoryIndex + 1;
}

export function normalizeProductWithCategoryOrder(product, categoriesInOrder) {
  return normalizeProductForSave(product, (categoryName) => (
    getCategoryOrderForName(categoriesInOrder, categoryName)
  ));
}

export function renameCategoryInProduct(product, oldCategoryName, newCategoryName, categoriesInOrder) {
  const oldCategoryKey = normalizeCategoryKey(oldCategoryName);
  const renamedCategories = getProductCategories(product).map((categoryName) => (
    normalizeCategoryKey(categoryName) === oldCategoryKey
      ? newCategoryName
      : categoryName
  ));

  return normalizeProductWithCategoryOrder({
    ...product,
    categories: renamedCategories,
    category: renamedCategories[0] || ''
  }, categoriesInOrder);
}

export function sortProductsByCategoryOrder(products) {
  return [...products].sort((firstProduct, secondProduct) => {
    const categoryOrderComparison = normalizeCategoryOrder(getPrimaryCategoryOrder(firstProduct)) -
      normalizeCategoryOrder(getPrimaryCategoryOrder(secondProduct));

    if (categoryOrderComparison !== 0) {
      return categoryOrderComparison;
    }

    const firstCategory = getPrimaryCategory(firstProduct);
    const secondCategory = getPrimaryCategory(secondProduct);
    const categoryComparison = firstCategory.localeCompare(secondCategory);

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

export async function getProductsRaw() {
  const querySnapshot = await getDocs(productsCollection);

  return sortProductsByCategoryOrder(querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...normalizeProductForSave(doc.data())
  })));
}

export async function getProducts() {
  const rawProducts = await getProductsRaw();

  const productsWithImages = await Promise.all(rawProducts.map(attachImage));

  return sortProductsByCategoryOrder(productsWithImages);
}

export default async function addProduct(productData) {
  try {
    const product = createProduct(mergeProductWithCategoryFields(productData));

    const newDoc = await addDoc(productsCollection, product);

    clearProductsCache();
    console.log("Product added with ID:", newDoc.id);
    return newDoc.id;
  } catch (error) {
    console.error("Error adding product:", error);
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

export async function updateCategoryOrder(categoriesInOrder, products) {
    try {
        for (let start = 0; start < products.length; start += 500) {
            const batch = writeBatch(db);

            products.slice(start, start + 500).forEach((product) => {
                const normalizedProduct = normalizeProductWithCategoryOrder(product, categoriesInOrder);

                if (normalizedProduct.categories.length === 0) {
                    return;
                }

                const productRef = doc(db, 'products', product.id);
                batch.update(productRef, {
                    category: normalizedProduct.category,
                    categories: normalizedProduct.categories,
                    categoryOrder: normalizedProduct.categoryOrder,
                    categoryOrders: normalizedProduct.categoryOrders
                });
            });

            await batch.commit();
        }

        clearProductsCache();
    } catch (error) {
        console.error('Error updating category order:', error);
        throw error;
    }
}

export async function renameCategory(oldCategoryName, newCategoryName, products) {
    const trimmedNewCategoryName = normalizeCategoryName(newCategoryName);
    const oldCategoryKey = normalizeCategoryKey(oldCategoryName);
    const newCategoryKey = normalizeCategoryKey(trimmedNewCategoryName);

    if (!oldCategoryKey || !newCategoryKey) {
        throw new Error('Choose a valid category name.');
    }

    if (isPopularCategory(oldCategoryName) || isPopularCategory(trimmedNewCategoryName)) {
        throw new Error('POPULAR is managed automatically and cannot be renamed.');
    }

    if (oldCategoryKey === newCategoryKey) {
        return;
    }

    const orderedCategories = getOrderedCategories(products);
    const categoryCollision = orderedCategories.some((category) => (
        normalizeCategoryKey(category.name) === newCategoryKey &&
        normalizeCategoryKey(category.name) !== oldCategoryKey
    ));

    if (categoryCollision) {
        throw new Error('A category with that name already exists.');
    }

    const renamedCategoriesInOrder = orderedCategories.map((category) => (
        normalizeCategoryKey(category.name) === oldCategoryKey
            ? { ...category, name: trimmedNewCategoryName }
            : category
    ));
    const productsToRename = products.filter((product) => productMatchesCategory(product, oldCategoryName));

    for (let start = 0; start < productsToRename.length; start += 500) {
        const batch = writeBatch(db);

        productsToRename.slice(start, start + 500).forEach((product) => {
            const renamedProduct = renameCategoryInProduct(
                product,
                oldCategoryName,
                trimmedNewCategoryName,
                renamedCategoriesInOrder
            );
            const productRef = doc(db, 'products', product.id);

            batch.update(productRef, {
                category: renamedProduct.category,
                categories: renamedProduct.categories,
                categoryOrder: renamedProduct.categoryOrder,
                categoryOrders: renamedProduct.categoryOrders
            });
        });

        await batch.commit();
    }

    clearProductsCache();
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
    const categoryOrderMap = new Map();

    existingProducts.forEach((product) => {
      const category = getPrimaryCategory(product);
      const currentCount = categorySortCounts.get(category) || 0;
      const existingSortOrder = Number(product.sortOrder);
      const nextCount = Number.isFinite(existingSortOrder) && existingSortOrder > 0
        ? Math.max(currentCount, existingSortOrder)
        : currentCount + 1;

      categorySortCounts.set(category, nextCount);
    });

    categoryOrderMap.clear();
    createCategoryOrderMap(existingProducts).forEach((value, key) => {
      categoryOrderMap.set(key, value);
    });

    products.forEach((product, index) => {
      const normalizedInputProduct = normalizeProductForSave(product);
      const productName = normalizeProductName(normalizedInputProduct.name);
      const categories = getProductCategories(normalizedInputProduct);
      const category = categories[0] || '';
      const parsedSortOrder = Number(normalizedInputProduct.sortOrder);
      const parsedCategoryOrder = Number(normalizedInputProduct.categoryOrder);
      const existingCategoryOrder = categoryOrderMap.get(category) || 0;
      const sortOrder = Number.isFinite(parsedSortOrder) && parsedSortOrder > 0
        ? parsedSortOrder
        : (categorySortCounts.get(category) || 0) + 1;
      const categoryOrder = Number.isFinite(parsedCategoryOrder) && parsedCategoryOrder > 0
        ? parsedCategoryOrder
        : existingCategoryOrder || categoryOrderMap.size + 1;

      if (!productName) {
        invalid.push({ row: index + 2, reason: 'Missing product name' });
        return;
      }

      if (knownProductNames.has(productName)) {
        skipped.push(normalizedInputProduct.name);
        return;
      }

      knownProductNames.add(productName);
      categories.forEach((categoryName) => {
        categorySortCounts.set(categoryName, Math.max(categorySortCounts.get(categoryName) || 0, sortOrder));

        if (!categoryOrderMap.has(categoryName)) {
          categoryOrderMap.set(categoryName, categoryOrderMap.size + 1);
        }
      });
      productsToAdd.push({
        ...productDefaults,
        ...normalizedInputProduct,
        name: normalizedInputProduct.name.trim(),
        category,
        categories,
        categoryOrder,
        categoryOrders: buildCategoryOrders(
          categories,
          (categoryName) => categoryOrderMap.get(categoryName) || categoryOrder
        ),
        sortOrder,
        image: String(normalizedInputProduct.image || '').trim()
      });
    });

    for (let start = 0; start < productsToAdd.length; start += 500) {
      const batch = writeBatch(db);

      productsToAdd.slice(start, start + 500).forEach((product) => {
        batch.set(doc(productsCollection), product);
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
