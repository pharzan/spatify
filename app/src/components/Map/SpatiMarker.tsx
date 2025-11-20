import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Marker } from "react-native-maps";
import type { SpatiLocation } from "../../hooks/useSpatiQuery";

type Props = {
  spati: SpatiLocation;
  onPress?: () => void;
  isSelected?: boolean;
};

const SpatiMarkerComponent = ({ spati, onPress, isSelected }: Props) => (
  <Marker
    identifier={spati.id.toString()}
    coordinate={{ latitude: spati.latitude, longitude: spati.longitude }}
    onPress={onPress}
  >
    <View style={[styles.marker, isSelected && styles.markerSelected]}>
      <Text style={styles.markerIcon}>🍺</Text>
    </View>
  </Marker>
);

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
