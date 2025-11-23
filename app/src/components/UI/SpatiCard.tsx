import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import type { SpatiLocation } from "../../hooks/useSpatiQuery";

type Coordinates = { latitude: number; longitude: number };

type Props = {
  spati: SpatiLocation;
  userLocation?: Coordinates | null;
  onClose: () => void;
  onDirections?: () => void;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80";

const getDistanceInKm = (
  from: Coordinates | null | undefined,
  to: SpatiLocation
) => {
  if (!from) return null;

  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);

  const fromLatRad = toRadians(from.latitude);
  const toLatRad = toRadians(to.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) *
      Math.sin(dLon / 2) *
      Math.cos(fromLatRad) *
      Math.cos(toLatRad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(earthRadiusKm * c * 10) / 10;
};

export const SpatiCard = ({
  spati,
  userLocation,
  onClose,
  onDirections,
}: Props) => {
  const distance = getDistanceInKm(userLocation, spati);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close details"
      >
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>

      <Image source={{ uri: spati.imageUrl ?? FALLBACK_IMAGE }} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{spati.name}</Text>
          <Text style={styles.rating}>⭐ {spati.rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {spati.description}
        </Text>
        <Text style={styles.meta}>{spati.address}</Text>
        <Text style={styles.meta}>
          {spati.type} • {spati.hours}
        </Text>

        {distance && (
          <Text style={styles.distance}>{distance} km from you</Text>
        )}

        {onDirections && (
          <TouchableOpacity
            style={styles.button}
            onPress={onDirections}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Get Directions</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    fontSize: 18,
    color: "#333",
  },
  image: {
    width: "100%",
    height: 180,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
    paddingRight: 12,
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  description: {
    fontSize: 15,
    color: "#555",
    marginBottom: 8,
  },
  meta: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  distance: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  button: {
    marginTop: 18,
    backgroundColor: "#4CAF50",
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
