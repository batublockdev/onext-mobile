import { useRef, useState, useEffect } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    ScrollView,
    Text,
    TextInput,
    View,
    StyleSheet,
    Platform,
} from "react-native";

export default function PinVerification({
    mode = "register",
    message,
    status, // "success" | "error" | null (comes from parent)
    onComplete,
}) {
    const [step, setStep] = useState(mode === "register" ? 1 : 2);
    const [firstPin, setFirstPin] = useState("");
    const [pin, setPin] = useState(["", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const inputs = useRef([]);

    // 🔥 Reset PIN when parent sends status (success or error)
    useEffect(() => {
        if (status) {
            setPin(["", "", "", ""]);
            setTimeout(() => {
                inputs.current[0]?.focus();
            }, 100);
        }
    }, [status]);

    const handlePin = async (pinCode) => {
        if (mode === "register") {
            if (step === 1) {
                setFirstPin(pinCode);
                setPin(["", "", "", ""]);
                setStep(2);
                inputs.current[0].focus();
            } else {
                if (pinCode === firstPin) {
                    setLoading(true);
                    await new Promise((res) => setTimeout(res, 300));
                    onComplete(pinCode);
                } else {
                    setPin(["", "", "", ""]);
                    setStep(1);
                    inputs.current[0].focus();
                }
            }
        } else {
            setLoading(true);
            await new Promise((res) => setTimeout(res, 200));
            onComplete(pinCode);
            setLoading(false);
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
                handlePin(newPin.join(""));
            }
        } else if (text === "") {
            const newPin = [...pin];
            newPin[index] = "";
            setPin(newPin);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    <Text style={styles.title}>
                        {mode === "register"
                            ? step === 1
                                ? "Crea tu PIN de 4 dígitos"
                                : "Confirma tu PIN"
                            : "Ingresa tu PIN"}
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
                                style={styles.input}
                                secureTextEntry
                            />
                        ))}
                    </View>

                    {/* Status from parent */}
                    {message && !loading && (
                        <Text
                            style={[
                                styles.feedbackText,
                                status === "error" && styles.errorText,
                                status === "success" && styles.successText,
                            ]}
                        >
                            {message}
                        </Text>
                    )}

                    {loading && (
                        <ActivityIndicator
                            size="large"
                            color="#007AFF"
                            style={{ marginTop: 20 }}
                        />
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 30,
        paddingTop: 20,
        paddingBottom: 50,
        backgroundColor: "#0D0D0D",
    },

    container: {
        width: "100%",
        alignItems: "center",
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 25,
        color: "#E9F5EC",
        textAlign: "center",
    },

    pinContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "80%",
        marginBottom: 20,
    },

    input: {
        width: 60,
        height: 60,
        backgroundColor: "#1A1A1A",
        borderRadius: 14,
        borderWidth: 2,
        borderColor: "#2D2D2D",
        textAlign: "center",
        fontSize: 26,
        color: "#E9F5EC",
        elevation: 4,
    },

    feedbackText: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
        color: "#E9F5EC",
    },

    errorText: {
        color: "#FF5252",
    },

    successText: {
        color: "#00E676",
    },
});
