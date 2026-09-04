import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getProducts, isProductVisible } from "../services/product.service";
import { createCustomContext } from "../utils/createContext";
import { fetcherHandler } from "../utils/storageHandler";
const ProductsContext = createContext(null);

function normalizeSearchValue(value) {
  return String(value || '').trim().toLowerCase();
}

function getProductSearchText(product) {
  const ingredients = Array.isArray(product.ingredients)
    ? product.ingredients.join(' ')
    : product.ingredients;

  return normalizeSearchValue([
    product.name,
    ingredients
  ].filter(Boolean).join(' '));
}

const ProductsProvider = ({ children }) => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const hasProductsRef = useRef(false);
  const visibleProducts = useMemo(() => {
    return products.filter(isProductVisible);
  }, [products]);

  const filterProductsBySearch = useCallback((productsToFilter) => {
    const searchTerms = normalizeSearchValue(searchQuery).split(/\s+/).filter(Boolean);

    if (searchTerms.length === 0) {
      return productsToFilter;
    }

    return productsToFilter.filter((product) => {
      const productSearchText = getProductSearchText(product);
      return searchTerms.every((term) => productSearchText.includes(term));
    });
  }, [searchQuery]);

  const replaceProducts = useCallback((productsOrUpdater) => {
    setProducts((currentProducts) => {
      const nextProducts = typeof productsOrUpdater === 'function'
        ? productsOrUpdater(currentProducts)
        : productsOrUpdater;

      hasProductsRef.current = nextProducts.length > 0;
      return nextProducts;
    });
  }, []);

  const refreshProducts = useCallback(async ({ useCache = true, showLoading } = {}) => {
    const shouldShowLoading = showLoading ?? !hasProductsRef.current;

    if (shouldShowLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);

    try {
      const productData = useCache
        ? await fetcherHandler("products", getProducts)
        : await getProducts();

      replaceProducts(productData);
      return productData;
    } catch (productError) {
      setError(productError);
      throw productError;
    } finally {
      if (shouldShowLoading) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, [replaceProducts]);

  useEffect(() => {
    refreshProducts({ showLoading: true }).catch(() => {});
  }, [refreshProducts]);

  const value = {
    products,
    visibleProducts,
    loading,
    refreshing,
    error,
    searchQuery,
    setSearchQuery,
    filterProductsBySearch,
    refreshProducts,
    setProducts: replaceProducts
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

const useProducts = () => createCustomContext(ProductsContext);

export { ProductsProvider, useProducts };
