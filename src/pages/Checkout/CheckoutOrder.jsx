import React from 'react'
import { useSelection } from '../../hooks/useSelection'
const CheckoutOrder = () => {
    const { selectedProducts,totalPrice} = useSelection()
  return (
    <div>
        {selectedProducts.map((item) => (
                    <div key={item.id}>
                        <h1>{item.name}</h1>
                        <p>Price: {item.price} GEL</p>
                    </div>
                ))
                }



    </div>

  )
}

export default CheckoutOrder