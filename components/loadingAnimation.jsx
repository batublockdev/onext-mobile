import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// Color Palette based on your branding
const COLORS = {
    background: '#0F172A',
    green: '#10B981',
    gold: '#FBBF24',
    darkStroke: '#1E293B'
};

const LoadingScreen = () => {
    // 1. Initialize the animated value
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // 2. Create the rotation loop
    useEffect(() => {
        const startRotation = () => {
            // Loop the animation from 0 to 1
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 3000, // 3 seconds per full rotation (slow and steady)
                    easing: Easing.linear,
                    useNativeDriver: true, // Important for performance
                })
            ).start();
        };

        startRotation();
    }, [rotateAnim]);

    // 3. Interpolate 0-1 to 0deg-360deg
    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <View style={styles.logoWrapper}>

                {/* --- 1. The Rotating Chain (Outer Layer) --- */}
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Svg height="120" width="120" viewBox="0 0 100 100">
                        {/* This Circle represents the chain. 
              strokeDasharray="15, 8" creates the "link" effect (15px line, 8px gap).
            */}
                        <Circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke={COLORS.green}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray="15, 8"
                            fill="none"
                        />
                    </Svg>
                </Animated.View>

                {/* --- 2. The Static Shield (Inner Layer) --- */}
                <View style={styles.shieldOverlay}>
                    <Svg height="60" width="60" viewBox="0 0 100 100">
                        {/* Shield Shape */}
                        <Path
                            d="M50 95C25 85 10 65 10 40V20L50 5L90 20V40C90 65 75 85 50 95Z"
                            stroke={COLORS.green}
                            strokeWidth="8"
                            fill="none" // Transparent center
                        />
                        {/* The Lightning/Crack in the middle */}
                        <Path
                            d="M35 40 L50 60 L65 30"
                            stroke={COLORS.gold}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                </View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrapper: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    shieldOverlay: {
        position: 'absolute',
        // Centering the shield perfectly inside the chain
        top: 30,
        left: 30,
    },
});

export default LoadingScreen;