import { useEffect, useState } from 'react';

import { Link } from 'expo-router';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { teamLogos } from "./teamLogos";

const MatchesScreen = () => {

    const [matches, setMatches] = useState([]);

    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await fetch('http://192.168.1.8:8383/api/data');
                const data = await response.json();
                console.log(data);
                setMatches(data);
            } catch (error) {
                console.error('Error fetching matches:', error);
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

        const hour = date.getUTCHours().toString().padStart(2, "0") + ":" +
            date.getUTCMinutes().toString().padStart(2, "0");

        const day = date.getUTCDate();
        const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
        return hour
    };
    const dateDate = (start) => {
        const date = new Date(start);

        const hour = date.getUTCHours().toString().padStart(2, "0") + ":" +
            date.getUTCMinutes().toString().padStart(2, "0");

        const day = date.getUTCDate();
        const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
        return day + " " + month
    };

    const renderItem = ({ item }) => (


        <Link
            href={{
                pathname: '/MatchDetails',
                params: { match: JSON.stringify(item) },
            }}
            asChild
        >
            <TouchableOpacity style={styles.card}>
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

        </Link>
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
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 10,
        marginHorizontal: 8,
    },

    teamSection: {
        alignItems: "center",
    },
    teamSectionRight: {
        alignItems: "center",
    },

    teamName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 6,
    },

    logo: {
        width: 40,
        height: 40,
        resizeMode: "contain",
    },

    centerSection: {
        alignItems: "center",
    },

    time: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ff6a00",
    },

    date: {
        fontSize: 12,
        color: "gray",
    },
});


export default MatchesScreen;