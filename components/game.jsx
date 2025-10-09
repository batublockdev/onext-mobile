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

    const renderItem = ({ item }) => (

        <Link
            href={{
                pathname: '/MatchDetails',
                params: { match: JSON.stringify(item) },
            }}
            asChild
        >
            <TouchableOpacity style={styles.matchCard}
            >
                <View style={styles.teamsContainer}>
                    <View style={styles.team}>
                        <Image source={teamLogos[item.local_team_logo]} style={styles.logo} />
                        <Text style={styles.teamName}>{item.local_team_name}</Text>
                    </View>

                    <Text style={styles.vs}>VS</Text>

                    <View style={styles.team}>
                        <Image source={teamLogos[item.away_team_logo]} style={styles.logo} />
                        <Text style={styles.teamName}>{item.away_team_name}</Text>
                    </View>
                </View>

                <Text style={styles.dateText}>
                    {new Date(item.start_time).toLocaleString()}
                </Text>
            </TouchableOpacity>
        </Link>
    );

    return (
        <FlatList
            data={matches}
            keyExtractor={(item) => item.match_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
        />
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#888',
    },
    listContainer: {
        padding: 10,
    },
    matchCard: {
        backgroundColor: '#c2c2c2ff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    teamsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
    },
    team: {
        alignItems: 'center',
        width: '40%',
    },
    logo: {
        width: 50,
        height: 50,
        marginBottom: 6,
    },
    teamName: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
    },
    vs: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dateText: {
        color: '#642c2cff',
        fontSize: 12,
        marginTop: 8,
    },
});

export default MatchesScreen;