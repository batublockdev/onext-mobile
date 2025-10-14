import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Keypair } from "stellar-sdk";
import ConfirmationMessage from "../components/ConfimationComponent";
import { ERROR_MESSAGES } from "../components/error";
import PinVerification from "../components/pin";
import { teamLogos } from "../components/teamLogos";
import { useApp } from "./contextUser";
const {
    place_bet,
    set_private_bet,
    claim,
    setGame,
} = require("../SmartContract/smartcontractOperation");
const { decryptOnly } = require('../self-wallet/wallet');


export default function MatchDetails() {
    const { match } = useLocalSearchParams();
    const router = useRouter();
    const [step, setStep] = useState(1); // 1 = add users, 2 = set bet
    const [users, setUsers] = useState([]);
    const [usersPubk, setUsersPubk] = useState([]);
    const parsedMatch = JSON.parse(match);
    const [status, setStatus] = useState(null); // null | "success" | "error"
    const [reason, setReason] = useState(null);
    const [minBet, setMinBet] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(false);


    const [loadingMessage, setLoadingMessage] = useState('...');
    const { userx, setUserx } = useApp();
    const [roomCode, setRoomCode] = useState("");

    function parseContractError(error) {
        const match = String(error).match(/Error\(Contract, #(\d+)\)/);
        if (match) {
            const code = parseInt(match[1]);
            const reason = ERROR_MESSAGES[code] || `Unknown error (code ${code})`;
            return { code, reason };
        }
        return { code: null, reason: "Unexpected error occurred." };
    }
    const handleAddUser = async () => {
        const newUser = {
            id: Date.now().toString(),
            name: `User ${users.length + 1}`,
            code: roomCode,
            played: false,
        };
        setIsLoadingUser(true);
        if (!roomCode.trim()) {
            alert("Please enter a user code.");
            setIsLoadingUser(false);
            return;
        }
        try {
            const response = await fetch('http://192.168.1.8:8383/api/userapp', {
                method: 'POST', // must be POST to send body
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_app: roomCode }), // send your user ID here
            });

            if (!response.ok) {
                console.error('Server responded with error:', response.status);
                return;
            }

            const data = await response.json();
            console.log('Fetched user data:', data);



            if (!data || (Array.isArray(data) && data.length === 0)) {
                console.log('No user data found');
                setexistUser(false);

            } else {
                newUser.name = data[0].username;
                newUser.id = data[0].user_id;
                newUser.code = data[0].id_app;
                setUsers((prev) => [...prev, newUser]);
                setUsersPubk((prev) => [...prev, data[0].pub_key]);
            }

        } catch (error) {
            console.error('Error fetching user data:', error);
        }


        setRoomCode("");
        setIsLoadingUser(false);

    };
    const handleNextStep = () => {
        if (users.length < 1) {
            alert("Add at least 1 users before creating the room.");
            return;
        }
        setStep(2);
    };

    // Simulate room creation (you'll replace this with backend call)
    const handleCreateRoom = async (pin) => {



        try {
            const description = `${parsedMatch.local_team_name} vs ${parsedMatch.away_team_name}`;
            const endTime = Math.floor(new Date(parsedMatch.end_time).getTime() / 1000);
            const startTime = Math.floor(new Date(parsedMatch.start_time).getTime() / 1000);
            const id_setting = Math.floor(100000 + Math.random() * 900000).toString();
            const id_gamex = Math.floor(100000 + Math.random() * 900000).toString();




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
            const plusOne7minUTC = new Date(nowUTC.getTime() + 420 * 1000);
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
            const keyUser = await decryptOnly(userx[0].encrypted_data, pin);
            const keypairUser = Keypair.fromRawEd25519Seed(keyUser.key);
            //setLoadingMessage("Creating private bet settings...");
            try {
                await setGame(description, timeEndstampForStellar, id_game, "200", timeStartstampForStellar, team_away, team_local);
            } catch (err) {
                const { reason, code } = parseContractError(err);
                if (code === 210) {
                    console.log("Game already set, proceeding...");
                } else {
                    throw err;
                }
            }
            setLoadingMessage("creating private bet settings...");

            await set_private_bet(minBet, id_game, description, keypairUser.publicKey(), id_setting, keypairUser, usersPubk);
            try {
                const response = await fetch('http://192.168.1.8:8383/api/insertrooms', {
                    method: 'POST', // must be POST to send body
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_user: userx[0].user_id, id_room: id_setting, start_time: nowUTC2, finish_time: nowUTC3, title: description, active: false, id_game: parsedMatch.match_id, minBet: minBet, users: users }), // send your user ID here
                });

                if (!response.ok) {
                    console.error('Server responded with error:', response.status);
                    return;
                }
                const data = await response.json();
                console.log('User data saved successfully:', data);


            } catch (error) {
                console.error('Error fetching user data:', error);
            }
            // Simulate returned code from backend

            setLoadingMessage("Room created successfully 🎉");
            setStatus("success");
            setRoomCode(id_setting);
        } catch (error) {
            if (error == "Invalid password or corrupted keystore") {
                setStatus("error");
                setReason(reason);
            } else {
                console.error("Error creating room:", error);
                const { reason, code } = parseContractError(error);

                setStatus("error");
                setReason(reason);
            }

        } finally {
            setIsLoading(false);
            setUsers([]);
            setUsersPubk([]);
            setStep(1);
            setMinBet("");
        }
    };



    const handleBeFirstToBet = () => {
        // Navigate to betting screen with roomCode + match info

        router.push({
            pathname: "/specificRoom",
            params: {
                room_id: roomCode,
            },
        })


    };
    if (isLoading) {
        return (<PinVerification
            mode="verify"
            message={loadingMessage}
            onComplete={handleCreateRoom}
        />)
    }
    else {
        return (
            <View style={styles.container}>
                {step === 1 ? (
                    <>
                        <Text style={styles.title}> Add Users to the Room</Text>
                        <Text style={styles.description}>
                            Enter the code of each participant to add them to this betting room.
                            After adding all users, click “Continue to Room Setup”.
                        </Text>

                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Enter User Code:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. USER123"
                                value={roomCode}
                                onChangeText={setRoomCode}
                                autoCapitalize="characters"
                            />
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={handleAddUser}
                            >
                                {isLoadingUser ? (
                                    <View style={{ alignItems: "center" }}>
                                        <ActivityIndicator color="#fff" />
                                        <Text
                                            style={{ color: "#fff", marginTop: 6, fontSize: 14 }}
                                        >
                                            {loadingMessage}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={styles.addButtonText}>Add User</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {users.length > 0 && (
                            <View style={styles.usersCard}>
                                <Text style={styles.label}>Users Added:</Text>
                                <FlatList
                                    data={users}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <View style={styles.userCard}>
                                            <Text style={styles.userName}>{item.name}</Text>
                                            <Text style={styles.userCode}>{item.code}</Text>
                                        </View>
                                    )}
                                />
                            </View>
                        )}

                        {users.length > 0 && (
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={handleNextStep}
                            >
                                <Text style={styles.createButtonText}>
                                    Continue to Room Setup
                                </Text>
                            </TouchableOpacity>
                        )}
                    </>
                ) : (
                    <>
                        <Text style={styles.title}>⚽ Step 2: Set Room Bet and Create Room</Text>
                        <Text style={styles.description}>
                            Review the match details and set the minimum bet amount that all
                            participants must contribute.
                        </Text>

                        {/* Match info */}
                        <View style={styles.matchCard}>
                            <View style={styles.teamRow}>
                                <View style={styles.team}>
                                    <Image
                                        source={teamLogos[parsedMatch.local_team_logo]}
                                        style={styles.logo}
                                    />
                                    <Text style={styles.teamName}>
                                        {parsedMatch.local_team_name}
                                    </Text>
                                </View>
                                <Text style={styles.vsText}>VS</Text>
                                <View style={styles.team}>
                                    <Image
                                        source={teamLogos[parsedMatch.away_team_logo]}
                                        style={styles.logo}
                                    />
                                    <Text style={styles.teamName}>
                                        {parsedMatch.away_team_name}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.dateText}>
                                {new Date(parsedMatch.start_time).toLocaleString()}
                            </Text>
                        </View>

                        <View style={styles.inputSection}>
                            <Text style={styles.label}>Set Minimum Bet Amount:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 1000"
                                value={minBet}
                                onChangeText={setMinBet}
                                keyboardType="numeric"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.createButton, isLoading && styles.disabledButton]}
                            onPress={() => setIsLoading(true)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <View style={{ alignItems: "center" }}>
                                    <ActivityIndicator color="#fff" />
                                    <Text
                                        style={{ color: "#fff", marginTop: 6, fontSize: 14 }}
                                    >
                                        {loadingMessage}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.createButtonText}>Create Room</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}
                {
                    status && (
                        <ConfirmationMessage
                            success={status === "success"}
                            message={
                                status === "success"
                                    ? "Operation complete successfully!"
                                    : "Operation failed."
                            }
                            reason={reason}
                            onClose={() => setStatus(null)}
                        />
                    )
                }
            </View>
        );


    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        color: "#6B7280",
        marginBottom: 20,
        lineHeight: 20,
    },
    inputSection: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 10,
    },
    input: {
        backgroundColor: "#F3F4F6",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: "#111827",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    addButton: {
        backgroundColor: "#10B981",
        borderRadius: 10,
        paddingVertical: 12,
        marginTop: 12,
        alignItems: "center",
    },
    addButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    usersCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    userCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#F9FAFB",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    userName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },
    userCode: {
        fontSize: 14,
        color: "#6B7280",
    },
    matchCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
    },
    teamRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    team: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    logo: {
        width: 45,
        height: 45,
        borderRadius: 50,
        marginRight: 10,
    },
    teamName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },
    vsText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#6B7280",
        marginHorizontal: 12,
    },
    dateText: {
        textAlign: "center",
        color: "#6B7280",
        fontSize: 14,
        fontWeight: "500",
        marginTop: 6,
    },
    createButton: {
        backgroundColor: "#2563EB",
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
        marginTop: 20,
    },
    createButtonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
    },
    disabledButton: {
        opacity: 0.6,
    },
});
