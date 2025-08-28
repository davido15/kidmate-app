import { useState, useEffect } from "react";
import * as Location from "expo-location";
import bugsnagLog from "../utility/bugsnag";

export default useLocation = () => {
  const [location, setLocation] = useState();

  const getLocation = async () => {
    try {
      const { granted } = await Location.requestPermissionsAsync();
      if (!granted) return;
      const {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync();
      setLocation({ latitude, longitude });
    } catch (error) {
      bugsnagLog.locationError("get_current_position", error);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return location;
};
