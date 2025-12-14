import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function DeleteAccountModal({ status }) {
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();

    // null = confirmation screen
    // "success" or "error" = result screen



    const closeModal = () => {
        setStatus(null);
        setModalVisible(false);
        if (status) {
            router.push({
                pathname: "/sign-in",

            })
        }
    };

    return (
        <View style={styles.container}>

            {/* Button to open the modal */}
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>

            {/* Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>

                        {/* === Confirmation Screen === */}
                        {status === null && (
                            <>
                                <Text style={styles.modalTitle}>Are you sure?</Text>
                                <Text style={styles.modalText}>
                                    This action will permanently delete your account.
                                </Text>

                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={closeModal}
                                    >
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.deleteConfirmButton]}
                                        onPress={handleDeleteAccount}
                                    >
                                        <Text style={styles.deleteConfirmText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {/* === Success Screen === */}
                        {status === "success" && (
                            <>
                                <Text style={styles.modalTitle}>Success</Text>
                                <Text style={styles.modalText}>
                                    Your account was deleted successfully.
                                </Text>

                                <TouchableOpacity
                                    style={styles.okButton}
                                    onPress={closeModal}
                                >
                                    <Text style={styles.okText}>OK</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* === Error Screen === */}
                        {status === "error" && (
                            <>
                                <Text style={styles.modalTitle}>Error</Text>
                                <Text style={styles.modalText}>
                                    Something went wrong. Please try again.
                                </Text>

                                <TouchableOpacity
                                    style={styles.okButton}
                                    onPress={closeModal}
                                >
                                    <Text style={styles.okText}>OK</Text>
                                </TouchableOpacity>
                            </>
                        )}

                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    deleteButton: {
        backgroundColor: "#FF4D4F",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    deleteButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
    },

    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    modalText: { fontSize: 15, textAlign: "center", marginBottom: 20 },

    buttonRow: { flexDirection: "row", justifyContent: "space-between", width: "100%" },

    modalButton: {
        flex: 1,
        paddingVertical: 12,
        marginHorizontal: 5,
        borderRadius: 8,
        alignItems: "center",
    },

    cancelButton: { backgroundColor: "#ccc" },
    deleteConfirmButton: { backgroundColor: "#FF4D4F" },

    cancelText: { color: "#000", fontWeight: "bold" },
    deleteConfirmText: { color: "#fff", fontWeight: "bold" },

    okButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
    },
    okText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
