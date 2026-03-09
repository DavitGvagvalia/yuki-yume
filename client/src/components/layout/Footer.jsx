import React from 'react'
import {PhoneIcon,EnvelopeIcon} from '@heroicons/react/24/outline';
function Footer() {
  return (
    <footer className=' py-6 bg-surface text-muted text-left'>
      <div className='container mx-auto text-center font-primary'>
        <address>
          Contact us:
          <br />
          <a href='mailto:yukiyume@gmail.com'><EnvelopeIcon className="inline mr-2 w-4 h-4" />yukiyume@gmail.com</a>
          <br />
          <a href='tel:+995555328809'><PhoneIcon className="inline mr-2 w-4 h-4" />+995 555 32 88 09</a>
          
        </address>
        <p> {new Date().getFullYear()} © Yuki Yume all rights reserved</p>
      </div>
    </footer>
  )
}

export default Footer