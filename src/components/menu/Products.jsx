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
  role="button"
  tabIndex={0}
  onClick={openDetail}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") openDetail();
  }}
  className="flex h-80 md:h-100 cursor-pointer flex-col overflow-hidden rounded-md border border-border bg-panel-elevated transition hover:border-accent hover:bg-control-hover"
>
  <div className="aspect-2/1 w-full overflow-hidden">
    <img
      src={product.imageUrl}
      alt={product.name}
      className="h-full w-full object-cover"
    />
  </div>

  <div className="flex flex-1 flex-col justify-between gap-4 p-4">
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {getProductCategoryLabel(product)}
      </p>

      <h4 className="line-clamp-2 text-lg font-bold text-text">
        {product.name}
      </h4>

      <p className="line-clamp-2 text-sm text-muted">
        {product.description}
      </p>
    </div>

    <div className="flex items-center justify-between">
      <p className="text-base font-bold text-text">
        {product.price}₾
      </p>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChoose();
        }}
        className="engage rounded-md bg-accent px-3 py-2 text-on-accent transition hover:bg-accent-hover active:scale-[1.03]"
      >
        <PlusIcon className="h-5 w-5" />
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
