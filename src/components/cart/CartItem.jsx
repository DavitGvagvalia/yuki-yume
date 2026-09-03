import {TrashIcon } from "@heroicons/react/24/outline";
import {Quantifier} from "../ui/quantifier";
import { useSelection } from "../../hooks/useSelection";
import { getProductPriceInfo } from "../../services/product.service";
import SectionUI from "../ui/SectionUI";
export default function CartItem({ item }) {
  const {getQuantity,increaseQuantity,decreaseQuantity,removeProduct} = useSelection()
  const priceInfo = getProductPriceInfo(item);
  
  return (
    <SectionUI>
    <div className="flex  items-center gap-4 py-3">
      <img
        src={item.imageUrl}
        alt={item.name}
        className="aspect-square w-16 rounded-md object-cover"
      />

      <div className="flex-1">
        <h4 className="text-text font-medium max-h-10 truncate overflow-hidden max-w-15">{item.name}</h4>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <p className="font-semibold text-text">{priceInfo.currentPriceLabel} GEL</p>
          {priceInfo.hasPromotion && (
            <>
              <p className="text-muted line-through">{priceInfo.basePriceLabel} GEL</p>
              <span className="text-success">-{priceInfo.promotion}%</span>
            </>
          )}
        </div>
      </div>

      <Quantifier
  value={getQuantity(item.id)}
  onIncrease={() => increaseQuantity(item.id)}
  onDecrease={() => decreaseQuantity(item.id)}
/>

      {/* Remove */}
      <button
        onClick={() => removeProduct(item.id)}
        className="
          mr-2
          text-muted
          hover:text-danger
          transition
        "
        aria-label="Remove item"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
    </SectionUI>
  );
}
