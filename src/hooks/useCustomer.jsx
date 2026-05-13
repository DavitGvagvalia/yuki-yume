import { createContext, useContext, useState } from "react";
import { createCustomContext } from "../utils/createContext";
const CustomerContext = createContext(null);

const CustomerProvider = ({ children }) => {
  



  return (
    <CustomerContext.Provider
      value={{ isCustomerOpen, toggleCustomer, openCustomer, closeCustomer }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

 const useCustomer = () => createCustomContext(CustomerContext);

export { CustomerProvider, useCustomer };
