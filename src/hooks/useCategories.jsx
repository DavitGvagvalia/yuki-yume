import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { getCategories, sortCategories } from '../services/category.service.js';
import { createCustomContext } from '../utils/createContext';
import { fetcherHandler } from '../utils/storageHandler';

const CategoriesContext = createContext(null);

const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const hasCategoriesRef = useRef(false);

  const replaceCategories = useCallback((categoriesOrUpdater) => {
    setCategories((currentCategories) => {
      const nextCategories = typeof categoriesOrUpdater === 'function'
        ? categoriesOrUpdater(currentCategories)
        : categoriesOrUpdater;

      hasCategoriesRef.current = nextCategories.length > 0;
      return sortCategories(nextCategories);
    });
  }, []);

  const refreshCategories = useCallback(async ({ useCache = true, showLoading } = {}) => {
    const shouldShowLoading = showLoading ?? !hasCategoriesRef.current;

    if (shouldShowLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);

    try {
      const categoryData = useCache
        ? await fetcherHandler('categories', getCategories)
        : await getCategories();

      replaceCategories(categoryData);
      return categoryData;
    } catch (categoryError) {
      setError(categoryError);
      throw categoryError;
    } finally {
      if (shouldShowLoading) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, [replaceCategories]);

  useEffect(() => {
    refreshCategories({ showLoading: true }).catch(() => {});
  }, [refreshCategories]);

  const value = {
    categories,
    loading,
    refreshing,
    error,
    refreshCategories,
    setCategories: replaceCategories
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

const useCategories = () => createCustomContext(CategoriesContext);

export { CategoriesProvider, useCategories };
