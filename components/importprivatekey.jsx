import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useUser } from "@clerk/clerk-react";
import { useApp } from '../app/contextUser';
import PinVerification from './pin';
import { Keypair } from "stellar-sdk";
import ConfirmationMessage from "./ConfimationComponent";
const { executionImport } = require('../self-wallet/wallet');

import { useEffect } from "react";
export default function PrivateKeyImport({ onContinue, onBack }) {
    const { user } = useUser();
    const [privateKey, setPrivateKey] = useState("");
    const [step, setStep] = useState(0);
    const [status, setStatus] = useState(null); // null | "success" | "error".
    const [msg, setMsg] = useState("");
    const [msgAnalys, setMsg2] = useState("");
    const [keyPr, setKey] = useState("");

    const { userx, setUserx, setKeypair } = useApp();

    const [reason, setReason] = useState("");
    const [existUser, setexistUser] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Crea tu PIN para continuar.");
    const [Result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        setMsg2("");
    }, [privateKey]);
    const steps = [
        {
            title: "Welcome",
            description: "Register your account quickly and securely.",
            image: "",
        },
        {
            title: "Download Wallet",
            description: "Install our wallet app to continue.",
            image: "",
        },
        {
            title: "Import Private Key",
            description: "Paste your private key in the box to restore your account.",
            image: "",
        },

        {
            title: "Create PIN",
            description: "Set a PIN to keep your wallet secure.",
            image: "",
        },
        {
            title: "",
            description: "",
            image: "",
        },
        {
            title: "Done!",
            description: "App is ready to use.",
            image: "",
        },
    ];


    /* <PinVerification
mode="register"
onComplete={handlePinComplete}
/>*/
    const onAnalyze = (key) => {
        // Here you can add logic to analyze the private key
        try {
            const keypairUser = Keypair.fromSecret(key);
            setKeypair(keypairUser);
            console.log("Public Key:", keypairUser.publicKey());
            setStep(step + 1);
            setKey(key);
        } catch (error) {
            setMsg2("Private key incorrecta");
        }
    }
    const handlePinComplete = async (pin) => {
        // Call the wallet creation function with the PIN as password
        console.log("PIN set to:");
        setLoadingMessage("Importing wallet...");
        const { publicKey, keystore, id_app, secrect } = await executionImport(keyPr, pin);
        console.log("keystore:", keystore);
        console.log("id_app:", id_app);
        console.log("Public Key:", publicKey);




        try {
            const response = await fetch('http://192.168.1.2:8383/api/usersave', {
                method: 'POST', // must be POST to send body
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_user: user.id, pub_key: publicKey, pr_code: keystore, tokenNotification: "x", username: user.firstName, user_email: user.emailAddresses[0].emailAddress, id_app: id_app }), // send your user ID here
            });

            if (!response.ok) {
                console.error('Server responded with error:', response.status);
                return;
            }
            const data = await response.json();
            console.log('User data saved successfully:', data);
            setStatus("success");
            setStep(step + 1);
            setUserx(data);


        } catch (error) {
            console.error('Error fetching user data:', error);
        }

        // Here you can call your create account function
    };

    return (
        <>

            {
                step == 4 && (
                    <PinVerification
                        mode="register"
                        status={status}

                        message={loadingMessage}
                        onComplete={handlePinComplete}

                    />
                )
            }
            {
                !isLoading && step != 4 && (
                    <View style={styles.container}>
                        <View style={styles.imageContainer}>

                        </View>

                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{steps[step].title}</Text>
                            <Text style={styles.description}>{steps[step].description}</Text>
                            {step == 2 && (
                                <View style={styles.container3}>
                                    {/* Title */}
                                    <Text style={styles.warning}>
                                        {msgAnalys}
                                    </Text>
                                    {/* Input Box */}
                                    <TextInput
                                        style={styles.input

                                        }
                                        placeholder="Paste your private key here"
                                        placeholderTextColor="#999"
                                        multiline={true}
                                        value={privateKey}
                                        onChangeText={setPrivateKey}
                                    />

                                    {/* Continue Button */}
                                    <TouchableOpacity
                                        style={[
                                            styles.continueBtn,
                                            privateKey.length < 10 && { opacity: 0.4 }
                                        ]}
                                        disabled={privateKey.length < 10}
                                        onPress={() => onAnalyze(privateKey)}
                                    >
                                        <Text style={styles.continueText}>Analizar</Text>
                                    </TouchableOpacity>

                                    <Text style={styles.warning}>
                                        {msgAnalys}
                                    </Text>

                                    {/* Safety Notice */}
                                    <Text style={styles.warning}>
                                        Never share your private key with anyone.
                                        Keep it safe and secure.
                                    </Text>
                                </View>)}
                        </View>

                        <View style={styles.bottomBar}>
                            <TouchableOpacity onPress={() => onBack()}>
                                <Text style={styles.skipText}>Skip</Text>
                            </TouchableOpacity>

                            <View style={styles.dotsContainer}>
                                {steps.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.dot,
                                            step === index && styles.activeDot,
                                        ]}
                                    />
                                ))}
                            </View>

                            {step != 2 && step != 5 && (<TouchableOpacity
                                onPress={() => step < steps.length - 1 && setStep(step + 1)}
                                style={styles.nextButton}
                            >
                                <Text style={styles.nextArrow}>→</Text>
                            </TouchableOpacity>)}
                            {step == 5 && (<TouchableOpacity
                                onPress={() => onContinue()}
                                style={styles.nextButton}
                            >
                                <Text style={styles.nextArrow}>→</Text>
                            </TouchableOpacity>)}
                        </View>
                    </View>
                )}


        </>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0D0D0D",
        padding: 24,
        justifyContent: "space-between",
    },

    /* IMAGE */
    imageContainer: {
        alignItems: "center",
        marginTop: 40,
    },

    image: {
        width: 220,
        height: 220,
        resizeMode: "contain",
    },

    /* TEXT AREA */
    textContainer: {
        marginTop: 10,
    },

    title: {
        color: "#FFF",
        fontSize: 30,
        fontWeight: "800",
        marginBottom: 10,
        letterSpacing: 0.3,
    },

    description: {
        color: "#6B7280",
        fontSize: 16,
        lineHeight: 22,
        fontWeight: "500",
    },

    /* INPUT + ANALYZE CARD */
    container3: {
        marginTop: 20,

        alignItems: "center",
    },

    input: {
        width: "100%",
        height: 160,
        borderWidth: 1,
        borderRadius: 14,
        borderColor: "#333",
        padding: 14,
        fontSize: 16,
        textAlignVertical: "top",
        marginBottom: 18,
        marginTop: 16,
        backgroundColor: "#1E1E1E",
        color: "#FFF",
    },

    continueBtn: {
        width: "100%",
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#35D787",
        alignItems: "center",
        elevation: 4,
    },

    continueText: {
        color: "#000",
        fontSize: 18,
        fontWeight: "700",
    },

    warning: {
        marginTop: 14,
        fontSize: 13,
        color: "#ff4d4d",
        textAlign: "center",
        width: "95%",
        fontWeight: "600",
    },

    /* BOTTOM BAR */
    bottomBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },

    skipText: {
        color: "#6B7280",
        fontSize: 16,
        fontWeight: "600",
    },

    dotsContainer: {
        flexDirection: "row",
        gap: 6,
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 50,
        backgroundColor: "rgba(255,255,255,0.25)",
    },

    activeDot: {
        backgroundColor: "#35D787",
        width: 22,
        height: 8,
        borderRadius: 6,
    },

    nextButton: {
        backgroundColor: "#161616",
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#333",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },

    nextArrow: {
        fontSize: 22,
        color: "#35D787",
        fontWeight: "900",
    },
});

