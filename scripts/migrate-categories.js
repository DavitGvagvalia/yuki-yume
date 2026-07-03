import { existsSync, readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import {
  collection,
  deleteField,
  doc,
  getDocs,
  getFirestore,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

const APPLY_CHANGES = process.argv.includes('--apply');
const BATCH_LIMIT = 500;

function loadEnvFile() {
  if (!existsSync('.env')) {
    return;
  }

  const lines = readFileSync('.env', 'utf8').split(/\r?\n/);

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function getRequiredEnv(key) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required env value: ${key}`);
  }

  return value;
}

function normalizeCategoryKey(categoryName) {
  return String(categoryName || '').trim().toLowerCase();
}

function isPopularCategory(categoryName) {
  return normalizeCategoryKey(categoryName) === 'popular';
}

function toTitleCase(value) {
  return String(value || '')
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function normalizeCategoryName(categoryName, existingNames = []) {
  const trimmedCategory = String(categoryName || '').trim();

  if (!trimmedCategory || isPopularCategory(trimmedCategory)) {
    return '';
  }

  const matchingCategory = existingNames.find((existingName) => (
    normalizeCategoryKey(existingName) === normalizeCategoryKey(trimmedCategory)
  ));

  return matchingCategory || toTitleCase(trimmedCategory);
}

function createCategorySlug(categoryName) {
  return normalizeCategoryKey(categoryName)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeOrder(value) {
  const order = Number(value);

  return Number.isFinite(order) && order > 0 ? order : Number.MAX_SAFE_INTEGER;
}

function getLegacyProductCategories(product, existingNames) {
  const sourceCategories = Array.isArray(product.categories) && product.categories.length > 0
    ? product.categories
    : [product.category];
  const categoriesByKey = new Map();

  sourceCategories.forEach((categoryName) => {
    const normalizedName = normalizeCategoryName(categoryName, [
      ...existingNames,
      ...categoriesByKey.values()
    ]);
    const categoryKey = normalizeCategoryKey(normalizedName);

    if (normalizedName && !categoriesByKey.has(categoryKey)) {
      categoriesByKey.set(categoryKey, normalizedName);
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

function getCategoryOrder(product, categoryName) {
  const categoryOrders = product.categoryOrders && typeof product.categoryOrders === 'object'
    ? product.categoryOrders
    : {};
  const categorySpecificOrder = normalizeOrder(findValueByCategoryKey(categoryOrders, categoryName));

  if (categorySpecificOrder !== Number.MAX_SAFE_INTEGER) {
    return categorySpecificOrder;
  }

  if (normalizeCategoryKey(product.category) === normalizeCategoryKey(categoryName)) {
    return normalizeOrder(product.categoryOrder);
  }

  return Number.MAX_SAFE_INTEGER;
}

function createFirebaseConfig() {
  loadEnvFile();

  return {
    apiKey: getRequiredEnv('VITE_FIREBASE_API_KEY'),
    authDomain: getRequiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getRequiredEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getRequiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getRequiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getRequiredEnv('VITE_FIREBASE_APP_ID')
  };
}

async function commitBatches(db, operations) {
  for (let start = 0; start < operations.length; start += BATCH_LIMIT) {
    const batch = writeBatch(db);

    operations.slice(start, start + BATCH_LIMIT).forEach((operation) => operation(batch));
    await batch.commit();
  }
}

async function migrateCategories() {
  const app = initializeApp(createFirebaseConfig());
  const db = getFirestore(app);
  const productsSnapshot = await getDocs(collection(db, 'products'));
  const categoriesByKey = new Map();
  const productUpdates = [];

  productsSnapshot.docs.forEach((productSnapshot) => {
    const product = productSnapshot.data();
    const categoryNames = getLegacyProductCategories(
      product,
      Array.from(categoriesByKey.values()).map((category) => category.name)
    );
    const categoryIds = [];

    categoryNames.forEach((categoryName) => {
      const categoryKey = normalizeCategoryKey(categoryName);
      const categoryId = createCategorySlug(categoryName);
      const categoryOrder = getCategoryOrder(product, categoryName);
      const currentCategory = categoriesByKey.get(categoryKey);

      if (!currentCategory || categoryOrder < currentCategory.sortOrder) {
        categoriesByKey.set(categoryKey, {
          id: categoryId,
          name: categoryName,
          sortOrder: categoryOrder
        });
      }

      if (categoryId && !categoryIds.includes(categoryId)) {
        categoryIds.push(categoryId);
      }
    });

    productUpdates.push({
      productId: productSnapshot.id,
      categoryIds
    });
  });

  const categories = Array.from(categoriesByKey.values())
    .sort((firstCategory, secondCategory) => {
      const orderComparison = normalizeOrder(firstCategory.sortOrder) - normalizeOrder(secondCategory.sortOrder);

      if (orderComparison !== 0) {
        return orderComparison;
      }

      return firstCategory.name.localeCompare(secondCategory.name);
    })
    .map((category, index) => ({
      ...category,
      sortOrder: normalizeOrder(category.sortOrder) === Number.MAX_SAFE_INTEGER
        ? index + 1
        : category.sortOrder
    }));

  console.log(`Found ${productsSnapshot.size} products.`);
  console.log(`Will create or update ${categories.length} categories.`);
  console.log(`Will update ${productUpdates.length} products with categoryIds and remove legacy category fields.`);

  // if (!APPLY_CHANGES) {
  //   console.log('Dry run only. Re-run with --apply to write changes.');
  //   return;
  // }

  const categoryOperations = categories.map((category) => (batch) => {
    batch.set(doc(db, 'categories', category.id), {
      name: category.name,
      sortOrder: category.sortOrder,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  });
  const productOperations = productUpdates.map((productUpdate) => (batch) => {
    batch.update(doc(db, 'products', productUpdate.productId), {
      categoryIds: productUpdate.categoryIds,
      category: deleteField(),
      categories: deleteField(),
      categoryOrder: deleteField(),
      categoryOrders: deleteField()
    });
  });

  await commitBatches(db, [...categoryOperations, ...productOperations]);
  console.log('Category migration complete.');
}

migrateCategories().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
