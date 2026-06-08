import React from 'react'

const CheckoutPayment = () => {
  return (
    <div className="flex flex-col gap-3">
        <datalist id="payment-methods">
            <option value="PayPal">PayPal</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Apple Pay">Apple Pay</option>
            <option value="Google Pay">Google Pay</option>
            <option value="Bitcoin">Bitcoin</option>
            <option value="Cash">Cash</option>
            <option value="Other">Other</option>
            <option value="None">None</option>
        </datalist>
        <input type="text" list="payment-methods" placeholder="Payment Method" aria-label="Select payment method" />
        <input type="text" placeholder="Card Number" aria-label="Enter card number" />
        <input type="text" placeholder="Expiration Date" aria-label="Enter card expiration date" />


            <input type="text" placeholder="CVV" aria-label="Enter card CVV" />
    </div>
  )
}

export default CheckoutPayment