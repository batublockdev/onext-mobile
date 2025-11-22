import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Keypair } from "stellar-sdk";
import ConfirmationMessage from "../../components/ConfimationComponent";
import { ERROR_MESSAGES } from "../../components/error";
import PinVerification from "../../components/pin";
import { useApp } from "../contextUser";


const SummiterRole = () => {
    const { decryptOnly } = require('../../self-wallet/wallet');
    const { userx, setUserx } = useApp();

    const {
        request_result_summiter,
        summit_result
    } = require("../../SmartContract/smartcontractOperation");
    const [isSummiter, setIsSummiter] = useState(false);
    const [hasRequested, setHasRequested] = useState(false);
    const [assignedGames, setAssignedGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGame, setSelectedGame] = useState(null);
    const [selectedResult, setSelectedResult] = useState('');
    const [description, setDescription] = useState('');
    const [stakeAmount, setStakeAmount] = useState("");
    const [statusx, setStatus] = useState(null); // null | "success" | "error"
    const [pinSend, setpinSend] = useState(null); // null | "success" | "error"
    const [reason, setReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Verifying PIN...");
    const [selected, setSelected] = useState(null);

    const [modalVisible, setModalVisible] = useState(false);

    // ✅ Example: Fetch existing rooms


    const action = async (pin) => {

        switch (pinSend) {
            case "request":
                handleRequest(pin);
                break;
            case "send":
                handlesummit(pin);
                break;

        }
        // do something
    }
    const handleBet = async (option, send) => {
        setSelected(option);
        setIsLoading(true);
        setpinSend(send);

    };

    // Fetch both lists when mounted
    useEffect(() => {

        const fetchData = async () => {
            try {
                console.log(userx);
                const res = await fetch(`http://192.168.1.8:8383/api/roomssummiter?pub_key=${userx[0].pub_key}`);
                const data = await res.json();
                console.log("Fetched rooms SUMMITER:", data);
                setIsSummiter(true);
                setHasRequested(true);
                setAssignedGames(data);

            } catch (error) {
                console.error('Error fetching games:', error);
                Alert.alert('Error', 'Could not load game data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    const openModal = (game) => {
        setSelectedGame(game);
        setSelectedResult('');
        setDescription('');
        setModalVisible(true);
    };

    // Handle request to become summiter
    //async function summit_result(address, description, game_id, team) 
    const handlesummit = async (pin) => {
        try {
            console.log(userx[0].encrypted_data);
            const keyUser = await decryptOnly(userx[0].encrypted_data, pin);
            const keypairUser = Keypair.fromRawEd25519Seed(keyUser.key);
            const admin = Keypair.fromSecret("SAO5QJMENIQ5K2Q7CK6TJ4AZCAQXGKV6RKZ6TRSY73E5GR2U2C5XXNMY");
            console.log("selecte: ")
            await summit_result(keypairUser.publicKey(), description, assignedGames[0].match_id, selectedResult, keypairUser);
            setStatus("success");

        } catch (error) {
            console.log("error", error);
            const { reason, code } = parseContractError(error);
            console.log("error", code);
            setStatus("error");
            setReason(reason);
            setIsLoading(false);
        } finally {
            setIsLoading(false);

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
    //async function request_result_summiter(address, amount)
    const handleRequest = async (pin) => {
        try {
            console.log(userx[0].encrypted_data);
            const keyUser = await decryptOnly(userx[0].encrypted_data, pin);
            const keypairUser = Keypair.fromRawEd25519Seed(keyUser.key);
            await request_result_summiter(keypairUser.publicKey(), stakeAmount, keypairUser);
            setStatus("success");

        } catch (error) {
            console.log("error", error);
            const { reason, code } = parseContractError(error);
            console.log("error", code);
            setStatus("error");
            setReason(reason);
            setIsLoading(false);
        } finally {
            setIsLoading(false);

        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    if (isLoading) {
        return (<PinVerification
            mode="verify"
            message={loadingMessage}
            onComplete={action}

        />);
    } else {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>Result Summiter Role</Text>

                {/* Current status */}
                <View style={styles.statusCard}>
                    {(
                        <>
                            <Text style={styles.statusInactive}>
                                You are not a summiter yet
                            </Text>

                            {/* Input for stake amount */}
                            <TextInput
                                style={styles.input}
                                placeholder="Enter amount to stake"
                                value={stakeAmount}
                                onChangeText={setStakeAmount}
                                keyboardType="numeric"
                                placeholderTextColor="#aaa"
                            />

                            {/* Request button */}
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    !stakeAmount && { backgroundColor: "#ccc" },
                                ]}
                                onPress={() => handleBet("reject", "request")}
                                disabled={!stakeAmount}
                            >
                                <Text style={styles.buttonText}>
                                    Request to Become Summiter
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Assigned games */}
                {isSummiter && (
                    <>
                        <Text style={styles.sectionTitle}>Games Assigned to You</Text>
                        <FlatList
                            data={assignedGames}
                            keyExtractor={(item) => item.match_id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.card}>
                                    <Text style={styles.gameText}>
                                        {item.local_team_name} vs {item.away_team_name}
                                    </Text>
                                    <Text style={styles.date}>{item.fecha}</Text>

                                    <TouchableOpacity
                                        style={[
                                            styles.submitButton,
                                            item.result_submitted && { backgroundColor: '#999' },
                                        ]}
                                        onPress={() => openModal(item)}
                                        disabled={item.result_submitted}
                                    >
                                        <Text style={styles.submitText}>
                                            {item.result_submitted
                                                ? '✅ Result Submitted'
                                                : 'Submit Result'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No games assigned yet.</Text>
                            }
                        />
                    </>
                )}

                {/* Modal */}
                <Modal visible={modalVisible} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>
                                Submit Result for {selectedGame?.local_team_name} vs{' '}
                                {selectedGame?.away_team_name}
                            </Text>

                            <View style={styles.optionsContainer}>
                                {['Team_local', 'Team_away', 'Draw', 'Cancel'].map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.optionButton,
                                            selectedResult === option && styles.optionSelected,
                                        ]}
                                        onPress={() => setSelectedResult(option)}
                                    >
                                        <Text style={styles.optionText}>
                                            {option === 'Team_local'
                                                ? '🏠 Local Team Win'
                                                : option === 'Team_away'
                                                    ? '🚗 Away Team Win'
                                                    : option === 'Draw'
                                                        ? '⚖️ Draw'
                                                        : '❌ Cancelled'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Add a short description (optional)"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, { backgroundColor: '#007AFF' }]}
                                    onPress={() => handleBet("reject", "send")}
                                    disabled={loading}
                                >
                                    <Text style={styles.modalBtnText}>
                                        {loading ? 'Sending...' : 'Send Result'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalBtn, { backgroundColor: '#aaa' }]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.modalBtnText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
                {
                    statusx && (
                        <ConfirmationMessage
                            success={statusx === "success"}
                            message={
                                statusx === "success"
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
    };
}

export default SummiterRole;

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    card: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
        elevation: 1
    },
    gameText: { fontSize: 16, fontWeight: '500' },
    date: { color: 'gray', fontSize: 14 },
    submitButton: {
        marginTop: 10,
        backgroundColor: '#007AFF',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center'
    },
    submitText: { color: '#FFF', fontWeight: '600' },
    emptyText: { textAlign: 'center', color: 'gray', marginTop: 20 },

    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 16
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16
    },
    optionsContainer: {
        marginBottom: 12
    },
    optionButton: {
        backgroundColor: '#EEE',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8
    },
    optionSelected: {
        backgroundColor: '#007AFF'
    },
    optionText: {
        color: '#000',
        textAlign: 'center',
        fontWeight: '500'
    },
    input: {
        backgroundColor: '#F2F2F2',
        borderRadius: 8,
        padding: 10,
        height: 80,
        marginBottom: 16
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5
    },
    modalBtnText: { color: '#FFF', fontWeight: '600' },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F7F8FA'
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16
    },
    statusCard: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center'
    },
    statusActive: { color: 'green', fontSize: 16, fontWeight: 'bold' },
    statusPending: { color: 'orange', fontSize: 16, fontWeight: 'bold' },
    statusInactive: { color: 'gray', fontSize: 16, marginBottom: 10 },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8
    },
    buttonText: { color: '#FFF', fontWeight: '600' },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    card: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
        elevation: 1
    },
    gameText: { fontSize: 16, fontWeight: '500' },
    date: { color: 'gray', fontSize: 14 },
    emptyText: { textAlign: 'center', color: 'gray', marginTop: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
