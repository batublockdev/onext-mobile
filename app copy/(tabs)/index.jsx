import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSignOut } from "../(auth)/signout";
import DepositComponent from '../../components/buttonSend';
import MatchesScreen from '../../components/game';
import MatchCard from '../../components/MatchCard';

import { useRouter } from "expo-router";
import PinVerification from "../../components/pin";
import { useApp } from '../contextUser';

const HomeScreen = () => {
    const { ensureTrustline, startDeposit } = require('../../anchor/anchor');
    const { decryptOnly } = require('../../self-wallet/wallet');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null); // null | "success" | "error"
    const [USDCBalance, setUSDCBalance] = useState("0"); // null | "success" | "error"
    const [TRUSTBalance, setTRUSTBalance] = useState("0"); // null | "success" | "error"
    const [loadingMessage, setLoadingMessage] = useState('...');
    const [reason, setReason] = useState(null);
    const [myMachesvar, setmyMachesvar] = useState([]);
    const [idcode, setidcode] = useState("N/A");
    const [position, setposition] = useState("0");


    const router = useRouter();

    const [depositUrl, setDepositUrl] = useState(null);
    const { signOutUser } = useSignOut();
    const { isSignedIn, user, isLoaded } = useUser();
    const { userx, setUserx } = useApp();
    const StellarSdk = require("stellar-sdk");
    const userId = user ? user.id : null;
    const server = new StellarSdk.Horizon.Server(
        "https://horizon-testnet.stellar.org",
    );

    const USDCasset = new StellarSdk.Asset("USD", "GCJWRFAW62LZB6LTSN57OMBYI6CATVFI3CKM63GSL7GNXIYDOL3J7FPY");
    const TrustAsset = new StellarSdk.Asset("TRUST", "GCJWRFAW62LZB6LTSN57OMBYI6CATVFI3CKM63GSL7GNXIYDOL3J7FPY");
    useEffect(() => {
        fetchRooms();
        if (userx != null) {
            if (!userx?.[0]?.id_app) {
                setidcode("registro sin completar")
            } else {
                setidcode(userx[0].id_app)
                setposition(userx[0].position)
                if (userx[0].position == 1 || userx[0].position == 2) {

                    supremeCheck()
                }

            }

        }

    }, []);
    useEffect(() => {

        if (userx != null) {
            if (!userx?.[0]?.id_app) {
                setidcode("registro sin completar")
            } else {
                setidcode(userx[0].id_app)
                setposition(userx[0].position)

                if (userx[0].position == 1 || userx[0].position == 2) {

                    supremeCheck()
                }

            }
        }

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
            const res = await fetch(`https://backendtrustapp-production.up.railway.app/api/rooms?user_id=${userId}`);
            const data = await res.json();
            //console.log("my rooms:", data);
            myMaches(data);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    const supremeCheck = async () => {
        console.log("got here")
        try {
            const res = await fetch(`https://backendtrustapp-production.up.railway.app/api/selectsupreme`);
            const data = await res.json();
            console.log("supreme games need of a result", data);
            const result = data.data;
            for (let i = 0; i < result.length; i++) {
                if (result[i].honest1 !== userx[0].pub_key && result[i].honest2 !== userx[0].pub_key) {
                    console.log("need to claim assestxxxxxxx")

                    const a = {
                        roomid: result[i].game_id,
                        match_id: result[i].game_id,
                        result: result[i].result,
                        type: 1,
                        league: "La Liga",
                        week: result[i].fecha,
                        team1: result[i].local_team_name,
                        team2: result[i].away_team_name,
                        logo1: result[i].local_team_logo,
                        logo2: result[i].away_team_logo,
                        reason: "Resultado",
                        honest1: result[i].honest1,
                        honest2: result[i].honest2,
                        adm: result[i].adm,
                        externalUser: result[i].externalUser,
                        result: result[i].result,
                        gameState: "final"
                    }
                    setmyMachesvar(prev => [...prev, a]);
                } else if (result[i].distributed == true && ((result[i].honest1_claim == false && result[i].honest1 == userx[0].pub_key) || (result[i].honest2_claim == false && result[i].honest2 == userx[0].pub_key))) {
                    console.log("need to claim assest")
                    const a = {
                        roomid: result[i].game_id,
                        match_id: result[i].game_id,
                        result: result[i].result,
                        type: 1,
                        league: "La Liga",
                        week: result[i].fecha,
                        team1: result[i].local_team_name,
                        team2: result[i].away_team_name,
                        logo1: result[i].local_team_logo,
                        logo2: result[i].away_team_logo,
                        reason: "Resultado",
                        honest1: result[i].honest1,
                        honest2: result[i].honest2,
                        adm: result[i].adm,
                        externalUser: result[i].externalUser,
                        result: result[i].result,
                        distributed: true,
                        gameState: "final"
                    }
                    setmyMachesvar(prev => [...prev, a]);
                }
            }

        } catch (error) {
            console.error("Error :", error);
        }

    }
    const goGameResult = async (roomid, match_id, result, type, league, week, team1, team2, logo1, logo2, reason, howmuch, gameState, honest1, honest2, adm, externalUser, distributed) => {
        if (type == 1) {
            router.push({
                pathname: "/GameDatail",
                params: { match_id, result, type, league, week, team1, team2, logo1, logo2, reason, howmuch, gameState, honest1, honest2, adm, externalUser, distributed },
            });
        } else if (type == 0) {
            router.push({
                pathname: "/specificRoom",
                params: {
                    room_id: roomid,
                },
            });
        }
        console.log("go to game detail", roomid);

    }
    const myMaches = async (rooms) => {

        const now = new Date();
        for (let i = 0; i < rooms.length; i++) {
            const res = await fetch(`https://backendtrustapp-production.up.railway.app/api/room?user_id=${user.id}&room_id=${rooms[i].room_id}`);
            const data = await res.json();
            console.log("my match data:", data);
            const startGame = new Date(data[0].start_time);
            console.log(data[0].user_assest)
            const endTime = new Date(data[0].finish_time);
            const limit = new Date(endTime.getTime() + 18000 * 1000);
            const limitStart = new Date(endTime.getTime() + 600 * 1000);
            if (now > limit && data[0].user_bet != "false" && !data[0].result) {
                console.log("no result so claim refund");
                const a = {
                    roomid: rooms[i].room_id,
                    type: 0,

                    match_id: rooms[i].match_id,
                    league: "Colombia primera A",
                    week: rooms[i].fecha,
                    team1: rooms[i].local_team_name,
                    team2: rooms[i].away_team_name,
                    logo1: rooms[i].local_team_logo,
                    logo2: rooms[i].away_team_logo,
                    reason: "Devolución",
                    howmuch: `${(parseFloat(data[0].min_amount) / 10_000_000)
                        .toFixed(6)
                        .replace(/\.?0+$/, "")} usd`,
                    gameState: "final"
                }
                setmyMachesvar(prev => [...prev, a]);

            } else
                if (now > limitStart && data[0].user_bet != "false" && !data[0].active) {
                    console.log("no active game after starting");
                    const a = {
                        roomid: rooms[i].room_id,
                        type: 0,

                        match_id: rooms[i].match_id,
                        league: "Colombia primera A",
                        week: rooms[i].fecha,
                        team1: rooms[i].local_team_name,
                        team2: rooms[i].away_team_name,
                        logo1: rooms[i].local_team_logo,
                        logo2: rooms[i].away_team_logo,
                        reason: "Devolución",
                        howmuch: `${(parseFloat(data[0].min_amount) / 10_000_000)
                            .toFixed(6)
                            .replace(/\.?0+$/, "")} usd`,
                        gameState: "final"
                    }
                    setmyMachesvar(prev => [...prev, a]);
                } else
                    if (now > endTime && data[0].user_bet != "false" && data[0].active && (!data[0].result || data[0].user_assest == "false")) {
                        console.log("subir resultado");
                        const a = {
                            roomid: rooms[i].room_id,
                            type: 0,

                            match_id: rooms[i].match_id,
                            league: "Colombia primera A",
                            week: rooms[i].fecha,
                            team1: rooms[i].local_team_name,
                            team2: rooms[i].away_team_name,
                            logo1: rooms[i].local_team_logo,
                            logo2: rooms[i].away_team_logo,
                            reason: "Resultado",
                            howmuch: `${(parseFloat(data[0].min_amount) / 10_000_000)
                                .toFixed(6)
                                .replace(/\.?0+$/, "")} usd`,
                            gameState: "final"
                        }
                        setmyMachesvar(prev => [...prev, a]);
                    } else
                        if (data[0].ready && !data[0].user_claim) {
                            console.log("Game without claiming");
                            const a = {
                                roomid: rooms[i].room_id,
                                type: 0,

                                match_id: rooms[i].match_id,
                                league: "Colombia primera A",
                                week: rooms[i].fecha,
                                team1: rooms[i].local_team_name,
                                team2: rooms[i].away_team_name,
                                logo1: rooms[i].local_team_logo,
                                logo2: rooms[i].away_team_logo,
                                reason: "Cobrar",
                                howmuch: `${(parseFloat(data[0].min_amount) / 10_000_000)
                                    .toFixed(6)
                                    .replace(/\.?0+$/, "")} usd`,
                                gameState: "live"
                            }
                            // setmyMachesvar(prev => [...prev, a]);
                        }


        }

    }
    useEffect(() => {
        UserBalance();
    }, []);
    useEffect(() => {
        UserBalance();
    }, [userx]);
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



    if (isLoading) {
        return (<PinVerification
            mode="verify"
            message={loadingMessage}
            onComplete={handleDeposit}

        />);
    }
    if (status == "sucess") {
        return (
            <DepositComponent depositUrl={depositUrl} />

        )
    }
    else {
        return (
            <ScrollView style={styles.container}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.push({
                        pathname: "/summiter",
                    })} style={{ padding: 10, flexDirection: "row", alignItems: "center" }}>

                        <View style={{ marginLeft: 10 }}>

                            <Text style={styles.username}>{user.firstName}</Text>
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
                        {myMachesvar.map((m) => (
                            <MatchCard goToGameDetail={goGameResult} key={m.roomid} data={m} />
                        ))}
                    </ScrollView>

                </Section>

                {/* Watchlist */}
                <Section title="Watchlist">
                    <MatchesScreen />
                </Section>

            </ScrollView >

        );

    }
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#f6f8fa",
        padding: 20,
    },

    /* Header */
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 30,
    },
    username: {
        color: "#222",
        fontSize: 18,
        fontWeight: "700",
    },
    userId: {
        color: "#777",
        fontSize: 12,
    },
    headerIcons: {
        flexDirection: "row",
    },
    icon: {
        fontSize: 22,
        marginLeft: 15,
        color: "#444",
    },

    /* Total */
    totalBox: {
        marginTop: 20,
        alignItems: "center",
    },
    totalLabel: {
        color: "#777",
        fontSize: 14,
    },
    totalValue: {
        color: "#000",
        fontSize: 34,
        fontWeight: "800",
        marginTop: 5,
    },
    totalChange: {
        color: "#0bbf63",
        fontSize: 14,
        marginTop: 5,
    },

    /* Buttons */
    buttonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 25,
    },
    lightBtn: {
        backgroundColor: "#e9ecef",
        width: "48%",
        padding: 14,
        borderRadius: 15,
        alignItems: "center",
    },
    darkBtn: {
        backgroundColor: "#000",
        width: "48%",
        padding: 14,
        borderRadius: 15,
        alignItems: "center",
    },
    lightBtnText: {
        color: "#000",
        fontWeight: "600",
    },
    profileCircle: {
        width: 40,
        height: 40,
        backgroundColor: "#000",
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10
    },
    darkBtnText: {
        color: "#fff",
        fontWeight: "600",
    },

    /* Section */
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111",
    },
    sectionShow: {
        color: "#0bbf63",
        fontWeight: "600",
    },
    sectionContent: {
        marginTop: 15,
    },

    /* Match Card */
    matchCard: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    matchTeam: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    matchCenter: {
        alignItems: "center",
    },
    matchTime: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0bbf63",
    },
    matchDate: {
        color: "#999",
        fontSize: 12,
    },

    /* Watchlist */
    watchCard: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 16,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    watchTeam: {
        fontSize: 17,
        fontWeight: "700",
        color: "#333",
    },
    watchOdds: {
        fontSize: 20,
        marginTop: 5,
        color: "#000",
        fontWeight: "700",
    },
    watchChange: {
        marginTop: 4,
        color: "#0bbf63",
        fontWeight: "600",
    },
});


export default HomeScreen