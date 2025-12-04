import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function AppError({ onRetry }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>⚠️ Problema con la conexión</Text>
            <Text style={styles.subtitle}>
                Parece tenemos un problema de conexion al servidor !
            </Text>

            {onRetry && (
                <TouchableOpacity style={styles.button} onPress={onRetry}>
                    <Text style={styles.buttonText}>Reintentar</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0D0D0D",
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#ccc",
        textAlign: "center",
        marginBottom: 20,
        width: "90%",
    },
    button: {
        backgroundColor: "#35D787",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    buttonText: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 16,
    },
});
