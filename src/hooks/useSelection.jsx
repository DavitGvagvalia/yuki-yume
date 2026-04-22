import { createContext, useState,useEffect } from "react";
import { createCustomContext } from "../utils/createContext";
const CartContext = createContext(null);

const SelectionProvider = ({ children }) => {
const localStorageKey = "SelectedProducts";

const [selectedProducts, setSelectedProducts] = useState(
    () => {
    const stored = localStorage.getItem(localStorageKey);
    return stored ? JSON.parse(stored) : [];
  })

  useEffect(() => {
    console.log("Selected products updated:", selectedProducts);
    localStorage.setItem(localStorageKey, JSON.stringify(selectedProducts));
  }, [selectedProducts]);
  
//product controls
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
    totalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

const useSelection = () =>createCustomContext(CartContext);

export { SelectionProvider, useSelection };