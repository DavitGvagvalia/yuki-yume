import { createContext, useContext, useState } from "react";
import { createCustomContext } from "../utils/createContext";
const DetailContext = createContext(null);

const DetailProvider = ({ children }) => {
  const [isDetailOpen, setDetailOpen] = useState(false);

  const toggleDetail = () => setDetailOpen((prev) => !prev);
  const openDetail = () => setDetailOpen(true);
  const closeDetail = () => setDetailOpen(false);

  return (
    <DetailContext.Provider
      value={{ isDetailOpen, toggleDetail, openDetail, closeDetail }}
    >
      {children}
    </DetailContext.Provider>
  );
};
const useDetail = () => createCustomContext(DetailContext);

export { DetailProvider, useDetail };