import { PlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Detail from "../productDetails/Detail.jsx";
import {
  getProductCategoryLabel,
  isProductVisible
} from "../../services/product.service.js";
function ProductCard({ product, openDetail, onChoose }) {
  return (
    <div
      className="flex  h-[500px] cursor-pointer flex-col overflow-hidden rounded-md border border-border bg-panel-elevated transition hover:border-accent hover:bg-control-hover"
      onClick={openDetail}
    >
      <div className="w-full flex justify-center items-center">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="aspect-2/1 h-full w-full object-cover"
        />
      </div>

      <div className="flex h-full flex-col justify-between gap-4 p-4 relative">
        <div className="flex flex-col gap-3 overflow-y-auto">
          <p className="text-xs font-semibold uppercase text-muted">{getProductCategoryLabel(product)}</p>
          <h4 className="text-lg font-bold text-text">{product.name}</h4>
          <div className="flex flex-wrap gap-1.5 text-sm">
            {product.ingredients.map((ingredient) => (
              <span
                key={ingredient}
                className="rounded-md border border-border bg-accent-soft px-2 py-1 text-xs text-text-secondary"
              >
                {ingredient}
              </span>
            ))}
          </div>
          <p className="text-sm font-semibold text-text">{product.price}₾</p>
        </div>

        <div className="flex justify-end items-end absolute bottom-5 right-5 z-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChoose();
            }}
            className="engage z-2 rounded-md bg-accent px-3 py-2 text-on-accent transition hover:bg-accent-hover active:scale-103"
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
  const visibleProducts = products.filter(isProductVisible);

  function openDetail(product) {
    if (!isProductVisible(product)) {
      return;
    }

    setSelectedProduct(product);
  }

  function closeDetail() {
    setSelectedProduct(null);
  }
  return (
    <div className="
    pt-45
  grid grid-cols-1 gap-4 p-6
  md:grid-cols-3
  overflow-y-auto
">
      {visibleProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          openDetail={() => openDetail(product)}
          onChoose={() => onChoose(product)}
        />
      ))}
    </div>
  );
};
export default Products;
