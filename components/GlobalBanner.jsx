import { StyleSheet, Text, View } from "react-native";

export default function GlobalBanner() {
    return (
        <View style={styles.banner}>
            <Text style={styles.bannerText}>  Version de prueba 1.0.1</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        width: "100%",
        backgroundColor: "#fbbe2441",
        paddingVertical: 1,
        alignItems: "center",
    },
    bannerText: {
        color: "#000",
        fontWeight: "600",
    },
});
