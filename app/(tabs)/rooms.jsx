import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppError from '../../components/e404';
import { teamColorsByID } from "../../components/TeamColor";
import TeamShield from "../../components/TeamShield";
import { useAuth } from '../../context/AuthContext';

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [code, setCode] = useState("");
    const router = useRouter();
    const { session } = useAuth()

    const [refreshing, setRefreshing] = useState(false);
    const [error404, setError404] = useState(false);

    const userId = session ? session.user.id : null;
    const statusStyles = {
        Ganada: {
            backgroundColor: "#35D787",
            text: "Ganada",
        },
        Perdida: {
            backgroundColor: "#FF6A6A",
            text: "Perdida",
        },

        Abierta: {
            backgroundColor: "#C8C8C8",
            text: "Abierta",
        },
        Cerrada: {
            backgroundColor: "#8C8C8C",
            text: "Cerrada",
        },
        Pendiente: {
            backgroundColor: "#C8C8C8",
            text: "Pendiente",
        },
        Resultado: {
            backgroundColor: "#C8C8C8",
            text: "Resultado",
        },
    };
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchRooms();
        setError404(false)
        // Simulate fetching new data
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);
    const getStatusData = (status) => {
        return statusStyles[status] || statusStyles.pending;
    };
    async function getUsdToCop(usd) {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await res.json();
        const result = data.rates.COP * usd;
        const rounded = Math.round(usd * data.rates.COP);

        return formatCOP(rounded.toFixed(6));
    }
    function formatCOP(value) {

        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(value);
    }
    const dateDate = (start) => {
        const date = new Date(start);


        const day = date.getUTCDate();
        const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
        return day + " " + month
    };

    // ✅ Example: Fetch existing rooms
    useEffect(() => {
        const load = async () => {
            try {
                fetchRooms();
            } catch (e) {
                console.log("Startup error:", e);
            }
        };
        load();
    }, []);

    const fetchRooms = async () => {
        try {
            setRooms([]);

            const res = await fetch(`https://trustappbackendlive-production.up.railway.app/api/rooms?user_id=${userId}`);
            const data = await res.json();
            console.log("getting data", data)

            status(data);
        } catch (error) {
            console.log("Error fetching rooms:", error);
            setError404(true);
        }
    };
    const status = async (data) => {
        const now = new Date();
        for (let i = 0; i < data.length; i++) {
            const startGame = new Date(data[i].start_time);

            const endTime = new Date(data[i].finish_time);
            const limit = new Date(endTime.getTime() + 18000 * 1000);
            const limitStart = new Date(endTime.getTime() + 600 * 1000);
            let status = "pendiente";
            let pick = "Ninguna prediccion aun";
            if (data[i].active && startGame < now) {
                if (endTime < now) {
                    status = "Resultado"
                } else {
                    status = "Pendiente"
                }
            }
            if (data[i].distributed == true) {

                if (now > limit && !(data[i].user_assest == "approve" || data[i].user_assest == "reject")) {
                    if (data[i].supreme_result == data[i].user_bet) {
                        status = "Ganada"
                    } else {
                        status = "Perdida"

                    }
                } else if (data[i].supreme_result == data[i].result) {
                    if (data[i].user_assest == "approve") {
                        status = "Ganada"
                    } else {
                        status = "Perdida"

                    }
                } else {
                    if (data[i].user_assest == "reject") {
                        status = "Ganada"
                    }
                    else {
                        status = "Perdida"

                    }
                }



            } else {
                if ((data[i].ready && data[i].result == data[i].user_bet) || (data[i].result && data[i].supreme_result == data[i].user_bet && data[i].supreme_distributed)) {
                    console.log("gano", data[i])
                    status = "Ganada"
                }
                if ((data[i].ready && data[i].result != data[i].user_bet) || (data[i].result && data[i].supreme_result != data[i].user_bet && data[i].supreme_distributed)) {
                    status = "Perdida"
                    console.log("Perdio", data[i])
                }
            }



            if (startGame > now) {
                status = "Abierta"
            }
            if (!data[i].active && startGame < now) {
                status = "Cerrada"
            }
            if (data[i].user_bet == "Team_away") {
                pick = data[i].away_team_name;
            } else if (data[i].user_bet == "Team_local") {
                pick = data[i].local_team_name;
            }
            let profitCop = await getUsdToCop(data[i].min_amount / 10000000);

            const a = {
                teamColor1: data[i].local_team_colors,
                teamColor2: data[i].away_team_colors,
                away_team_logo: data[i].away_team_logo,
                team1: data[i].away_team_name,
                fecha: 15,
                local_team_logo: data[i].local_team_logo,
                team2: data[i].local_team_name,
                room_id: data[i].room_id,
                date: data[i].start_time,
                pick: pick,
                profit: profitCop,
                status: status
            }
            setRooms(prev => [...prev, a]);


        }
    };
    // ✅ Add or Join Room


    const renderRoom = ({ item }) => (

        <TouchableOpacity
            activeOpacity={0.85}
            style={[
                styles.card,
                item.active && styles.activeCard
            ]}
            onPress={() =>
                router.push({
                    pathname: "/specificRoom",
                    params: { room_id: item.room_id },
                })
            }
        >

            {/* TOP ROW */}
            <View style={styles.topRow}>
                {/* STATUS BADGE */}
                <View style={styles.centeredBadge}>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusData(item.status).backgroundColor }
                    ]}>
                        <Text style={styles.statusText}>
                            {getStatusData(item.status).text}
                        </Text>
                    </View>
                </View>

                {/* DATE */}
                <Text style={styles.date}>
                    {dateDate(item.date)}
                </Text>
            </View>

            {/* TEAMS */}
            <View style={styles.teamsRow}>
                <View style={styles.team}>
                    <TeamShield
                        colors={item.teamColor1}
                        width={35}
                        height={41}
                    />
                    <Text style={styles.teamName} numberOfLines={1}>{item.team2.substring(0, 7)}</Text>
                </View>

                <View style={styles.team}>
                    <TeamShield
                        colors={item.teamColor2}
                        width={35}
                        height={41}
                    />
                    <Text style={styles.teamName} numberOfLines={1}>{item.team1.substring(0, 7)}</Text>
                </View>
            </View>

            {/* PICK + PROFIT */}
            <View style={styles.bottom}>
                <Text style={styles.pick}>{item.pick}</Text>

                <Text
                    style={[
                        styles.profit,
                        item.status === "Ganada"
                            ? styles.winProfit
                            : item.status === "Perdida"
                                ? styles.loseProfit
                                : styles.okProfit
                    ]}
                >
                    {item.status === "Ganada"
                        ? `+${item.profit}`
                        : item.status === "Perdida"
                            ? `-${item.profit}`
                            : `${item.profit}`}
                </Text>
            </View>
        </TouchableOpacity>
    );



    return (
        error404 ? (
            <AppError onRetry={() => onRefresh()} />
        ) : (
            <View style={styles.container}>

                <Text style={styles.title}>Acuerdos</Text>
                <ScrollView style={styles.container} refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }></ScrollView>
                <FlatList
                    data={rooms}
                    renderItem={renderRoom}
                    keyExtractor={(item) => item.room_id.toString()}
                    contentContainerStyle={styles.list}
                />


            </View>)
    );
}

