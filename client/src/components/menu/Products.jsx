import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import React from "react";
import ProductModal from "./ProductModal.jsx";
const ProductCard = ({ product, onChoose }) => {
  const [Modal,setModal] = React.useState(false);
  const toggleModal = () => setModal(!Modal);
  return (
    <div className="bg-card rounded-md flex flex-col h-fit"
    onClick={toggleModal}>
      <img
        src="https://picsum.photos/1000"
        alt={product.name}
        className="w-full aspect-square object-cover"
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
          onClick={onChoose}
          className="bg-accent text-text rounded-md px-3 py-2 engage transition-transform z-10"
        >
          <ShoppingCartIcon className="w-5 h-5" />
        </button>
        </div>
        {Modal && <ProductModal item={product} isOpen={Modal} onClose={toggleModal}/>}
      </div>
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
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onChoose={() => onChoose(product)}
        />
      ))}
    </div>
  );
};
export default Products;