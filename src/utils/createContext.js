import {  useContext } from "react";


export const createCustomContext = (context) => {
  const ctx = useContext(context);

  if (!ctx) {
    throw new Error("useSelection must be used inside SelectionProvider");
  }

  return ctx;
}
