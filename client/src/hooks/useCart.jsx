import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [isCartOpen, setCartOpen] = useState(false);

  const toggleCart = () => setCartOpen((prev) => !prev);
  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);

  return (
    <CartContext.Provider
      value={{ isCartOpen, toggleCart, openCart, closeCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};