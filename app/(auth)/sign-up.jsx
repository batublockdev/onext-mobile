import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp()
    const router = useRouter()
    const [firstName, setFirstName] = React.useState('');
    const [firstNameError, setFirstNameError] = React.useState('');
    const [emailError, setEmailError] = React.useState('');
    const [passwordError, setPasswordError] = React.useState('');
    const [codeError, setcodeError] = React.useState('');




    const [isLoading, setIsLoading] = React.useState(false);

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [pendingVerification, setPendingVerification] = React.useState(false)
    const [code, setCode] = React.useState('')
    const [globalError, setGlobalError] = React.useState(null);
    // Handle submission of sign-up form
    const onSignUpPress = async () => {
        setGlobalError("")
        if (!isLoaded) return

        // Start sign-up process using email and password provided
        try {
            await signUp.create({
                emailAddress,
                password,
                firstName,
            })

            // Send user an email with verification code
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

            // Set 'pendingVerification' to true to display second form
            // and capture OTP code
            setPendingVerification(true)
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            setGlobalError(err)
            console.log(err)

        }
    }

    // Handle submission of verification form
    const onVerifyPress = async () => {
        setGlobalError("")

        if (!isLoaded) return

        try {
            // Use the code the user provided to attempt verification
            console.log("Verifying code:", code)
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            })
            console.log("SignUp Attempt:", signUpAttempt)
            // If verification was completed, set the session to active
            // and redirect the user
            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId })
                //router.replace('/')
                Alert.alert("Sign up complete! Please sign in.")


            } else {
                // If the status is not complete, check why. User may need to
                // complete further steps.
                console.log(err)
                setcodeError(err)


            }
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.log(err)
            setcodeError(err)
        }
    }

    if (pendingVerification) {
        return (
            <View style={styles.darkContainer}>
                <Text style={styles.titleImproved}>Verifica tu correo</Text>

                <Text style={styles.subtitleImproved}>
                    Ingresa el código que enviamos a tu bandeja de entrada
                </Text>

                {globalError && (
                    <View style={styles.errorBoxImproved}>
                        <Text style={styles.errorBoxText}>{globalError}</Text>
                    </View>
                )}

                <View style={styles.codeWrapperImproved}>
                    <TextInput
                        style={styles.codeInputImproved}
                        placeholderTextColor="#9CA3AF"
                        value={code}
                        placeholder="Código de verificación"
                        keyboardType="numeric"
                        maxLength={6}
                        onChangeText={(value) => {
                            setCode(value);
                            setGlobalError(null);
                        }}
                    />
                    {codeError && <Text style={styles.errorText}>{codeError}</Text>}

                    <TouchableOpacity style={styles.buttonImproved} onPress={onVerifyPress}>
                        <Text style={styles.buttonImprovedText}>Verificar</Text>
                    </TouchableOpacity>
                </View>
            </View>

        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Crear Cuenta</Text>

            {globalError && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorBoxText}>{globalError}</Text>
                </View>
            )}

            <TextInput
                style={styles.input}
                placeholder="Nombre"
                placeholderTextColor="#9CA3AF"
                value={firstName}
                onChangeText={(value) => {
                    setFirstName(value);
                    setFirstNameError(null);
                }}
            />
            {firstNameError && <Text style={styles.errorText}>{firstNameError}</Text>}

            <TextInput
                style={styles.input}
                placeholder="Correo"
                placeholderTextColor="#9CA3AF"
                value={emailAddress}
                onChangeText={(value) => {
                    setEmailAddress(value);
                    setEmailError(null);
                }}
            />
            {emailError && <Text style={styles.errorText}>{emailError}</Text>}

            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={true}
                value={password}
                onChangeText={(value) => {
                    setPassword(value);
                    setPasswordError(null);
                }}
            />
            {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

            <TouchableOpacity
                style={[styles.button, isLoading && { opacity: 0.7 }]}
                onPress={onSignUpPress}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isLoading ? 'Creando cuenta...' : 'Continuar'}
                </Text>
            </TouchableOpacity>

            <View style={styles.signInRow}>
                <Text style={styles.normalText}>¿Ya tienes una cuenta?</Text>
                <Link href="/sign-in">
                    <Text style={styles.signupLink}> Inicia sesión</Text>
                </Link>
            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    darkContainer: {
        flex: 1,
        backgroundColor: "#0B1220", // deep dark background
        paddingHorizontal: 20,
    },

    titleImproved: {
        marginTop: 70,

        fontSize: 28,
        fontWeight: "700",
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 10,
    },

    subtitleImproved: {
        fontSize: 16,
        color: "#CBD5E1",
        textAlign: "center",
        marginBottom: 25,
    },

    errorBoxImproved: {
        backgroundColor: "#ff4d4d20",
        borderLeftWidth: 4,
        borderLeftColor: "#ff4d4d",
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
    },

    errorBoxText: {
        color: "#ff4d4d",
        textAlign: "center",
        fontWeight: "600",
    },

    codeWrapperImproved: {
        width: "100%",
        alignItems: "center",
    },

    codeInputImproved: {
        width: "80%",
        height: 60,
        backgroundColor: "#1E293B",
        color: "#FFFFFF",
        borderRadius: 12,
        fontSize: 22,
        textAlign: "center",
        letterSpacing: 8,
        borderWidth: 1,
        borderColor: "#334155",
        marginBottom: 20,
    },

    buttonImproved: {
        width: "80%",
        backgroundColor: "#35D787",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },

    buttonImprovedText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#000000",
    },


    codeContainer: {
        backgroundColor: "#161616",
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 4,
        borderWidth: 1,
        borderColor: "#1F1F1F",
        marginBottom: 16,
    },

    // Verification input
    codeInput: {
        backgroundColor: "#111111",
        color: "#fff",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        fontSize: 18,
        textAlign: "center",
        borderWidth: 1,
        borderColor: "#222",
        letterSpacing: 1,
    },

    subtitle: {
        color: "#6B7280",
        fontSize: 15,
        marginBottom: 22,
        textAlign: "center",
    },
    container: {
        flex: 1,
        backgroundColor: "#0D0D0D",
        paddingHorizontal: 28,
        paddingTop: 60,
    },
    title2: {
        color: "#000000ff",
        fontSize: 30,
        fontWeight: "800",
        marginBottom: 20,
        textAlign: "center",
        letterSpacing: 0.5,
    },
    // --- Titles ---
    title: {
        color: "#FFFFFF",
        fontSize: 30,
        fontWeight: "800",
        marginBottom: 20,
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
        backgroundColor: "#35D787",
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

    // --- Sign In Row ---
    signInRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    normalText: {
        color: "#6B7280",
        fontSize: 14,
    },
    signupLink: {
        color: "#35D787",
        fontWeight: "bold",
        fontSize: 14,
    },
    errorText: {
        color: "#EF4444",       // soft red
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
});