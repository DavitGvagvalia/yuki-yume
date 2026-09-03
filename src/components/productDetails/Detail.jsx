import { XMarkIcon } from "@heroicons/react/24/outline";
import { useSelection } from '../../hooks/useSelection';
import { Quantifier } from "../ui/quantifier";
import { getProductCategoryLabel, getProductPriceInfo } from '../../services/product.service';
import { getProductDetailMetadata } from '../../config/productFields';
import AddToCartBUutton from "../ui/addToCartBUutton";
import SectionUI from "../ui/SectionUI";



const DetailHeader = ({ closeDetail }) => {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-panel px-4 py-4 backdrop-blur-xl">
      <button
        aria-label="Close detail"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-control text-muted transition hover:bg-control-hover hover:text-text"
        onClick={(e) => {
          e.stopPropagation();
          closeDetail();
        }}
      >
        <XMarkIcon className="h-5 w-5" />
      </button>

      <h2 className="min-w-0 truncate text-base font-bold text-text">
        Made with ❤️ by Yuki Yume
      </h2>
    </div>
  );
};



const DetailAction = ({ product }) => {
  const { getQuantity, increaseQuantity, decreaseQuantity, addProduct } = useSelection()
  let quantity = getQuantity(product.id)

  return (
    !quantity ?
      <AddToCartBUutton product={product} onChoose={() => addProduct(product)} />
      :
      <div className='flex justify-start'>
        <Quantifier
          value={quantity}
          onIncrease={() => increaseQuantity(product.id)}
          onDecrease={() => decreaseQuantity(product.id)}
        />
      </div>
  )
}

const DetailBody = ({ product, categories }) => {
  const ingredients = Array.isArray(product.ingredients) ? product.ingredients : [];
  const detailMetadata = getProductDetailMetadata(product);
  const priceInfo = getProductPriceInfo(product);

  return (
    <div className='flex flex-1 flex-col gap-4 overflow-y-auto p-4'>
      <div className="overflow-hidden rounded-md border border-border bg-panel-elevated backdrop-blur-xl">
        <img src={product.imageUrl} alt={product.name} className='max-h-80 w-full object-cover' />
      </div>


      <SectionUI>
        <div className='flex flex-col gap-0.5'>
          <h3 className='text-xl font-bold text-text'>
            {product.name}
            {product.spicy && <span className='text-danger'>🔥</span>}
            {product.vegetarian && <span className='text-success'>🌱</span>}
          </h3>
          <p className='text-sm text-muted'>{getProductCategoryLabel(product, categories)}</p>
        </div>
        </SectionUI>
        {ingredients.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1 text-sm leading-6 text-text-secondary">
            {ingredients.join(" | ")}
          </div>
        )}
      

      {detailMetadata.length > 0 && (
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
          {detailMetadata.map((item) => (
            <div key={item.key} className="rounded-md border border-border bg-control p-3 backdrop-blur-xl">
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted">{item.label}</span>
              <span className="font-semibold text-text">{item.value}</span>
            </div>
          ))}
        </div>
      )}
      <SectionUI>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col gap-2">
            <p className='text-xl font-bold text-text'>{priceInfo.currentPriceLabel}₾</p>
            {priceInfo.hasPromotion && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted line-through">{priceInfo.basePriceLabel}₾</p>
                <span className="rounded bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                  -{priceInfo.promotion}%
                </span>
              </div>
            )}
          </div>
          <DetailAction product={product} />
        </div>
      </SectionUI>
    </div>
  )
}

const Detail = ({ item, categories = [], closeDetail }) => {
  return (
    <div
      className="fixed
        left-0
        top-0
        h-full
        w-screen
        max-w-md
        bg-panel
        flex
        flex-col
        border-r
        border-border
        shadow-[0_28px_70px_rgb(15_27_51_/_0.28)]
        backdrop-blur-2xl
        md:h-screen
        md:w-104;
        z-110"
    >
      <DetailHeader closeDetail={closeDetail} />
      <DetailBody product={item} categories={categories} />
    </div>
  );
};

export default Detail
