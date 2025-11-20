import { useEffect, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import MapView, { PROVIDER_GOOGLE, type Region } from "react-native-maps";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  useSpatisQuery,
  type SpatiLocation,
} from "./hooks/useSpatiQuery";
import { useUserLocation } from "./hooks/useUserLocation";
import { SearchBar } from "./components/UI/SearchBar";
import { SpatiMarker } from "./components/Map/SpatiMarker";
import { SpatiCard } from "./components/UI/SpatiCard";
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
  const { data: spatis = [], isLoading, error } = useSpatisQuery();
  const {
    location: userLocation,
    errorMsg: locationError,
  } = useUserLocation();
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

  const statusMessage = isLoading
    ? "Loading nearby Spätis..."
    : error
    ? error.message
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
        showsPointsOfInterest={false}
        showsMyLocationButton={false}
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

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <SearchBar data={spatis} onSelect={handleSelect} />
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
      </SafeAreaView>

      {selectedSpati && (
        <SpatiCard
          spati={selectedSpati}
          userLocation={userLocation}
          onClose={() => setSelectedSpati(null)}
        />
      )}
    </View>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SpatiMap />
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
    paddingTop: 12,
    paddingBottom: 16,
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
