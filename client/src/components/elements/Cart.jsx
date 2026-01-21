import React, { useEffect } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'
function Cart({ HandleToggleCart, Toggle, ChosenProducts, setChosenProducts }) {

    const handleDelete = (index) => {
        setChosenProducts(prev => prev.filter((_, i) => i !== index));

    };

    useEffect(() => {
    if (Toggle) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [Toggle]);

  if (!Toggle) return null;


    return (
        Toggle &&
        <div className='fixed inset-0 w-screen h-screen bg-black/40 backdrop-blur-md shadow-lg z-50 flex flex-col items-center overflow-hidden'>
            <div className='flex flex-col gap-6 max-h-screen z-52  overflow-scroll py-30 h-[90%]'>
                {ChosenProducts.map((item, index) => (
                    <div key={index} className=' bg-gray-300/40 flex ' >
                        <img src={item.image} alt={item.name} className='aspect-square w-[100px] rounded-md object-cover' />
                        <div className='text-white text-2xl'>{item.name}</div>
                        <div className='text-white text-xl'>${item.price}</div>
                        <button onClick={() => handleDelete(index)} className='bg-red-500 text-white rounded-md px-4 py-2'>
                            <TrashIcon className='w-5 h-5' />
                        </button>
                    </div>
                ))}
            </div>
            <div className=' flex flex-col items-center justify-center w-full bg-black/70 py-4'>
                <p className='text-yellow-500'>total: ${ChosenProducts.reduce((acc, item) => acc + item.price, 0)}</p>
                <button className='bg-(--china-red) text-yellow-400 py-3 px-5 border-black border-3 rounded-4xl'>order</button>

            </div>
        </div>)

}

export default Cart