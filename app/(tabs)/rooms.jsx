import { useUser } from "@clerk/clerk-react";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { teamLogos } from "../../components/teamLogos";

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [code, setCode] = useState("");
    const router = useRouter();
    const { user } = useUser();
    const userId = user ? user.id : null;
    // ✅ Example: Fetch existing rooms
    useEffect(() => {
        fetchRooms();
        console.log("User ID in Rooms:", userId);
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await fetch(`http://192.168.1.8:8383/api/rooms?user_id=${userId}`);
            const data = await res.json();
            console.log("Fetched rooms:", data);
            setRooms(data);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };
    // ✅ Add or Join Room


    const renderRoom = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.roomCard, { backgroundColor: item.active ? "#E0F7FA" : "#F8F8F8" }]}
            onPress={() =>
                router.push({
                    pathname: "/specificRoom",
                    params: {
                        room_id: item.room_id,

                    },
                })

            }

        >
            <View style={styles.teamsContainer}>
                <View style={styles.team}>
                    <Image
                        source={teamLogos[item.local_team_logo]}
                        style={styles.logo}
                    />
                    <Text style={styles.teamName}>{item.local_team_name}</Text>
                </View>

                <Text style={styles.vs}>VS</Text>

                <View style={styles.team}>
                    <Image
                        source={teamLogos[item.away_team_logo]} style={styles.logo}
                    />
                    <Text style={styles.teamName}>{item.away_team_name}</Text>
                </View>
            </View>

            <Text style={styles.roomTime}>
                {new Date(item.start_time).toLocaleString()} -{" "}
                {new Date(item.finish_time).toLocaleString()}
            </Text>

            <Text style={styles.roomStatus}>
                Status: {item.active ? "Active" : "Inactive"} | Your predic:{" "}
                {item.user_bet && item.user_bet !== "false" ? item.user_bet : "No bet"}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Available Rooms</Text>

            <FlatList
                data={rooms}
                renderItem={renderRoom}
                keyExtractor={(item) => item.room_id.toString()}
                contentContainerStyle={styles.list}
            />


        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        paddingHorizontal: 16,
        paddingTop: 20,
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#222",
        marginBottom: 16,
        textAlign: "center",
    },

    list: {
        paddingBottom: 20,
    },

    roomCard: {
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 14,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },

    teamsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },

    team: {
        flex: 1,
        alignItems: "center",
    },

    logo: {
        width: 50,
        height: 50,
        resizeMode: "contain",
        marginBottom: 6,
    },

    teamName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
    },

    vs: {
        fontSize: 16,
        fontWeight: "700",
        color: "#999",
        marginHorizontal: 8,
    },

    roomTime: {
        fontSize: 13,
        color: "#666",
        textAlign: "center",
        marginBottom: 6,
    },

    roomStatus: {
        fontSize: 13,
        color: "#444",
        textAlign: "center",
        fontWeight: "500",
    },
});
