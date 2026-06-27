import {TrashIcon } from "@heroicons/react/24/outline";
import {Quantifier} from "../ui/quantifier";
import { useSelection } from "../../hooks/useSelection";
export default function CartItem({ item }) {
  const {getQuantity,increaseQuantity,decreaseQuantity,removeProduct} = useSelection()
  
  return (
    <div className="flex h-36 items-center gap-4 border-b border-border py-3">
      <img
        src={item.imageUrl}
        alt={item.name}
        className="aspect-square w-16 rounded-md object-cover"
      />

      <div className="flex-1">
        <h4 className="text-text font-medium">{item.name}</h4>
        <p className="text-sm text-muted">{item.price} GEL</p>
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
          ml-2
          text-muted
          hover:text-danger
          transition
        "
        aria-label="Remove item"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
