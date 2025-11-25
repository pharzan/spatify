import { StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  rating: number;
  size?: number;
  color?: string;
  showText?: boolean;
};

export const StarRating = ({
  rating,
  size = 16,
  color = "#FFD700",
  showText = true,
}: Props) => {
  // Ensure rating is between 0 and 5
  const clampedRating = Math.max(0, Math.min(5, rating));

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    let iconName: keyof typeof Ionicons.glyphMap = "star-outline";

    if (clampedRating >= i) {
      iconName = "star";
    } else if (clampedRating >= i - 0.5) {
      iconName = "star-half";
    }

    stars.push(
      <Ionicons
        key={i}
        name={iconName}
        size={size}
        color={color}
        style={styles.star}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stars}>{stars}</View>
      {showText && <Text style={[styles.text, { fontSize: size }]}></Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  stars: {
    flexDirection: "row",
    marginRight: 6,
  },
  star: {
    marginRight: 1,
  },
  text: {
    fontWeight: "600",
    color: "#4CAF50",
  },
});
