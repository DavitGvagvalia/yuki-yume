import { ShoppingCartIcon } from "@heroicons/react/24/outline";

const ProductCard = ({ product, onChoose }) => {
  return (
    <div className="bg-black/20 rounded-md flex flex-col h-fit ">
      <img
        src="https://picsum.photos/1000"
        alt={product.name}
        className="w-full aspect-square object-cover"
      />

      <div className="p-4 flex flex-col md:flex-row justify-between h-full">

        <div className="flex flex-col gap-1 flex-wrap overflow-y-auto">
          <p className="text-xs opacity-70">{product.category}</p>
          <h4 className="">{product.name}</h4>
          <p className="text-sm">${product.price}</p>
        </div>

        <div className="flex justify-end items-end">
        <button
          type="button"
          onClick={onChoose}
          className="bg-yellow-300 text-[var(--china-red)] rounded-md px-3 py-2"
        >
          <ShoppingCartIcon className="w-5 h-5" />
        </button>
        </div>

      </div>
    </div>
  );
};
export default ProductCard;