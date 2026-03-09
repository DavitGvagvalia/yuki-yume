import { createContext, useContext, useState } from "react";

const DetailContext = createContext(null);

export const DetailProvider = ({ children }) => {
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

export const useDetail = () => {
  const context = useContext(DetailContext);

  if (!context) {
    throw new Error("useDetail must be used inside DetailProvider");
  }

  return context;
};