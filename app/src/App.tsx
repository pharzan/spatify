import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, Linking } from "react-native";
import MapView, { PROVIDER_GOOGLE, type Region } from "react-native-maps";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useSpatisQuery, type SpatiLocation } from "./hooks/useSpatiQuery";
import { useAmenitiesQuery } from "./hooks/useAmenitiesQuery";
import { useMoodsQuery } from "./hooks/useMoodsQuery";
import { useUserLocation } from "./hooks/useUserLocation";
import { SearchBar } from "./components/UI/SearchBar";
import { SpatiMarker } from "./components/Map/SpatiMarker";
import { UserLocationButton } from "./components/Map/UserLocationButton";
import { SpatiCard } from "./components/UI/SpatiCard";
import { SplashScreen } from "./components/UI/SplashScreen";
import { GOOGLE_MAP_STYLE } from "./constants/mapStyle";

const queryClient = new QueryClient();

const INITIAL_REGION: Region = {
  latitude: 52.52,
  longitude: 13.405,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const SpatiMap = () => {
  const mapRef = useRef<MapView>(null);
  const {
    data: spatis = [],
    isLoading: spatisLoading,
    error: spatisError,
  } = useSpatisQuery();

  const {
    data: amenities = [],
    isLoading: amenitiesLoading,
    error: amenitiesError,
  } = useAmenitiesQuery();

  const {
    data: moods = [],
    isLoading: moodsLoading,
    error: moodsError,
  } = useMoodsQuery();

  const { location: userLocation, errorMsg: locationError } = useUserLocation();
  const insets = useSafeAreaInsets();
  const [selectedSpati, setSelectedSpati] = useState<SpatiLocation | null>(
    null
  );

  useEffect(() => {
    if (!userLocation) return;
    mapRef.current?.animateToRegion(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      500
    );
  }, [userLocation]);

  useEffect(() => {
    if (!selectedSpati) return;
    const match = spatis.find((spati) => spati.id === selectedSpati.id);
    if (!match) {
      setSelectedSpati(null);
    }
  }, [spatis, selectedSpati]);

  const handleSelect = (spati: SpatiLocation) => {
    setSelectedSpati(spati);
    mapRef.current?.animateToRegion(
      {
        latitude: spati.latitude,
        longitude: spati.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      400
    );
  };

  const handleDirections = () => {
    if (!selectedSpati) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedSpati.latitude},${selectedSpati.longitude}`;
    Linking.openURL(url);
  };

  const handleCenterOnUser = () => {
    if (!userLocation) return;
    mapRef.current?.animateToRegion(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      500
    );
  };

  const isLoading = spatisLoading || amenitiesLoading || moodsLoading;
  const error = spatisError || amenitiesError || moodsError;

  const statusMessage = isLoading
    ? `Loading data...`
    : error
    ? `Error: ${error.message}`
    : locationError ?? null;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        customMapStyle={GOOGLE_MAP_STYLE}
        showsUserLocation
        showsPointsOfInterests={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        {spatis.map((spati) => (
          <SpatiMarker
            key={spati.id}
            spati={spati}
            onPress={() => handleSelect(spati)}
            isSelected={selectedSpati?.id === spati.id}
          />
        ))}
      </MapView>

      <View
        style={[
          styles.overlay,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 },
        ]}
        pointerEvents="box-none"
      >
        <SearchBar
          data={spatis}
          amenities={amenities}
          moods={moods}
          onSelect={handleSelect}
        />
        {statusMessage && (
          <View
            style={[
              styles.statusPill,
              (error || locationError) && styles.statusPillError,
            ]}
          >
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        )}
      </View>

      <UserLocationButton
        onPress={handleCenterOnUser}
        style={{
          position: "absolute",
          bottom: selectedSpati ? 400 : insets.bottom + 32,
          right: 16,
        }}
      />

      {selectedSpati && (
        <SpatiCard
          spati={selectedSpati}
          userLocation={userLocation}
          onClose={() => setSelectedSpati(null)}
          onDirections={handleDirections}
        />
      )}
    </View>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        {showSplash ? (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : (
          <SpatiMap />
        )}
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdfdfd",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    // Padding handled dynamically via insets
  },
  statusPill: {
    alignSelf: "center",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  statusPillError: {
    backgroundColor: "rgba(211, 47, 47, 0.9)",
  },
  statusText: {
    color: "white",
    fontSize: 13,
    fontWeight: "500",
  },
});
