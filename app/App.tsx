import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Animated,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { useState, useEffect, useRef, useCallback } from "react";
import * as ExpoLocation from "expo-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  useSpatisQuery,
  type SpatiLocation,
} from "./spatis";

import Constants from "expo-constants";

const GOOGLE_MAPS_API_KEY =
  Constants.expoConfig?.extra?.googleMapsApiKey ??
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ??
  "";
const queryClient = new QueryClient();

const mapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#e8e8e8" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#4a4a4a" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#a0a0a0" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#d8d8d8" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#606060" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#d0d0d0" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#808080" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#5a5a5a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#c0c0c0" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3a3a3a" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7a7a7a" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{ color: "#d0d0d0" }],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#d8d8d8" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#b0b0b0" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#808080" }],
  },
];

function AnimatedLocationMarker() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.markerContainer}>
      <Animated.View
        style={[
          styles.pulseCircle,
          {
            transform: [{ scale: pulseAnim }],
            opacity: pulseAnim.interpolate({
              inputRange: [1, 1.5],
              outputRange: [0.5, 0],
            }),
          },
        ]}
      />
      <View style={styles.innerCircle} />
    </View>
  );
}

function MapIcon() {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.mapIconPin}>
        <View style={styles.mapIconDot} />
      </View>
    </View>
  );
}

function FilterIcon() {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.filterLine} />
      <View style={[styles.filterLine, { width: 16 }]} />
      <View style={styles.filterLine} />
    </View>
  );
}

function RatingStars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);

  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Text key={index} style={styles.starIcon}>
          {index < rounded ? "★" : "☆"}
        </Text>
      ))}
      <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
    </View>
  );
}

