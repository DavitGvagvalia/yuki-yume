import React from 'react'
import { useProducts } from '../../hooks/useProducts'
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useDetail } from '../../hooks/useDetail';
import { useSelection } from '../../hooks/useSelection';
import {Quantifier} from "../ui/quantifier";




const DetailHeader = ({ product, closeDetail }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <button
        aria-label="Close detail"
        className="text-muted hover:text-text transition"
        onClick={(e) => {
          e.stopPropagation();
          closeDetail();
        }}
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      <h2 className="text-lg font-bold text-text flex gap-2 items-center">
        {product.name}
      </h2>
    </div>
  );
};



const DetailBody = ({ product }) => {
  return (
    <div className='p-4 flex flex-col gap-4'>
      <img src={product.imageUrl} alt={product.name} className='w-full object-cover rounded-md max-h-[300px]' />
      <div className='flex flex-col gap-0.5'>
        <h3 className='text-xl font-bold'>
          {product.name}
          {product.spicy && <span className='text-red-500'>🔥</span>}
          {product.vegetarian && <span className='text-green-500'>🌱</span>}
        </h3>
        <p className='text-sm text-muted'>{product.category}</p>
      </div>
      <p className='text-base text-muted'>{product.description}</p>
      <div className="flex flex-wrap gap-1 text-sm">
        {product.ingredients.map((ingredient) => (
          <span
            key={ingredient}
            className="text-sm bg-accent-muted rounded-md px-2 py-1"
          >
            {ingredient}
          </span>
        ))}
      </div>
      <p className='text-lg font-semibold'>${product.price}</p>
    </div>
  )
}

const DetailFooter = ({ product }) => {
    const {getQuantity,increaseQuantity,decreaseQuantity,removeProduct,addProduct} = useSelection()
    let quantity = getQuantity(product.id)

  return (
    <div className='py-5 flex justify-center gap-4 items-center'>
       {!quantity ? <button className='flex justify-center items-center gap-2 bg-accent  text-white rounded-3xl py-2 px-5 active:scale-103 disabled:bg-border disabled:text-muted' onClick={() => addProduct(product)}>
        <span >add to cart</span>
        </button>
        :
      <div className='scale-120'>
        <Quantifier
          value={quantity}
          onIncrease={() => increaseQuantity(product.id)}
          onDecrease={() => decreaseQuantity(product.id)}
        />
      </div>}
    </div>
  )
}

const Detail = ({ item, closeDetail }) => {
  return (
    <div
      className="fixed
        left-0
        top-0
        h-full
        overflow-x-auto
        w-screen
        bg-surface
        flex
        flex-col
        shadow-xl
        md:h-screen
        md:w-[30vw]
        z-[9]"
    >
      <DetailHeader product={item} closeDetail={closeDetail} />
      <DetailBody product={item} />
      <DetailFooter product={item} />
    </div>
  );
};

export default Detail