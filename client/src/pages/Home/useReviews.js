import { useEffect, useState } from "react";
import { apiGet } from "../../utils/api";

export function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await apiGet('/get/reviews');
        setReviews(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  return { reviews, loading, error };
}
