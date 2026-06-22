import { ArrowLeftIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import CartItem from "./CartItem.jsx";
import { useSelection } from "../../hooks/useSelection.jsx";
import { useCart } from "../../hooks/useCart.jsx";
import { useCheckout } from "../../hooks/useCheckout.jsx";
import { Link } from "react-router";
import { useOrder } from "../../hooks/useOrders.jsx";
import { useLocation, useNavigate } from 'react-router'
import {useState, useEffect} from "react";

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

const CartFooter = ({ totalPrice,selectedProducts,toggleCart,clearSelection }) => {
  const navigate = useNavigate()
  const path = useLocation().pathname.split("/")
  const table = path[path.length - 1]
  const { createNewOrder } = useOrder();

  const [user,setUser] = useState(
    {
            id: crypto.randomUUID(),
            table: table,
            products: [],
            date: new Date().toISOString(),
            totalPrice: 0,
            status: "pending",
        }
  )
  

  useEffect(() => {
    setUser((currentUser) => ({
      ...currentUser,
      products: selectedProducts,
      totalPrice: Number(totalPrice),
    }))
  }, [selectedProducts, totalPrice])


  const handleOrder = async (e) => {
    e.preventDefault();
    const orderId = await createNewOrder(user);
    navigate(`/order/success`, {
      state: {
        order: {
          ...user,
          orderId,
        },
      },
    })
    toggleCart()
    clearSelection()
    

  }




  return (
    <div className=" py-5 border-t border-border flex justify-center">
      <div className=' w-[90%] bg-background flex  justify-between items-center p-2 rounded-4xl bottom-5 z-9 px-7 border border-border'>
      <h1 className=''>{totalPrice} GEL</h1>
      <button disabled={selectedProducts.length === 0 } onClick={handleOrder} className='flex justify-center items-center gap-2 bg-accent  text-white rounded-3xl py-2 px-5 active:scale-103 disabled:bg-border disabled:text-muted'>
         <span>place order</span>
      </button>
      </div>
    </div>
  );
};

export default function CartDrawer() {
  const { isCartOpen, toggleCart  } = useCart()
  const { selectedProducts,totalPrice, clearSelection} = useSelection();
  if (!isCartOpen) return null;

  return (

    <aside
      className="
        fixed
        right-0
        top-0
        h-full
        md:w-2/7
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
      <CartFooter totalPrice={totalPrice} selectedProducts={selectedProducts} toggleCart={toggleCart} clearSelection={clearSelection}/>
    </aside>

  );
}