function SpatiMap() {
  const {
    data: spatiLocations = [],
    isLoading: isSpatiLoading,
    isError: isSpatiError,
    error: spatiError,
  } = useSpatisQuery();
  const [selectedLocation, setSelectedLocation] = useState<SpatiLocation | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // Force map to Berlin after component mounts
    const timer = setTimeout(() => {
      mapRef.current?.animateToRegion(
        {
          latitude: 52.52,
          longitude: 13.405,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        },
        1000
      );
    }, 1000); // Give it 1 second to load

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(coords);

      // Center map on user location
      mapRef.current?.animateToRegion(
        {
          ...coords,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        },
        1000
      );
    })();
  }, []);

  useEffect(() => {
    if (!selectedLocation) {
      return;
    }

    const updatedLocation = spatiLocations.find(
      (location) => location.id === selectedLocation.id
    );

    if (!updatedLocation) {
      setSelectedLocation(null);
      setShowRoute(false);
      return;
    }

    if (updatedLocation !== selectedLocation) {
      setSelectedLocation(updatedLocation);
    }
  }, [spatiLocations, selectedLocation]);

  const filteredLocations = spatiLocations.filter((location) => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    return (
      location.name.toLowerCase().includes(query) ||
      location.description.toLowerCase().includes(query) ||
      location.address.toLowerCase().includes(query)
    );
  });

  const dataStatusMessage = isSpatiLoading
    ? "Loading nearby Spätis..."
    : isSpatiError
    ? spatiError?.message ?? "Failed to load Späti locations"
    : null;
  return (
    <View style={styles.container}>
      {/* Full screen map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 52.52,
          longitude: 13.405,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={false}
        customMapStyle={mapStyle}
      >
        {spatiLocations.map((location) => (
          <Marker
            key={location.id}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            onPress={() => {
              setSelectedLocation(location);
              setShowRoute(false);
              // Center with offset to avoid card covering marker
              mapRef.current?.animateToRegion(
                {
                  latitude: location.latitude - 0.015,
                  longitude: location.longitude,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                },
                500
              );
            }}
            pinColor="#4CAF50"
          />
        ))}

        {/* Current location marker */}
        {currentLocation && (
          <Marker coordinate={currentLocation} anchor={{ x: 0.5, y: 0.5 }}>
            <AnimatedLocationMarker />
          </Marker>
        )}

        {/* Route directions */}
        {currentLocation && selectedLocation && showRoute && (
          <MapViewDirections
            origin={{
              latitude: 52.5170,
              longitude: 13.3889,
            }}
            destination={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="#4CAF50"
            mode="DRIVING"
            onReady={(result) => {
              console.log('Route loaded successfully');
              console.log(`Distance: ${result.distance} km`);
              console.log(`Duration: ${result.duration} min`);
              setRouteError(null);
            }}
            onError={(errorMessage) => {
              console.log('Directions error:', errorMessage);
              setRouteError(errorMessage);
            }}
          />
        )}
      </MapView>

      {/* Error message */}
      {routeError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Route Error: {routeError}</Text>
        </View>
      )}

      {/* Search bar overlay */}
      <SafeAreaView style={styles.topOverlay}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#aaa"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.menuButton}>
              <Text style={styles.menuDots}>⋮</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {dataStatusMessage && (
          <View
            style={[
              styles.dataStatusContainer,
              isSpatiError && styles.dataStatusError,
            ]}
          >
            <Text
              style={[
                styles.dataStatusText,
                isSpatiError && styles.dataStatusErrorText,
              ]}
            >
              {dataStatusMessage}
            </Text>
          </View>
        )}
        {/* Search results */}
        {filteredLocations.length > 0 && (
          <ScrollView style={styles.searchResults}>
            {filteredLocations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={styles.resultItem}
                onPress={() => {
                  setSelectedLocation(location);
                  setSearchQuery("");
                  setShowRoute(false);
                  // Center with offset to avoid card covering marker
                  mapRef.current?.animateToRegion(
                    {
                      latitude: location.latitude - 0.015,
                      longitude: location.longitude,
                      latitudeDelta: 0.1,
                      longitudeDelta: 0.1,
                    },
                    500
                  );
                }}
              >
                <View style={styles.resultContent}>
                  <Text style={styles.resultName}>{location.name}</Text>
                  <Text style={styles.resultDescription}>
                    {location.description}
                  </Text>
                  <Text style={styles.resultAddress}>{location.address}</Text>
                </View>
                <View style={styles.resultRating}>
                  <Text style={styles.ratingText}>⭐ {location.rating}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Bottom card */}
      {selectedLocation && (
        <View style={styles.bottomCard}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setSelectedLocation(null);
              setShowRoute(false);
            }}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80",
              }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.textSection}>
            <Text style={styles.locationName}>{selectedLocation.name}</Text>
            <Text style={styles.locationDescription}>
              {selectedLocation.description}
            </Text>
            <Text style={styles.locationAddress}>{selectedLocation.address}</Text>
            <Text style={styles.locationMeta}>
              {selectedLocation.type} • {selectedLocation.hours}
            </Text>
            <RatingStars rating={selectedLocation.rating} />

            <TouchableOpacity
              style={styles.directionsButton}
              onPress={() => {
                if (!currentLocation) {
                  setRouteError("Current location not available");
                } else {
                  setShowRoute(true);
                  setRouteError(null);
                }
              }}
            >
              <Text style={styles.directionsText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom toolbar */}
      <View style={styles.bottomToolbar}>
        <TouchableOpacity style={styles.toolbarButton}>
          <MapIcon />
          <Text style={styles.toolbarLabel}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton}>
          <FilterIcon />
          <Text style={styles.toolbarLabel}>Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    backgroundColor: "#f5f5f5",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  errorContainer: {
    position: "absolute",
    top: 150,
    left: 20,
    right: 20,
    backgroundColor: "#ff5252",
    padding: 12,
    borderRadius: 8,
    zIndex: 100,
  },
  errorText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 10,
    color: "#666",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  menuButton: {
    padding: 4,
  },
  menuDots: {
    fontSize: 24,
    color: "#666",
    fontWeight: "bold",
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  profileIcon: {
    fontSize: 24,
  },
  dataStatusContainer: {
    marginHorizontal: 24,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "white",
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataStatusText: {
    fontSize: 12,
    color: "#666",
  },
  dataStatusError: {
    backgroundColor: "#ffe5e5",
  },
  dataStatusErrorText: {
    color: "#d32f2f",
  },
  logButton: {
    alignSelf: "flex-start",
    marginHorizontal: 24,
    marginTop: 8,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  logButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  bottomCard: {
    position: "absolute",
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  closeText: {
    fontSize: 20,
    color: "#333",
    fontWeight: "600",
  },
  imageContainer: {
    width: "100%",
    height: 220,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  textSection: {
    padding: 32,
    alignItems: "center",
  },
  locationName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
  },
  locationDescription: {
    marginTop: 8,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  locationAddress: {
    marginTop: 8,
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
  locationMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "#4CAF50",
    textTransform: "capitalize",
  },
  starsRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 6,
    alignItems: "center",
  },
  starIcon: {
    fontSize: 20,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  directionsButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  directionsText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  searchResults: {
    marginTop: 8,
    marginHorizontal: 24,
    backgroundColor: "white",
    borderRadius: 16,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  resultItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  resultAddress: {
    fontSize: 12,
    color: "#999",
  },
  resultRating: {
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  markerContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseCircle: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
  },
  innerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomToolbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "white",
    paddingBottom: 34,
    paddingTop: 12,
    paddingHorizontal: 20,
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  toolbarButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  toolbarLabel: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
    marginTop: 6,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  mapIconPin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  mapIconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#333",
  },
  filterLine: {
    width: 20,
    height: 2,
    backgroundColor: "#333",
    marginVertical: 2,
    borderRadius: 1,
  },
});
