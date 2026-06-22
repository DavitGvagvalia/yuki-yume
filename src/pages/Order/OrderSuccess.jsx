import React from 'react'

const OrderSuccess = () => {
    const waitTime = 10
  return (
    <div>
        <h1>Order Success</h1>
        <p>Thank you for your order!</p>
        <p>your order will be ready in {waitTime} minutes</p>

    </div>
  )
}

export default OrderSuccess