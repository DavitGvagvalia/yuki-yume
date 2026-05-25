import { createContext, use, useContext, useState } from "react";
import { createCustomContext } from "../utils/createContext";
import { useLocation } from "react-router";
const CheckoutContext = createContext(null);

const CheckoutProvider = ({ children }) => {
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  
  //Checkout controls
  const toggleCheckout = () => setCheckoutOpen((prev) => !prev);
  const openCheckout = () => setCheckoutOpen(true);
  const closeCheckout = () => setCheckoutOpen(false);


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
