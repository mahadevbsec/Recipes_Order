const getApiUrl = () => {
  // For production, use the deployed backend URL
  return "https://recipes-order.onrender.com";
};

export const API_BASE_URL = getApiUrl();

export const buildUrl = (path = "") => {
  if (!path) {
    return API_BASE_URL;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

