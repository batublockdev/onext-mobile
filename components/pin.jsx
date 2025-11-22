import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function PinVerification({ mode = 'register', message, onComplete }) {
    const [step, setStep] = useState(mode === 'register' ? 1 : 2);
    const [firstPin, setFirstPin] = useState('');
    const [pin, setPin] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputs = useRef([]);
    const [focusedIndex, setFocusedIndex] = useState(null);

    const handlePin = async (pinCode) => {
        if (mode === 'register') {
            if (step === 1) {
                // Save first PIN and ask for verification
                setFirstPin(pinCode);
                setPin(['', '', '', '']);
                setStep(2);
                inputs.current[0].focus();

            } else {
                // Verify PIN
                if (pinCode === firstPin) {
                    setLoading(true);
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate processing
                    onComplete && onComplete(pinCode);

                } else {
                    Alert.alert('Error', 'PINs do not match. Try again.');
                    setPin(['', '', '', '']);
                    setStep(1);
                    inputs.current[0].focus();
                }
            }
        } else {
            // Operation mode (single PIN)
            setLoading(true);
            try {
                onComplete && onComplete(pinCode);
            } catch (error) {
                Alert.alert('Error', 'Something went wrong.');
            } finally {

            }
        }
    };

    const handleChange = (text, index) => {
        if (/^\d$/.test(text)) {
            const newPin = [...pin];
            newPin[index] = text;
            setPin(newPin);

            if (index < 3) {
                inputs.current[index + 1].focus();
            } else {
                // All 4 digits entered → trigger handlePin
                const pinCode = newPin.join('');
                handlePin(pinCode);
            }
        } else if (text === '') {
            const newPin = [...pin];
            newPin[index] = '';
            setPin(newPin);
        }
    };
    if (loading) {
        // show only spinner
        return (
            <View style={styles.loadingContainer}>
                {message && <Text style={styles.message}>{message}</Text>}
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Processing...</Text>
            </View>
        );
    } else {

        return (
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20} // adjust offset if you have header
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Your current content */}
                    <View style={styles.container}>
                        <Text style={styles.title}>
                            {mode === "register"
                                ? step === 1
                                    ? "Create a 4-digit PIN"
                                    : "Confirm your PIN"
                                : "Enter your PIN"}
                        </Text>

                        <View style={styles.pinContainer}>
                            {pin.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => (inputs.current[index] = ref)}
                                    value={digit}
                                    onChangeText={(text) => handleChange(text, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    style={[
                                        styles.input,
                                        focusedIndex === index && styles.inputFocused,
                                    ]}
                                    secureTextEntry
                                    onFocus={() => setFocusedIndex(index)}
                                    onBlur={() => setFocusedIndex(null)}
                                    editable={!loading}
                                />
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        justifyContent: "center",
        alignItems: "center",
    },

    loadingContainer: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        justifyContent: "center",
        alignItems: "center",
    },

    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#4B5563",
        fontWeight: "500",
    },

    message: {
        color: "#007AFF",
        fontSize: 14,
        marginBottom: 10,
        textAlign: "center",
        fontWeight: "500",
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 32,
        textAlign: "center",
    },

    pinContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "80%",
        marginBottom: 40,
    },

    input: {
        width: 55,
        height: 55,
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        textAlign: "center",
        fontSize: 24,
        color: "#111827",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },

    inputFocused: {
        borderColor: "#007AFF",
    },
});
