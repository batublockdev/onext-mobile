import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'; // Ensure expo-linear-gradient is installed
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function Page() {
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')

    // Handle the submission of the sign-in form
    const onSignInPress = async () => {
        if (!isLoaded) return
        if (!emailAddress || !password) {
            Alert.alert('Please fill in all fields')
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
                console.error(JSON.stringify(signInAttempt, null, 2))
            }
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            Alert.alert("Sign in failed. Please try again.")
            console.error(JSON.stringify(err, null, 2))
        }
    }

    return (
        <LinearGradient
            colors={['#6B7280', '#111827']} // Dark gradient for a modern look
            style={styles.container}
        >
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter email"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    value={emailAddress}
                    onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={true}
                    value={password}
                    onChangeText={(password) => setPassword(password)}
                />
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={onSignInPress}
                activeOpacity={0.7}
            >
                <LinearGradient
                    colors={['#3B82F6', '#60A5FA']} // Vibrant blue gradient
                    style={styles.buttonGradient}
                >
                    <Text style={styles.buttonText}>Sign In</Text>
                </LinearGradient>
            </TouchableOpacity>

            <View style={styles.signupRow}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <Link href="/sign-up">
                    <Text style={styles.signupLink}>Sign Up</Text>
                </Link>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#D1D5DB',
        textAlign: 'center',
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 24,
    },
    input: {
        backgroundColor: '#1F2937', // Dark neumorphic base
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#374151',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5, // For Android shadow
    },
    button: {
        borderRadius: 12,
        overflow: 'hidden', // Ensure gradient stays within bounds
        marginBottom: 24,
    },
    buttonGradient: {
        padding: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    signupRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        color: '#D1D5DB',
        fontSize: 14,
    },
    signupLink: {
        color: '#60A5FA',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});