import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [selectedProducts, setSelectedProducts] = useState(() => {
    const saved = localStorage.getItem("products");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(selectedProducts));
    console.log(selectedProducts)
  }, [selectedProducts]);

  const addProduct = (product) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((p) => p.id === product.id);

      if (existing) {
        return prev.map((p) =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p.id !== productId)
    );
  };

  const increaseQuantity = (productId) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, quantity: p.quantity + 1 }
          : p
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setSelectedProducts((prev) =>
      prev
        .map((p) =>
          p.id === productId
            ? { ...p, quantity: p.quantity - 1 }
            : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  const getQuantity = (productId) => {
    const found = selectedProducts.find((p) => p.id === productId);
    return found ? found.quantity : 0;
  };

  const isSelected = (productId) => {
    return selectedProducts.some((p) => p.id === productId);
  };

  const totalCount = useMemo(() => {
    return selectedProducts.reduce(
      (sum, p) => sum + p.quantity,
      0
    );

  }, [selectedProducts]);

  const totalPrice = useMemo(() => {
    let total = selectedProducts.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );
    return total.toFixed(2)
  }, [selectedProducts]);
  

  const value = {
    selectedProducts,
    addProduct,
    removeProduct,
    increaseQuantity,
    decreaseQuantity,
    getQuantity,
    isSelected,
    totalCount,
    totalPrice,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error("useProducts must be used inside ProductsProvider");
  }

  return context;
}