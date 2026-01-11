import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSignOut } from "../(auth)/signout";
import PrivateKeyImport from "../../components/importprivatekey";
import { supabase } from "../../lib/supabase";
import { useApp } from '../contextUser';

export default function ProfileScreen() {
    const { userx, setUserx, setKeypair } = useApp();
    const [importPkey, setImport] = useState(false);
    const walletAddress = userx ? userx[0]?.pub_key : 'N/A'; // dynamic
    const username = userx ? userx[0]?.username : '?';
    const userId = userx ? userx[0]?.id_app : 'N/A';
    const { signOutUser } = useSignOut();
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    useEffect(() => {
        const load = async () => {
            try {
                console.log("User ID in Rooms:", !userx ? userx[0]?.position : "no");
                if (userx != null) {
                    if (!userx[0]?.pub_key) {
                        setImport(true);
                    } else {

                    }
                }
            } catch (e) {
                console.log("in summiter error:", e);
            }
        };
        load();


    }, []);
    const handleDeleteAccount = async () => {

        try {

            const response = await fetch('https://trustappbackendlive-production.up.railway.app/deleteUser', {
                method: 'POST', // must be POST to send body
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_user: userx[0].user_id }), // send your user ID here
            });

            if (!response.ok) {
                console.log('Server responded with error:', response.status);
                return;
            }
            const data = await response.json();
            await supabase.auth.signOut();
            await supabase.auth.admin.deleteUser(userx[0].user_id);
            console.log('User data deleted successfully:', data);
            setUserx([])
            setKeypair()
            router.push({
                pathname: "/sign-in",

            })


        } catch (error) {
            console.log('Error fetching user data:', error);
        }
    }
    const handleShare = async () => {
        try {
            await Share.share({
                message: `${userx ? userx[0].id_app : 'N/A'}`,
            });
        } catch (error) {
            console.log("Error sharing:", error);
        }
    };
    const handleShareAddress = async () => {
        try {
            await Share.share({
                message: `${userx ? userx[0]?.pub_key : 'N/A'}`,
            });
        } catch (error) {
            console.log("Error sharing:", error);
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
                {/* Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Estas seguro?</Text>
                            <Text style={styles.modalText}>
                                Esta accion eliminara permanentemente tu cuenta.
                            </Text>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelText}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.deleteConfirmButton]}
                                    onPress={handleDeleteAccount}
                                >
                                    <Text style={styles.deleteConfirmText}>Eliminar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* --- Profile Header --- */}
                <View style={styles.profileHeader}>
                    <View style={styles.profileCircle}>
                        <Text style={{ color: "white", fontSize: 26 }}>
                            {username ? username.substring(0, 1) : "?"}
                        </Text>
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
                        Este identificador puede actualizarse periódicamente para mayor seguridad.
                    </Text>

                    {/* Actions */}
                    <View style={styles.actionRow}>

                        <TouchableOpacity onPress={handleShareAddress} style={styles.actionBtn}>
                            <Ionicons name="share-outline" size={22} color="#35D787" />
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Row for both buttons */}
                <View style={styles.accountRow}>

                    {/* Log Out */}
                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={() => { supabase.auth.signOut(); setKeypair(null); }}
                    >
                        <Text style={styles.logoutTxt}>Cerrar sesión</Text>
                    </TouchableOpacity>

                    {/* Delete Account */}
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.deleteTxt}>Eliminar cuenta</Text>
                    </TouchableOpacity>

                </View>

            </View>

        );
    }

}

const styles = StyleSheet.create({
    deleteButton: {
        backgroundColor: "#FF4D4F",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    deleteButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    modalText: { fontSize: 15, textAlign: "center", marginBottom: 20 },
    buttonRow: { flexDirection: "row", justifyContent: "space-between" },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        marginHorizontal: 5,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelButton: { backgroundColor: "#ccc" },
    deleteConfirmButton: { backgroundColor: "#FF4D4F" },
    cancelText: { color: "#000", fontWeight: "bold" },
    deleteConfirmText: { color: "#fff", fontWeight: "bold" },

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



    accountRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
        paddingHorizontal: 10,
    },

    logoutBtn: {
        backgroundColor: "#35D787",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
    },

    logoutTxt: {
        color: "white",
        fontWeight: "bold",
    },

    deleteBtn: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
    },

    deleteTxt: {
        color: "#5f1e1eff",
        opacity: 0.7,        // menos resaltado
        fontWeight: "600",   // menos fuerte que bold
    },
});


