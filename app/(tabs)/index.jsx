import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Keypair } from "stellar-sdk";
import { useSignOut } from "../(auth)/signout";
import { sendSep24Deposit } from '../../anchor/walletAnchor';
import DepositComponent from '../../components/buttonSend';
import MatchesScreen from '../../components/game';
import MatchCard from '../../components/MatchCard';

import PinVerification from "../../components/pin";
import { useApp } from '../contextUser';

const HomeScreen = () => {
    const { ensureTrustline, startDeposit } = require('../../anchor/anchor');
    const { decryptOnly } = require('../../self-wallet/wallet');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null); // null | "success" | "error"
    const [USDCBalance, setUSDCBalance] = useState("0"); // null | "success" | "error"
    const [TRUSTBalance, setTRUSTBalance] = useState("0"); // null | "success" | "error"

    const [loadingMessage, setLoadingMessage] = useState('...');
    const [reason, setReason] = useState(null);
    const [depositUrl, setDepositUrl] = useState(null);
    const { signOutUser } = useSignOut();
    const { isSignedIn, user, isLoaded } = useUser();
    const { userx, setUserx } = useApp();
    const StellarSdk = require("stellar-sdk");
    const server = new StellarSdk.Horizon.Server(
        "https://horizon-testnet.stellar.org",
    );
    const USDCasset = new StellarSdk.Asset("USD", "GCJWRFAW62LZB6LTSN57OMBYI6CATVFI3CKM63GSL7GNXIYDOL3J7FPY");
    const TrustAsset = new StellarSdk.Asset("TRUST", "GCJWRFAW62LZB6LTSN57OMBYI6CATVFI3CKM63GSL7GNXIYDOL3J7FPY");

    useEffect(() => {
        UserBalance();
    }, []);
    useEffect(() => {
        UserBalance();
    }, [userx]);
    const UserBalance = async () => {

        if (userx) {
            const account = await server.loadAccount(userx[0].pub_key);
            const assetUsdcBalance = account.balances.find(
                (b) => b.asset_code === USDCasset.getCode() && b.asset_issuer === USDCasset.getIssuer()
            );
            const asseTrustBalance = account.balances.find(
                (b) => b.asset_code === TrustAsset.getCode() && b.asset_issuer === TrustAsset.getIssuer()
            );

            if (assetUsdcBalance) {
                console.log(`${USDCasset.getCode()} balance: ${assetUsdcBalance.balance}`);
                setUSDCBalance(assetUsdcBalance.balance);
            } else {
                console.log(`No ${USDCasset.getCode()} balance found`);
            }
            if (asseTrustBalance) {
                console.log(`${TrustAsset.getCode()} balance: ${asseTrustBalance.balance}`);
                setTRUSTBalance(asseTrustBalance.balance);
            } else {
                console.log(`No ${TrustAsset.getCode()} balance found`);
            }
        }


    };

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

    function Section({ title, children }) {
        return (
            <View style={{ marginTop: 30 }}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    <Text style={styles.sectionShow}>Show All</Text>
                </View>
                <View style={styles.sectionContent}>{children}</View>
            </View>
        );
    }
    const matches = [
        {
            match_id: 1,
            league: "Premier League",
            week: 10,
            team1: "Newcastle",
            team2: "Chelsea",
            logo1: "https://...",
            logo2: "https://...",
            score1: 0,
            score2: 3,
            minute: 83,
            gameState: "final"
        },
        {
            match_id: 2,
            league: "La Liga",
            week: 12,
            team1: "Barcelona",
            team2: "Betis",
            logo1: "https://...",
            logo2: "https://...",
            score1: 0,
            score2: 0,
            minute: 20,
            gameState: "final"
        }
    ];


    const handleDeposit = async (pin) => {
        try {
            const keyUser = await decryptOnly(userx[0].encrypted_data, pin);
            const keypairUser = Keypair.fromRawEd25519Seed(keyUser.key);
            //await ensureTrustline(keypairUser);
            //const url = await startDeposit("USDC", keypairUser);
            const response = await sendSep24Deposit({
                assetCode: "USDC",            // or whatever asset anchor supports
                userKeypair: keypairUser,
                amount: "10",                 // optional, in asset units
                destinationAccount: keypairUser.publicKey, // where funds go
            });
            console.log(response.url);
            setDepositUrl(response.url);
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
    if (status == "sucess") {
        return (
            <DepositComponent depositUrl={depositUrl} />

        )
    }
    else {
        return (
            <ScrollView style={styles.container}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.username}>{user.firstName}</Text>
                            <Text style={styles.userId}>ID: {userx ? userx[0].id_app : 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={styles.headerIcons}>
                        <Text style={styles.icon}>🔍</Text>
                        <Text style={styles.icon}>🔄</Text>
                    </View>
                </View>

                {/* Total Bets */}
                <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>Saldo</Text>
                    <Text style={styles.totalValue}>{parseFloat(USDCBalance).toFixed(2)}</Text>
                    <Text style={styles.totalChange}>{parseFloat(TRUSTBalance).toFixed(2)}</Text>
                </View>

                {/* Buttons */}
                <View style={styles.buttonsRow}>
                    <TouchableOpacity style={styles.lightBtn}>
                        <Text style={styles.lightBtnText}>Deposit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.darkBtn}>
                        <Text style={styles.darkBtnText}>Withdraw</Text>
                    </TouchableOpacity>
                </View>

                {/* My Matches */}
                <Section title="My Matches">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
                        {matches.map((m) => (
                            <MatchCard key={m.match_id} data={m} />
                        ))}
                    </ScrollView>

                </Section>

                {/* Watchlist */}
                <Section title="Watchlist">
                    <MatchesScreen />
                </Section>

            </ScrollView>

        );

    }
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#f6f8fa",
        padding: 20,
    },

    /* Header */
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 30,
    },
    username: {
        color: "#222",
        fontSize: 18,
        fontWeight: "700",
    },
    userId: {
        color: "#777",
        fontSize: 12,
    },
    headerIcons: {
        flexDirection: "row",
    },
    icon: {
        fontSize: 22,
        marginLeft: 15,
        color: "#444",
    },

    /* Total */
    totalBox: {
        marginTop: 20,
        alignItems: "center",
    },
    totalLabel: {
        color: "#777",
        fontSize: 14,
    },
    totalValue: {
        color: "#000",
        fontSize: 34,
        fontWeight: "800",
        marginTop: 5,
    },
    totalChange: {
        color: "#0bbf63",
        fontSize: 14,
        marginTop: 5,
    },

    /* Buttons */
    buttonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 25,
    },
    lightBtn: {
        backgroundColor: "#e9ecef",
        width: "48%",
        padding: 14,
        borderRadius: 15,
        alignItems: "center",
    },
    darkBtn: {
        backgroundColor: "#000",
        width: "48%",
        padding: 14,
        borderRadius: 15,
        alignItems: "center",
    },
    lightBtnText: {
        color: "#000",
        fontWeight: "600",
    },
    darkBtnText: {
        color: "#fff",
        fontWeight: "600",
    },

    /* Section */
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111",
    },
    sectionShow: {
        color: "#0bbf63",
        fontWeight: "600",
    },
    sectionContent: {
        marginTop: 15,
    },

    /* Match Card */
    matchCard: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    matchTeam: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    matchCenter: {
        alignItems: "center",
    },
    matchTime: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0bbf63",
    },
    matchDate: {
        color: "#999",
        fontSize: 12,
    },

    /* Watchlist */
    watchCard: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 16,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    watchTeam: {
        fontSize: 17,
        fontWeight: "700",
        color: "#333",
    },
    watchOdds: {
        fontSize: 20,
        marginTop: 5,
        color: "#000",
        fontWeight: "700",
    },
    watchChange: {
        marginTop: 4,
        color: "#0bbf63",
        fontWeight: "600",
    },
});


export default HomeScreen