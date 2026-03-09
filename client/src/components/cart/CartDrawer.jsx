import { ArrowLeftIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import CartItem from "./CartItem.jsx";
import { useProducts } from "../../hooks/useProducts.jsx";
import { useCart } from "../../hooks/useCart.jsx";

const CartItems = ({ items }) => {
  return (
    <div className="flex-1 px-4 overflow-y-auto">
      {items.length === 0 ? (
        <p className="text-muted text-center mt-8">
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
    <div className="flex items-center justify-between p-4 border-b border-border">
      <button
        onClick={onCartToggle}
        aria-label="Close cart"
        className="text-muted hover:text-text transition"
      >
        <ArrowLeftIcon className="w-6 h-6" />
      </button>

      <h2 className="text-lg font-bold text-text flex gap-2 items-center">
        Your Cart
        <ShoppingCartIcon className="w-6 h-6" />
      </h2>
    </div>
  );
};

const CartFooter = ({ totalPrice,selectedProducts }) => {
  return (
    <div className=" py-5 border-t border-border flex justify-center">
      <div className=' w-[90%] bg-background flex  justify-between items-center p-2 rounded-4xl bottom-5 z-9 px-7 border border-border'>
      <h1 className=''>{totalPrice} GEL</h1>
      <button disabled={selectedProducts.length === 0 } className='flex justify-center items-center gap-2 bg-accent  text-white rounded-3xl py-2 px-5 active:scale-103 disabled:bg-border disabled:text-muted'>
        <span>checkout</span>
      </button>
      </div>
    </div>
  );
};

export default function CartDrawer() {
  const { isCartOpen, toggleCart, closeCart  } = useCart()

  const {
    selectedProducts,
    totalPrice
  } = useProducts();
  // if (selectedProducts.length === 0) closeCart()
  if (!isCartOpen) return null;

  return (

    <aside
      className="
        fixed
        right-0
        top-0
        h-full
        md:w-100
        w-screen
        bg-surface
        flex
        flex-col
        shadow-xl
        z-11
      "
    >
      <CartHeader onCartToggle={toggleCart} />
      <CartItems items={selectedProducts} />
      <CartFooter totalPrice={totalPrice} selectedProducts={selectedProducts}/>
    </aside>

  );
}
