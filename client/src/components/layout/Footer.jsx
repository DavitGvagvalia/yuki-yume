import React from 'react'
import {} from '@heroicons/react/24/outline';
function Footer() {
  return (
    <footer className=' py-6 bg-surface text-muted text-left'>
      <div className='container mx-auto text-center font-primary'>
        <p> {new Date().getFullYear()} © Yuki Yume all rights reserved</p>
      </div>
    </footer>
  )
}

export default Footer