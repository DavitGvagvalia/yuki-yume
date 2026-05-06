import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Detail from "../productDetails/Detail.jsx";
const ProductCard = ({ product, onChoose }) => {
  const [isDetailOpen, setDetailOpen] = useState(false);
  const openDetail = () => setDetailOpen(true);
  const closeDetail = () => setDetailOpen(false);
  const toggleDetail = () => setDetailOpen(prev => !prev);
  return (
    <div className="bg-card rounded-md flex flex-col h-max" onClick={toggleDetail}>
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-full object-cover"
      />

      <div className="p-4 flex flex-col md:flex-row justify-between h-full">

        <div className="flex flex-col gap-1 flex-wrap overflow-y-auto">
          <p className="text-xs opacity-70">{product.category}</p>
          <h4 className="">{product.name}</h4>
          <p className="text-sm">${product.price}</p>
        </div>

        <div className="flex justify-end items-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChoose();
            }}
            className="bg-accent text-text rounded-md px-3 py-2 engage transition-transform z-2"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>

      </div>
      {isDetailOpen && <Detail item={product} closeDetail={closeDetail} />}
    </div>
  );
};
const Products = ({ products, onChoose }) => {

  return (
    <div className="
  grid grid-cols-2 gap-4 mt-8
  overflow-y-auto
  md:grid-cols-none
  md:grid-flow-col
  md:auto-cols-[40vw]
  md:overflow-x-auto
  md:overflow-y-hidden
">
      {products.map((product, key) => (
        <ProductCard
          key={key}
          product={product}
          onChoose={() => onChoose(product)}
        />
      ))}
    </div>
  );
};
export default Products;