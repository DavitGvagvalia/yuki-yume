import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

import Detail from "../productDetails/Detail.jsx";
import { useDetail } from "../../hooks/useDetail";
import { useCategories } from "../../hooks/useCategories.jsx";
import {
  getProductCategoryLabel,
  isProductVisible,
} from "../../services/product.service.js";

function ProductCard({ product, categories, onOpenDetail, onChoose }) {
  const ingredients = Array.isArray(product.ingredients) ? product.ingredients : [];

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenDetail();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpenDetail}
      onKeyDown={handleKeyDown}
      className="flex h-80 cursor-pointer flex-col overflow-hidden rounded-md border border-border bg-panel-elevated transition hover:border-accent hover:bg-control-hover md:h-[25rem]"
    >
      <div className="aspect-2/1 w-full overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {getProductCategoryLabel(product, categories)}
          </p>

          <h4 className="line-clamp-2 text-lg font-bold text-text">
            {product.name}
          </h4>

          {ingredients.length > 0 && (
            <p className="line-clamp-2 text-sm text-muted">
              {ingredients.join(", ")}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-base font-bold text-text">{product.price}₾</p>

          <button
            type="button"
            aria-label={`Add ${product.name}`}
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

const Products = ({ products = [], onChoose }) => {
  const {
    isDetailOpen,
    openDetail: openDetailModal,
    closeDetail: closeDetailModal,
  } = useDetail();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const { categories } = useCategories();

  const visibleProducts = products.filter(isProductVisible);

  function handleOpenDetail(product) {
    if (!isProductVisible(product)) return;

    setSelectedProduct(product);
    openDetailModal();
  }

  function handleCloseDetail() {
    setSelectedProduct(null);
    closeDetailModal();
  }

  function handleChoose(product) {
    onChoose?.(product);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 overflow-y-auto p-6 pt-45 md:grid-cols-3">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            categories={categories}
            onOpenDetail={() => handleOpenDetail(product)}
            onChoose={() => handleChoose(product)}
          />
        ))}
      </div>

      {isDetailOpen && selectedProduct && (
        <Detail
          item={selectedProduct}
          categories={categories}
          closeDetail={handleCloseDetail}
        />
      )}
    </>
  );
};

export default Products;
