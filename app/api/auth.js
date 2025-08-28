import apiClient from './client';

// A helper function to make POST requests using the centralized API client
const postRequest = async (url, body) => {
  return await apiClient.post(url, body);
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
