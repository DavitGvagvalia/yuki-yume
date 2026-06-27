import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "../../hooks/useCart";
import { useSelection } from "../../hooks/useSelection";
import { useCheckout } from "../../hooks/useCheckout";
import { useEffect, useState } from "react";

export const CartButton = () => {
  const { isCartOpen, toggleCart } = useCart();
  const { totalCount, totalPrice } = useSelection();
  const { isCheckoutOpen } = useCheckout();

  const [animateTotal, setAnimateTotal] = useState(false);

  useEffect(() => {
    if (totalCount === 0) return;

    setAnimateTotal(true);

    const timer = setTimeout(() => {
      setAnimateTotal(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [totalCount]);

  return (
    totalCount !== 0 &&
    !isCartOpen &&
    !isCheckoutOpen &&
     (
      <div className="fixed bottom-3 z-[7] flex w-full justify-center md:z-50">
        <div className="mb-5 flex w-[90%] items-center justify-between rounded-3xl border border-border bg-panel-elevated p-2 px-7 shadow-2xl backdrop-blur md:w-[40%]">
          <h1 key={totalPrice} className="text-lg font-bold text-text animate-pop">
            {totalPrice} GEL
          </h1>
          <button
            onClick={toggleCart}
            className="flex items-center justify-center gap-2 rounded-3xl bg-accent px-5 py-2 text-sm font-semibold text-on-accent transition hover:bg-accent-hover active:scale-103"
          >
            <span>Your cart</span>
          </button>


        </div>
      </div>
    )
  );
};
