import { useUser } from "@clerk/clerk-react";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
export default function RoomDetail({ }) {
    const { isSignedIn, user, isLoaded } = useUser();

    const [selected, setSelected] = useState(null);
    const params = useLocalSearchParams();
    console.log("Room params:", params.users);
    const room = {
        room_id: params.room_id,
        title: params.title,
        start_time: params.start_time,
        finish_time: params.finish_time,
        active: params.active === "true",
        bet: params.bet === "true",
    };
    const handleBet = (option) => {
        setSelected(option);
        console.log("Bet placed on:", option);
        //if (onBet) onBet(option);
    };

    const renderUser = ({ item }) => (
        <View style={styles.userCard}>
            <Text style={styles.userEmoji}>👤</Text>
            <Text style={styles.userName}>{item.firstName}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
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

            {/* Match info */}
            <Text style={styles.time}>
                🕐 {new Date(room.start_time).toLocaleTimeString()} -{" "}
                {new Date(room.finish_time).toLocaleTimeString()}
            </Text>

            <Text style={styles.betStatus}>
                {room.bet ? "Ya realizaste tu apuesta ✅" : "Aún no has apostado 🎯"}
            </Text>

            {/* Users list */}
            <View style={styles.usersSection}>
                <Text style={styles.sectionTitle}>Jugadores en la sala</Text>
                <FlatList
                    data={params.users ? JSON.parse(params.users) : []}
                    horizontal
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.userCard} key={item.id}>
                            <Text style={styles.userName}>👤 {item.firstName}</Text>
                        </View>
                    )}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            {/* Betting options */}
            <View style={styles.optionsContainer}>
                {["local", "draw", "away"].map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.optionButton,
                            selected === option && styles.selectedOption,
                            room.bet && { opacity: 0.6 },
                        ]}
                        onPress={() => handleBet(option)}
                        disabled={!room.active || room.bet}
                    >
                        <Text
                            style={[
                                styles.optionText,
                                selected === option && styles.selectedOptionText,
                            ]}
                        >
                            {option === "local"
                                ? "🏠 Local"
                                : option === "draw"
                                    ? "⚔️ Empate"
                                    : "🚗 Visitante"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
        padding: 16,
        justifyContent: "space-between",
    },
    header: {
        marginBottom: 10,
    },
    roomTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#007AFF",
    },
    status: {
        fontSize: 14,
        fontWeight: "600",
    },
    time: {
        fontSize: 14,
        color: "#555",
        marginBottom: 6,
    },
    betStatus: {
        fontSize: 14,
        fontWeight: "600",
        color: "#444",
        marginBottom: 10,
    },
    usersSection: {
        marginTop: 10,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 5,
        color: "#333",
    },
    usersList: {
        flexDirection: "row",
        alignItems: "center",
    },
    userCard: {
        backgroundColor: "#F2F2F2",
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginRight: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    userEmoji: {
        fontSize: 18,
        marginRight: 5,
    },
    userName: {
        fontSize: 14,
        fontWeight: "500",
    },
    optionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: "auto",
    },
    optionButton: {
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: "#E5E7EB",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },
    selectedOption: {
        backgroundColor: "#007AFF",
    },
    optionText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
    },
    selectedOptionText: {
        color: "#FFF",
    },
});