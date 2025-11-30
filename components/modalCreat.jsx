import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
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
    claim_refund,
    set_GameStruct
} = require("../SmartContract/smartcontractOperation");
const { decryptOnly } = require('../self-wallet/wallet');

// Main Screen Component (The Lobby)
export default function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.lobbyContainer}>
                <Text style={styles.lobbyTitle}>Your Game Lobby</Text>
                <Text style={styles.lobbySubtitle}>Click a game to start a bet.</Text>

                {/* Game Card */}
                <TouchableOpacity
                    style={styles.gameCard}
                    activeOpacity={0.8}
                    onPress={() => setIsModalOpen(true)}
                >
                    <View style={styles.gameCardRow}>
                        <Ionicons name="game-controller-outline" size={24} color="#4f46e5" style={{ marginRight: 10 }} />
                        <Text style={styles.gameCardText}>Chiefs vs. 49ers</Text>
                    </View>
                    <Text style={styles.gameCardSubtext}>Tap to create a private room</Text>
                </TouchableOpacity>
            </View>

            {/* The Betting Modal */}
            <CreateRoomModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                gameName="Chiefs vs. 49ers (NFL)"
            />
        </SafeAreaView>
    );
}

// ---------------------------------------------------------
// The Modal Component
// ---------------------------------------------------------
const CreateRoomModal = ({ visible, onClose, gameName }) => {
    const [friendCode, setFriendCode] = useState('');
    const [betAmount, setBetAmount] = useState('');
    const [friends, setFriends] = useState([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
    ]);

    const handleAddFriend = () => {
        if (friendCode.trim()) {
            // Basic validation to check for duplicates
            if (friends.some(f => f.name.toLowerCase() === friendCode.trim().toLowerCase())) {
                Alert.alert("Already Added", "This friend is already in the list.");
                return;
            }

            const newFriend = {
                id: Date.now().toString(),
                name: friendCode.trim(),
            };
            setFriends([...friends, newFriend]);
            setFriendCode('');
        }
    };

    const handleCreateRoom = () => {
        // Logic to send data to your backend would go here
        console.log('Creating room:', {
            game: gameName,
            participants: friends,
            totalBet: betAmount
        });

        Alert.alert(
            "Success!",
            `Room created for ${gameName} with a total pot of $${betAmount}`,
            [{ text: "OK", onPress: onClose }]
        );
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                {/* KeyboardAvoidingView ensures the input doesn't get hidden by the keyboard */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardView}
                >
                    <View style={styles.modalContainer}>

                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Create Private Bet</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.contentArea} contentContainerStyle={{ paddingBottom: 20 }}>

                            {/* 1. Game Display */}
                            <View style={styles.gameDisplay}>
                                <Text style={styles.sectionLabel}>Betting On Game:</Text>
                                <View style={styles.gameDisplayContent}>
                                    <Ionicons name="american-football" size={20} color="#4f46e5" />
                                    <Text style={styles.gameDisplayName}>{gameName}</Text>
                                </View>
                            </View>

                            {/* 2. Add Friends */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>
                                    <Ionicons name="person-add-outline" size={14} color="#6366f1" /> Invite Friends
                                </Text>
                                <View style={styles.inputGroup}>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Enter Friend's Code/Name"
                                        value={friendCode}
                                        onChangeText={setFriendCode}
                                        placeholderTextColor="#9ca3af"
                                    />
                                    <TouchableOpacity
                                        style={[styles.addButton, !friendCode.trim() && styles.disabledButton]}
                                        onPress={handleAddFriend}
                                        disabled={!friendCode.trim()}
                                    >
                                        <Text style={styles.addButtonText}>Add</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* 3. Participants List */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>
                                    <Ionicons name="people-outline" size={14} color="#6366f1" /> Participants ({friends.length})
                                </Text>
                                <View style={styles.friendListContainer}>
                                    {friends.length > 0 ? (
                                        friends.map((friend) => (
                                            <View key={friend.id} style={styles.friendListItem}>
                                                <Text style={styles.friendName}>{friend.name}</Text>
                                                <View style={styles.joinedBadge}>
                                                    <Text style={styles.joinedText}>Joined</Text>
                                                </View>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.emptyListText}>No friends added yet.</Text>
                                    )}
                                </View>
                            </View>

                            {/* 4. Bet Amount */}
                            <View style={[styles.section, { marginBottom: 0 }]}>
                                <Text style={styles.sectionLabel}>
                                    <Ionicons name="cash-outline" size={14} color="#6366f1" /> Total Bet Amount
                                </Text>
                                <View style={styles.betInputWrapper}>
                                    <Text style={styles.dollarSign}>$</Text>
                                    <TextInput
                                        style={styles.betInput}
                                        placeholder="50.00"
                                        value={betAmount}
                                        onChangeText={setBetAmount}
                                        keyboardType="numeric"
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>
                                <Text style={styles.inputHint}>Total amount split by all participants.</Text>
                            </View>

                        </ScrollView>

                        {/* Footer / Create Button */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[
                                    styles.createButton,
                                    (friends.length === 0 || !betAmount) && styles.disabledButton
                                ]}
                                onPress={handleCreateRoom}
                                disabled={friends.length === 0 || !betAmount}
                            >
                                <Text style={styles.createButtonText}>Create Room & Start Bet</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

// ---------------------------------------------------------
// Styles
// ---------------------------------------------------------
const styles = StyleSheet.create({
    // Main Screen Styles
    safeArea: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        padding: 20,
    },
    lobbyContainer: {
        alignItems: 'center',
    },
    lobbyTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    lobbySubtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 30,
    },
    gameCard: {
        backgroundColor: '#fff',
        width: '100%',
        padding: 20,
        borderRadius: 16,
        // Shadows
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    gameCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    gameCardText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
    },
    gameCardSubtext: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },

    // Modal Overlay Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end', // Aligns modal to bottom like a sheet
    },
    keyboardView: {
        width: '100%',
        height: '90%', // Height of the modal sheet
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
    },

    // Content
    contentArea: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },

    // 1. Game Display
    gameDisplay: {
        marginBottom: 24,
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 12,
    },
    gameDisplayContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    gameDisplayName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginLeft: 10,
    },

    // 2. Add Friends Input
    inputGroup: {
        flexDirection: 'row',
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: '#1f2937',
        backgroundColor: '#fff',
    },
    addButton: {
        backgroundColor: '#4f46e5',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderRadius: 10,
        marginLeft: 10,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },

    // 3. Friends List
    friendListContainer: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        maxHeight: 150,
    },
    friendListItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    friendName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1f2937',
    },
    joinedBadge: {
        backgroundColor: '#d1fae5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    joinedText: {
        fontSize: 12,
        color: '#059669',
        fontWeight: '600',
    },
    emptyListText: {
        padding: 20,
        textAlign: 'center',
        color: '#9ca3af',
        fontStyle: 'italic',
    },

    // 4. Bet Amount
    betInputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    dollarSign: {
        position: 'absolute',
        left: 16,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6b7280',
        zIndex: 1,
    },
    betInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        paddingVertical: 14,
        paddingLeft: 35, // Space for dollar sign
        paddingRight: 14,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        backgroundColor: '#fff',
    },
    inputHint: {
        marginTop: 6,
        fontSize: 12,
        color: '#6b7280',
    },

    // Footer / Buttons
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    createButton: {
        backgroundColor: '#000',
        paddingVertical: 18,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
    },
});