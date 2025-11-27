import { memo, useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Platform } from "react-native";
import { Marker } from "react-native-maps";
import type { SpatiLocation } from "../../hooks/useSpatiQuery";

type Props = {
  spati: SpatiLocation;
  onPress?: () => void;
  isSelected?: boolean;
};

const SpatiMarkerComponent = ({ spati, onPress, isSelected }: Props) => {
  // Optimization for Android: tracksViewChanges={false} prevents re-rendering the marker bitmap
  // We only track changes when the marker is first mounted or when its appearance changes (isSelected)
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (tracksViewChanges) {
      // Stop tracking after a short delay to allow the view to render
      // 100ms is usually sufficient for the view to be drawn
      timeoutRef.current = setTimeout(() => {
        setTracksViewChanges(false);
      }, 100);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [tracksViewChanges]);

  useEffect(() => {
    // When selection state changes, we need to update the view
    setTracksViewChanges(true);
  }, [isSelected]);

  return (
    <Marker
      identifier={spati.id.toString()}
      coordinate={{ latitude: spati.latitude, longitude: spati.longitude }}
      onPress={onPress}
      tracksViewChanges={tracksViewChanges}
    >
      <View style={[styles.marker, isSelected && styles.markerSelected]}>
        <Text style={styles.markerIcon}>🍺</Text>
      </View>
    </Marker>
  );
};

export const SpatiMarker = memo(SpatiMarkerComponent);

const styles = StyleSheet.create({
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(76, 175, 80, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  markerSelected: {
    backgroundColor: "rgba(76, 175, 80, 0.3)",
  },
  markerIcon: {
    fontSize: 20,
  },
});
