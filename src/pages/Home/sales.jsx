import React from 'react'
import { useSales } from '../../hooks/useSales.jsx';
import { SalesProvider } from '../../hooks/useSales.jsx';
const SaleCard = ({ product }) => {
  return (
    <div className='min-w-[200px] bg-card rounded-md p-4 flex flex-col gap-2'>
      <img src={product.image} alt={product.name} className='w-full h-32 object-cover rounded-md' />
      <div className='font-semibold text-text'>{product.name}</div>
      <div className='text-sm text-muted line-through'>${product.price}</div>
      <div className='text-lg font-bold text-accent'>${(product.price * 0.8).toFixed(2)}</div>
    </div>
  )
}

const SalesList = () => {
    const {onSale} = useSales()


  return (
    <div className='flex overflow-x-auto gap-4 p-4'>
      {onSale.map((sale) => (
        <SaleCard key={product.id} product={product} />
      ))}

    </div>
  )
}


const Sales = () => {
  return (
    <SalesProvider>
      <section className='flex flex-col items-center text-center py-10 gap-6'>
        <SalesList />
      </section>
    </SalesProvider>
  )
}

export default Sales