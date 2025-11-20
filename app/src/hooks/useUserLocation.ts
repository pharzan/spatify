import { useState, useEffect, useCallback } from "react";
import * as ExpoLocation from "expo-location";

type Coordinates = { latitude: number; longitude: number };

export const useUserLocation = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      setHasPermission(false);
      setIsLoading(false);
      return null;
    }

    setHasPermission(true);

    const currentPosition = await ExpoLocation.getCurrentPositionAsync({});
    const coords = {
      latitude: currentPosition.coords.latitude,
      longitude: currentPosition.coords.longitude,
    };
    setLocation(coords);
    setIsLoading(false);
    return coords;
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    location,
    errorMsg,
    hasPermission,
    isLoading,
    refresh: requestLocation,
  };
};
