import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";

export default function DeleteAccountModal() {
    const [modalVisible, setModalVisible] = useState(false);

    const handleDeleteAccount = () => {
        // Put your account deletion logic here
        console.log("Account deleted!");
        setModalVisible(false);
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
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Are you sure?</Text>
                        <Text style={styles.modalText}>
                            This action will permanently delete your account.
                        </Text>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
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
    buttonRow: { flexDirection: "row", justifyContent: "space-between" },
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
});
