import { useUser } from "@clerk/clerk-react";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
    const handleJoinRoom = async () => {
        if (!code.trim()) return Alert.alert("Please enter a code");

        try {
            const res = await fetch(`http://192.168.1.8:8383/api/rooms/${code}`);
            const data = await res.json();

            if (!data || !data.id) {
                Alert.alert("Room not found");
                return;
            }

            // Navigate to the Room detail page
            router.push({
                pathname: "/room/[id]",
                params: { id: data.id },
            });
        } catch (error) {
            Alert.alert("Error joining room");
            console.error(error);
        }
    };

    const renderRoom = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.roomCard,
                { backgroundColor: item.active ? "#E0F7FA" : "#F8F8F8" },
            ]}
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
                Status: {item.active ? "Active" : "Inactive"} | Your bet:{" "}
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

            <View style={styles.joinContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter room code"
                    value={code}
                    onChangeText={setCode}
                    placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.joinButton} onPress={handleJoinRoom}>
                    <Text style={styles.joinButtonText}>Join</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 16 },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    list: { paddingBottom: 80 },
    roomCard: {
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    teamsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    team: { alignItems: "center", width: "40%" },
    logo: { width: 50, height: 50, resizeMode: "contain" },
    teamName: { fontSize: 14, fontWeight: "600", marginTop: 6 },
    vs: { fontSize: 16, fontWeight: "bold" },
    roomTime: { color: "#555", marginTop: 10, fontSize: 13 },
    roomStatus: { color: "#222", marginTop: 4, fontSize: 13 },
    joinContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginRight: 8,
        color: "#000",
    },
    joinButton: {
        backgroundColor: "#2196F3",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    joinButtonText: { color: "#fff", fontWeight: "bold" },
});