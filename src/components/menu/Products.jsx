import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Detail from "../productDetails/Detail.jsx";
function ProductCard({ product, openDetail, onChoose }) {
  return (
    <div
      className="bg-card rounded-md flex flex-col h-max"
      onClick={openDetail}
    >
      <div className="w-full aspect-square flex justify-center items-center">
      <img
        src={product.imageUrl}
        alt={product.name}
        className=" rounded-md object-cover w-full h-full"
      />
      </div>

      <div className="p-4 flex flex-col md:flex-row justify-between h-full">
        <div className="flex flex-col gap-1 flex-wrap overflow-y-auto">
          <p className="text-xs opacity-70">{product.category}</p>
          <h4>{product.name}</h4>
          <p className="text-sm">{product.price}₾</p>
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
    </div>
  );
}
const Products = ({ products, onChoose }) => {

  const [selectedProduct, setSelectedProduct] = useState(null);

  function openDetail(product) {
    setSelectedProduct(product);
  }

  function closeDetail() {
    setSelectedProduct(null);
  }
  return (
    <div className="
    pb-4
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
          openDetail={() => openDetail(product)}
          onChoose={() => onChoose(product)}
        />
      ))}

      {selectedProduct && (
        <>
          <Detail
            item={selectedProduct}
            closeDetail={closeDetail}
          />
        </>
      )}
    </div>
  );
};
export default Products;