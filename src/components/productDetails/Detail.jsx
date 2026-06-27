import React from 'react'
import { useProducts } from '../../hooks/useProducts'
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useDetail } from '../../hooks/useDetail';
import { useSelection } from '../../hooks/useSelection';
import {Quantifier} from "../ui/quantifier";
import { getProductCategoryLabel } from '../../services/product.service';




const DetailHeader = ({ product, closeDetail }) => {
  return (
    <div className="flex items-center justify-between border-b border-border bg-panel px-4 py-4">
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
    <div className='flex flex-col gap-4 p-4'>
      <img src={product.imageUrl} alt={product.name} className='max-h-[300px] w-full rounded-md border border-border object-cover' />
      <div className='flex flex-col gap-0.5'>
        <h3 className='text-xl font-bold'>
          {product.name}
          {product.spicy && <span className='text-danger'>🔥</span>}
          {product.vegetarian && <span className='text-success'>🌱</span>}
        </h3>
        <p className='text-sm text-muted'>{getProductCategoryLabel(product)}</p>
      </div>
      <div className="flex flex-wrap gap-1 text-sm">
        {product.ingredients.map((ingredient) => (
          <span
            key={ingredient}
            className="rounded-md border border-border bg-accent-soft px-2 py-1 text-sm text-text-secondary"
          >
            {ingredient}
          </span>
        ))}
      </div>
      <p className='text-lg font-semibold'>{product.price}₾</p>
    </div>
  )
}

const DetailFooter = ({ product }) => {
    const {getQuantity,increaseQuantity,decreaseQuantity,removeProduct,addProduct} = useSelection()
    let quantity = getQuantity(product.id)

  return (
    <div className='py-5 flex justify-center gap-4 items-center'>
       {!quantity ? <button className='flex items-center justify-center gap-2 rounded-3xl bg-accent px-5 py-2 text-sm font-semibold text-on-accent transition hover:bg-accent-hover active:scale-103 disabled:bg-border disabled:text-muted' onClick={() => addProduct(product)}>
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
        bg-panel
        flex
        flex-col
        border-l
        border-border
        shadow-2xl
        md:h-screen
        md:w-2/7
        z-[9]"
    >
      <DetailHeader product={item} closeDetail={closeDetail} />
      <DetailBody product={item} />
      <DetailFooter product={item} />
    </div>
  );
};

export default Detail
