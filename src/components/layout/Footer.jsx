import React from 'react'
import {PhoneIcon,EnvelopeIcon} from '@heroicons/react/24/outline';
import { useCheckout } from '../../hooks/useCheckout'
function Footer() {
  const { isCheckoutOpen } = useCheckout()
  return (
    !isCheckoutOpen && (
    <footer className='border-t border-border bg-panel py-6 text-left text-muted'>
      <div className='container mx-auto px-4 text-center font-primary'>
        <address className="not-italic">
          Contact us:
          <br />
          <a className="transition hover:text-text" href='mailto:yukiyume@gmail.com'><EnvelopeIcon className="inline mr-2 h-4 w-4" />yukiyume@gmail.com</a>
          <br />
          <a className="transition hover:text-text" href='tel:+995555328809'><PhoneIcon className="inline mr-2 h-4 w-4" />+995 555 32 88 09</a>
          
        </address>
        <p> {new Date().getFullYear()} © Yuki Yume all rights reserved</p>
      </div>
    </footer>
  )
)
}

export default Footer
