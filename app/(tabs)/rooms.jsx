import { useUser } from "@clerk/clerk-react";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

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
                        title: item.title,
                        start_time: item.start_time,
                        finish_time: item.finish_time,
                        active: item.active,
                        bet: item.bet,
                        users: JSON.stringify([
                            { id: "user1", firstName: "Carlos" },
                            { id: "user2", firstName: "Laura" },
                            { id: "user3", firstName: "Andrés" },
                        ]),
                    },
                })
            }

        >
            <Text style={styles.roomName}>{item.title}</Text>
            <Text style={styles.roomTime}>
                {new Date(item.start_time).toLocaleString()} -{" "}
                {new Date(item.finish_time).toLocaleString()}
            </Text>
            <Text style={styles.roomStatus}>
                Status: {item.active ? "Active" : "Inactive"} | Bet:{" "}
                {item.bet ? "Yes" : "No"}
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
        </View>);
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#FAFAFA" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 15, color: "#333" },
    list: { paddingBottom: 20 },

    roomCard: {
        padding: 20,
        borderRadius: 15,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    roomName: { fontSize: 18, fontWeight: "700", marginBottom: 5, color: "#007AFF" },
    roomTime: { fontSize: 14, color: "#555", marginBottom: 3 },
    roomStatus: { fontSize: 13, color: "#888" },

    joinContainer: { flexDirection: "row", marginTop: 25 },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#CCC",
        borderRadius: 12,
        padding: 12,
        marginRight: 10,
        backgroundColor: "#FFF",
    },
    joinButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 25,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    joinButtonText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});

