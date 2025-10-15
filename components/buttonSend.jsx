import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

export default function DepositComponent({ depositUrl }) {
    const [showWebView, setShowWebView] = useState(false);

    // Handle opening the deposit flow inside WebView
    const handlePress = () => {
        if (!depositUrl) return;
        setShowWebView(true);
    };

    // Optionally, you can add a close button inside WebView
    const handleClose = () => {
        setShowWebView(false);
    };

    // If the user clicked the button, render the WebView
    if (showWebView && depositUrl) {
        return (
            <View style={{ flex: 1 }}>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
                <WebView
                    source={{ uri: depositUrl }}
                    style={{ flex: 1 }}
                    startInLoadingState={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                />
            </View>
        );
    }

    // Otherwise, show the deposit button
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={handlePress}
                disabled={!depositUrl}
            >
                <Text style={styles.buttonText}>
                    {depositUrl ? "Deposit USDC" : "Loading..."}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

// Styles for button and close button
const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: "center",
    },
    button: {
        backgroundColor: "#4CAF50",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    closeButton: {
        backgroundColor: "#f44336",
        padding: 10,
        borderRadius: 8,
        position: "absolute",
        top: 40,
        right: 20,
        zIndex: 1,
    },
    closeText: {
        color: "#fff",
        fontWeight: "bold",
    },
});
