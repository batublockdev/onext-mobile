import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSignOut } from "../(auth)/signout";
import AppError from '../../components/e404';
import MatchesScreen from '../../components/game';
import MatchCard from '../../components/MatchCard';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../contextUser';
import BetRoomModal from '../modalCreateCh';

const HomeScreen = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null); // null | "success" | "error"
    const [USDCBalance, setUSDCBalance] = useState("0"); // null | "success" | "error"
    const [TRUSTBalance, setTRUSTBalance] = useState("0"); // null | "success" | "error"
    const [loadingMessage, setLoadingMessage] = useState('...');
    const [reason, setReason] = useState(null);
    const [myMachesvar, setmyMachesvar] = useState([]);

    const [idcode, setidcode] = useState("N/A");
    const [position, setposition] = useState("0");
    const [error404, setError404] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [dataModalVisible, setdataModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const { session } = useAuth()
    const router = useRouter();

    const [depositUrl, setDepositUrl] = useState(null);
    const { signOutUser } = useSignOut();
    const { userx, setUserx } = useApp();
    const StellarSdk = require("stellar-sdk");
    const userId = session ? session.user.id : null;
    const server = new StellarSdk.Horizon.Server(
        "https://horizon.stellar.org",
    );
    const seen = new Set();


    const USDCasset = new StellarSdk.Asset("USDC", "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN");
    const TrustAsset = new StellarSdk.Asset("TRUST", "GD4IBE2P3LXDLXCL5G5LNNPPZLOCWDGTXJF44UHWLHHUDBZDYYRRJDYE");
    useEffect(() => {
        const load = async () => {
            try {
                setmyMachesvar([]);
                UserBalance();

                fetchRooms();
            } catch (e) {
                console.log("Startup error:", e);
            }
        };
        load();


    }, []);
    useEffect(() => {
        const load = async () => {
            try {
                setmyMachesvar([]);
                UserBalance();

                fetchRooms();
            } catch (e) {
                console.log("Startup error:", e);
            }
        };
        load();

    }, [userx]);
    async function getUsdToCop(usd) {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await res.json();
        console.log("USD to COP rate:", data.rates.COP);
        const result = data.rates.COP * usd;
        console.log(`$${usd} USD is approximately ₱${result.toFixed(2)} COP`);
        return result;
    }
    function formatCOP(value) {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        }).format(value);
    }

    const fetchRooms = async () => {
        try {
            const res = await fetch(`https://trustappbackendlive-production.up.railway.app/api/rooms?user_id=${userId}`);
            const data = await res.json();
            //console.log("my rooms:", data);
            myMaches(data);
            setError404(false);
            if (userx != null) {
                if ((userx[0]?.id_app == undefined)) {
                    setidcode("registro sin completar")

                } else {
                    console.log(userx[0].id_app)
                    setidcode(userx[0].id_app)
                    setposition(userx[0].position)


                    supremeCheck()


                }

            }



        } catch (error) {
            setError404(true)

        }
    };

    const supremeCheck = async () => {
        setmyMachesvar([])
        try {
            const res = await fetch(`https://trustappbackendlive-production.up.railway.app/api/selectsupreme`);
            const data = await res.json();
            console.log("supreme data:", data);
            const result = data.data;


            for (let i = 0; i < result.length; i++) {
                console.log("supreme honest 1:", result[i]);
                console.log("supreme honest 2:", result[i].honest2);
                console.log("user pub key:", userx[0].pub_key);
                if (result[i].honest1 !== userx[0].pub_key && result[i].honest2 !== userx[0].pub_key) {
                    if (userx[0].position == 1 || userx[0].position == 2) {

                        console.log("need to claim assestxxxxxxx", result[i])
                        const endTime = new Date(result[i].end_time);
                        const now = new Date();

                        const limitSupreme = new Date(endTime.getTime() + 104400 * 1000);
                        const voteLimit = new Date(endTime.getTime() + 18000 * 1000);
                        let show = false;
                        if ((voteLimit < now) && (now < limitSupreme) && !result[i].distributed) {
                            show = true;
                        }
                        if ((result[i].allusersvoted) && !result[i].distributed && (now < limitSupreme)) {
                            show = true;

                        }
                        if (show) {


                            const a = {
                                localid: result[i].local_team_id,
                                awayid: result[i].away_team_id,
                                roomid: result[i].game_id,
                                match_id: result[i].game_id,
                                result: result[i].result,
                                type: 1,
                                league: "Supreme Court",
                                week: result[i].fecha,
                                team1: result[i].local_team_name,
                                team2: result[i].away_team_name,
                                logo1: result[i].local_team_colors,
                                logo2: result[i].away_team_colors,
                                reason: "Resultado",
                                honest1: result[i].honest1,
                                honest2: result[i].honest2,
                                adm: result[i].adm,
                                externalUser: result[i].externalUser,
                                gameState: "supreme"
                            }
                            setmyMachesvar(prev => [...prev, a]);
                        }

                    }
                } else if (result[i].distributed == true && (((result[i].honest1_claim == false || !result[i].honest1_claim) && result[i].honest1 == userx[0].pub_key) || ((result[i].honest2_claim == false || !result[i].honest2_claim) && result[i].honest2 == userx[0].pub_key))) {
                    console.log("need to claim assest", result[i])
                    const a = {
                        localid: result[i].local_team_id,
                        awayid: result[i].away_team_id,
                        roomid: result[i].game_id,
                        match_id: result[i].game_id,
                        result: result[i].result,
                        type: 1,
                        league: "Supreme Court",
                        week: result[i].fecha,
                        team1: result[i].local_team_name,
                        team2: result[i].away_team_name,
                        logo1: result[i].local_team_colors,
                        logo2: result[i].away_team_colors,
                        reason: "Gracias",
                        honest1: result[i].honest1,
                        honest2: result[i].honest2,
                        honest1_claim: result[i].honest1_claim,
                        honest2_claim: result[i].honest2_claim,
                        adm: result[i].adm,
                        externalUser: result[i].externalUser,
                        result: result[i].result,
                        distributed: true,
                        gameState: "supreme"
                    }
                    setmyMachesvar(prev => [...prev, a]);
                }
            }


        } catch (error) {
            console.log("Error :", error);
        }

    }
    const goGameResult = async (roomid, match_id, result, type, league, week, localid, awayid, team1, team2, logo1, logo2, reason, howmuch, gameState, honest1, honest2, adm, externalUser, distributed, honest1_claim, honest2_claim) => {
        if (type == 1) {
            router.push({
                pathname: "/GameDatail",
                params: { roomid, match_id, result, type, league, week, localid, awayid, team1, team2, logo1: JSON.stringify(logo1), logo2: JSON.stringify(logo2), reason, howmuch, gameState, honest1, honest2, adm, externalUser, distributed, honest1_claim, honest2_claim },
            });
        } else if (type == 0) {
            router.push({
                pathname: "/specificRoom",
                params: {
                    room_id: roomid,
                },
            });
        }
        console.log("go to game detail", type);

    }
    const myMaches = async (rooms) => {
        const now = new Date();
        for (let i = 0; i < rooms.length; i++) {
            const res = await fetch(`https://trustappbackendlive-production.up.railway.app/api/room?user_id=${session.user.id}&room_id=${rooms[i].room_id}`);
            const data = await res.json();
            console.log("my match data:", data);
            const startGame = new Date(data[0].start_time);
            console.log(data[0].user_assest)
            const endTime = new Date(data[0].finish_time);
            const limit = new Date(endTime.getTime() + 18000 * 1000);
            const limitSupreme = new Date(endTime.getTime() + 104400 * 1000);

            if (now > limitSupreme && data[0].user_bet != "false" && !data[0].result && data[0].active && !data[0].user_claim && !data[0].supreme_distributed) {
                console.log("no result so claim refund");
                let usd = await getUsdToCop(parseFloat((data[0].min_amount) / 10_000_000));
                let formattedUsd = await formatCOP(usd);
                const a = {
                    localid: rooms[i].local_team_id,
                    awayid: rooms[i].away_team_id,
                    roomid: rooms[i].room_id,
                    type: 0,

                    match_id: rooms[i].match_id,
                    league: "Colombia primera A",
                    week: rooms[i].fecha,
                    team1: rooms[i].local_team_name,
                    team2: rooms[i].away_team_name,
                    logo1: rooms[i].local_team_colors,
                    logo2: rooms[i].away_team_colors,
                    reason: "Disolver",
                    howmuch: formattedUsd,
                    gameState: "cobrar"
                }
                setmyMachesvar(prev => [...prev, a]);

            } else
                if (now > endTime && data[0].user_bet != "false" && !data[0].active && !data[0].user_claim) {
                    let usd = await getUsdToCop(parseFloat((data[0].min_amount) / 10_000_000));
                    let formattedUsd = await formatCOP(usd);
                    console.log("no active game after starting");
                    const a = {
                        localid: rooms[i].local_team_id,
                        awayid: rooms[i].away_team_id,
                        roomid: rooms[i].room_id,
                        type: 0,

                        match_id: rooms[i].match_id,
                        league: "Acuerdo sin resolver",
                        week: rooms[i].fecha,
                        team1: rooms[i].local_team_name,
                        team2: rooms[i].away_team_name,
                        logo1: rooms[i].local_team_colors,
                        logo2: rooms[i].away_team_colors,
                        reason: "Disolver",
                        howmuch: formattedUsd,
                        gameState: "cobrar"
                    }
                    setmyMachesvar(prev => [...prev, a]);
                } else
                    if (limit > now && now > endTime && data[0].user_bet != "false" && data[0].active && (!data[0].result || data[0].user_assest == "false")) {
                        console.log("subir resultado");
                        const a = {
                            localid: rooms[i].local_team_id,
                            awayid: rooms[i].away_team_id,
                            roomid: rooms[i].room_id,
                            type: 0,

                            match_id: rooms[i].match_id,
                            league: "Acuerdo sin resolver",
                            week: rooms[i].fecha,
                            team1: rooms[i].local_team_name,
                            team2: rooms[i].away_team_name,
                            logo1: rooms[i].local_team_colors,
                            logo2: rooms[i].away_team_colors,
                            reason: "Resultado",
                            howmuch: `${(parseFloat(data[0].min_amount) / 10_000_000)
                                .toFixed(6)
                                .replace(/\.?0+$/, "")} usd`,
                            gameState: "resultado"
                        }
                        setmyMachesvar(prev => [...prev, a]);
                    } else
                        if (data[0].ready && !data[0].user_claim) {
                            console.log("Game without claiming", data[0]);
                            let show = false;
                            if (data[0].supreme_distributed == true) {
                                if (now > limit && !(data[0].user_assest == "approve" || data[0].user_assest == "reject")) {
                                    if (data[0].supreme_result == data[0].user_bet) {
                                        show = true;
                                    }
                                } else if (data[0].supreme_result == data[0].result) {
                                    if (data[0].user_assest == "approve") {
                                        show = true;
                                    }
                                } else {
                                    if (data[0].user_assest == "reject") {
                                        show = true;
                                    }
                                }



                            } else {
                                show = true;

                            } if (show) {
                                const a = {
                                    localid: rooms[i].local_team_id,
                                    awayid: rooms[i].away_team_id,
                                    roomid: rooms[i].room_id,
                                    type: 0,

                                    match_id: rooms[i].match_id,
                                    league: "Acuerdo sin resolver",
                                    week: rooms[i].fecha,
                                    team1: rooms[i].local_team_name,
                                    team2: rooms[i].away_team_name,
                                    logo1: rooms[i].local_team_colors,
                                    logo2: rooms[i].away_team_colors,
                                    reason: "Ejecutar",
                                    howmuch: `${(parseFloat(data[0].min_amount) / 10_000_000)
                                        .toFixed(6)
                                        .replace(/\.?0+$/, "")} usd`,
                                    gameState: "upcoming"
                                }
                                setmyMachesvar(prev => [...prev, a]);
                            }
                        }


        }


    }

    const UserBalance = async () => {
        if (userx != null) {
            if (!(!userx[0]?.pub_key)) {
                const account = await server.loadAccount(userx[0].pub_key);
                const assetUsdcBalance = account.balances.find(
                    (b) => b.asset_code === USDCasset.getCode() && b.asset_issuer === USDCasset.getIssuer()
                );
                const asseTrustBalance = account.balances.find(
                    (b) => b.asset_code === TrustAsset.getCode() && b.asset_issuer === TrustAsset.getIssuer()
                );

                if (assetUsdcBalance) {
                    console.log(`${USDCasset.getCode()} balance: ${assetUsdcBalance.balance}`);
                    let usd = await getUsdToCop(parseFloat(assetUsdcBalance.balance));
                    let formattedUsd = await formatCOP(usd);
                    console.log(formattedUsd, "Apx");
                    setUSDCBalance(formattedUsd);
                } else {
                    console.log(`No ${USDCasset.getCode()} balance found`);
                }
                if (asseTrustBalance) {
                    console.log(`${TrustAsset.getCode()} balance: ${asseTrustBalance.balance}`);
                    let trust = await getUsdToCop(asseTrustBalance.balance);
                    let formattedUsd = await formatCOP(trust);
                    setTRUSTBalance(formattedUsd);
                } else {
                    console.log(`No ${TrustAsset.getCode()} balance found`);
                }
            }
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


    function Section({ title, children }) {
        return (
            <View style={{ marginTop: 30 }}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                </View>
                <View style={styles.sectionContent}>{children}</View>
            </View>
        );
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setmyMachesvar([]);
        fetchRooms();
        UserBalance();
        // Simulate fetching new data
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    return (
        error404 ? (
            <AppError onRetry={() => onRefresh()} />
        ) : (
            <ScrollView style={styles.container} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.push({
                        pathname: "/summiter",
                    })} style={{ padding: 10, flexDirection: "row", alignItems: "center" }}>

                        <View style={{ marginLeft: 10 }}>

                            <Text style={styles.username}>{session.user.user_metadata.name}</Text>
                            <Text style={styles.userId}>ID: {idcode}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.headerIcons}>
                        <Text style={styles.icon}>{position}</Text>
                    </View>
                </View>

                {/* Total Bets */}
                <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>Saldo</Text>
                    <Text style={styles.totalValue}>{USDCBalance}</Text>
                    <Text style={styles.totalChange}>{TRUSTBalance + " Trust"}</Text>
                </View>


                {/* My Matches */}
                <Section title="My Matches">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
                        {myMachesvar
                            .filter(m => {
                                if (seen.has(m.roomid)) return false;
                                seen.add(m.roomid);
                                return true;
                            })
                            .map(m => (
                                <MatchCard
                                    goToGameDetail={goGameResult}
                                    key={m.roomid}
                                    data={m}
                                />
                            ))}
                    </ScrollView>

                </Section>

                {/* Watchlist */}
                <Section title="Watchlist">
                    <MatchesScreen onOpen={(id, data) => { console.log(id, data); setModalVisible(true), setdataModalVisible(data) }} />
                </Section>
                <BetRoomModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    game={dataModalVisible}
                />

            </ScrollView >
        )


    );

}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
        backgroundColor: "#0A0F14",
        padding: 20,
        flex: 1,
    },

    /* Header */
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    username: {
        color: "#F5F5F5",
        fontSize: 18,
        fontWeight: "700",
    },
    userId: {
        color: "#C8CCD1",
        fontSize: 12,
    },
    headerIcons: {
        flexDirection: "row",
    },
    icon: {
        fontSize: 22,
        marginLeft: 15,
        color: "#28FF41",
    },

    /* Total */
    totalBox: {
        marginTop: 20,
        alignItems: "center",
    },
    totalLabel: {
        color: "#C8CCD1",
        fontSize: 14,
    },
    totalValue: {
        color: "#F5F5F5",
        fontSize: 34,
        fontWeight: "800",
        marginTop: 5,
    },
    totalChange: {
        color: "#28FF41",
        fontSize: 14,
        marginTop: 5,
    },

    /* Section */
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#F5F5F5",
    },
    sectionShow: {
        color: "#28FF41",
        fontWeight: "600",
    },
    sectionContent: {
        marginTop: 15,
    },

    /* Cards (My Matches + Watchlist) */
    matchCard: {
        backgroundColor: "#1A1F25",
        padding: 18,
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#1A1F25",
    },
    matchTeam: {
        fontSize: 16,
        fontWeight: "600",
        color: "#F5F5F5",
    },
    matchCenter: {
        alignItems: "center",
    },
    matchTime: {
        fontSize: 18,
        fontWeight: "700",
        color: "#28FF41",
    },
    matchDate: {
        color: "#C8CCD1",
        fontSize: 12,
    },

    watchCard: {
        backgroundColor: "#1A1F25",
        padding: 18,
        borderRadius: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#1A1F25",
    },
    watchTeam: {
        fontSize: 17,
        fontWeight: "700",
        color: "#F5F5F5",
    },
    watchOdds: {
        fontSize: 20,
        marginTop: 5,
        color: "#F5F5F5",
        fontWeight: "700",
    },
    watchChange: {
        marginTop: 4,
        color: "#28FF41",
        fontWeight: "600",
    },
});



export default HomeScreen