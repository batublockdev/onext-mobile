import { useUser } from "@clerk/clerk-react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ConfirmPrediction from "../components/ConfirmationPrediction";
import { ERROR_MESSAGES } from "../components/error";
import LoadingOverlay from "../components/loadingCompnent";
import { teamColorsByID } from "../components/TeamColor";
import TeamShield from "../components/TeamShield";
import TrustFullScreenLoading from "../components/TrustFullScreenLoading";
import { useApp } from "./contextUser";
const {
    place_bet,
    claim,
    asses_result,
    execute_distribution,
    claim_refund,
    summit_result
} = require("../SmartContract/smartcontractOperation");
const { decryptOnly } = require('../self-wallet/wallet');
export default function RoomDetail({ }) {
    const router = useRouter();
    const [loadingx, setIsLoading] = useState(false);

    const { isSignedIn, user, isLoaded } = useUser();

    const [rooms, setRooms] = useState([]);
    const [canClaimRefund, setcanClaimRefund] = useState(false);
    const [message, setMessage] = useState(null);
    const [result, setResult] = useState(null);
    const [reject, setReject] = useState(false);
    const [loading, setLoading] = useState(true);

    const [fee, setFee] = useState("");

    const [LastPred, setLastPred] = useState(null);

    const [betis, setBet] = useState(null);
    const [activeBet, setactiveBet] = useState(null);
    const [lastAsses, setlastAsses] = useState(null);
    const [LastPlay, setLastPlay] = useState(null);
    let collateral = false;

    const [msgLoading, setMsgLoading] = useState("Cargando");
    const [disclaimer, setDisclaimer] = useState(true)


    const [teamSelected, setteamSelected] = useState(null);   // e.g. "Team_local"
    const [teamSelectedlogo, setteamSelectedlogo] = useState(null);   // e.g. "Team_local"

    const [matchResult, setMatchResult] = useState(null);   // e.g. "Team_local"
    const [userDecision, setUserDecision] = useState(null); // "accepted" or "rejected"
    const [claimAvailable, setClaimAvailable] = useState(false);
    const [status, setStatus] = useState(null); // null | "success" | "error".
    const [readytoSend, setreadytoSend] = useState(null); // null | "success" | "error"

    const [amount, setamount] = useState(""); // null | "success" | "error"

    const [reason, setReason] = useState("");
    const [color1, setColor1] = useState([]);
    const [color2, setColor2] = useState([]);


    const [msg, setMsg] = useState("");
    let id1 = 0;
    let id2 = 0;
    const { userx, keypair } = useApp();
    const [loadingMessage, setLoadingMessage] = useState("Verifying PIN...");
    const [done, setdone] = useState(false);
    const [selected, setSelected] = useState(null);
    const params = useLocalSearchParams();
    useEffect(() => {
        const load = async () => {
            try {
                fetchRooms();
                console.log("User ID in Rooms:", user.id);

            } catch (e) {
                console.log("Startup error:", e);
            }
        };
        load();
    }, []);
    const handleClaim = async () => {
        setIsLoading(true);
        setStatus("loading");

        setMsgLoading("Ejecutando")
        try {

            //fn execute_distribution(gameId: i128)

            const keypairUser = keypair; try {
                await execute_distribution(params.room_id, keypairUser);
            } catch (err) {
                const { reason, code } = parseContractError(err);
                if (code === 221) {
                    console.log("Game already set, proceeding...");
                } else {
                    throw err;
                }
            }
            setMsgLoading("Recibiendo")

            //async function claim(address, setting, claimType, keypairUser)
            const value = await claim(userx[0].pub_key, params.room_id, "User", keypairUser);
            console.log("Resultado claim: ", value)
            const valueItems = value._value;
            const valUsd = valueItems[0]._value._attributes;
            const valTrust = valueItems[1]._value._attributes;

            const usd = BigInt(valUsd.lo._value);
            const trust = BigInt(valTrust.lo._value);


            let amountUsd = (Number(usd) / 10_000_000).toFixed(2);
            const amountTrust = (Number(trust) / 10_000_000).toFixed(2);

            if (amountUsd != 0) {
                amountUsd - (rooms.min_amount / 10000000)
                console.log(amountUsd)
            }
            let cop = await getUsdToCop(amountUsd);
            console.log(cop)

            /** we got to show all the info */
            if (amountTrust == 0) {
                setMsgLoading(` + ${cop} `)

            } else {
                let trust = await getUsdToCop(amountTrust);
                setMsgLoading(` + ${cop} y + ${trust} Trust`)

            }


            try {
                const response = await fetch('https://backendtrustapp-production.up.railway.app/api/updateroomuser', {
                    method: 'POST', // must be POST to send body
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_user: userx[0].user_id, id_room: params.room_id, bet: rooms.user_bet, claim: true, active: true, ready: true, colaterall: rooms.colaterall, amount_earned: cop }), // send your user ID here
                });

                if (!response.ok) {
                    console.log('Server responded with error:', response.status);
                    return;
                }
                const data = await response.json();
                console.log('User data saved successfully:', data);


            } catch (error) {
                console.log('Error fetching user data:', error);
            }
            setStatus("success");

            setMessage("Acuerdo completado");

        } catch (error) {
            console.log("error", error);
            const { reason, code } = parseContractError(error);
            console.log("error", code);
            setStatus("error");
            setReason();
            setMsgLoading(reason)

            return;
        }

    };
    const handleRefund = async () => {
        setIsLoading(true);
        setStatus("loading");
        setMsgLoading("Recibiendo")
        try {
            const keypairUser = keypair;

            const value = await claim_refund(userx[0].pub_key, params.room_id, keypairUser);
            console.log("Resultado claim: ", value)
            const valueItems = value._value;
            const valUsd = valueItems[0]._value._attributes;
            const valTrust = valueItems[1]._value._attributes;

            const usd = BigInt(valUsd.lo._value);
            const trust = BigInt(valTrust.lo._value);


            let amountUsd = (Number(usd) / 10_000_000).toFixed(2);
            const amountTrust = (Number(trust) / 10_000_000).toFixed(2);
            /** we got to show all the info */
            let cop = await getUsdToCop(amountUsd);

            if (amountTrust == 0) {
                setMsgLoading(` + ${cop} `)

            } else {
                let copTrust = await getUsdToCop(amountUsd);

                setMsgLoading(` + ${cop} y + ${copTrust} `)

            }

            /** we got to show all the info */

            try {
                const response = await fetch('https://backendtrustapp-production.up.railway.app/api/updateroomuser', {
                    method: 'POST', // must be POST to send body
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_user: userx[0].user_id, id_room: params.room_id, bet: rooms.user_bet, claim: true, active: activeBet, ready: claimAvailable, colaterall: rooms.colaterall, amount_earned: cop }), // send your user ID here
                });

                if (!response.ok) {
                    console.log('Server responded with error:', response.status);
                    return;
                }
                const data = await response.json();
                console.log('User data saved successfully:', data);


            } catch (error) {
                console.log('Error fetching user data:', error);
            }
            setStatus("success");
            setMessage("Acuerdo completado");



        } catch (error) {
            console.log("error", error);
            const { reason, code } = parseContractError(error);
            console.log("error", code);
            setStatus("error");
            setReason(reason);
            setIsLoading(false);
            return;
        }

    }
    const handlesummit = async (answer) => {
        setIsLoading(true);
        setStatus("loading");

        setMsgLoading("Enviando ...")

        try {
            const keypairUser = keypair; console.log("selecte: ", answer + " " + rooms.match_id, +" " + params.room_id)
            setLoadingMessage("Enviando resultado para su evaluacion")

            await summit_result(keypairUser.publicKey(), "description", rooms.match_id, answer, keypairUser, params.room_id,);
            setStatus("success");
            setIsLoading(false);
            try {
                const response = await fetch('https://backendtrustapp-production.up.railway.app/api/updateroomuserresult', {
                    method: 'POST', // must be POST to send body
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_user: userx[0].user_id, id_room: params.room_id, bet: rooms.user_bet, assest: "approve", claim: false, resultx: answer, id_game: rooms.match_id }), // send your user ID here
                });

                if (!response.ok) {
                    console.log('Server responded with error:', response.status);
                    return;
                }
                const data = await response.json();
                console.log('User data saved successfully:', data);


            } catch (error) {
                console.log('Error fetching user data:', error);
            }
            setMatchResult(answer);
            setStatus("success");
            setIsLoading(false);
            setUserDecision("approve");
            setResult(false);
        } catch (error) {

            const { reason, code } = parseContractError(error);
            const errorMsg =
                error.message || error.reason || "An unexpected error occurred.";

            setStatus("error");
            setMsgLoading(reason)



        }
    };
    const handleDesition = async (answer) => {
        setIsLoading(true);
        setStatus("loading");

        setMsgLoading("Enviando ...")
        try {
            const keypairUser = keypair;
            //async function asses_result(address, setting, game_id, desition) {
            setLoadingMessage("Enviando opinion del resultado")

            await asses_result(userx[0].pub_key, params.room_id, answer, keypairUser);
            setIsLoading(false);
            let ready = false;
            if (lastAsses && !(answer == "reject" || reject)) {
                ready = true;
                setClaimAvailable(true)
            }
            setLoadingMessage("Guardando opinion ")

            try {
                const response = await fetch('https://backendtrustapp-production.up.railway.app/api/updateroomuser', {
                    method: 'POST', // must be POST to send body
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_user: userx[0].user_id, id_room: params.room_id, bet: rooms.user_bet, assest: answer, claim: false, active: true, ready: ready, colaterall: rooms.colaterall, amount_earned: rooms.amount_earned }), // send your user ID here
                });

                if (!response.ok) {
                    console.log('Server responded with error:', response.status);
                    return;
                }
                setUserDecision(answer)
                const data = await response.json();
                console.log('User data saved successfully:', data);


            } catch (error) {
                console.log('Error fetching user data:', error);
            }
            if (answer == "reject" || reject) {
                setMessage("El resultado propuesto ha sido rechazado, este sera resuelto en breve")

            }
            if (answer == "reject") {
                try {
                    const response = await fetch('https://backendtrustapp-production.up.railway.app/api/insertsupreme', {
                        method: 'POST', // must be POST to send body
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id_game: rooms.match_id }), // send your user ID here
                    });

                    if (!response.ok) {
                        console.log('Server responded with error:', response.status);
                        return;
                    }
                    setUserDecision(answer)
                    const data = await response.json();
                    console.log('User data saved successfully:', data);


                } catch (error) {
                    console.log('Error fetching user data:', error);
                }
            }
            setStatus("success");


        } catch (error) {
            console.log("error", error);

            const { reason, code } = parseContractError(error);
            const errorMsg =
                error.message || error.reason || "An unexpected error occurred.";
            setStatus("error");
            setMsgLoading(reason)

            return;
        }

    }
    const fetchRooms = async () => {
        console.log("Fetching room details for room ID:", params.room_id);
        try {
            const res = await fetch(`https://backendtrustapp-production.up.railway.app/api/room?user_id=${user.id}&room_id=${params.room_id}`);
            const data = await res.json();

            setRooms(data[0]);
            let fee = 0;
            console.log(data[0].colaterall)
            if (data[0].colaterall) {
                fee = data[0].min_amount * 0.20;
                console.log("fee cop")
            } else {
                fee = data[0].min_amount * 0.10;
                console.log("fee co2p")


            }

            let feeCop = await getUsdToCop(fee / 10000000);

            setFee(feeCop)
            let cop = await getUsdToCop(data[0].min_amount / 10000000);
            setamount(cop);
            if (data[0].user_assest == 'false') {
                setUserDecision(null)
            } else {
                setUserDecision(data[0].user_assest)
                setClaimAvailable(data[0].ready);
                if (data[0].user_claim == true) {
                    setMessage("Acuerdo completado");
                }
            }


            setMatchResult(data[0].result)
            setactiveBet(data[0].active)
            console.log(data[0])
            let noPlayUsers = 0;
            let noAssessUsers = 0;
            let rejected = false;
            let lastBet = "";
            console.log(data[0].local_team_id)
            id1 = data[0].local_team_id;
            setColor1(teamColorsByID[id1].colors)
            id2 = data[0].away_team_id;
            setColor2(teamColorsByID[id2].colors)

            for (let i = 0; i < data[0].room_users.length; i++) {
                const item = data[0].room_users[i];
                if (!(data[0].active)) {
                    if (item.bet != "false") {
                        setLastPred(item.bet)
                    }
                }




                if (item.assesment == "false") {
                    noAssessUsers += 1;
                }
                if (item.assesment == "reject") {
                    setReject(true)
                    rejected = true;
                    console.log("someone has rejected")
                }
                if (item.bet == "false") {
                    noPlayUsers += 1;
                }

            }
            if (noPlayUsers == 1) {
                setLastPlay(true)
                console.log("the last one to assess")
            }
            if (noAssessUsers == 1) {
                setlastAsses(true)
            }

            const startGame = new Date(data[0].start_time);
            const now = new Date();

            const endTime = new Date(data[0].finish_time);
            const limit = new Date(endTime.getTime() + 18000 * 1000);
            const limitSupreme = new Date(endTime.getTime() + 104400 * 1000);
            const nowUTC2 = new Date(limitSupreme);

            console.log("Supreme limit in Colombia:", nowUTC2.toLocaleString("es-CO", { timeZone: "America/Bogota" }));
            console.log("End in Colombia:", endTime.toLocaleString("es-CO", { timeZone: "America/Bogota" }));




            const limitStart = new Date(endTime.getTime());
            if (now > limit && !data[0].result && !data[0].supreme_distributed) {
                console.log("limit passed")
                setMessage("El tiempo de resolucion ha pasado, el resultado sera resuelto en breve");
            }
            if (data[0].user_bet !== "false") {
                setBet(true);
                console.log("has jugado")
            }
            if (now > limitSupreme && data[0].user_bet != "false" && data[0].active && !data[0].result && !data[0].supreme_distributed) {
                setMessage("")
                setcanClaimRefund(true);
                console.log("no result so claim refund");
                if (data[0].user_claim == true) {
                    setMessage("Acuerdo completado");
                }

            }
            if (now > limitStart && data[0].user_bet != "false" && !data[0].active) {
                setcanClaimRefund(true);
                console.log("no active game after starting");
                if (data[0].user_claim == true) {
                    setMessage("Acuerdo completado");
                }
            }
            if (limit > now && now > endTime && data[0].user_bet != "false" && data[0].active && !data[0].result) {
                //limit this t 5hours
                setResult(true);
                console.log("subir resultado");
            }
            if (now > startGame && data[0].user_bet == "false") {
                setMessage("Ya es tarde para entrar");
                console.log("late");
            }
            if (data[0].user_assest != 'false' && rejected) {
                setMessage("El resultado ha sido rechazado, este sera resuelto en breve")
                console.log("late rejected");
            }
            if (data[0].supreme_distributed == true) {
                setClaimAvailable(true);
                setReject(false);
                setMessage(""),
                    setMatchResult(data[0].supreme_result)
                if (now > limit && !(data[0].user_assest == "approve" || data[0].user_assest == "reject")) {
                    if (data[0].supreme_result == data[0].user_bet) {

                    } else {
                        setMessage("no obtuvimos tu opnion acerca del resultado o tu prediccion fue incorrecta");

                    }
                }

                if (data[0].supreme_result == data[0].result) {
                    if (data[0].user_assest == "approve") {
                        console.log("late approved");
                        if (data[0].user_claim == true) {
                            setMessage("Acuerdo completado");
                        }
                    } else {
                        setMessage("La communidad ha estado en desacuerdo con tu opinion, no puedes reclamar esta recompensa ");
                    }

                } else {
                    if (data[0].user_assest == "reject") {
                        console.log("late approved");
                        if (data[0].user_claim == true) {
                            setMessage("Acuerdo completado");
                        }
                    } else {
                        setMessage("La communidad ha estado en desacuerdo con tu opinion, no puedes reclamar esta recompensa ");
                    }

                }



            }


            setLoading(false)
        } catch (error) {
            console.log("Error fetching rooms:", error);
        }
    };
    console.log(id1)
    const room = {
        title: `${rooms.local_team_name} vs ${rooms.away_team_name}`,
        local_team_name: rooms.local_team_name,
        away_team_name: rooms.away_team_name,
        local_team_logo: rooms.local_team_logo,
        away_team_logo: rooms.away_team_logo,
        start_time: rooms.start_time,
        finish_time: rooms.finish_time,
        active: rooms.active === "true" || rooms.active === true,
        bet: rooms.user_bet,
        users: rooms.room_users ? rooms.room_users : [],
        color1: id1 != 0 ? teamColorsByID[id1].colors : teamColorsByID[21].colors,
        color2: id2 != 0 ? teamColorsByID[id2].colors : teamColorsByID[21].colors,

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


    const play = async () => {
        setIsLoading(true);
        setStatus("loading");

        setMsgLoading("Enviando ...")
        try {
            const team = selected;
            console.log("Bet placed on:", team);
            console.log("rooms,", rooms.match_id)
            const keypairUser = keypair; const id_bet = Math.floor(100000 + Math.random() * 900000).toString();

            //async function place_bet(address, id_bet, game_id, team, amount, setting, keypairUser) {
            const value = Number(rooms.min_amount);
            console.log("Colateral", collateral)
            console.log(value)
            setLoadingMessage("Enviando prediccion a la red")
            await place_bet(userx[0].pub_key, id_bet, rooms.match_id, team, value, params.room_id, keypairUser, collateral);
            let active = false;
            console.log(LastPred)
            console.log(team)
            if ((LastPred != "false" && LastPred != null) && LastPred != team) {
                active = true;
                setactiveBet(true);
            }
            setLoadingMessage("Guardando prediccion ")

            try {
                const response = await fetch('https://backendtrustapp-production.up.railway.app/api/updateroomuser', {
                    method: 'POST', // must be POST to send body
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_user: userx[0].user_id, id_room: params.room_id, bet: team, claim: false, active: active, ready: false, colaterall: collateral, amount_earned: 0 }), // send your user ID here
                });

                if (!response.ok) {
                    console.log('Server responded with error:', response.status);
                    return;
                }
                const data = await response.json();
                console.log('User data saved successfully:', data);


            } catch (error) {
                console.log('Error fetching user data:', error);
            }
            setIsLoading(false);
            setBet(true);
            setStatus("success");
        } catch (error) {
            console.log("error", error);
            const { reason, code } = parseContractError(error);
            console.log("error", code);
            setStatus("error");
            setReason(reason);
            setIsLoading(false);
            return;
        }
    };
    const handlePredict = async (option) => {
        setSelected(option);
        if (option == "Team_local") {
            setteamSelected(room.local_team_name);
            setteamSelectedlogo(rooms.local_team_id);
        } else if (option == "Team_away") {
            setteamSelected(room.away_team_name);
            setteamSelectedlogo(rooms.away_team_id);
        }
        setreadytoSend(true);
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
    if (loading) {
        return <TrustFullScreenLoading />;
    }


    return (


        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
        >

            <LoadingOverlay
                visible={loadingx}
                status={status}
                message={msgLoading}
                onAutoClose={() => setIsLoading(false)}
                onClose={() => setIsLoading(false)}
            />

            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.push({ pathname: "/rooms" })}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>

            {/* GAME HEADER */}
            <View style={styles.gameHeader}>
                <Text style={styles.mainTitle}>{room.title}</Text>

                <View style={styles.teamsRow}>
                    <View style={styles.teamBox}>
                        <TeamShield
                            colors={color1}
                            width={80}
                            height={96}
                        />
                        <Text style={styles.team}>{room.local_team_name}</Text>
                    </View>

                    <Text style={styles.vs}>VS</Text>

                    <View style={styles.teamBox}>
                        <TeamShield
                            colors={color2}
                            width={80}
                            height={96}
                        />
                        <Text style={styles.team}>{room.away_team_name}</Text>
                    </View>
                </View>

                <View style={styles.gameDetails}>
                    <Text style={styles.dateText}>
                        {new Date(room.start_time).toLocaleString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: "America/Bogota"
                        })}{" "}
                        {new Date(room.start_time).toLocaleString("en-US", { month: "short", timeZone: "UTC" })}
                    </Text>

                    <Text style={[styles.statusText, { color: activeBet ? "#00E676" : "#FF5252" }]}>
                        {activeBet ? "Acuerdo activo" : "Esperando participantes"}
                    </Text>

                    <Text style={styles.amountText}>Acuerdo por: {amount}</Text>
                </View>
            </View>

            {/* ACTION BOX */}
            <View style={styles.actionBox}>
                <Text style={styles.actionTitle}>
                    {!betis && !message && !result ? "Selecciona tu opción" :
                        result && !message ? "Registrar resultado del encuentro" :
                            matchResult && !userDecision && !claimAvailable ? "Confirma el registro" :
                                claimAvailable ? "Recibir resultado del acuerdo" :
                                    canClaimRefund ? "Solicitar devolución" :
                                        "Acciones disponibles"
                    }
                </Text>

                {!betis && !message && (
                    <>
                        {["Team_local", "Tie", "Team_away"].map((option) => (
                            <TouchableOpacity key={option} style={styles.actionButton} onPress={() => handlePredict(option)}>
                                <Text style={styles.actionButtonText}>
                                    {option === "Team_local"
                                        ? room.local_team_name
                                        : option === "Tie"
                                            ? "Empate"
                                            : room.away_team_name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                {result && !message && (
                    <>
                        {["Team_local", "Tie", "Team_away"].map((option) => (
                            <TouchableOpacity key={option} style={styles.actionButton} onPress={() => handlesummit(option)}>
                                <Text style={styles.actionButtonText}>
                                    {option === "Team_local"
                                        ? room.local_team_name
                                        : option === "Tie"
                                            ? "Empate"
                                            : room.away_team_name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                {message && (
                    <Text style={styles.infoMessage}>{message}</Text>
                )}

                {canClaimRefund && !message && (
                    <TouchableOpacity style={styles.refundButton} onPress={() => handleRefund()}>
                        <Text style={styles.actionButtonText}>Solicitar devolución</Text>
                    </TouchableOpacity>
                )}

                {betis && !matchResult && !canClaimRefund && !message && !result && (
                    <Text style={styles.waiting}>Esperando finalización del encuentro...</Text>
                )}

                {matchResult && !message && (
                    <View style={styles.resultBox}>
                        <Text style={styles.resultText}>
                            Resultado registrado:{" "}
                            {matchResult === "Team_local"
                                ? room.local_team_name
                                : matchResult === "Team_away"
                                    ? room.away_team_name
                                    : "Empate"}
                        </Text>

                        {!userDecision && !claimAvailable && (
                            <View style={styles.decisionRow}>
                                <TouchableOpacity
                                    style={[styles.decisionButton, { backgroundColor: "#00E676" }]}
                                    onPress={() => handleDesition("approve")}
                                >
                                    <Text style={styles.decisionText}>Confirmar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.decisionButton, { backgroundColor: "#FF5252" }]}
                                    onPress={() => handleDesition("reject")}
                                >
                                    <Text style={styles.decisionText}>Rechazar</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {userDecision && !claimAvailable && (
                            <Text style={styles.userDecisionText}>
                                Has {userDecision === "approve" ? "confirmado" : "solicitado revisión"} del resultado.
                            </Text>
                        )}

                        {claimAvailable && (
                            <TouchableOpacity
                                style={[styles.claimButton, { backgroundColor: "#2196F3" }]}
                                onPress={() => handleClaim()}
                            >
                                <Text style={styles.decisionText}>Recibir resultado del acuerdo</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {/* VERTICAL DATA TABLE */}
            <View style={styles.tableBox}>
                <Text style={styles.tableTitle}>Detalles del acuerdo</Text>

                <View style={styles.tableRow}>
                    <Text style={styles.sectionLabel}>Participantes</Text>
                    <Text style={styles.sectionValue}>
                        {room.users.map(u => u.username).join(", ")}
                    </Text>
                </View>

                <View style={styles.tableRow}>
                    <Text style={styles.sectionLabel}>Seleccion</Text>
                    <Text style={styles.sectionValue}>
                        {betis ? (room.bet === "Team_local"
                            ? room.local_team_name
                            : room.bet === "Team_away"
                                ? room.away_team_name
                                : "Empate") : "Sin seleccionar"}
                    </Text>
                </View>

                <View style={styles.tableRow}>
                    <Text style={styles.sectionLabel}>Tarifa aplicada</Text>
                    <Text style={styles.sectionValue}>
                        {betis ? (rooms.colaterall ? (fee + " cop") : fee + " trust") : "Pendiente"}
                    </Text>
                </View>

                <View style={styles.tableRow}>
                    <Text style={styles.sectionLabel}>Resultado final</Text>
                    <Text style={styles.sectionValue}>
                        {rooms.amount_earned}
                    </Text>
                </View>
            </View>


            {
                readytoSend && (
                    <ConfirmPrediction
                        amount={rooms.min_amount}
                        prediction={selected}
                        teamName={teamSelected}
                        teamid={teamSelectedlogo}
                        onConfirm={(data) => {
                            // this runs in your previous screen
                            console.log("CONFIRMED DATA →", data);
                            if (data.type == "usd") {

                                collateral = true;
                                console.log("ture")
                            } else {
                                collateral = false;

                            }
                            play(data.prediction);
                            setreadytoSend(false);

                        }}
                        onBack={() => {
                            // go back
                            setreadytoSend(false);
                        }}
                    />
                )
            }
        </ScrollView>)

}



const styles = StyleSheet.create({
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 10,
    },

    sectionLabel: {
        color: "#00E676",
        fontSize: 14,
        fontWeight: "700",
        width: "40%",     // label stays left
    },

    sectionValue: {
        color: "#ccc",
        fontSize: 14,
        fontWeight: "500",
        textAlign: "right",
        width: "55%",     // values stay right
        flexWrap: "wrap", // long text wraps if needed
    },
    mainTitle: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 20,
    },

    tableBox: {
        backgroundColor: "#111",
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: "#00E67622",
        marginBottom: 40,
    },

    tableTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16,
        textAlign: "center",
    },



    sectionItem: {
        color: "#ccc",
        fontSize: 13,
        paddingLeft: 10,
        marginBottom: 4,
    },
    container: {
        flex: 1,
        backgroundColor: "#0D0D0D",
        padding: 16,
    },
    actionTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 14,
        textAlign: "center",
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderColor: "#00E67633",
    },

    backButton: {
        padding: 8,
        marginBottom: 10,
    },

    gameHeader: {
        backgroundColor: "#111",
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: "#00E67622",
        marginBottom: 18,
    },

    teamsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    teamBox: {
        alignItems: "center",
        width: "35%",
    },

    logo: {
        width: 55,
        height: 55,
        borderRadius: 12,
        marginBottom: 6,
    },

    team: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },

    vs: {
        color: "#00E676",
        fontSize: 16,
        fontWeight: "bold",
    },

    gameDetails: {
        marginTop: 12,
        alignItems: "center",
    },

    dateText: {
        color: "#aaa",
        fontSize: 12,
    },

    statusText: {
        fontSize: 14,
        marginTop: 4,
        fontWeight: "700",
    },

    amountText: {
        color: "#00E676",
        fontSize: 15,
        fontWeight: "600",
        marginTop: 8,
    },

    actionBox: {
        backgroundColor: "#111",
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: "#00E67622",
        marginBottom: 20,
    },

    actionButton: {
        backgroundColor: "#00E67622",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
    },

    actionButtonText: {
        color: "#00E676",
        fontWeight: "700",
        textAlign: "center",
    },

    infoMessage: {
        color: "#00E676",
        fontWeight: "600",
        textAlign: "center",
    },

    refundButton: {
        backgroundColor: "#FFC10733",
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
    },
    claimButton: {
        backgroundColor: "#07ff5133",
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
    },

    waiting: {
        color: "#aaa",
        textAlign: "center",
        marginTop: 10,
    },

    resultBox: {
        marginTop: 10,
    },

    resultText: {
        color: "#00E676",
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
    },

    decisionRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 12,
    },

    decisionButton: {
        padding: 12,
        borderRadius: 10,
        width: "45%",
    },

    decisionText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "700",
    },

    userDecisionText: {
        color: "#aaa",
        textAlign: "center",
        marginTop: 8,
    },

    /** TABLE **/
    tableBox: {
        backgroundColor: "#111",
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: "#00E67622",
        marginBottom: 30,
    },

    tableTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
    },

    tableHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },

    col: {
        width: "16%",
        color: "#00E676",
        fontSize: 12,
        fontWeight: "700",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderColor: "#222",
    },

    colValue: {
        width: "16%",
        color: "#ccc",
        fontSize: 11,
    },
});

