import { createContext, useContext, useState } from "react";
import { createCustomContext } from "../utils/createContext";
const CartContext = createContext(null);

const CartProvider = ({ children }) => {
  const [isCartOpen, setCartOpen] = useState(false);
  
  //cart controls
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

 const useCart = () => createCustomContext(CartContext);

export { CartProvider, useCart };
