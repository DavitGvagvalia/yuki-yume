import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  /* ---------- UI state ---------- */
  const [isOpen, setIsOpen] = useState(false);

  /* ---------- Cart data ---------- */
  const [items, setItems] = useState([]);

  /* ---------- Actions ---------- */
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen(o => !o);

  const addItem = product => {
    setItems(prev => {
      const item = prev.find(i => i.id === product.id);
      return item
        ? prev.map(i =>
            i.id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = id =>
    setItems(prev => prev.filter(i => i.id !== id));

  const increase = id =>
    setItems(prev =>
      prev.map(i =>
        i.id === id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );

  const decrease = id =>
    setItems(prev =>
      prev
        .map(i =>
          i.id === id
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter(i => i.quantity > 0)
    );

  const clearCart = () => setItems([]);

  /* ---------- Derived values ---------- */
  const totalCount = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () =>
      items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );

  /* ---------- Exposed API ---------- */
  const value = {
    // UI
    isOpen,
    openCart,
    closeCart,
    toggleCart,

    // data
    items,
    totalCount,
    totalPrice,

    // actions
    addItem,
    removeItem,
    increase,
    decrease,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/* ---------- Hook ---------- */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
