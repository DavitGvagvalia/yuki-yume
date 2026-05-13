import { createContext, use, useContext, useState } from "react";
import { createCustomContext } from "../utils/createContext";
import { useLocation } from "react-router";
const CheckoutContext = createContext(null);

const CheckoutProvider = ({ children }) => {
  const location = useLocation();
  let defaultValue = location.pathname === "/checkout";
  const [isCheckoutOpen, setCheckoutOpen] = useState(defaultValue);
  
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