const styles = StyleSheet.create({
    deleteBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 10,
        backgroundColor: "red",
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
        backgroundColor: "#0A0F14",
        paddingTop: 10,
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 18,
        marginTop: 10,
        color: "#FFFFFF",
    },

    list: {
        paddingHorizontal: 16,
    },

    card: {
        backgroundColor: "#12171D",
        padding: 18,
        borderRadius: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#1E252D",
    },

    activeCard: {
        backgroundColor: "#1A222C",
        borderColor: "#2A323D",
    },

    /* TOP ROW */
    topRow: {
        marginBottom: 12,
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },

    centeredBadge: {
        width: "100%",
        alignItems: "center",
    },

    statusBadge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
    },

    statusText: {
        fontWeight: "700",
        fontSize: 14,
        color: "#000",
    },

    date: {
        position: "absolute",
        left: 0,
        top: 0,
        fontSize: 13,
        fontWeight: "500",
        color: "#9CA3AF",
    },

    /* TEAMS */
    teamsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
        paddingHorizontal: 4,
    },

    team: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    logo: {
        width: 36,
        height: 36,
        resizeMode: "contain",
    },

    teamName: {
        fontWeight: "700",
        fontSize: 15,
        color: "#FFFFFF",
        maxWidth: 95,
        flexShrink: 1,
    },

    /* BOTTOM ROW */
    bottom: {
        marginTop: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    pick: {
        backgroundColor: "#0A0F14",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        fontWeight: "600",
        color: "#35D787",
        borderWidth: 1,
        borderColor: "#35D787",
    },

    profit: {
        fontWeight: "700",
        fontSize: 15,
    },

    winProfit: {
        color: "#35D787",
    },

    loseProfit: {
        color: "#FF6A6A",
    },

    okProfit: {
        color: "#9CA3AF",
    },
});

