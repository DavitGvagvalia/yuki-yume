import { ArrowLeftIcon,ShoppingCartIcon} from "@heroicons/react/24/outline";

import CartItem from "./CartItem.jsx";
import { useCart } from "../../hooks/useCart.jsx";

const CartItems = ({ items }) => {
  return (<div className="flex-1 px-4">
    {items.length === 0 ? (
      <p className="text-muted text-center mt-8">
        Your cart is empty
      </p>
    ) : (
      items.map((item) => (
        <CartItem key={item.id} item={item} />
      ))
    )}
  </div>)
}

const CartHeader = ({ onCartToggle }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <button
        onClick={onCartToggle}
        aria-label="Close cart"
        className="text-muted hover:text-text transition"
      >
        <ArrowLeftIcon className="w-6 h-6" />
      </button>
      <h2 className="text-lg font-bold text-text flex gap-2">Your Cart
        <ShoppingCartIcon className="w-6 h-6" />
      </h2>
    </div>
  )
}


const CartFooter = ({ totalPrice, clearCart }) => {

  return (
    <div className="p-4 border-t border-border">
      <div className="flex justify-between text-text mb-4">
        <span>Total</span>
        <span>${totalPrice.toFixed(2)}</span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={clearCart}
          className="
            sticky
            bottom-0
            bg-card
            text-text
            rounded-md
            py-2
            hover:bg-surface
            transition
          "
        >
          Clear
        </button>

        <button
          disabled={totalPrice === 0}
          className="
            flex-1
            bg-accent
            hover:bg-accent-hover
            text-background
            rounded-md
            py-2
            transition
            disabled:opacity-50
            disabled:cursor-not-allowed
            disabled:bg-background
            disabled:text-muted
          "
        >
          Checkout
        </button>
      </div>
    </div>
  )
};

export default function CartDrawer() {
  const { isOpen, items, totalPrice, clearCart,toggleCart } = useCart();

  if (!isOpen) return null;

  return (

      <aside
        className="
          fixed
          right-0
          top-0
          h-full
          w-full
          max-w-md
          bg-surface
          flex
          flex-col
          shadow-xl
          z-10
        "
      >
        <CartHeader onCartToggle={toggleCart} />

        <CartItems items={items} />

        <CartFooter totalPrice={totalPrice} clearCart={clearCart} />
      </aside>
  );
}
