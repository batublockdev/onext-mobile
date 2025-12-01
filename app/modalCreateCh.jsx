import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import LoadingOverlay from "../components/loadingCompnent";
import { Keypair } from "stellar-sdk";
import ConfirmationMessage from "../components/ConfimationComponent";
import { ERROR_MESSAGES } from "../components/error";
import PinVerification from "../components/pin";
import { teamLogos } from "../components/teamLogos";
import { useApp } from "./contextUser";
const {
    set_private_bet,
    setGame,
} = require("../SmartContract/smartcontractOperation");
const { decryptOnly } = require('../self-wallet/wallet');
export default function BetRoomModal({ visible, onClose, game }) {
    const [friendCode, setFriendCode] = useState("");
    const [friends, setFriends] = useState([]);
    const [usersPubk, setUsersPubk] = useState([]);
    const [users, setUsers] = useState([]);
    const router = useRouter();
    const { userx, keypair } = useApp();
    const [loadingMessage, setLoadingMessage] = useState("");
    const [status, setStatus] = useState(null); // null, 'success', 'error'
    const [reason, setReason] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [minBet, setMinBet] = useState("");
    const [loadingx, setLoadingx] = useState(false);
    const [msgLoading, setMsgLoading] = useState("Cargando");
    const parsedMatch = JSON.parse(game);
    const [friendCodeError, setFriendCodeError] = useState(null);

    console.log("Parsed Match in Modal:", parsedMatch);
    const [amount, setAmount] = useState(0);
    function cleanNumber(value) {
        return Number(
            value.replace(/[.,]/g, "")  // remove dots & commas
        );
    }
    const handleAddFriend = async () => {
        if (!friendCode) {
            setFriendCodeError("Friend code is required");
            return;
        }

        setFriendCodeError(null);
        const newUser = {
            id: Date.now().toString(),
            name: `User ${users.length + 1}`,
            code: roomCode,
            played: false,
        };

        try {
            const response = await fetch('http://192.168.1.2:8383/api/userapp', {
                method: 'POST', // must be POST to send body
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_app: friendCode }), // send your user ID here
            });

            if (!response.ok) {
                console.error('Server responded with error:', response.status);
                return;
            }

            const data = await response.json();
            console.log('Fetched user data:', data);



            if (!data || (Array.isArray(data) && data.length === 0)) {
                console.log('No user data found');
                setFriendCodeError("No se encontro");

            } else {
                if (data[0].pub_key == userx[0].pub_key) {
                    setFriendCodeError("Usa un codico dintisto al tuyo");
                    return

                } else {

                    newUser.name = data[0].username;
                    newUser.id = data[0].user_id;
                    newUser.code = data[0].id_app;
                    setUsers((prev) => [...prev, newUser]);
                    setUsersPubk((prev) => [...prev, data[0].pub_key]);
                    setFriends([...friends, { id: Date.now().toString(), name: data[0].username }]);
                    setFriendCode("");
                }
            }

        } catch (error) {
            console.error('Error fetching user data:', error);
        }


    };
    const handleBeFirstToBet = () => {
        // Navigate to betting screen with roomCode + match info
        console.log("Navigating to specificRoom with roomCode:", roomCode);

        if (status == "success") {
            console.log("Navigating to specificRoom with roomCode:", roomCode);
            router.push({
                pathname: "/specificRoom",
                params: {
                    room_id: roomCode,
                },
            })
            setLoadingx(false);
        } else {
            setLoadingx(false);
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
    const handleCreateRoom = async () => {
        setLoadingx(true);
        setStatus("loading");
        setMsgLoading("Creando salon");

        try {
            const description = `${parsedMatch.local_team_name} vs ${parsedMatch.away_team_name}`;
            const endTime = Math.floor(new Date(parsedMatch.end_time).getTime() / 1000);
            const startTime = Math.floor(new Date(parsedMatch.start_time).getTime() / 1000);





            const nowInColombia = new Date().toLocaleString("es-CO", {
                timeZone: "America/Bogota",
            });
            console.log(nowInColombia);
            // 1️⃣ Current date in UTC
            const nowUTC = new Date();

            // 2️⃣ Display it as Colombia local time
            console.log("Now in Colombia:", nowUTC.toLocaleString("es-CO", { timeZone: "America/Bogota" }));
            //1760212800u32
            //1760212800u32
            // 3️⃣ Add one hour (3600 seconds)
            const plusOne7minUTC = new Date(nowUTC.getTime() + 220 * 1000);
            const plusOne14minUTC = new Date(nowUTC.getTime() + 840 * 1000);
            console.log(plusOne14minUTC);
            console.log("1760212800");
            const timeEndstampForStellar = Math.floor(plusOne14minUTC.getTime() / 1000);

            const timeStartstampForStellar = Math.floor(plusOne7minUTC.getTime() / 1000);
            console.log(timeStartstampForStellar);
            const nowUTC2 = new Date(plusOne14minUTC);
            const nowUTC3 = new Date(plusOne7minUTC);


            // 2️⃣ Display it as Colombia local time
            console.log("Now in Colombia2:", nowUTC2.toLocaleString("es-CO", { timeZone: "America/Bogota" }));
            // 4️⃣ Display one hour later, still in Colombia time
            console.log("One hour later (Colombia):", plusOne14minUTC.toLocaleString("es-CO", { timeZone: "America/Bogota" }));

            const id_game = parsedMatch.match_id.toString();
            console.log("Match ID:", id_game);
            const team_away = parsedMatch.away_team_id;
            const team_local = parsedMatch.local_team_id;
            setLoadingMessage("Setting game on blockchain...");

            const keypairUser = keypair;
            console.log("Keypair User:", keypairUser);
            //setLoadingMessage("Creating private bet settings...");

            const game = {
                description,
                timeEndstampForStellar,
                id_game,
                leage: "20",
                timeStartstampForStellar,
                team_away,
                team_local
            };
            setMsgLoading("Creando");

            const response = await fetch('http://192.168.1.2:8383/sign-game', {
                method: 'POST', // must be POST to send body
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ game: game }), // send your user ID here
            });

            if (!response.ok) {
                console.error('Server responded with error:', response.status);
                return;
            }
            const data = await response.json();
            console.log('User data saved successfully:', data.signature);
            const sig = Buffer.from(data.signature, "base64");
            setMsgLoading("Enviando a la blockchain");

            try {
                await setGame(description, timeEndstampForStellar, id_game, "20", timeStartstampForStellar, team_away, team_local, sig, keypairUser);
            } catch (err) {
                const { reason, code } = parseContractError(err);
                if (code === 210) {
                    console.log("Game already set, proceeding...");
                } else {
                    throw err;
                }
            }

            setMsgLoading("Enviando");

            setLoadingMessage("creating private bet settings...");
            const responsex = await fetch('http://192.168.1.2:8383/api/next', {
                method: 'GET', // must be POST to send body
            });
            if (!responsex.ok) {
                console.error('Server responded with error:', responsex.status);
                return;
            }
            const dataid = await responsex.json();
            console.log('Next room id:', dataid.nextRoomId);
            console.log("Min bet COP:", cleanNumber(minBet));
            let usd = await getCopToUsd(cleanNumber(minBet));
            console.log("Min bet USD:", usd);
            const MICRO_USD = 10000000; // 1e7

            // Example: min_amount = 7.866644640061674
            const usdMicro = Math.round(usd * MICRO_USD);
            console.log("Min bet in micro USD:", usdMicro);
            usd = usdMicro;
            await set_private_bet(usd, id_game, description, keypairUser.publicKey(), dataid.nextRoomId, keypairUser, usersPubk);
            setMsgLoading("Guardando");

            try {
                const response = await fetch('http://192.168.1.2:8383/api/insertrooms', {
                    method: 'POST', // must be POST to send body
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_user: userx[0].user_id, id_room: dataid.nextRoomId, start_time: nowUTC3, finish_time: nowUTC2, title: description, active: false, id_game: parsedMatch.match_id, minBet: usd, users: users }), // send your user ID here
                });

                if (!response.ok) {
                    console.error('Server responded with error:', response.status);
                    return;
                }
                const data = await response.json();
                console.log('User data saved successfully:', data);


            } catch (error) {
                console.log('Error fetching user data:', error);
            }
            // Simulate returned code from backend

            setLoadingMessage("Room created successfully 🎉");
            setStatus("success");

            setRoomCode(dataid.nextRoomId);
            setMsgLoading("Se el primero");
            setUsers([]);
            setUsersPubk([]);
            setMinBet("");
            setFriends([]);
            setAmount("");
        } catch (error) {
            setMsgLoading("Algo no salio bien");

            if (error == "Invalid password or corrupted keystore") {
                setStatus("error");
                setReason(reason);
            } else {
                console.error("Error creating room:", error);
                const { reason, code } = parseContractError(error);
                const errorMsg =
                    error.message || error.reason || "An unexpected error occurred.";

                setStatus("error");
                setReason(errorMsg);
            }

        }
    };

    const formatCOP = (value) => {
        // remove everything except numbers
        const digits = value.replace(/\D/g, "");

        if (!digits) return "";

        // convert to number
        const numberValue = Number(digits);

        // format with COP
        return new Intl.NumberFormat("es-CO").format(numberValue);
    };
    async function getCopToUsd(cop) {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await res.json();

        const usdToCopRate = data.rates.COP; // how many COP equals 1 USD
        const usd = cop / usdToCopRate;

        console.log(`₱${cop} COP is approximately $${usd.toFixed(2)} USD`);
        return usd;
    }


    const handleClose = () => {
        setFriends([]);
        onClose();
    };

    return (<>

        <Modal visible={visible} animationType="slide" transparent>
            <LoadingOverlay
                visible={loadingx}
                status={status}
                message={msgLoading}
                onAutoClose={() => setLoadingx(false)}
                onClose={handleBeFirstToBet}
            />
            <View style={styles.background}>
                <View style={styles.container}>
                    {/* Close button */}
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeTxt}>✕</Text>
                    </TouchableOpacity>

                    {/* Game title */}
                    <Text style={styles.title}>{parsedMatch.local_team_name} vs {parsedMatch.away_team_name}</Text>

                    {/* Friend code input */}
                    <Text style={styles.label}>Friend Code</Text>
                    <View style={styles.row}>
                        <TextInput
                            style={[
                                styles.input2,
                                friendCodeError && styles.inputError
                            ]}
                            value={friendCode}
                            placeholder="Enter friend code"
                            placeholderTextColor="#999"
                            onChangeText={(value) => {
                                setFriendCode(value);
                                setFriendCodeError(null); // remove error while typing
                            }}
                        />
                        <TouchableOpacity style={styles.addBtn} onPress={handleAddFriend}>
                            <Text style={styles.addBtnTxt}>Add</Text>
                        </TouchableOpacity>
                    </View>

                    {friendCodeError && (
                        <Text style={styles.errorText}>{friendCodeError}</Text>
                    )}

                    {/* Friends list */}
                    <Text style={styles.label}>Friends Added</Text>
                    {/* Friends list */}
                    <FlatList
                        data={friends}
                        keyExtractor={(item) => item.id}
                        style={{ maxHeight: 120 }}
                        renderItem={({ item }) => (
                            <View style={styles.friendItem}>
                                <Text style={styles.friendName}>{item.name}</Text>

                                <TouchableOpacity
                                    onPress={() =>
                                        setFriends(friends.filter((f) => f.id !== item.id))
                                    }
                                >
                                    <Text style={styles.deleteX}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.empty}>No friends added yet</Text>
                        }
                    />

                    {/* Amount box */}
                    <Text style={styles.label}>Amount per person</Text>
                    <TextInput
                        style={styles.input}
                        value={amount}
                        placeholder="$0"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        onChangeText={(text) => {
                            const formatted = formatCOP(text);
                            setAmount(formatted);
                            console.log("Formatted Amount:", formatted);
                            console.log("Raw Input Amount:", text);
                            setMinBet(text);

                        }}
                    />

                    {/* Submit button */}
                    <TouchableOpacity
                        style={[
                            styles.createBtn,
                            (friends.length == 0 || !minBet || !keypair) && styles.createBtnDisabled
                        ]}
                        onPress={handleCreateRoom}
                        disabled={(friends.length == 0 || !minBet || !keypair)}
                    >
                        <Text style={styles.createBtnTxt}>Crear salon</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    </>

    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.65)",
        justifyContent: "flex-end",
    },

    container: {
        backgroundColor: "#12171D",
        padding: 24,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,

        borderWidth: 1,
        borderColor: "#1E252D",

        shadowColor: "#000",
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
        elevation: 10,
    },

    /* close button */
    closeBtn: {
        alignSelf: "flex-end",
        backgroundColor: "#0F1419",
        padding: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#1E252D",
    },

    closeTxt: {
        fontSize: 18,
        color: "#9CA3AF",
        fontWeight: "700",
    },

    /* title */
    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 20,
        textAlign: "center",
        color: "#FFFFFF",
    },

    /* labels */
    label: {
        fontSize: 14,
        color: "#A5ADB4",
        marginTop: 15,
        marginBottom: 5,
        fontWeight: "600",
    },
    createBtnDisabled: {
        backgroundColor: "#474747ff",  // dark and clean
        opacity: 0.4,
    },
    /* main inputs */
    input: {
        width: "100%",
        backgroundColor: "#0F1419",
        padding: 14,
        borderRadius: 12,
        fontSize: 17,
        marginTop: 5,
        color: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#1E252D",
    },

    input2: {
        flex: 1,
        backgroundColor: "#0F1419",
        padding: 14,
        borderRadius: 12,
        fontSize: 17,
        color: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#1E252D",
    },
    inputError: {
        borderColor: "#EF4444", // red neon border
    },

    errorText: {
        color: "#EF4444",
        fontSize: 14,
        marginTop: 6,
        marginLeft: 4,
    },
    row: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 5,
    },

    /* add friend button */
    addBtn: {
        backgroundColor: "#35D787",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 12,
    },

    addBtnTxt: {
        color: "#0F1419",
        fontWeight: "700",
        fontSize: 15,
    },

    /* friend list */
    friendItem: {
        backgroundColor: "#0F1419",
        padding: 12,
        borderRadius: 12,
        marginVertical: 4,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        borderWidth: 1,
        borderColor: "#1E252D",
    },

    friendName: {
        fontSize: 16,
        color: "#FFFFFF",
        fontWeight: "500",
    },

    deleteX: {
        fontSize: 18,
        color: "#FF6A6A",
        paddingHorizontal: 6,
    },

    empty: {
        color: "#7B828A",
        fontStyle: "italic",
        marginTop: 10,
        textAlign: "center",
    },

    /* CREATE ROOM button */
    createBtn: {
        backgroundColor: "#35D787",
        paddingVertical: 15,
        borderRadius: 16,
        marginTop: 25,
    },

    createBtnTxt: {
        color: "#0F1419",
        textAlign: "center",
        fontWeight: "700",
        fontSize: 16,
    },
});


