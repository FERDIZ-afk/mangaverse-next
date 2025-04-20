// Local storage helpers for offline support
const CACHE_KEY_PREFIX = "mangaverse_cache_";

export function saveToLocalCache(key, data) {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      `${CACHE_KEY_PREFIX}${key}`,
      JSON.stringify(cacheData)
    );
    return true;
  } catch (err) {
    console.error("Failed to save to cache:", err);
    return false;
  }
}

export function getFromLocalCache(key, maxAge = 60 * 60 * 1000) {
  // Default max age: 1 hour
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    // Return null if cache is too old
    if (age > maxAge) return null;

    return data;
  } catch (err) {
    console.error("Failed to read from cache:", err);
    return null;
  }
}

// Progressive image loading with blur placeholder
export const shimmer = (w, h) => `
  <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="#2D3748" />
  </svg>
`;

export const toBase64 = (str) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

// Get color based on content type
export const getTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case "manga":
      return "bg-blue-600 text-white";
    case "manhwa":
      return "bg-purple-600 text-white";
    case "manhua":
      return "bg-orange-600 text-white";
    default:
      return "bg-gray-600 text-white";
  }
};

// Get color for rating
export const getColorForRating = (rating) => {
  const parsedRating = Number.parseFloat(rating);
  if (parsedRating >= 8) return "bg-green-500 text-white";
  if (parsedRating >= 7) return "bg-yellow-500 text-black";
  return "bg-red-500 text-white";
};
