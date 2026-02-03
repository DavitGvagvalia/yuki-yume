import { PlusIcon, MinusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCart } from "../../hooks/useCart.jsx";
export default function CartItem({ item }) {
  const { increase, decrease, removeItem } = useCart();
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border">
      {/* Image */}
      <img
        src={item.image || "https://picsum.photos/200"}
        alt={item.name}
        className="w-16 h-16 rounded-md object-cover"
      />

      {/* Info */}
      <div className="flex-1">
        <h4 className="text-text font-medium">{item.name}</h4>
        <p className="text-sm text-muted">${item.price}</p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => decrease(item.id)}
          className="
            w-8 h-8
            flex items-center justify-center
            rounded-md
            bg-card
            hover:bg-surface
            transition
          "
        >
          <MinusIcon className="w-4 h-4 text-text" />
        </button>

        <span className="w-6 text-center text-text">
          {item.quantity}
        </span>

        <button
          onClick={() => increase(item.id)}
          className="
            w-8 h-8
            flex items-center justify-center
            rounded-md
            bg-card
            hover:bg-surface
            transition
          "
        >
          <PlusIcon className="w-4 h-4 text-text" />
        </button>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(item.id)}
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
