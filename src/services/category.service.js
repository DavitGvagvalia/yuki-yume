import { db } from '../firebaseConfig.js';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';

const categoriesCollection = collection(db, 'categories');
const categoriesCacheKeys = ['categories', 'categories_time'];

export function clearCategoriesCache() {
  if (typeof localStorage === 'undefined') {
    return;
  }

  categoriesCacheKeys.forEach((key) => localStorage.removeItem(key));
}

export function normalizeCategoryKey(categoryName) {
  return String(categoryName || '').trim().toLowerCase();
}

export function isPopularCategory(categoryName) {
  return normalizeCategoryKey(categoryName) === 'popular';
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
    normalizeCategoryKey(existingCategory.name || existingCategory) === normalizeCategoryKey(trimmedCategory)
  ));

  return matchingCategory?.name || matchingCategory || toTitleCase(trimmedCategory);
}

export function createCategorySlug(categoryName) {
  return normalizeCategoryKey(categoryName)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeCategoryOrder(value) {
  const sortOrder = Number(value);

  return Number.isFinite(sortOrder) ? sortOrder : Number.MAX_SAFE_INTEGER;
}

export function sortCategories(categories) {
  return [...categories].sort((firstCategory, secondCategory) => {
    const orderComparison = normalizeCategoryOrder(firstCategory.sortOrder) -
      normalizeCategoryOrder(secondCategory.sortOrder);

    if (orderComparison !== 0) {
      return orderComparison;
    }

    return String(firstCategory.name || '').localeCompare(String(secondCategory.name || ''));
  });
}

export function normalizeCategoryDoc(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: String(data.name || '').trim(),
    sortOrder: Number.isFinite(Number(data.sortOrder)) ? Number(data.sortOrder) : 0,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
  };
}

export async function getCategories() {
  const querySnapshot = await getDocs(categoriesCollection);

  return sortCategories(querySnapshot.docs.map(normalizeCategoryDoc));
}

export function getCategoryNameById(categories, categoryId) {
  const category = categories.find((item) => item.id === categoryId);

  return category?.name || '';
}

export function getCategoryIdsByNames(categoryNames, categories) {
  const categoriesByName = new Map(
    categories.map((category) => [normalizeCategoryKey(category.name), category.id])
  );
  const categoryIds = [];

  categoryNames.forEach((categoryName) => {
    const categoryId = categoriesByName.get(normalizeCategoryKey(categoryName));

    if (categoryId && !categoryIds.includes(categoryId)) {
      categoryIds.push(categoryId);
    }
  });

  return categoryIds;
}

export function getUnknownCategoryNames(categoryNames, categories) {
  const categoriesByName = new Set(
    categories.map((category) => normalizeCategoryKey(category.name))
  );

  return categoryNames.filter((categoryName) => (
    categoryName && !categoriesByName.has(normalizeCategoryKey(categoryName))
  ));
}

export async function addCategory(categoryName, existingCategories = []) {
  const name = normalizeCategoryName(categoryName, existingCategories);
  const id = createCategorySlug(name);

  if (!id) {
    throw new Error('Choose a valid category name.');
  }

  if (existingCategories.some((category) => category.id === id || normalizeCategoryKey(category.name) === normalizeCategoryKey(name))) {
    throw new Error('A category with that name already exists.');
  }

  const nextSortOrder = existingCategories.length + 1;

  await setDoc(doc(db, 'categories', id), {
    name,
    sortOrder: nextSortOrder,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  clearCategoriesCache();

  return {
    id,
    name,
    sortOrder: nextSortOrder,
    createdAt: null,
    updatedAt: null
  };
}

export async function renameCategory(categoryId, nextCategoryName, existingCategories = []) {
  const name = normalizeCategoryName(nextCategoryName, existingCategories);

  if (!categoryId || !name) {
    throw new Error('Choose a valid category name.');
  }

  const collision = existingCategories.some((category) => (
    category.id !== categoryId &&
    normalizeCategoryKey(category.name) === normalizeCategoryKey(name)
  ));

  if (collision) {
    throw new Error('A category with that name already exists.');
  }

  await updateDoc(doc(db, 'categories', categoryId), {
    name,
    updatedAt: serverTimestamp()
  });

  clearCategoriesCache();
}

export async function updateCategoryOrder(categoriesInOrder) {
  const batch = writeBatch(db);

  categoriesInOrder.forEach((category, index) => {
    batch.update(doc(db, 'categories', category.id), {
      sortOrder: index + 1,
      updatedAt: serverTimestamp()
    });
  });

  await batch.commit();
  clearCategoriesCache();
}

export async function productCountForCategory(categoryId) {
  const productsQuery = query(
    collection(db, 'products'),
    where('categoryIds', 'array-contains', categoryId)
  );
  const querySnapshot = await getDocs(productsQuery);

  return querySnapshot.size;
}

export async function deleteCategory(categoryId) {
  const linkedProductCount = await productCountForCategory(categoryId);

  if (linkedProductCount > 0) {
    throw new Error(`Cannot delete category while ${linkedProductCount} product${linkedProductCount === 1 ? '' : 's'} still use it.`);
  }

  await deleteDoc(doc(db, 'categories', categoryId));
  clearCategoriesCache();
}
