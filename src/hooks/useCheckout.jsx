import { createContext, useCallback, useState } from "react";
import { createCustomContext } from "../utils/createContext";
const CheckoutContext = createContext(null);

const CheckoutProvider = ({ children }) => {
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  
  //Checkout controls
  const toggleCheckout = useCallback(() => setCheckoutOpen((prev) => !prev), []);
  const openCheckout = useCallback(() => setCheckoutOpen(true), []);
  const closeCheckout = useCallback(() => setCheckoutOpen(false), []);


  return (
    <CheckoutContext.Provider
      value={{ isCheckoutOpen, toggleCheckout, openCheckout, closeCheckout }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

 const useCheckout = () => createCustomContext(CheckoutContext);

export { CheckoutProvider, useCheckout };
