import React from 'react'

const CheckoutPayment = () => {
  return (
    <div className="flex flex-col gap-3">
        <datalist id="payment-methods">
            <option value="PayPal" />
            <option value="Credit Card" />
            <option value="Apple Pay" />
            <option value="Google Pay" />
            <option value="Bitcoin" />
            <option value="Cash" />
            <option value="Other" />
            <option value="None" />
        </datalist>
        <input type="text" list="payment-methods" placeholder="Payment Method" />
        <input type="text" placeholder="Card Number" />
        <input type="text" placeholder="Expiration Date" />


            <input type="text" placeholder="CVV" />
    </div>
  )
}

export default CheckoutPayment