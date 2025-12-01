import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
import useState from 'react';
import { Text, TextInput, StyleSheet, TouchableOpacity, View } from 'react-native';

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
            setGlobalError("Error")
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
                setcodeError("Error")

            }
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            setcodeError("Error")
        }
    }

    if (pendingVerification) {
        return (
            <>
                <Text style={styles.title2}>Verify your email</Text>

                <Text style={styles.subtitle}>
                    Enter the code we sent to your inbox
                </Text>

                {globalError && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorBoxText}>{globalError}</Text>
                    </View>
                )}

                <View style={styles.codeWrapper}>
                    <TextInput
                        style={styles.codeInput}
                        placeholderTextColor="#6B7280"
                        value={code}
                        placeholder="Verification code"
                        keyboardType="numeric"
                        maxLength={6}
                        onChangeText={(value) => {
                            setCode(value);
                            setGlobalError(null);
                        }}
                    />
                    {codeError && <Text style={styles.errorText}>{codeError}</Text>}

                    <TouchableOpacity style={styles.button} onPress={onVerifyPress}>
                        <Text style={styles.buttonText}>Verify</Text>
                    </TouchableOpacity>
                </View>


            </>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>

            {globalError && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorBoxText}>{globalError}</Text>
                </View>
            )}

            <TextInput
                style={styles.input}
                placeholder="First Name"
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
                placeholder="Email"
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
                placeholder="Password"
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
                    {isLoading ? 'Creating Account...' : 'Continue'}
                </Text>
            </TouchableOpacity>

            <View style={styles.signInRow}>
                <Text style={styles.normalText}>Already have an account?</Text>
                <Link href="/sign-in">
                    <Text style={styles.signupLink}> Sign in</Text>
                </Link>
            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    codeWrapper: {
        width: "70%",        // <= Reduce width
        alignSelf: "center", // <= Center horizontally
        marginBottom: 20,
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