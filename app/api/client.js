import cache from "../utility/cache";
import authStorage from "../auth/storage";

// Add baseURL for all requests
const baseURL = "https://bdf1812b29eb.ngrok-free.app";

// Create a simple function for making GET requests
const get = async (url, params, config = {}) => {
  try {
    // Get the authentication token
    const authToken = await authStorage.getToken();
    const headers = {
      "Content-Type": "application/json",
      ...config.headers,
    };

    // If we have the token, add it to the headers
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    // Build the full URL with params
    const queryParams = new URLSearchParams(params).toString();
    const fullUrl = queryParams ? `${url}?${queryParams}` : url;

    // Make the HTTP GET request using fetch
    const response = await fetch(`${baseURL}${fullUrl}`, {
      method: "GET",
      headers,
      ...config,  // Optional: any other custom configuration
    });

    // Check if the response is successful
    if (response.ok) {
      const data = await response.json();
      // Cache the data if the request was successful
      cache.store(url, data);
      return { ok: true, data };
    }

    // If the response isn't successful, try to return cached data
    const cachedData = await cache.get(url);
    if (cachedData) {
      return { ok: true, data: cachedData };
    }

    return { ok: false, data: null };
  } catch (error) {
    console.error("Error making GET request:", error);
    return { ok: false, error: error.message };
  }
};

// Create a simple function for making POST requests
const post = async (url, body, config = {}) => {
  try {
    const authToken = await authStorage.getToken();
    const headers = {
      "Content-Type": "application/json",
      ...config.headers,
    };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    const response = await fetch(`${baseURL}${url}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      ...config,
    });
    const data = await response.json();
    if (response.ok) {
      return { ok: true, data };
    }
    return { ok: false, data: null };
  } catch (error) {
    console.error("Error making POST request:", error);
    return { ok: false, error: error.message };
  }
};

// Create a simple function for making PUT requests
const put = async (url, body, config = {}) => {
  try {
    const authToken = await authStorage.getToken();
    const headers = {
      "Content-Type": "application/json",
      ...config.headers,
    };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    const response = await fetch(`${baseURL}${url}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
      ...config,
    });
    const data = await response.json();
    if (response.ok) {
      return { ok: true, data };
    }
    return { ok: false, data: null };
  } catch (error) {
    console.error("Error making PUT request:", error);
    return { ok: false, error: error.message };
  }
};

// Export the custom API client with get, post, and put methods
const apiClient = {
  get,
  post,
  put,
};

export default apiClient;
