import { useUser } from "@clerk/clerk-react";
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MatchesScreen from '../../components/game';

const HomeScreen = () => {
    const { isSignedIn, user, isLoaded } = useUser();
    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.playerName}>{user.firstName}, como vas</Text>
                <View>

                    <Text style={styles.pointsText}>Points: 29</Text>
                    <Text style={styles.ranking}>#5</Text>
                </View>

            </View>



            {/* Balances */}
            <View style={styles.balanceContainer}>
                <View style={styles.balanceBox}>
                    <Text style={styles.balanceLabel}>USD</Text>
                    <Text style={styles.balanceValue}>0.02</Text>
                </View>
                <View style={styles.balanceBox}>
                    <Text style={styles.balanceLabel}>Trust</Text>
                    <Text style={styles.balanceValue}>0.08</Text>
                </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonsRow}>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Deposit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Withdraw</Text>
                </TouchableOpacity>
            </View>

            {/* Placeholder for games list */}
            <MatchesScreen />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#ffffffff",
        padding: 20,
        marginBottom: 55,


    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    playerName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#222",
    },
    ranking: {
        fontSize: 16,
        color: "#666",
    },
    points: {
        marginBottom: 12,
    },
    pointsText: {
        fontSize: 16,
        color: "#444",
    },
    balanceContainer: {
        backgroundColor: "#f7e6e6ff",
        borderRadius: 8,
        height: 120,
        flexDirection: "row",
        paddingTop: 26,
        justifyContent: "space-around",
        marginBottom: 16,
        marginTop: 12,
    },
    balanceBox: {
        alignItems: "center",
    },
    balanceLabel: {
        fontSize: 14,
        color: "#888",
    },
    balanceValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#111",
    },
    buttonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    button: {
        flex: 1,
        backgroundColor: "#35043fff",
        paddingVertical: 10,
        marginHorizontal: 5,
        height: 60,
        justifyContent: "center",
        textAlign: "center",
        borderRadius: 8,
    },
    buttonText: {
        color: "#e63a3aff",
        fontSize: 16,
        textAlign: "center",
        fontWeight: "600",
    },
    gamesList: {
        marginTop: 20,
        padding: 12,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#ccc",
        borderRadius: 8,
    },
    placeholderText: {
        fontSize: 14,
        color: "#aaa",
        textAlign: "center",
    },
});

export default HomeScreen