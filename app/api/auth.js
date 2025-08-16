// API client setup without apisauce
const baseURL = "https://bdf1812b29eb.ngrok-free.app";

// A helper function to make POST requests
const postRequest = async (url, body) => {
  try {
    const response = await fetch(`${baseURL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
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

// Login function
const login = (email, password) => postRequest('/api/login', { email, password });

// Register function
const register = (email, password, phone, name) =>
  postRequest('/api/register', { email, password, phone, name });


// Export functions as an object
export default {
  login,
  register
 
};
