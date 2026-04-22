

export const fetcherHandler = async (key, fetcher) => {
  const TEN_MINUTES = 10 * 60 * 1000;
  const now = Date.now();
  const expirationTime = now + TEN_MINUTES;

  try {
    const savedData = localStorage.getItem(key);
    const cacheTime = localStorage.getItem(`${key}_time`);

    if (savedData && cacheTime && cacheTime > now) {
      try {
        return JSON.parse(savedData);
      } catch (parseError) {
        console.warn("Cache parse failed, clearing corrupted cache:", key);
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_time`);
      }
    }

    // ✅ Fetch fresh data
    console.log("Fetching fresh data for:", key);
    const fetchedData = await fetcher();

    try {
      localStorage.setItem(key, JSON.stringify(fetchedData));
      localStorage.setItem(`${key}_time`, expirationTime.toString());
    } catch (storageError) {
      console.warn("Failed to save to localStorage:", storageError);
    }

    return fetchedData;
  } catch (error) {
    console.error("storageHandler error:", error);
    throw error;
  }
};