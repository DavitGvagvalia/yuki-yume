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
      <div className="fixed bottom-3 flex justify-center w-full md:z-50 z-[7]">
        <div className="bg-background flex justify-between items-center p-2 rounded-4xl md:w-[40%] w-[90%] mb-5 px-7 border border-border">
          <h1 key={totalPrice} className="text-lg font-bold text-text animate-pop">
            {totalPrice} GEL
          </h1>
          <button
            onClick={toggleCart}
            className="flex justify-center items-center gap-2 bg-accent-muted text-white rounded-3xl py-2 px-5 active:scale-103"
          >
            <span>Your cart</span>
          </button>


        </div>
      </div>
    )
  );
};