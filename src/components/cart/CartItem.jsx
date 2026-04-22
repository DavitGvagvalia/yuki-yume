import {TrashIcon } from "@heroicons/react/24/outline";
import Quantifier from "../ui/quantifier";
import { useSelection } from "../../hooks/useSelection";
export default function CartItem({ item }) {
  const {getQuantity,increaseQuantity,decreaseQuantity,removeProduct} = useSelection()
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border h-40">
      {/* Image */}
      <img
        src={item.imageUrl}
        alt={item.name}
        className="w-16 h-16 rounded-md object-cover"
      />

      {/* Info */}
      <div className="flex-1">
        <h4 className="text-text font-medium">{item.name}</h4>
        <p className="text-sm text-muted">${item.price}</p>
      </div>

      {/* Quantity controls */}
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
          hover:text-accent
          transition
        "
        aria-label="Remove item"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
