import { createContext, useCallback, useEffect, useState } from "react";
import { getProducts } from "../services/product.service";
import { createCustomContext } from "../utils/createContext";
import { fetcherHandler } from "../utils/storageHandler";
const ProductsContext = createContext(null);

const ProductsProvider = ({ children }) => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshProducts = useCallback(async ({ useCache = true } = {}) => {
    setLoading(true);
    setError(null);

    try {
      const productData = useCache
        ? await fetcherHandler("products", getProducts)
        : await getProducts();

      setProducts(productData);
      return productData;
    } catch (productError) {
      setError(productError);
      throw productError;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts().catch(() => {});
  }, [refreshProducts]);

  const value = { products, loading, error, refreshProducts };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

const useProducts = () => createCustomContext(ProductsContext);

export { ProductsProvider, useProducts };
