import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { getProducts } from "../services/product.service";
import { createCustomContext } from "../utils/createContext";
import { fetcherHandler } from "../utils/storageHandler";
const ProductsContext = createContext(null);

const ProductsProvider = ({ children }) => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const hasProductsRef = useRef(false);

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
    loading,
    refreshing,
    error,
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
