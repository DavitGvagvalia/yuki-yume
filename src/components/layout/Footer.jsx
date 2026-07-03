import React from 'react'
import {PhoneIcon,EnvelopeIcon,MapPinIcon} from '@heroicons/react/24/outline';
import { useCheckout } from '../../hooks/useCheckout'
import instagramLogo from '../../assets/images/instagram_glyph_white.svg'
function Footer() {
  const { isCheckoutOpen } = useCheckout()
  return (
    !isCheckoutOpen && (
    <footer className='border-t border-border bg-panel py-6 text-left text-muted'>
      <div className='container mx-auto px-4 text-center font-primary'>
        <address className="not-italic">
          Contact us:
          <br />
          <a className="transition hover:text-text" href='mailto:yukiyume@gmail.com'><EnvelopeIcon className="inline mr-2 h-4 w-4 text-accent" />yukiyume707@gmail.com</a>
          <br />
          <a className="transition hover:text-text" href='tel:+995555328809'><PhoneIcon className="inline mr-2 h-4 w-4 text-accent" />+995 511 557 707</a>
          <br />
          <a className="transition hover:text-text text-muted" href='https://www.instagram.com/yukiyume.sushi_tbilisi/' target="_blank" rel="noopener noreferrer"><img src={instagramLogo} alt="Instagram" className="inline mr-2 h-4 w-4 text-accent" /> Instagram</a>
          <br />
          <a className="transition hover:text-text text-muted" href='https://maps.app.goo.gl/mre4bVB5AT6q3DpB9' target="_blank" rel="noopener noreferrer"><MapPinIcon className="inline mr-2 h-5 w-5 text-accent" /> Tkviavi 18</a>
        </address>
        <p> {new Date().getFullYear()} © Yuki Yume all rights reserved</p>
      </div>
    </footer>
  )
)
}

export default Footer
