import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';

export default function PinVerification({ mode = 'register', message, onComplete }) {
    const [step, setStep] = useState(mode === 'register' ? 1 : 2);
    const [firstPin, setFirstPin] = useState('');
    const [pin, setPin] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputs = useRef([]);

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
            <View style={styles.container}>
                {message && <Text style={styles.message}>{message}</Text>}

                <Text style={styles.title}>
                    {mode === 'register'
                        ? step === 1
                            ? 'Create a 4-digit PIN'
                            : 'Confirm your PIN'
                        : 'Enter your PIN'}
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
                            autoFocus={index === 0}
                            editable={!loading}
                        />
                    ))}
                </View>


            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 20,
        marginBottom: 150,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    message: {
        fontSize: 16,
        color: '#444',
        marginBottom: 10,
        textAlign: 'center',
        width: '80%',
    },
    pinContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
    },
    input: {
        width: 50,
        height: 60,
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: '#f9f9f9',
    },
    loadingContainer: {
        marginTop: 25,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '500',
    },
});
