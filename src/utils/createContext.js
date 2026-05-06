import {  useContext } from "react";


export const createCustomContext = (context) => {
  const ctx = useContext(context);

  if (!ctx) {
    throw new Error("custom context must be used within a provider");
  }

  return ctx;
}
