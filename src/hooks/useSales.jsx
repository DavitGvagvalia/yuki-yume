import { createContext, useContext, useState } from "react";
import { createCustomContext } from "../utils/createContext";
const SalesContext = createContext(null);

const SalesProvider = ({ children }) => {

    const [onSale,setOnSale] = useState([]);


    const getOnSale = (products) => {
        const onSaleProducts = products.filter(product => product.onSale);
        setOnSale(onSaleProducts);
    }


    const value = { onSale, setOnSale, getOnSale };



  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
}

const useSales = () => createCustomContext(SalesContext);

export { SalesProvider, useSales };