import { ArrowLeftIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import CartItem from "./CartItem.jsx";
import { useSelection } from "../../hooks/useSelection.jsx";
import { useCart } from "../../hooks/useCart.jsx";
import { useNavigate } from 'react-router-dom';

const CartItems = ({ items }) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 pb-5 pt-3">
      {items.length === 0 ? (
        <p className="mt-5 rounded-xl px-2 py-3 border-b border-border bg-panel/85  backdrop-blur">
          Your cart is empty
        </p>
      ) : (
        items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))
      )}
    </div>
  );
};

const CartHeader = ({ onCartToggle }) => {
  return (
    <div className="flex items-center justify-between border-b border-border bg-panel px-4 py-4 backdrop-blur-xl">
      <button
        onClick={onCartToggle}
        aria-label="Close cart"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-control text-muted transition hover:bg-control-hover hover:text-text"
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </button>

      <h2 className="flex items-center gap-2 text-base font-bold text-text">
        Your Cart
        <ShoppingCartIcon className="h-5 w-5" />
      </h2>
    </div>
  );
};

const CartSummary = ({ totalPrice, selectedProducts, closeCart }) => {
  const navigate = useNavigate();

  function handleCheckout() {
    closeCart();
    navigate('/checkout');
  }

  return (
    <div className="px-4 pt-4">
      <div className='flex items-center justify-between gap-3 rounded-md border border-border bg-panel-elevated p-2 pl-5 backdrop-blur-xl'>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Total</span>
          <h1 className='text-lg font-bold text-text'>{totalPrice} GEL</h1>
        </div>
        <button
          type="button"
          disabled={selectedProducts.length === 0}
          onClick={handleCheckout}
          className='flex min-h-11 items-center justify-center rounded-3xl bg-accent px-5 py-2 text-sm font-semibold text-on-accent transition hover:bg-accent-hover active:scale-103 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-muted'
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default function CartDrawer() {
  const { isCartOpen, toggleCart  } = useCart()
  const { selectedProducts,totalPrice } = useSelection();
  if (!isCartOpen) return null;

  return (

    <aside
      className="
        fixed
        right-0
        top-0
        h-full
        w-screen
        max-w-md
        bg-panel
        flex
        flex-col
        border-l
        border-border
        shadow-[0_28px_70px_rgb(15_27_51_/_0.28)]
        backdrop-blur-2xl
        md:w-[26rem]
        z-11
      "
    >
      <CartHeader onCartToggle={toggleCart} />
      <CartItems items={selectedProducts} />
      <CartSummary totalPrice={totalPrice} selectedProducts={selectedProducts} closeCart={toggleCart}/>
    </aside>

  );
}
