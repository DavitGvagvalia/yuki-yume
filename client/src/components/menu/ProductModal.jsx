import React from 'react'

function ProductModal({item, isOpen, onClose}) {
  if (!isOpen) return null;
  return (
    <div className="fixed  bg-opacity-50  z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-background ">Product Details</h2>
        <p>Here are the details of the selected product.</p>
        <p>Name: {item.name}</p>
        <p>Price: ${item.price}</p>
      </div>
    </div>
  )
}

export default ProductModal