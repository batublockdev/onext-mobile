import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function TrustFullScreenLoading() {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const load = async () => {
            try {
                Animated.loop(
                    Animated.parallel([
                        Animated.sequence([
                            Animated.timing(scale, {
                                toValue: 1.15,
                                duration: 700,
                                useNativeDriver: true,
                            }),
                            Animated.timing(scale, {
                                toValue: 1,
                                duration: 700,
                                useNativeDriver: true,
                            }),
                        ]),
                        Animated.sequence([
                            Animated.timing(opacity, {
                                toValue: 0.6,
                                duration: 700,
                                useNativeDriver: true,
                            }),
                            Animated.timing(opacity, {
                                toValue: 1,
                                duration: 700,
                                useNativeDriver: true,
                            }),
                        ]),
                    ])
                ).start();
            } catch (e) {
                console.log("Startup error:", e);
            }
        };
        load();

    }, []);

    return (
        <View style={styles.container}>
            <Animated.Image
                source={require("../assets/logo/trust-new.png")} // <-- your logo
                style={[
                    styles.logo,
                    {
                        transform: [{ scale }],
                        opacity,
                    },
                ]}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width,
        height,
        backgroundColor: "#050A0E", // full dark BG
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: 160,
        height: 160,
    },
});
