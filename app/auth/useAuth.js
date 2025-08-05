import { useContext } from "react";
import { jwtDecode } from "jwt-decode";
import AuthContext from "./context";
import authStorage from "./storage";

export default function useAuth() {
  const { user, setUser } = useContext(AuthContext);

  const logIn = async (authToken) => {
    try {
      const decodedUser = jwtDecode(authToken);
      setUser(decodedUser);
      await authStorage.storeToken(authToken); // Ensure async storage is awaited
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const logOut = async () => {
    setUser(null);
    await authStorage.removeToken(); // Ensure logout clears storage
  };

  return { user, logIn, logOut };
}
