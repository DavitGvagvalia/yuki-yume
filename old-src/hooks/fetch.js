import { useEffect, useState } from "react";
import axios from 'axios'
export function useFetch(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        const res = await axios.get(url, { signal: controller.signal });
        setData(res.data);
      } catch (err) {
        if (!axios.isCancel(err)) setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}
