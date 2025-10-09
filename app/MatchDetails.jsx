import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Keypair } from "stellar-sdk";
import PinVerification from "../components/pin";
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
    const parsedMatch = JSON.parse(match);

    const [minBet, setMinBet] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Please enter pin to continue...');
    const { userx, setUserx } = useApp();
    const [roomCode, setRoomCode] = useState(null);
    // Simulate room creation (you'll replace this with backend call)
    const handleCreateRoom = async (pin) => {



        try {
            // Simulate async backend call

            // Simulate returned code from backend
            const description = `${parsedMatch.local_team_name} vs ${parsedMatch.away_team_name}`;
            const endTime = Math.floor(new Date(parsedMatch.end_time).getTime() / 1000);
            const startTime = Math.floor(new Date(parsedMatch.start_time).getTime() / 1000);
            const id_setting = Math.floor(100000 + Math.random() * 900000).toString();
            const id_game = Math.floor(100000 + Math.random() * 900000).toString();
            console.log("Match ID:", id_game);
            const team_away = parsedMatch.away_team_id;
            const team_local = parsedMatch.local_team_id;
            setLoadingMessage("Setting game on blockchain...");
            const keyUser = await decryptOnly(userx[0].encrypted_data, pin);
            const keypairUser = Keypair.fromRawEd25519Seed(keyUser.key);
            //await setGame(description, endTime, id_game, "44", startTime, team_away, team_local);
            //setLoadingMessage("Creating private bet settings...");

            await set_private_bet(minBet, "557828", description, keypairUser.publicKey(), id_setting, keypairUser);
            try {
                const response = await fetch('http://192.168.1.8:8383/api/insertrooms', {
                    method: 'POST', // must be POST to send body
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_user: userx[0].user_id, id_room: id_setting, start_time: parsedMatch.start_time, finish_time: parsedMatch.end_time, title: description, active: false }), // send your user ID here
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
            setLoadingMessage("Room created successfully 🎉");

            setRoomCode(id_game);
        } catch (error) {
            alert("Error creating room");
            console.error("Error creating room:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShareCode = async () => {
        try {
            await Share.share({
                message: `Join my betting room for ${parsedMatch.local_team_name} vs ${parsedMatch.away_team_name}!\nRoom Code: ${roomCode}`,
            });
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    const handleBeFirstToBet = () => {
        // Navigate to betting screen with roomCode + match info
        router.push({
            pathname: "/BetRoom",
            params: { match: JSON.stringify(parsedMatch), roomCode },
        });
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
                {/* Match Info */}
                <View style={styles.matchCard}>
                    <View style={styles.teamRow}>
                        <View style={styles.team}>
                            <Image
                                source={{ uri: parsedMatch.local_team_logo }}
                                style={styles.logo}
                            />
                            <Text style={styles.teamName}>{parsedMatch.local_team_name}</Text>
                        </View>
                        <Text style={styles.vsText}>VS</Text>
                        <View style={styles.team}>
                            <Image
                                source={{ uri: parsedMatch.away_team_logo }}
                                style={styles.logo}
                            />
                            <Text style={styles.teamName}>{parsedMatch.away_team_name}</Text>
                        </View>
                    </View>
                    <Text style={styles.dateText}>
                        {new Date(parsedMatch.start_time).toLocaleString()}
                    </Text>
                </View>

                {/* Set Minimum Bet */}
                {!roomCode && (
                    <>
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
                            onPress={() => {
                                if (!minBet || parseFloat(minBet) <= 0) {
                                    alert("Please enter a valid minimum bet amount");
                                    return;
                                }
                                setIsLoading(true)
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <View style={{ alignItems: 'center' }}>
                                    <ActivityIndicator color="#fff" />
                                    <Text style={{ color: '#fff', marginTop: 6, fontSize: 14 }}>
                                        {loadingMessage}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.createButtonText}>Create Room</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}

                {/* Show Room Code + Actions */}
                {roomCode && (
                    <View style={styles.roomCodeBox}>
                        <Text style={styles.roomLabel}>Room Created!</Text>
                        <Text style={styles.roomCode}>{roomCode}</Text>
                        <Text style={styles.roomInfo}>
                            Share this code so others can join your room.
                        </Text>

                        {/* Buttons inside box */}
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.secondaryButton} onPress={handleShareCode}>
                                <Text style={styles.secondaryButtonText}>Share Code</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.primaryButton} onPress={handleBeFirstToBet}>
                                <Text style={styles.primaryButtonText}>Be First to Bet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        );

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        padding: 20,
    },
    matchCard: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 30,
    },
    teamRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    team: {
        alignItems: "center",
    },
    logo: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginBottom: 6,
    },
    teamName: {
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
    vsText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#e63946",
    },
    dateText: {
        textAlign: "center",
        marginTop: 10,
        fontSize: 14,
        color: "#666",
    },
    inputSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    createButton: {
        backgroundColor: "#007AFF",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    createButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    disabledButton: {
        opacity: 0.7,
    },
    roomCodeBox: {
        marginTop: 30,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#007AFF",
    },
    roomLabel: {
        fontSize: 18,
        fontWeight: "700",
        color: "#007AFF",
    },
    roomCode: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#111",
        marginVertical: 10,
    },
    roomInfo: {
        fontSize: 14,
        textAlign: "center",
        color: "#555",
        marginBottom: 16,
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        gap: 10,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: "#eee",
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    secondaryButtonText: {
        fontWeight: "600",
        color: "#333",
    },
    primaryButton: {
        flex: 1,
        backgroundColor: "#007AFF",
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    primaryButtonText: {
        fontWeight: "600",
        color: "#fff",
    },
});
