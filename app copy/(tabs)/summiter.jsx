import { Ionicons } from "@expo/vector-icons";
import { Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import { useSignOut } from "../(auth)/signout";
import { useApp } from '../contextUser';
import PrivateKeyImport from "../../components/importprivatekey";
export default function ProfileScreen() {
    const { userx, setUserx } = useApp();
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
                        <Text style={{ color: "white", fontSize: 26 }}>{username.substring(0, 1)}</Text>
                    </View>

                    <Text style={styles.username}>{username}</Text>

                    <View style={styles.row}>
                        <Text style={styles.userId}>{userId}</Text>
                        <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                            <Ionicons name="share-social-outline" size={18} color="#000703ff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- QR Card --- */}
                <View style={styles.qrCard}>
                    <QRCode
                        value={walletAddress}
                        size={200}
                        color="white"
                        backgroundColor="transparent"
                    />



                    <Text style={styles.walletText}>{walletAddress}</Text>

                    <Text style={styles.warningText}>
                        Your wallet address will change on every receipt
                    </Text>

                    {/* Actions */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Ionicons name="copy-outline" size={22} color="#000" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionBtn}>
                            <Ionicons name="share-outline" size={22} color="#000" />
                        </TouchableOpacity>

                    </View>
                </View>

                {/* LOG OUT */}
                <TouchableOpacity style={styles.logoutBtn} onPress={signOutUser}>
                    <Text style={{ color: "white", fontWeight: "bold" }}>Log Out</Text>
                </TouchableOpacity>

            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, alignItems: "center" },

    profileHeader: { alignItems: "center", marginBottom: 30 },
    profileCircle: {
        width: 90,
        height: 90,
        backgroundColor: "#000",
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10
    },
    username: { fontSize: 21, fontWeight: "700", color: "#000" },
    userId: {
        fontSize: 15, color: "#555", textAlign: "center",
    },

    row: { flexDirection: "row", alignItems: "center", gap: 8 },
    iconBtn: {
        padding: 5,
        backgroundColor: "#e6e6e6",
        borderRadius: 50
    },

    qrCard: {
        padding: 20,
        backgroundColor: "#0E1F2F",
        borderRadius: 20,
        alignItems: "center",
        width: "100%"
    },

    selectorRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 20
    },

    selectorBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: "#1c2d3f"
    },

    selectorActive: {
        backgroundColor: "#007AFF"
    },

    walletText: {
        color: "white",
        marginTop: 15,
        fontSize: 15,
        textAlign: "center",
    },

    warningText: {
        color: "#aaa",
        marginTop: 6,
        fontSize: 12
    },

    actionRow: {
        flexDirection: "row",
        gap: 20,
        marginTop: 20
    },

    actionBtn: {
        padding: 12,
        backgroundColor: "white",
        borderRadius: 50
    },

    logoutBtn: {
        marginTop: 40,
        backgroundColor: "red",
        padding: 15,
        width: "90%",
        borderRadius: 12,
        alignItems: "center"
    }
});
