import React from 'react';

const CheckoutOrder = ({ selectedProducts }) => {
  return (
    <div>
      {selectedProducts.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 py-3 border-b border-border h-40"
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-16 h-16 rounded-md object-cover"
          />

          <div className="flex-1">
            <h4 className="text-text font-medium">{item.name}</h4>
            <p className="text-lg text-muted">${item.price} X {item.quantity}</p> 
          </div>
        </div>
      ))}
    </div>
  );
};

export default CheckoutOrder;