import React, { useEffect } from "react";
import {
    View,
    Text,
    Modal,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

export default function LoadingOverlay({
    visible,
    message = "Loading...",
    status = "loading",      // "loading" | "success" | "error"
    onClose, }) {



    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
        >
            <View style={styles.overlay}>
                <View style={styles.box}>
                    {/* Spinner solo para loading */}
                    {status === "loading" && (
                        <ActivityIndicator size="large" color="#35D787" />
                    )}

                    {/* Success icon */}
                    {status === "success" && (
                        <Text style={styles.successIcon}>✓</Text>
                    )}

                    {/* Error icon */}
                    {status === "error" && (
                        <Text style={styles.errorIcon}>✕</Text>
                    )}

                    {/* Mensaje */}
                    {message ? (
                        <Text style={[
                            styles.message,
                            status === "error" ? styles.errorMessage : styles.successMessage
                        ]}>
                            {message}
                        </Text>
                    ) : null}

                    {/* Botón para cerrar cuando hay success o error */}
                    {(status === "success" || status === "error") && (
                        <TouchableOpacity style={styles.button} onPress={onClose}>
                            <Text style={styles.buttonText}>OK</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
    },
    box: {
        width: 260,
        padding: 24,
        backgroundColor: "#0E0E0E",
        borderRadius: 14,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#1A1A1A",
    },
    successIcon: {
        fontSize: 50,
        color: "#35D787",
        marginBottom: 10,
    },
    errorIcon: {
        fontSize: 50,
        color: "#FF5555",
        marginBottom: 10,
    },
    message: {
        textAlign: "center",
        marginTop: 4,
    },
    errorMessage: {
        color: "#FF7777",
        fontSize: 13,
    },
    successMessage: {
        color: "#35D787",
        fontSize: 14,
    },
    button: {
        marginTop: 18,
        backgroundColor: "#35D787",
        paddingVertical: 10,
        paddingHorizontal: 34,
        borderRadius: 10,
    },
    buttonText: {
        color: "#000",
        fontWeight: "600",
        fontSize: 15,
    },
});

