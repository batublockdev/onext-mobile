import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import Onboarding from '../../components/onboarding';

export default function Page() {
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()
    const [emailError, setEmailError] = React.useState(null);
    const [Onboardingx, setOnboarding] = React.useState(true);

    const [passwordError, setPasswordError] = React.useState(null);
    const [globalError, setGlobalError] = React.useState(null);
    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')

    // Handle the submission of the sign-in form
    const onSignInPress = async () => {
        setEmailError(null);
        setPasswordError(null);
        setGlobalError(null);
        if (!isLoaded) return
        if (!emailAddress) {
            setEmailError("Email is required.");

            return
        }
        if (!password) {
            setPasswordError("Password is required.");

            return
        }

        // Start the sign-in process using the email and password provided
        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            })

            // If sign-in process is complete, set the created session as active
            // and redirect the user
            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId })
                router.replace('/')
            } else {
                // If the status isn't complete, check why. User might need to
                // complete further steps.
                Alert.alert("Sign in failed. Please try again.")
            }
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            setGlobalError("Invalid email or password.");
        }
    }
    const onGuestPress = async () => {
        console.log("Entrando como invitado...");
        //Testing account 

        const signInAttempt = await signIn.create({
            identifier: "banguardos@gmail.com",
            password: "Trust35000",
        })

        // If sign-in process is complete, set the created session as active
        // and redirect the user
        if (signInAttempt.status === 'complete') {
            await setActive({ session: signInAttempt.createdSessionId })
            setOnboarding(false)

            router.replace('/')
        } else {
            // If the status isn't complete, check why. User might need to
            // complete further steps.
            Alert.alert("Tenemos problemas al entrar como invitado, registrate o intentalo mas tarde")
        }
    };
    if (Onboardingx) {
        return <Onboarding onLoginPress={() => setOnboarding(false)} onGuestPress={onGuestPress} />
    } else {

        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
                <StatusBar style="light" backgroundColor="transparent" translucent />

                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >

                    {/* Your UI */}



                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.title}>Bienvenido de nuevo</Text>
                        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

                        {/* Global Error Box */}
                        {globalError && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorBoxText}>{globalError}</Text>
                            </View>
                        )}

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ingresa tu correo"
                                placeholderTextColor="#6B7280"
                                autoCapitalize="none"
                                value={emailAddress}
                                onChangeText={(text) => {
                                    setEmailAddress(text);
                                    setEmailError(null);
                                    setGlobalError(null);
                                }}
                            />
                            {emailError && <Text style={styles.errorText}>{emailError}</Text>}

                            <TextInput
                                style={styles.input}
                                placeholder="Ingresa tu contraseña"
                                placeholderTextColor="#6B7280"
                                secureTextEntry
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setPasswordError(null);
                                    setGlobalError(null);
                                }}
                            />
                            {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
                        </View>

                        <TouchableOpacity style={styles.button} onPress={onSignInPress}>
                            <Text style={styles.buttonText}>Iniciar Sesión</Text>
                        </TouchableOpacity>

                        <View style={styles.signupRow}>
                            <Text style={styles.signupText}>¿No tienes una cuenta? </Text>
                            <Link href="/sign-up">
                                <Text style={styles.signupLink}>Regístrate</Text>
                            </Link>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>

        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0D0D0D", // darker and cleaner
    },
    errorText: {
        color: "#EF4444",
        fontSize: 14,
        marginBottom: 10,
        marginLeft: 4,
    },

    errorBox: {
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(239,68,68,0.4)",
        marginBottom: 20,
    },

    errorBoxText: {
        color: "#FCA5A5",
        fontSize: 15,
        textAlign: "center",
        fontWeight: "600",
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 28,
        paddingVertical: 10,
    },

    // --- Titles ---
    title: {
        color: "#FFFFFF",
        fontSize: 30,
        fontWeight: "800",
        marginBottom: 6,
        textAlign: "center",
        letterSpacing: 0.5,
    },
    subtitle: {
        color: "#6B7280",
        fontSize: 15,
        marginBottom: 32,
        textAlign: "center",
    },

    // --- Inputs ---
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: "#161616",
        color: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 10,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#222",
        fontSize: 15,
    },

    // --- Button ---
    button: {
        backgroundColor: "#35D787", // neon green
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#35D787",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        color: "#000",
        fontSize: 17,
        fontWeight: "700",
    },

    // --- Sign up ---
    signupRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 25,
    },
    signupText: {
        color: "#6B7280",
        fontSize: 14,
    },
    signupLink: {
        color: "#35D787",
        fontWeight: "bold",
        fontSize: 14,
    },
});