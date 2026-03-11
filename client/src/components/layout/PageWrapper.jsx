import React from 'react'
import { useCart } from '../../hooks/useCart';
function PageWrapper({ children }) {
  const {isCartOpen} = useCart()
  return (

    <div 
      className = {`
        min-h-screen
        bg-background
        text-text
        flex
        flex-col
        overflow-x-hidden
        md:overflow-y-scroll
        md:max-h-[100%]
        ${isCartOpen ? "overflow-y-clip" : ''}
        ${isCartOpen ? "max-h-screen" : ''}
        `}
      >
      {children}
    </div>
  );
}

export default PageWrapper;