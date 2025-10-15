import { useUser } from "@clerk/clerk-react";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Keypair } from "stellar-sdk";
import { useSignOut } from "../(auth)/signout";
import { DepositComponent } from '../../components/buttonSend';
import MatchesScreen from '../../components/game';
import PinVerification from "../../components/pin";
import { useApp } from '../contextUser';
const HomeScreen = () => {
    const { ensureTrustline, startDeposit } = require('../../anchor/anchor');
    const { decryptOnly } = require('../../self-wallet/wallet');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null); // null | "success" | "error"
    const [loadingMessage, setLoadingMessage] = useState('...');
    const [reason, setReason] = useState(null);
    const [depositUrl, setDepositUrl] = useState(null);
    const { signOutUser } = useSignOut();
    const { isSignedIn, user, isLoaded } = useUser();
    const { userx, setUserx } = useApp();


    function parseContractError(error) {
        const match = String(error).match(/Error\(Contract, #(\d+)\)/);
        if (match) {
            const code = parseInt(match[1]);
            const reason = ERROR_MESSAGES[code] || `Unknown error (code ${code})`;
            return { code, reason };
        }
        return { code: null, reason: "Unexpected error occurred." };
    }
    const handleShare = async () => {
        try {
            await Share.share({
                message: `Here’s my player ID: ${userx ? userx[0].id_app : 'N/A'}. Join me in the game!`,
            });
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };
    const handleDeposit = async (pin) => {
        try {
            const keyUser = await decryptOnly(userx[0].encrypted_data, pin);
            const keypairUser = Keypair.fromRawEd25519Seed(keyUser.key);
            await ensureTrustline(keypairUser);
            const url = await startDeposit("USDC", keypairUser);
            setDepositUrl(url);
            setStatus("sucess")
            setIsLoading(false);
        } catch (error) {
            console.log("error", error);
            const { reason, code } = parseContractError(error);
            console.log("error", code);
            setStatus("error");
            setReason(reason);
            setIsLoading(false);
            return;
        }
    };
    if (isLoading) {
        return (<PinVerification
            mode="verify"
            message={loadingMessage}
            onComplete={handleDeposit}

        />);
    }
    if (status == "sucesss") {
        return (
            <DepositComponent depositUrl={depositUrl} />

        )
    }

    else {
        return (
            <View style={styles.card}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.playerName}>{user.firstName}, ¿cómo vas?</Text>
                        <Text style={styles.userId}>ID: {userx ? userx[0].id_app : 'N/A'}</Text>
                    </View>

                    <View style={styles.rightHeader}>
                        <Text style={styles.pointsText}>Points: 29</Text>
                        <Text style={styles.ranking}>#5</Text>
                    </View>
                </View>

                {/* Share & Sign Out Row */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                        <Ionicons name="share-social-outline" size={18} color="#fff" />
                        <Text style={styles.shareText}>Share ID</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.signOutButton} onPress={signOutUser}>
                        <Ionicons name="log-out-outline" size={18} color="#fff" />
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>

                {/* Balances */}
                <View style={styles.balanceContainer}>
                    <View style={styles.balanceBox}>
                        <Text style={styles.balanceLabel}>USD</Text>
                        <Text style={styles.balanceValue}>0.02</Text>
                    </View>
                    <View style={styles.balanceBox}>
                        <Text style={styles.balanceLabel}>Trust</Text>
                        <Text style={styles.balanceValue}>0.08</Text>
                    </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttonsRow}>
                    <TouchableOpacity style={styles.button} onPress={() => setIsLoading(true)}>
                        <Text style={styles.buttonText}>Deposit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Withdraw</Text>
                    </TouchableOpacity>
                </View>

                {/* Games List */}
                <MatchesScreen />
            </View>
        );

    }
}
const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        padding: 25,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    playerName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1f2937",
    },
    userId: {
        fontSize: 13,
        color: "#6b7280",
        marginTop: 2,
    },
    rightHeader: {
        alignItems: "flex-end",
    },
    pointsText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2563eb",
    },
    ranking: {
        fontSize: 14,
        color: "#9ca3af",
    },
    actionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15,
    },
    shareButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#10b981",
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    shareText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 6,
    },
    signOutButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ef4444",
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    signOutText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 6,
    },
    balanceContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: 20,
    },
    balanceBox: {
        backgroundColor: "#f9fafb",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
        flex: 1,
        marginHorizontal: 6,
    },
    balanceLabel: {
        fontSize: 14,
        color: "#6b7280",
    },
    balanceValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    buttonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    button: {
        flex: 1,
        backgroundColor: "#3b82f6",
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: "center",
        marginHorizontal: 6,
    },
    buttonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
});

export default HomeScreen