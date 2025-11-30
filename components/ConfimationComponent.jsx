import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ConfirmationMessage({ success, message, reason, onClose }) {
    console.log("Rendering ConfirmationMessage with:", { success, message, reason });

    return (
        <View style={[styles.container, success ? styles.successBg : styles.errorBg]}>
            <View style={styles.content}>
                <Ionicons
                    name={success ? "checkmark-circle" : "close-circle"}
                    size={80}
                    color={success ? "#16a34a" : "#dc2626"}
                    style={{ marginBottom: 20 }}
                />

                <Text style={styles.title}>
                    {success ? "Todo bien!" : "Algo salio mal"}
                </Text>

                {/* ✅ Show message in both success and error cases */}
                {message && (
                    <Text style={styles.message}>{message}</Text>
                )}

                {/* Show reason only for failed transactions */}
                {!success && reason ? (
                    <Text style={styles.reason}>{reason}</Text>
                ) : null}

                <TouchableOpacity onPress={onClose} style={styles.button}>
                    <Text style={styles.buttonText}>OK</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        elevation: 999,
    },
    successBg: {
        backgroundColor: '#dcfce7',
    },
    errorBg: {
        backgroundColor: '#fee2e2',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 10,
    },
    message: {
        fontSize: 18,
        textAlign: 'center',
        color: '#374151',
        marginBottom: 10,
    },
    reason: {
        fontSize: 16,
        color: '#991b1b',
        textAlign: 'center',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#111827',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
});
