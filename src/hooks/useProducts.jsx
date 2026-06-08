import { createContext, useEffect, useState } from "react";
import { getProducts } from "../services/product.service";
import { createCustomContext } from "../utils/createContext";
import { fetcherHandler } from "../utils/StorageHandler";
const ProductsContext = createContext(null);

const ProductsProvider = ({ children }) => {

  const [products, setProducts] = useState([]);

  useEffect(()=>{
      (async () => {
        const productData = await fetcherHandler("products", getProducts);
        setProducts(productData);
      })()
    },[])
  const value = { products };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

const useProducts = () => createCustomContext(ProductsContext);

export { ProductsProvider, useProducts };