import * as SecureStore from "expo-secure-store";
import jwtDecode from "jwt-decode";

const key = "authToken";

const storeToken = async (authToken) => {
  try {
    await SecureStore.setItemAsync(key, authToken);
  } catch (error) {
    console.error("Error storing the auth token:", error);
  }
};

const getToken = async () => {
  try {
    const token = await SecureStore.getItemAsync(key);
    return token;
  } catch (error) {
    console.error("Error getting the auth token:", error);
    return null;
  }
};

const getUser = async () => {
  try {
    const token = await getToken();
    return token ? jwtDecode(token) : null;
  } catch (error) {
    console.error("Error decoding the user token:", error);
    return null;
  }
};

const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error("Error removing the auth token:", error);
  }
};

export default {
  storeToken,
  getToken,
  getUser,
  removeToken,
};
