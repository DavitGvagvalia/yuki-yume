import React from 'react'
import { PlusIcon } from "@heroicons/react/24/outline";

const AddToCartBUutton = ({product,onChoose}) => {
  return (
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
  )
}

export default AddToCartBUutton