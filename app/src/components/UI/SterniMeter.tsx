import { View, Image, StyleSheet, Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";
import type { components } from "../../generated/api-types";

type SterniValue = components["schemas"]["PublicSpatiLocation"]["sterniValue"];

type Props = {
    value: SterniValue;
    size?: number;
};

export const SterniMeter = ({ value, size = 100 }: Props) => {
    const rotationAnim = useRef(new Animated.Value(-80)).current; // Start at "0" (left-most)

    useEffect(() => {
        if (!value) return;

        const getRotationValue = (val: NonNullable<SterniValue>) => {
            switch (val) {
                case "low":
                    return -80;
                case "medium":
                    return -10;
                case "high":
                    return 40;
                case "very_high":
                    return 80;
                default:
                    return -60;
            }
        };

        const targetRotation = getRotationValue(value);

        // Initial sweep animation: oscillate between left (-80) and right (80) then settle
        Animated.sequence([
            // Sweep to right
            Animated.timing(rotationAnim, {
                toValue: 80,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.quad),
            }),
            // Sweep back to left
            Animated.timing(rotationAnim, {
                toValue: -80,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.quad),
            }),
            // Spring to target value
            Animated.spring(rotationAnim, {
                toValue: targetRotation,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, [value, rotationAnim]);

    if (!value) return null;

    // Interpolate number value to degrees string
    const rotation = rotationAnim.interpolate({
        inputRange: [-180, 180],
        outputRange: ["-180deg", "180deg"],
    });

    // Height of the bottle image
    const cylinderHeight = size * 0.6;
    // We want to shift the bottle up so its bottom pivot is at the center of the container
    const translateY = -cylinderHeight / 2;

    return (
        <View style={[styles.container, { width: size, height: size / 2 }]}>
            <Image
                source={require("../../../assets/sterni-levels.png")}
                style={[styles.meter, { width: size, height: size / 2 }]}
                resizeMode="contain"
            />

            <Animated.View
                style={[
                    styles.indicatorContainer,
                    {
                        width: size,
                        height: size,
                        transform: [{ rotate: rotation }]
                    }
                ]}
            >
                <Image
                    source={require("../../../assets/sterni-indicator.png")}
                    style={{
                        width: size * 0.15,
                        height: cylinderHeight,
                        transform: [{ translateY }],
                    }}
                    resizeMode="contain"
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // Main container is a semi-circle (rectangle half height)
        overflow: "visible",
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    meter: {
        // The gauge background
    },
    indicatorContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        justifyContent: "center",
        alignItems: "center",
    },
});
