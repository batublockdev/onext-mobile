import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { teamLogos } from "./teamLogos";
import { teamColorsByID } from "./TeamColor";
import TeamShield from "./TeamShield";
export default function MatchCard({ data, goToGameDetail }) {
    const { roomid, match_id, result, type, league, week, localid, awayid, team1, team2, logo1, logo2, reason, howmuch, gameState, honest1, honest2, adm, externalUser, distributed } = data;

    const themes = {
        cobrar: {
            bg: "#ff8888ff",
            text: "#000",
            sub: "#666",
            score: "#000",
            minuteBg: "#eee"
        },
        supreme: {
            bg: "#ca8effff",
            text: "#000000ff",
            sub: "#444444ff",
            score: "#530000ff",
            minuteBg: "#ff4d94"
        },
        resultado: {
            bg: "#fff460ff",
            text: "#000000ff",
            sub: "#2b1717ff",
            score: "#333",
            minuteBg: "#ccc"
        },
        upcoming: { // default theme
            bg: "#85f3f7ff",
            text: "#333",
            sub: "#3f0000ff",
            score: "#333",
            minuteBg: "#ddd"
        },
        empty: {
            bg: "#dcdcdc",
            text: "#000",
            sub: "#666",
            score: "#000",
            minuteBg: "#bbb"
        }
    };

    const theme = themes[gameState] || themes.upcoming;

    return (

        <TouchableOpacity onPress={() => goToGameDetail(roomid, match_id, result, type, league, week, localid, awayid, team1, team2, logo1, logo2, reason, howmuch, gameState, honest1, honest2, adm, externalUser, distributed)} style={[styles.card, { backgroundColor: theme.bg }]}>
            <Text style={[styles.league, { color: theme.sub }]}>{league}</Text>
            <Text style={[styles.week, { color: theme.sub }]}>Week {week}</Text>

            <View style={styles.row}>
                <TeamShield
                    colors={logo1}
                    width={45}
                    height={61}
                />

                <View style={styles.center}>
                    <Text style={[styles.score, { color: theme.score }]}>
                        {reason}
                    </Text>

                    {gameState === "cobrar" && (
                        <View style={[styles.minuteBubble, { backgroundColor: theme.minuteBg }]}>
                            <Text style={[styles.minuteText, { color: theme.text }]}>
                                {howmuch}
                            </Text>
                        </View>
                    )}
                </View>
                <TeamShield
                    colors={logo2}
                    width={45}
                    height={61}
                />
            </View>

            <View style={styles.rowNames}>
                <View style={{ alignItems: "center" }}>
                    <Text style={[styles.teamName, { color: theme.text }]}>{team1.substring(0, 7)}</Text>
                    <Text style={[styles.subText, { color: theme.sub }]}>Home</Text>
                </View>

                <View style={{ alignItems: "center" }}>
                    <Text style={[styles.teamName, { color: theme.text }]}>{team2.substring(0, 7)}</Text>
                    <Text style={[styles.subText, { color: theme.sub }]}>Away</Text>
                </View>
            </View>
        </TouchableOpacity>


    );
}
const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 20,
        marginRight: 15,
        width: 260,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 10,
        elevation: 5,
    },
    league: {
        fontSize: 14,
        textAlign: "center",
        fontWeight: "600",
    },
    week: {
        fontSize: 12,
        textAlign: "center",
        marginBottom: 10,
        fontWeight: "500",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    rowNames: {
        marginTop: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
    },
    teamLogo: {
        width: 50,
        height: 50,
        resizeMode: "contain",
    },
    center: {
        alignItems: "center",
    },
    score: {
        fontSize: 15,
        fontWeight: "700",
    },
    minuteBubble: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginTop: 5,
    },
    minuteText: {
        fontSize: 12,
        fontWeight: "600",
    },
    teamName: {
        fontSize: 16,
        fontWeight: "600",
    },
    subText: {
        fontSize: 12,
    },
    // No games styles
    noGamesCard: {
        borderRadius: 20,
        padding: 20,
        marginRight: 15,
        width: 240,
        backgroundColor: "#f8f8f8",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 10,
        elevation: 5,
    },
    noGamesTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
    },
    noGamesText: {
        fontSize: 14,
        color: "#555",
        marginBottom: 10,
    },
    featuresList: {
        alignSelf: "flex-start",
        marginLeft: 10,
    },
    featureItem: {
        fontSize: 14,
        marginVertical: 2,
    },
    adPlaceholder: {
        marginTop: 15,
        backgroundColor: "#ddd",
        padding: 15,
        borderRadius: 15,
        width: "100%",
        alignItems: "center",
    },
    adText: {
        fontWeight: "600",
        color: "#555",
    }
});