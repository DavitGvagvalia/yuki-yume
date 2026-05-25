import React from 'react'
import { useState } from 'react'
const CheckoutCustomerDetails = () => {
  const [telephone, setTelephone] = useState('+995')
  const [email, setEmail] = useState('')

  const handleChange = (e,setter) => {
    setter(e.target.value)
  }
  return (
    <div className='flex flex-col'>
      <h2>lets us contact you</h2>
      <label htmlFor="tel">Mobile</label>
      <input type="tel"  name="tel" pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}" value={telephone} onChange={(e) => handleChange(e,setTelephone)} />
      <label htmlFor="email">Email</label>
      <input type="email" name="email" value={email} onChange={(e) => handleChange(e,setEmail)} />
    </div>
  )
}

export default CheckoutCustomerDetails