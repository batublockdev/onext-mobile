import { useUser } from "@clerk/clerk-react";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { teamLogos } from "../../components/teamLogos";

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [code, setCode] = useState("");
    const router = useRouter();
    const { user } = useUser();
    const userId = user ? user.id : null;
    const statusStyles = {
        Ganada: {
            backgroundColor: "#35D787",
            text: "Ganada",
        },
        Perdida: {
            backgroundColor: "#FF6A6A",
            text: "Perdida",
        },

        // Neutral gray group
        Abierta: {
            backgroundColor: "#C8C8C8",
            text: "Abierta",
        },
        Cerrada: {
            backgroundColor: "#887575ff",
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
    const getStatusData = (status) => {
        return statusStyles[status] || statusStyles.pending;
    };
    async function getUsdToCop(usd) {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await res.json();
        console.log("USD to COP rate:", data.rates.COP);
        const result = data.rates.COP * usd;
        const rounded = Math.round(usd * data.rates.COP);

        console.log(`$${usd} USD is approximately ₱${rounded.toFixed(6)} COP`);
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
        fetchRooms();
        console.log("User ID in Rooms:", userId);
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await fetch(`https://backendtrustapp-production.up.railway.app/api/rooms?user_id=${userId}`);
            const data = await res.json();
            console.log("Fetched rooms:", data);
            status(data);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };
    const status = async (data) => {
        const now = new Date();
        for (let i = 0; i < data.length; i++) {
            console.log(data[i].room_id);
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
            if (data[i].ready && data[i].result == data[i].user_bet) {
                status = "Ganada"
            }
            if (data[i].ready && data[i].result != data[i].user_bet) {
                status = "Perdida"
            }

            if (!data[i].active && startGame < now) {
                status = "Cerrada"
            }
            if (startGame > now) {
                status = "Abierta"
            }
            if (data[i].user_bet == "Team_away") {
                pick = data[i].away_team_name;
            } else if (data[i].user_bet == "Team_local") {
                pick = data[i].away_team_name;
            }
            let profitCop = await getUsdToCop(data[i].min_amount / 10000000);

            const a = {
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
            style={[styles.card, { backgroundColor: item.active ? "#E0F7FA" : "#F8F8F8" }]}
            onPress={() =>
                router.push({
                    pathname: "/specificRoom",
                    params: {
                        room_id: item.room_id,

                    },
                })

            }

        >
            {/* League + Status + Date */}
            <View style={styles.topRow}>



                <View style={styles.centeredBadge}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusData(item.status).backgroundColor }]}>
                        <Text style={styles.statusText}>{getStatusData(item.status).text}</Text>
                    </View>
                </View>

                {/* Date on top-right */}
                <Text style={styles.date}>{dateDate(item.date)}</Text>
            </View>

            {/* Teams Row */}
            <View style={styles.teamsRow}>
                <View style={styles.team}>
                    <Image source={teamLogos[item.local_team_logo]} style={styles.logo} />
                    <Text style={styles.teamName}>{item.team2.substring(0, 7)}</Text>
                </View>


                <View style={styles.team}>
                    <Image source={teamLogos[item.away_team_logo]} style={styles.logo} />
                    <Text style={styles.teamName}>{item.team1.substring(0, 7)}</Text>
                </View>
            </View>

            {/* Pick + Profit */}
            <View style={styles.bottom}>
                <Text style={styles.pick}>{item.pick}</Text>

                <Text style={[styles.profit, item.status == "Ganada" ? styles.winProfit : item.status == "Perdida" ? styles.loseProfit : styles.okProfit,]}>
                    {item.status == "Ganada" ? `+${item.profit}` : item.status == "Perdida" ? `-${item.profit} ` : ` ${item.profit} `}
                </Text>
            </View>

        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Available Rooms</Text>

            <FlatList
                data={rooms}
                renderItem={renderRoom}
                keyExtractor={(item) => item.room_id.toString()}
                contentContainerStyle={styles.list}
            />


        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 20,
        marginTop: 10,
    },

    list: {
        paddingHorizontal: 16,
    },

    card: {
        backgroundColor: "#fff",
        padding: 20,              // more padding
        borderRadius: 16,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "center",  // centered badge
        alignItems: "center",
        marginBottom: 12,
    },



    statusText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 14,
    },



    teamsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
    },
    topRow: {
        marginBottom: 12,
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },

    centeredBadge: {
        width: "100%",
        alignItems: "center",  // forces badge to center
    },

    date: {
        position: "absolute",
        right: 0,
        top: 0,
        fontSize: 13,
        fontWeight: "500",
        color: "#555",
    },

    statusBadge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
    },

    team: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    logo: {
        width: 32,
        height: 32,
    },

    teamName: {
        fontWeight: "600",
        fontSize: 15,
    },

    bottom: {
        marginTop: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    pick: {
        backgroundColor: "#EFEFEF",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        fontWeight: "600",
    },

    profit: {
        fontWeight: "700",
        fontSize: 15,
    },

    winProfit: {
        color: "#26B36C",
    },

    loseProfit: {
        color: "#E34A4A",
    },
    okProfit: {
        color: "#6b6b6bff",
    },
});