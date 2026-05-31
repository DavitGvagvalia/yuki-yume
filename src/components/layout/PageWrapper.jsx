import React from 'react'
import { useCart } from '../../hooks/useCart';
import { useDetail } from '../../hooks/useDetail';
import { useCheckout } from '../../hooks/useCheckout';
function PageWrapper({ children }) {
  const {isCartOpen} = useCart()
  const {isDetailOpen} = useDetail()
  const {isCheckoutOpen} = useCheckout()
  return (

    <div 
      className = {`
        min-h-screen
        bg-background
        text-text
        flex
        flex-col
        ${(isCartOpen || isDetailOpen || isCheckoutOpen) ? "overflow-y-hidden" : ''}
        ${(isCartOpen || isDetailOpen || isCheckoutOpen) ? "max-h-screen" : ''}
        overflow-x-hidden
        md:overflow-y-auto
        md:max-h-full
        `}
      >
      {children}
    </div>
  );
}

export default PageWrapper;