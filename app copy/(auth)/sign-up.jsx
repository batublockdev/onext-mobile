import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp()
    const router = useRouter()
    const [firstName, setFirstName] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [pendingVerification, setPendingVerification] = React.useState(false)
    const [code, setCode] = React.useState('')

    // Handle submission of sign-up form
    const onSignUpPress = async () => {
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
            console.error(JSON.stringify(err, null, 2))
        }
    }

    // Handle submission of verification form
    const onVerifyPress = async () => {
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
                console.error(JSON.stringify(signUpAttempt, null, 2))
            }
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err))
        }
    }

    if (pendingVerification) {
        return (
            <>
                <Text style={styles.title}>Verify your email</Text>
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#9CA3AF"
                    value={code}
                    placeholder="Enter your verification code"
                    onChangeText={(code) => setCode(code)}
                />
                <TouchableOpacity style={styles.button} onPress={onVerifyPress}>
                    <Text>Verify</Text>
                </TouchableOpacity>
            </>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>

            {/* First Name */}
            <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
            />

            {/* Email */}
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={emailAddress}
                autoCapitalize="none"
                onChangeText={setEmailAddress}
            />

            {/* Password */}
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
            />

            {/* Submit */}
            <TouchableOpacity
                style={[styles.button, isLoading && { opacity: 0.7 }]}
                onPress={onSignUpPress}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isLoading ? 'Creating Account...' : 'Continue'}
                </Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signInRow}>
                <Text>Already have an account?</Text>
                <Link href="/sign-in">
                    <Text style={styles.signupLink}> Sign in</Text>
                </Link>
            </View>
        </View>
    );
}

const styles = {
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    button: {
        height: 48,
        backgroundColor: '#4F46E5',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    signInRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
    },
    signupLink: {
        color: '#4F46E5',
        fontWeight: 'bold',
    },
};