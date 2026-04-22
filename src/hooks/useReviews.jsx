import { createContext, useEffect, useState } from "react";
import { createCustomContext } from "../utils/createContext";
import { getReviews } from "../services/reviews.service";
import { fetcherHandler } from "../utils/StorageHandler";
const ReviewsContext = createContext(null);

const ReviewsProvider = ({ children }) => {

  const [reviews, setReviews] = useState([]);

  useEffect(()=>{
    (async () => {
      const reviewData = await fetcherHandler("reviews", getReviews);
      setReviews(reviewData);
    })()
  },[])


  const value = { reviews };

  return (
    <ReviewsContext.Provider value={value}>
      {children}
    </ReviewsContext.Provider>
  );
}

const useReviews = () => createCustomContext(ReviewsContext);

export { ReviewsProvider, useReviews };