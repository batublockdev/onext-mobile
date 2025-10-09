import { useUser } from "@clerk/clerk-react";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Keypair } from "stellar-sdk";
import PinVerification from "../components/pin";
import { teamLogos } from "../components/teamLogos";
import { useApp } from "./contextUser";
const {
    place_bet,
    claim,
} = require("../SmartContract/smartcontractOperation");
const { decryptOnly } = require('../self-wallet/wallet');
export default function RoomDetail({ }) {
    const { isSignedIn, user, isLoaded } = useUser();

    const { userx, setUserx } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Verifying PIN...");
    const [selected, setSelected] = useState(null);
    const params = useLocalSearchParams();
    const room = {
        title: params.title,
        local_team_name: params.local_team_name,
        away_team_name: params.away_team_name,
        local_team_logo: params.local_team_logo,
        away_team_logo: params.away_team_logo,
        start_time: params.start_time,
        finish_time: params.finish_time,
        active: params.active === "true" || params.active === true,
        bet: params.bet !== "false" && params.bet !== false,
        users: params.users ? JSON.parse(params.users) : [],
    };
    const bet = async (pin) => {
        console.log("Bet placed on:", selected);
        const keyUser = await decryptOnly(userx[0].encrypted_data, pin);
        const keypairUser = Keypair.fromRawEd25519Seed(keyUser.key);
        const id_bet = Math.floor(100000 + Math.random() * 900000).toString();

        //async function place_bet(address, id_bet, game_id, team, amount, setting, keypairUser) {
        await place_bet(userx[0].pub_key, id_bet, "557828", selected, "3000", params.room_id, keypairUser);
        /**
         *   Team_local(),
            Team_away(),
            Draw(),
         */};
    const handleBet = async (option) => {
        setSelected(option);
        setIsLoading(true);

    };

    const renderUser = ({ item }) => (
        <View style={styles.userCard}>
            <Text style={styles.userEmoji}>👤</Text>
            <Text style={styles.userName}>{item.firstName}</Text>
        </View>
    );
    if (isLoading) {
        return (<PinVerification
            mode="verify"
            message={loadingMessage}
            onComplete={bet}
        />)
    }
    else {
        return (<View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.roomTitle}>{room.title}</Text>
                <Text
                    style={[
                        styles.status,
                        { color: room.active ? "#28A745" : "#FF3B30" },
                    ]}
                >
                    {room.active ? "Activo" : "Esperando jugadores"}
                </Text>
            </View>

            {/* Teams */}
            <View style={styles.teamsContainer}>
                <View style={styles.team}>
                    <Image
                        source={teamLogos[room.local_team_logo]}
                        style={styles.logo}
                    />
                    <Text style={styles.teamName}>{room.local_team_name}</Text>
                </View>

                <Text style={styles.vs}>VS</Text>

                <View style={styles.team}>
                    <Image
                        source={teamLogos[room.away_team_logo]} style={styles.logo}

                    />
                    <Text style={styles.teamName}>{room.away_team_name}</Text>
                </View>
            </View>

            {/* Match info */}
            <Text style={styles.time}>
                {new Date(room.start_time).toLocaleString()} -{" "}
                {new Date(room.finish_time).toLocaleString()}
            </Text>

            <Text style={styles.betStatus}>
                {room.bet ? "Ya realizaste tu apuesta ✅" : "Aún no has apostado ❌"}
            </Text>

            {/* Users list */}
            <View style={styles.usersSection}>
                <Text style={styles.sectionTitle}>Jugadores en la sala</Text>
                <FlatList
                    data={room.users}
                    horizontal
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    renderItem={({ item }) => (
                        <View
                            style={[
                                styles.userCard,
                                item.bet && item.bet !== "false"
                                    ? styles.playedCard
                                    : styles.notPlayedCard,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.userName,
                                    item.bet && item.bet !== "false"
                                        ? styles.playedText
                                        : styles.notPlayedText,
                                ]}
                            >
                                {item.username === user.firstName ? "Yo" : item.username || item.user_id || "User"}
                            </Text>
                        </View>
                    )}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            {/* Betting options */}
            <View style={styles.optionsContainer}>
                {["Team_local", "Draw", "Team_away"].map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.optionButton,
                            room.bet && { opacity: 0.6 },
                        ]}
                        onPress={() => handleBet(option)}
                        disabled={!room.active || room.bet}
                    >
                        <Text style={styles.optionText}>
                            {option === "Team_local"
                                ? room.local_team_name
                                : option === "Draw"
                                    ? "Empate"
                                    : room.away_team_name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>)
    }
}



const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 16 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    roomTitle: { fontSize: 18, fontWeight: "bold", color: "#000" },
    status: { fontSize: 14, fontWeight: "500" },
    teamsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginVertical: 16,
    },
    team: { alignItems: "center" },
    logo: { width: 60, height: 60, resizeMode: "contain" },
    teamName: { marginTop: 6, fontWeight: "600", fontSize: 14 },
    vs: { fontSize: 18, fontWeight: "bold", color: "#333" },
    time: { textAlign: "center", color: "#444", fontSize: 13, marginVertical: 4 },
    betStatus: { textAlign: "center", marginVertical: 8, color: "#333", fontWeight: "500" },
    usersSection: { marginTop: 10 },
    sectionTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 6 },
    userCard: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginRight: 8,
    },
    playedCard: { backgroundColor: "#D1F7C4" },
    notPlayedCard: { backgroundColor: "#FDE2E2" },
    userName: { fontWeight: "600" },
    playedText: { color: "#2E7D32" },
    notPlayedText: { color: "#C62828" },
    optionsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 20,
    },
    optionButton: {
        backgroundColor: "#007BFF",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    optionText: { color: "#fff", fontWeight: "bold" },
});