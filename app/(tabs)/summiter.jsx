import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { useSignOut } from "../(auth)/signout";
import PrivateKeyImport from "../../components/importprivatekey";
import { useApp } from '../contextUser';
export default function ProfileScreen() {
    const { userx, setUserx, setKeypair } = useApp();
    const [importPkey, setImport] = useState(false);
    const walletAddress = userx ? userx[0]?.pub_key : 'N/A'; // dynamic
    const username = userx ? userx[0]?.username : '?';
    const userId = userx ? userx[0]?.id_app : 'N/A';
    const { signOutUser } = useSignOut();
    const router = useRouter();

    useEffect(() => {
        console.log("User ID in Rooms:", !userx ? userx[0]?.position : "no");
        if (userx != null) {
            if (!userx[0]?.pub_key) {
                setImport(true);
            } else {

            }
        }

    }, []);
    const handleShare = async () => {
        try {
            await Share.share({
                message: `Manito mira mi id: ${userx ? userx[0].id_app : 'N/A'} meteme a la vaina`,
            });
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };
    if (importPkey) {
        return (
            <PrivateKeyImport
                onContinue={() => setImport(false)}
                onBack={() => router.push({
                    pathname: "/",
                })}
            />
        );
    } else {
        return (
            <View style={styles.container}>

                {/* --- Profile Header --- */}
                <View style={styles.profileHeader}>
                    <View style={styles.profileCircle}>
                        <Text style={{ color: "white", fontSize: 26 }}>{username ? username.substring(0, 1) : "?"}</Text>
                    </View>

                    <Text style={styles.username}>{username}</Text>

                    <View style={styles.row}>
                        <Text style={styles.userId}>{userId}</Text>
                        <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                            <Ionicons name="share-social-outline" size={18} color="#35D787" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- QR Card --- */}
                <View style={styles.qrCard}>
                    <QRCode
                        value={walletAddress}
                        size={200}
                        color="#35D787"
                        backgroundColor="transparent"
                    />



                    <Text style={styles.walletText}>{walletAddress}</Text>

                    <Text style={styles.warningText}>
                        Your wallet address will change on every receipt
                    </Text>

                    {/* Actions */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Ionicons name="copy-outline" size={22} color="#35D787" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionBtn}>
                            <Ionicons name="share-outline" size={22} color="#35D787" />
                        </TouchableOpacity>

                    </View>
                </View>

                {/* LOG OUT */}
                <TouchableOpacity style={styles.logoutBtn} onPress={() => { signOutUser(); setKeypair(null); }}>
                    <Text style={{ color: "white", fontWeight: "bold" }}>Log Out</Text>
                </TouchableOpacity>

            </View>
        );
    }

}

const styles = StyleSheet.create({

    /* MAIN */
    container: {
        flex: 1,
        padding: 20,
        alignItems: "center",
        backgroundColor: "#0A0F14",
    },

    /* HEADER */
    profileHeader: {
        alignItems: "center",
        marginBottom: 30
    },

    profileCircle: {
        width: 90,
        height: 90,
        backgroundColor: "#12171D",  // matches card style
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#1E252D",
    },

    username: {
        fontSize: 21,
        fontWeight: "700",
        color: "#FFFFFF"
    },

    userId: {
        fontSize: 15,
        color: "#9CA3AF",
        textAlign: "center",
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },

    iconBtn: {
        padding: 5,
        backgroundColor: "#12171D",
        borderRadius: 50,
        borderWidth: 1,
        borderColor: "#1E252D",
    },

    /* QR CARD */
    qrCard: {
        padding: 20,
        backgroundColor: "#12171D",
        borderRadius: 20,
        alignItems: "center",
        width: "100%",
        borderWidth: 1,
        borderColor: "#1E252D",
    },

    walletText: {
        color: "#FFFFFF",
        marginTop: 15,
        fontSize: 15,
        textAlign: "center",
    },

    warningText: {
        color: "#9CA3AF",
        marginTop: 6,
        fontSize: 12,
    },

    actionRow: {
        flexDirection: "row",
        gap: 20,
        marginTop: 20,
    },

    actionBtn: {
        padding: 12,
        backgroundColor: "#1A222C",
        borderRadius: 50,
        borderWidth: 1,
        borderColor: "#2A323D",
    },

    /* LOGOUT */
    logoutBtn: {
        marginTop: 40,
        backgroundColor: "#FF6A6A",
        padding: 15,
        width: "90%",
        borderRadius: 12,
        alignItems: "center"
    },
});


