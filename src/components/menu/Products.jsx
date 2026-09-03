import { useState } from "react";

import Detail from "../productDetails/Detail.jsx";
import { useDetail } from "../../hooks/useDetail";
import { useCategories } from "../../hooks/useCategories.jsx";
import { useProducts } from "../../hooks/useProducts.jsx";
import {
  getProductPriceInfo,
  isProductVisible,
} from "../../services/product.service.js";
import AddToCartBUtton from "../ui/addToCartBUutton.jsx";

function normalizeSearchValue(value) {
  return String(value || '').trim().toLowerCase();
}

function getProductSearchText(product) {
  const ingredients = Array.isArray(product.ingredients)
    ? product.ingredients.join(' ')
    : product.ingredients;

  return normalizeSearchValue([
    product.name,
    ingredients
  ].filter(Boolean).join(' '));
}

function doesProductMatchSearch(product, query) {
  const searchTerms = normalizeSearchValue(query).split(/\s+/).filter(Boolean);

  if (searchTerms.length === 0) {
    return true;
  }

  const productSearchText = getProductSearchText(product);
  return searchTerms.every((term) => productSearchText.includes(term));
}

function ProductCard({ product, imagePriority = false, onOpenDetail, onChoose }) {
  const priceInfo = getProductPriceInfo(product);
  const description =  (product?.pieces > 1 ? product.pieces + " pieces" : "");

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
      className="flex cursor-pointer flex-col overflow-hidden rounded-md border border-white/75 bg-white/85 shadow-[0_18px_45px_rgb(23_36_63_/_0.18)] backdrop-blur-xl transition hover:border-white hover:bg-white/95 md:h-[25rem]"
    >
      <div className="aspect-1.5/1 h-30 w-full overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading={imagePriority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={imagePriority ? "high" : "auto"}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
        <div className="flex flex-col gap-2">


          <h4 className="line-clamp-2 text-sm font-bold text-text">
            {product.name}
          </h4>

          {description && (
            <p className="line-clamp-2 text-sm text-muted">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-bold text-text">{priceInfo.currentPriceLabel}₾</p>
            {priceInfo.hasPromotion && (
              <>
                <p className="text-sm text-muted line-through">{priceInfo.basePriceLabel}₾</p>
                <span className="rounded bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                  -{priceInfo.promotion}%
                </span>
              </>
            )}
          </div>

          <AddToCartBUtton product={product} onChoose={onChoose} />
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
  const { searchQuery, visibleProducts: allVisibleProducts } = useProducts();
  const normalizedSearchQuery = normalizeSearchValue(searchQuery);
  const productsToShow = normalizedSearchQuery ? allVisibleProducts : products;

  const visibleProducts = productsToShow
    .filter(isProductVisible)
    .filter((product) => doesProductMatchSearch(product, normalizedSearchQuery));

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
      <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-3">
        {visibleProducts.length === 0 && normalizedSearchQuery ? (
          <p className="col-span-2 rounded-md border border-border bg-panel-elevated px-4 py-8 text-center text-sm font-medium text-muted backdrop-blur-xl md:col-span-3">
            No products found
          </p>
        ) : visibleProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            imagePriority={index < 6}
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
