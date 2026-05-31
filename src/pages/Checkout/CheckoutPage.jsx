import React from 'react'
import Loader from '../../components/ui/Loader'
import { useSelection } from '../../hooks/useSelection'
import { useCart } from '../../hooks/useCart'
import { useDetail } from '../../hooks/useDetail'
import { useCheckout } from '../../hooks/useCheckout'
import CheckoutCustomerDetails from './CheckoutCustomerDetails'
import CheckoutAddress from './CheckoutAddress'
import CheckoutPayment from './CheckoutPayment'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router'


const CheckoutHeader = ({ closeCheckOut }) => {
    return (
        <div className="flex items-center justify-between p-4 border-b border-border h-1">
            <Link to="/menu" className="flex items-center gap-2 text-text hover:text-accent transition" onClick={closeCheckOut}>
            <XMarkIcon className="w-6 h-6" />
            <span>Back</span>
            </Link>
        </div>
    )
}


function CheckoutPage() {
  const { isCheckoutOpen, closeCheckout} = useCheckout()
    const { isCartOpen, closeCart } = useCart()
    const { isDetailOpen, closeDetail } = useDetail()
  const { selectedProducts,totalPrice} = useSelection()
  if (!isCheckoutOpen) return null
  return (
    isCheckoutOpen && <main className="min-h-screen h-full bg-background p-2 z-50 fixed top-0 left-0 w-full flex flex-col gap-2 overflow-y-scroll ">
        <CheckoutHeader closeCheckOut={closeCheckout}/>
        <CheckoutCustomerDetails />
        <CheckoutAddress />
        <CheckoutPayment />
        
    </main>
  )
}

export default CheckoutPage