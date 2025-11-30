import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from "react-native";

export default function BetRoomModal({ visible, onClose, game }) {
    const [friendCode, setFriendCode] = useState("");
    const [friends, setFriends] = useState([]);
    const [amount, setAmount] = useState("");

    const handleAddFriend = () => {
        if (!friendCode.trim()) return;

        setFriends([...friends, { id: Date.now().toString(), name: friendCode }]);
        setFriendCode("");
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.background}>
                <View style={styles.container}>
                    {/* Close button */}
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeTxt}>✕</Text>
                    </TouchableOpacity>

                    {/* Game title */}
                    <Text style={styles.title}>Bet on {game?.team1} vs {game?.team2}</Text>

                    {/* Friend code input */}
                    <Text style={styles.label}>Friend Code</Text>
                    <View style={styles.row}>
                        <TextInput
                            style={styles.input}
                            value={friendCode}
                            placeholder="Enter friend code"
                            placeholderTextColor="#999"
                            onChangeText={setFriendCode}
                        />
                        <TouchableOpacity style={styles.addBtn} onPress={handleAddFriend}>
                            <Text style={styles.addBtnTxt}>Add</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Friends list */}
                    <Text style={styles.label}>Friends Added</Text>
                    <FlatList
                        data={friends}
                        keyExtractor={(item) => item.id}
                        style={{ maxHeight: 120 }}
                        renderItem={({ item }) => (
                            <View style={styles.friendItem}>
                                <Text style={styles.friendName}>{item.name}</Text>
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
                        onChangeText={setAmount}
                    />

                    {/* Submit button */}
                    <TouchableOpacity style={styles.createBtn}>
                        <Text style={styles.createBtnTxt}>Create Bet Room</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: "#fff",
        padding: 20,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
    },
    closeBtn: {
        alignSelf: "flex-end",
    },
    closeTxt: {
        fontSize: 22,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    label: {
        fontSize: 14,
        color: "#777",
        marginTop: 15,
    },
    input: {
        flex: 1,
        backgroundColor: "#F7F7F7",
        padding: 12,
        borderRadius: 10,
        fontSize: 16,
        marginTop: 5,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 5,
    },
    addBtn: {
        backgroundColor: "#000",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 10,
    },
    addBtnTxt: {
        color: "#fff",
        fontWeight: "600",
    },
    friendItem: {
        backgroundColor: "#F0F0F0",
        padding: 10,
        borderRadius: 10,
        marginVertical: 4,
    },
    friendName: {
        fontSize: 16,
    },
    empty: {
        color: "#aaa",
        fontStyle: "italic",
        marginTop: 10,
    },
    createBtn: {
        backgroundColor: "#000",
        paddingVertical: 15,
        borderRadius: 15,
        marginTop: 25,
    },
    createBtnTxt: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "600",
        fontSize: 16,
    },
});
