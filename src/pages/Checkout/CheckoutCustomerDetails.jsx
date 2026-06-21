import React, { useState } from 'react'
import { PhoneIcon, UserIcon } from '@heroicons/react/24/outline'
import IntlTelInput from '@intl-tel-input/react'
import 'intl-tel-input/styles'

const CheckoutCustomerDetails = ({user,setUser}) => {
  const [telephone, setTelephone] = useState('')

  return (
    <div className="flex flex-col gap-3">
      <h2>plaese provide contact info</h2>

      <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-3xl ">
        <UserIcon className="w-5 h-5" />

        <input
          type="text"
          placeholder="John Doe"
          aria-label="Enter your full name"
          className="focus:outline-none"
          value={user.name}
          onChange={(e) => setUser((currentUser) => ({...currentUser, name: e.target.value}))}
        />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-3xl">
        <PhoneIcon className="w-5 h-5" />

        <IntlTelInput
          initialCountry="ge"
          loadUtils={() => import('intl-tel-input/utils')}
          onChangeNumber={setTelephone}
          inputProps={{
            type: 'tel',
            placeholder: 'XXX-XXX-XXXX',
            className:
              ' focus:outline-none',
          }}
        />
      </div>

 
    </div>
  )
}

export default CheckoutCustomerDetails
