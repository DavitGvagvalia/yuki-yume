import { useEffect } from "react";

const requestedImageUrls = new Set();
const activePreloadImages = new Set();
const DEFAULT_CONCURRENCY = 8;

function getUniqueUrls(urls = []) {
  const uniqueUrls = [];
  const seenUrls = new Set();

  urls.forEach((url) => {
    const normalizedUrl = String(url || '').trim();

    if (!normalizedUrl || seenUrls.has(normalizedUrl)) {
      return;
    }

    seenUrls.add(normalizedUrl);
    uniqueUrls.push(normalizedUrl);
  });

  return uniqueUrls;
}

function preloadImage(url) {
  return new Promise((resolve) => {
    const image = new Image();

    activePreloadImages.add(image);
    image.decoding = 'async';
    image.onload = () => {
      activePreloadImages.delete(image);
      resolve();
    };
    image.onerror = () => {
      activePreloadImages.delete(image);
      resolve();
    };
    image.src = url;
  });
}

export function useImagePreloader({
  priorityUrls = [],
  backgroundUrls = [],
  concurrency = DEFAULT_CONCURRENCY
} = {}) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      return undefined;
    }

    const safeConcurrency = Math.max(1, Number(concurrency) || DEFAULT_CONCURRENCY);
    const preloadUrls = getUniqueUrls([...priorityUrls, ...backgroundUrls]).filter((url) => {
      if (requestedImageUrls.has(url)) {
        return false;
      }

      requestedImageUrls.add(url);
      return true;
    });

    if (preloadUrls.length === 0) {
      return undefined;
    }

    let activeCount = 0;
    let currentIndex = 0;
    let cancelled = false;

    function runNextBatch() {
      if (cancelled || (currentIndex >= preloadUrls.length && activeCount === 0)) {
        return;
      }

      while (activeCount < safeConcurrency && currentIndex < preloadUrls.length) {
        const url = preloadUrls[currentIndex];

        currentIndex += 1;
        activeCount += 1;

        preloadImage(url).finally(() => {
          activeCount -= 1;
          runNextBatch();
        });
      }
    }

    runNextBatch();

    return () => {
      cancelled = true;
    };
  }, [priorityUrls, backgroundUrls, concurrency]);
}
