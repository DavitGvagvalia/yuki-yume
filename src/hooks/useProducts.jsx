import { createContext,  useEffect, useState } from "react";
import { apiGet } from "../utils/api";
import { createCustomContext } from "../utils/createContext";

const ProductsContext = createContext(null);

const ProductsProvider = ({ children }) => {
  
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {

        if (products.length > 0) return
        const data = await apiGet('/api/products');
        setProducts(data);
    }
    fetchProducts();
    
  }, []);
  const value = { products, setProducts };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

const useProducts = () =>createCustomContext(ProductsContext);

export { ProductsProvider, useProducts };