import React from 'react'
import { useProducts } from '../../hooks/useProducts'
const Detail = ({item}) => {
  return (
    <div className='h-screen w-screen bg-black absolute inset-0'>
        <div>{item.name}</div>
        <div>item desctiption</div>
        <div>options</div>
        <div>footer
            <button>add to cart</button>
        </div>
    </div>
  )
}

export default Detail