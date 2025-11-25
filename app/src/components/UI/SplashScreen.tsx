import React, { useEffect, useRef } from "react";
import { View, Image, StyleSheet, Animated, Dimensions } from "react-native";

// Import assets directly
const splash1 = require("../../../assets/spatify-splash-1.jpg");
const splash2 = require("../../../assets/spatify-splash-2.jpg");

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  useEffect(() => {
    Animated.sequence([
      // Wait a brief moment before starting (optional, but feels smoother)
      Animated.delay(500),
      // Fade in the second image over 2 seconds
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      // Hold the final state for a moment
      Animated.delay(500),
    ]).start(() => {
      // Animation finished
      onFinish();
    });
  }, [fadeAnim, onFinish]);

  return (
    <View style={styles.container}>
      {/* First image is the background base */}
      <Image source={splash1} style={styles.image} resizeMode="contain" />

      {/* Second image fades in on top */}
      <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
        <Image source={splash2} style={styles.image} resizeMode="contain" />
      </Animated.View>
    </View>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Or a color matching your splash screen background
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999, // Ensure it sits on top of everything
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: width,
    height: height,
  },
});
