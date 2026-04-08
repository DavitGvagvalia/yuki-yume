import { createContext,  useEffect, useState } from "react";
import { apiGet } from "../utils/api";
import { createCustomContext } from "../utils/createContext";

const ReviewsContext = createContext(null);

const ReviewsProvider = ({ children }) => {
  
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    async function fetchReviews() {
        const stored = localStorage.getItem("reviews");
        if (stored) {
          setReviews(JSON.parse(stored));
          return;
        }   
        const data = await apiGet('/api/products');
        setReviews(data);
    }
    fetchReviews();
    
  }, []);
  const value = { reviews, setReviews };

  return (
    <ReviewsContext.Provider value={value}>
      {children}
    </ReviewsContext.Provider>
  );
}

const useReviews = () =>createCustomContext(ReviewsContext);

export { ReviewsProvider, useReviews };