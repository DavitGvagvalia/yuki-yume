import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { useCart } from '../../hooks/useCart'
import { useSelection } from '../../hooks/useSelection'
export const CartButton = () => {
  const {  isCartOpen,toggleCart } = useCart()
  const {totalCount,totalPrice} = useSelection()
  
  return (
    totalCount !== 0 && !isCartOpen &&
    <div className='bg-background flex  justify-between items-center p-2 rounded-4xl  w-[90%] left-[5%] fixed bottom-0 mb-5 z-9 px-7 border border-border'>
      <h1 className=''>{totalPrice} GEL</h1>
      <button onClick={toggleCart} className='flex justify-center items-center gap-2 bg-accent-muted  text-white rounded-3xl py-2 px-5 active:scale-103'>
        <span>your cart</span>
      </button>
      </div>
  )

}
