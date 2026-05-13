import React from 'react'
import Loader from '../../components/ui/Loader'
import { useSelection } from '../../hooks/useSelection'
import { useCart } from '../../hooks/useCart'
import CheckoutOrder from './CheckoutOrder'
import CheckoutCustomerDetails from './CheckoutCustomerDetails'
import CheckoutAddress from './CheckoutAddress'
import CheckoutPayment from './CheckoutPayment'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router'


const CheckoutHeader = () => {
    return (
        <div>
            <Link to="/menu" className="flex items-center gap-2 text-text hover:text-accent transition">
            <XMarkIcon className="w-6 h-6" />
            </Link>
        </div>
    )
}


function CheckoutPage() {
    const {}
  const { selectedProducts,totalPrice} = useSelection()
  if (isCartOpen) closeCart()
  return (
    <main className="min-h-screen bg-background pt-20 px-2 z-50">
        <CheckoutHeader />
        <CheckoutOrder />
        <CheckoutCustomerDetails />
        <CheckoutAddress />
        <CheckoutPayment />
        
    </main>
  )
}

export default CheckoutPage