import { Image, StyleSheet, Text, View } from "react-native";

export default function MatchCard({ data }) {
    const { league, week, team1, team2, logo1, logo2, score1, score2, minute, gameState } = data;
    const themes = {
        upcoming: {
            bg: "#ffffff",
            text: "#000",
            sub: "#666",
            score: "#000",
            minuteBg: "#eee"
        },
        live: {
            bg: "#4B0E80",
            text: "#fff",
            sub: "#ddd",
            score: "#fff",
            minuteBg: "#ff4d94"
        },
        final: {
            bg: "#f1f1f1",
            text: "#333",
            sub: "#999",
            score: "#333",
            minuteBg: "#ccc"
        }
    };
    const theme = themes[gameState] || themes.upcoming;

    return (
        <View style={[styles.card, { backgroundColor: theme.bg }]}>
            <Text style={[styles.league, { color: theme.sub }]}>{league}</Text>
            <Text style={[styles.week, { color: theme.sub }]}>Week {week}</Text>

            <View style={styles.row}>
                <Image source={{ uri: logo1 }} style={styles.teamLogo} />

                <View style={styles.center}>
                    <Text style={[styles.score, { color: theme.score }]}>
                        {score1} : {score2}
                    </Text>

                    {gameState === "live" && (
                        <View style={[styles.minuteBubble, { backgroundColor: theme.minuteBg }]}>
                            <Text style={[styles.minuteText, { color: theme.text }]}>
                                {minute}'
                            </Text>
                        </View>
                    )}
                </View>

                <Image source={{ uri: logo2 }} style={styles.teamLogo} />
            </View>

            <View style={styles.rowNames}>
                <View style={{ alignItems: "center" }}>
                    <Text style={[styles.teamName, { color: theme.text }]}>{team1}</Text>
                    <Text style={[styles.subText, { color: theme.sub }]}>Home</Text>
                </View>

                <View style={{ alignItems: "center" }}>
                    <Text style={[styles.teamName, { color: theme.text }]}>{team2}</Text>
                    <Text style={[styles.subText, { color: theme.sub }]}>Away</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 20,
        marginRight: 15,
        width: 260,
    },
    league: {
        fontSize: 14,
        textAlign: "center",
    },
    week: {
        fontSize: 12,
        textAlign: "center",
        marginBottom: 10,
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
        fontSize: 35,
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
});
