import { useEffect, useState } from 'react';

import { Link } from 'expo-router';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { teamLogos } from "./teamLogos";

const MatchesScreen = ({ onOpen }) => {

    const [matches, setMatches] = useState([]);

    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await fetch('http://192.168.1.2:8383/api/data');
                const data = await response.json();
                setMatches(data);
            } catch (error) {
                console.log('Error fetching matches:', error);
            }
        };

        fetchMatches();
    }, []);

    if (!matches.length) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading matches...</Text>
            </View>
        );
    }
    const limitText = (text, max) => {
        return text.length > max ? text.substring(0, max) + "..." : text;
    };
    const dateHour = (start) => {
        const date = new Date(start);

        const hour = date.toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "America/Bogota"
        });

        return hour
    };
    const dateDate = (start) => {
        const date = new Date(start);


        const day = date.getUTCDate();
        const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
        return day + " " + month
    };

    const renderItem = ({ item }) => (



        <TouchableOpacity style={styles.card} onPress={() => onOpen(item.match_id, JSON.stringify(item))}>
            {/* Left team */}
            <View style={styles.teamSection}>
                <Image
                    source={teamLogos[item.local_team_logo]}

                    style={styles.logo}
                />
                <Text style={styles.teamName}>{limitText(item.local_team_name, 8)}</Text>
            </View>

            {/* Middle time */}
            <View style={styles.centerSection}>
                <Text style={styles.time}>{dateHour(item.start_time)}</Text>
                <Text style={styles.date}>{dateDate(item.start_time)}</Text>
            </View>

            {/* Right team */}
            <View style={styles.teamSectionRight}>
                <Image
                    source={teamLogos[item.away_team_logo]}
                    style={styles.logo}
                />
                <Text style={styles.teamName}>{limitText(item.away_team_name, 8)}</Text>
            </View>
        </TouchableOpacity>

    );

    return (
        <FlatList
            data={matches}
            keyExtractor={(item) => item.match_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // 👈 hides scrollbar

        />
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: "#12171D",
        padding: 16,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "space-between",

        // sombra sutil estilo dark
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,

        marginBottom: 12,
        marginHorizontal: 10,

        borderWidth: 1,
        borderColor: "#1E252D",
    },

    teamSection: {
        alignItems: "center",
        width: 70,
    },

    teamSectionRight: {
        alignItems: "center",
        width: 70,
    },

    teamName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
        marginTop: 6,
        textAlign: "center",
    },

    logo: {
        width: 42,
        height: 42,
        resizeMode: "contain",
    },

    centerSection: {
        alignItems: "center",
        flex: 1,
    },

    time: {
        fontSize: 18,
        fontWeight: "700",
        color: "#35D787",   // verde premium (mismo que status Win)
    },

    date: {
        marginTop: 2,
        fontSize: 13,
        color: "#9CA3AF",
        fontWeight: "500",
    },

    listContainer: {
        paddingBottom: 20,
        paddingHorizontal: 8,
    },
});



export default MatchesScreen;