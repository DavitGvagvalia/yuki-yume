import React from 'react'
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

function Menu({ items = [],ChooseItem }) {


  const handleChoosing = (chosen) => {
    ChooseItem(prev => [...prev, chosen]);
  };

  return (
    <div className='h-screen bg-gray-800 text-yellow-300 flex flex-col py-30 px-6' id="Menu">
      <div className=' h-[20%]  flex flex-col justify-center items-center'>
        <h2>Menu Section</h2>
        <p>some text</p>
      </div>
      <div className='md:flex-row flex-col gap-8 mt-8 overflow-scroll max-h-[80%]'>
        {items.map((item, index) => (
          <div key={index} className='min-h-100 min-w-[300px] text-left px-1 py-1' >
            <div className=' bg-gray-100'>
            <img src="https://picsum.photos/200" alt={item.name} />
            <div className='flex justify-between'>
            <div><p>{item.category}</p>
            <h3>{item.name}</h3>
            <p>{item.price}</p>
            </div>
            <button type="submit" onClick={() => handleChoosing(item)} className='bg-gold-500 text-(--china-red) rounded-md px-4 py-2'>
              <ShoppingCartIcon className="w-5 h-5 mx-4 shopping-cart"/>
            </button>
            </div>
          </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Menu