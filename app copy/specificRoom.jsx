import { useUser } from "@clerk/clerk-react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";


import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ConfirmationMessage from "../components/ConfimationComponent";
import ConfirmPrediction from "../components/ConfirmationPrediction";
import { ERROR_MESSAGES } from "../components/error";
import PinVerification from "../components/pin";
import { teamLogos } from "../components/teamLogos";
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

    const { isSignedIn, user, isLoaded } = useUser();
    const [rooms, setRooms] = useState([]);
    const [canClaimRefund, setcanClaimRefund] = useState(false);
    const [message, setMessage] = useState(null);
    const [result, setResult] = useState(null);
    const [reject, setReject] = useState(false);

    const [betis, setBet] = useState(null);
    const [activeBet, setactiveBet] = useState(null);
    const [lastAsses, setlastAsses] = useState(null);
    const [LastPlay, setLastPlay] = useState(null);
    const [collateral, setColateral] = useState(false);





    const [teamSelected, setteamSelected] = useState(null);   // e.g. "Team_local"
    const [teamSelectedlogo, setteamSelectedlogo] = useState(null);   // e.g. "Team_local"

    const [matchResult, setMatchResult] = useState(null);   // e.g. "Team_local"
    const [userDecision, setUserDecision] = useState(null); // "accepted" or "rejected"
    const [claimAvailable, setClaimAvailable] = useState(false);
    const [status, setStatus] = useState(null); // null | "success" | "error".
    const [readytoSend, setreadytoSend] = useState(null); // null | "success" | "error"

    const [pinSend, setpinSend] = useState(null); // null | "success" | "error"

    const [reason, setReason] = useState("");
    const [msg, setMsg] = useState("");

    const { userx, setUserx } = useApp();
    const [isLoading, setIsLoading] = useState(false);
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
    const handleClaim = async (pin) => {
        console.log("User claimed rewards!");

        try {

            //fn execute_distribution(gameId: i128)
            setLoadingMessage("Reclamando recompensa")

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
            //async function claim(address, setting, claimType, keypairUser)
            const value = await claim(userx[0].pub_key, params.room_id, "User", keypairUser);
            console.log("Resultado claim: ", value)
            const valueItems = value._value;
            const valUsd = valueItems[0]._value._attributes;
            const valTrust = valueItems[1]._value._attributes;

            const usd = BigInt(valUsd.lo._value);
            const trust = BigInt(valTrust.lo._value);


            const amountUsd = (Number(usd) / 10_000_000).toFixed(2);
            const amountTrust = (Number(trust) / 10_000_000).toFixed(2);

            setMsg(`Has reclamado ${amountUsd} USD y ${amountTrust} en Trust`);

            try {
                const response = await fetch('https://backendtrustapp-production.up.railway.app/api/updateroomuser', {
                    method: 'POST', // must be POST to send body
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_user: userx[0].user_id, id_room: params.room_id, bet: rooms.user_bet, claim: true, active: true, ready: true }), // send your user ID here
                });

                if (!response.ok) {
                    console.error('Server responded with error:', response.status);
                    return;
                }
                const data = await response.json();
                console.log('User data saved successfully:', data);


            } catch (error) {
                console.error('Error fetching user data:', error);
            }
            setStatus("success");
            setIsLoading(false);
            setMessage("Ya reclamaste esta recompensa 💰");

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
    const handleRefund = async (pin) => {
        try {
            const keypairUser = keypair; setLoadingMessage("Reclamando reembolso")

            const value = await claim_refund(userx[0].pub_key, params.room_id, keypairUser);
            console.log("Resultado claim: ", value)
            const val = value._value._attributes;
            console.log("Val ", val);
            const lo = BigInt(val.lo._value);

            const amount = (Number(lo) / 10_000_000).toFixed(2);
            setMsg(`Has reclamado ${amount} USD`);
            console.log("Result number:", lo.toString());
            try {
                const response = await fetch('https://backendtrustapp-production.up.railway.app/api/updateroomuser', {
                    method: 'POST', // must be POST to send body
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_user: userx[0].user_id, id_room: params.room_id, bet: rooms.user_bet, claim: true, active: true, ready: true }), // send your user ID here
                });

                if (!response.ok) {
                    console.error('Server responded with error:', response.status);
                    return;
                }
                const data = await response.json();
                console.log('User data saved successfully:', data);


            } catch (error) {
                console.error('Error fetching user data:', error);
            }
            setStatus("success");
            setIsLoading(false);
            setMessage("Ya reclamaste esta recompensa 💰");


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
    const handlesummit = async (pin) => {
        /*Team_local(),
          Team_away(),
          Tie*/
        try {
            const keypairUser = keypair; console.log("selecte: ", selected)
            setLoadingMessage("Enviando resultado para su evaluacion")

            await summit_result(keypairUser.publicKey(), "description", rooms.match_id, selected, keypairUser, params.room_id,);
            setStatus("success");
            setLoadingMessage("Gueardando resultado ")

            try {
                const response = await fetch('https://backendtrustapp-production.up.railway.app/api/updateroomuserresult', {
                    method: 'POST', // must be POST to send body
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_user: userx[0].user_id, id_room: params.room_id, bet: rooms.user_bet, assest: "approve", claim: false, resultx: selected, id_game: rooms.match_id }), // send your user ID here
                });

                if (!response.ok) {
                    console.error('Server responded with error:', response.status);
                    return;
                }
                const data = await response.json();
                console.log('User data saved successfully:', data);


            } catch (error) {
                console.error('Error fetching user data:', error);
            }
            setMatchResult(selected);
            //approve
            setUserDecision("approve");
            setResult(false);
        } catch (error) {

            console.log("contraseñadd")

            const { reason, code } = parseContractError(error);
            const errorMsg =
                error.message || error.reason || "An unexpected error occurred.";
            if (errorMsg == "Invalid password or corrupted keystore") {
                console.log("contraseña")
                setStatus("error");
                setReason("Pin incorrecto");
            } else {
                setStatus("error");
                setReason(errorMsg);

            }

        } finally {
            setIsLoading(false);

        }
    };
    const handleDesition = async (pin) => {
        try {
            const keypairUser = keypair;
            //async function asses_result(address, setting, game_id, desition) {
            setLoadingMessage("Enviando opinion del resultado")

            await asses_result(userx[0].pub_key, params.room_id, selected, keypairUser);
            setIsLoading(false);
            let ready = false;
            if (lastAsses && !(selected == "reject" || reject)) {
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
                    body: JSON.stringify({ id_user: userx[0].user_id, id_room: params.room_id, bet: rooms.user_bet, assest: selected, claim: false, active: true, ready: ready }), // send your user ID here
                });

                if (!response.ok) {
                    console.error('Server responded with error:', response.status);
                    return;
                }
                setUserDecision(selected)
                const data = await response.json();
                console.log('User data saved successfully:', data);


            } catch (error) {
                console.error('Error fetching user data:', error);
            }
            setStatus("success");
            setIsLoading(false);
            if (selected == "reject" || reject) {
                setMessage("El resultado propuesto ha sido rechazado, este sera resuelto en breve")

            }
            if (selected == "reject") {
                try {
                    const response = await fetch('https://backendtrustapp-production.up.railway.app/api/insertsupreme', {
                        method: 'POST', // must be POST to send body
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id_game: rooms.match_id }), // send your user ID here
                    });

                    if (!response.ok) {
                        console.error('Server responded with error:', response.status);
                        return;
                    }
                    setUserDecision(selected)
                    const data = await response.json();
                    console.log('User data saved successfully:', data);


                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }

        } catch (error) {
            console.log("error", error);

            const { reason, code } = parseContractError(error);
            const errorMsg =
                error.message || error.reason || "An unexpected error occurred.";
            if (errorMsg == "Invalid password or corrupted keystore") {
                console.log("contraseña")
                setStatus("error");
                setReason("Pin incorrecto");
                setIsLoading(false);

            } else {
                setStatus("error");
                setReason(reason);
                setIsLoading(false);


            }

            return;
        }

    }
    const fetchRooms = async () => {
        console.log("Fetching room details for room ID:", params.room_id);
        try {
            const res = await fetch(`https://backendtrustapp-production.up.railway.app/api/room?user_id=${user.id}&room_id=${params.room_id}`);
            const data = await res.json();
            setRooms(data[0]);

            if (data[0].user_assest == 'false') {
                setUserDecision(null)
            } else {
                setUserDecision(data[0].user_assest)
                setClaimAvailable(data[0].ready);
            }
            if (data[0].user_claim == true) {
                setMessage("Ya reclamaste esta recompensa 💰");
            }

            setMatchResult(data[0].result)
            setactiveBet(data[0].active)
            console.log(data[0].start_time);
            console.log("Fetched rooms specific:", data[0]);
            let noPlayUsers = 0;
            let noAssessUsers = 0;
            let rejected = false;
            for (let i = 0; i < data[0].room_users.length; i++) {
                const item = data[0].room_users[i];
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
            console.log("fecha", startGame.toLocaleString("es-CO", { timeZone: "America/Bogota" }));
            console.log("fecha2 ", now.toLocaleString("es-CO", { timeZone: "America/Bogota" }));

            const endTime = new Date(data[0].finish_time);
            const limit = new Date(endTime.getTime() + 18000 * 1000);
            const limitStart = new Date(endTime.getTime() + 600 * 1000);

            if (data[0].user_bet !== "false") {
                setBet(true);
                console.log("has jugado")
            }
            if (now > limit && data[0].user_bet != "false" && !data[0].result) {
                setcanClaimRefund(true);
                console.log("no result so claim refund");

            }
            if (now > limitStart && data[0].user_bet != "false" && !data[0].active) {
                setcanClaimRefund(true);
                console.log("no active game after starting");
            }
            if (now > endTime && data[0].user_bet != "false" && data[0].active && !data[0].result) {
                //limit this t 5hours
                setResult(true);
                console.log("subir resultado");
            }
            if (now > startGame && data[0].user_bet == "false") {
                setMessage("Ya es tarde para entrar");
                console.log("late");
            }
            if (data[0].user_assest != 'false' && rejected) {
                if (data[0].supreme_distributed == true) {
                    setClaimAvailable(true);
                    setReject(false);
                    setMessage(""),
                        setMatchResult(data[0].supreme_result)

                    console.log("late approved");
                    if (data[0].user_claim == true) {
                        setMessage("Ya reclamaste esta recompensa 💰");
                    }

                } else {
                    setMessage("El resultado ha sido rechazado, este sera resuelto en breve")
                    console.log("late rejected");
                }

            }


        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };
    const room = {
        title: `${rooms.local_team_name} vs ${rooms.away_team_name}`,
        local_team_name: rooms.local_team_name,
        away_team_name: rooms.away_team_name,
        local_team_logo: rooms.local_team_logo,
        away_team_logo: rooms.away_team_logo,
        start_time: rooms.start_time,
        finish_time: rooms.finish_time,
        active: rooms.active === "true" || rooms.active === true,
        bet: rooms.user_bet !== "false" && rooms.user_bet !== false,
        users: rooms.room_users ? rooms.room_users : [],
        /* title: `${item.local_team_name} vs ${item.away_team_name}`,
         local_team_name: item.local_team_name,
         away_team_name: item.away_team_name,
         start_time: item.start_time,
         finish_time: item.finish_time,
         active: item.active,
         bet: item.user_bet,
         users: JSON.stringify(item.room_users),
         local_team_logo: item.local_team_logo,
         away_team_logo: item.away_team_logo,*/
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
    const action = async (pin) => {

        switch (pinSend) {
            case "playx":
                bet(pin);
                break;
            case "assest":
                handleDesition(pin);
                break;
            case "claim":
                handleClaim(pin);
                break;
            case "refund":
                handleRefund(pin);
                break;
            case "result":
                handlesummit(pin);
                break;

        }
        // do something
    }

    const bet = async (pin) => {
        try {
            console.log("Bet placed on:", selected);
            console.log("rooms,", rooms.match_id)
            const keypairUser = keypair; const id_bet = Math.floor(100000 + Math.random() * 900000).toString();

            //async function place_bet(address, id_bet, game_id, team, amount, setting, keypairUser) {
            const value = Number(rooms.min_amount);

            console.log(value)
            setLoadingMessage("Enviando prediccion a la red")
            await place_bet(userx[0].pub_key, id_bet, rooms.match_id, selected, value, params.room_id, keypairUser, collateral);
            let active = false;
            if (LastPlay) {
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
                    body: JSON.stringify({ id_user: userx[0].user_id, id_room: params.room_id, bet: selected, claim: false, active: active, ready: false }), // send your user ID here
                });

                if (!response.ok) {
                    console.error('Server responded with error:', response.status);
                    return;
                }
                const data = await response.json();
                console.log('User data saved successfully:', data);


            } catch (error) {
                console.error('Error fetching user data:', error);
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
    const handleBet = async (option, send) => {
        setSelected(option);
        if (send == "play") {
            setreadytoSend(true);
            if (option == "Team_local") {
                setteamSelected(room.local_team_name);
                setteamSelectedlogo(room.local_team_logo);
            } else if (option == "Team_away") {
                setteamSelected(room.away_team_name);
                setteamSelectedlogo(room.away_team_logo);
            }
        } else {
            setIsLoading(true);
            setpinSend(send);
        }

    };

    const renderUser = ({ item }) => (
        <View style={styles.userCard}>
            <Text style={styles.userEmoji}>👤</Text>
            <Text style={styles.userName}>{item.firstName}</Text>
        </View>
    );
    if (isLoading) {
        return (<PinVerification
            mode="verify"
            message={loadingMessage}
            onComplete={action}

        />);
    }

    else {
        return (<View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push({
                pathname: "/rooms",
            })}>
                <Ionicons name="arrow-back" size={22} color="#333" />
            </TouchableOpacity>
            {/* Header */}
            <View style={styles.header}>

                <Text style={styles.roomTitle}>{room.title}</Text>
                <Text
                    style={[
                        styles.status,
                        { color: activeBet ? "#28A745" : "#FF3B30" },
                    ]}
                >
                    {activeBet ? "Activo" : "Esperando jugadores"}
                </Text>
            </View>

            {/* Teams */}
            <View style={styles.teamsContainer}>
                <View style={styles.team}>
                    <Image
                        source={teamLogos[room.local_team_logo]}
                        style={styles.logo}
                    />
                    <Text style={styles.teamName}>{room.local_team_name}</Text>
                </View>

                <Text style={styles.vs}>VS</Text>

                <View style={styles.team}>
                    <Image
                        source={teamLogos[room.away_team_logo]} style={styles.logo}

                    />
                    <Text style={styles.teamName}>{room.away_team_name}</Text>
                </View>
            </View>

            {/* Match info */}
            <Text style={styles.time}>
                {new Date(room.start_time).getUTCDate()} {" "}
                {new Date(room.start_time).toLocaleString("en-US", { month: "short", timeZone: "UTC" })}
            </Text>

            <View style={styles.minAmountContainer}>
                <Text style={styles.minAmountLabel}>En juego:</Text>
                <Text style={styles.minAmountValue}>
                    {`${(parseFloat(rooms.min_amount) / 10_000_000)
                        .toFixed(6)
                        .replace(/\.?0+$/, "")} USD`}
                </Text>
            </View>

            <Text style={styles.betStatus}>
                {betis ? result ? "¿Cual fue el equipo ganador? " : "Ya realizaste tu predicion ✅" : "Aún no has jugado ❌"}
            </Text>

            {/* Users list */}
            <View style={styles.usersSection}>
                <Text style={styles.sectionTitle}>Jugadores en la sala</Text>
                <FlatList
                    data={room.users}
                    horizontal
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    renderItem={({ item }) => (
                        <View
                            style={[
                                styles.userCard,
                                item.bet && item.bet !== "false" || (betis && item.username === user.firstName)
                                    ? styles.playedCard
                                    : styles.notPlayedCard,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.userName,
                                    item.bet && item.bet !== "false" || (betis && item.username === user.firstName)
                                        ? styles.playedText
                                        : styles.notPlayedText,
                                ]}
                            >
                                {item.username === user.firstName ? "Yo" : item.username || item.user_id || "User"}
                            </Text>
                        </View>
                    )}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            {/* Betting options or result status */}
            <View style={styles.optionsContainer}>
                {/* CASE 1: User hasn’t bet yet and match still active */}
                {!betis && !message && (
                    <>
                        {["Team_local", "Tie", "Team_away"].map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={styles.optionButton}
                                onPress={() => handleBet(option, "play")}
                            >
                                <Text style={styles.optionText} numberOfLines={1} ellipsizeMode="tail">
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
                {result && (
                    <>
                        {["Team_local", "Tie", "Team_away"].map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={styles.optionButton}
                                onPress={() => handleBet(option, "result")}
                            >
                                <Text style={styles.optionText} numberOfLines={1} ellipsizeMode="tail">
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
                    <Text style={{ color: "#007AFF", marginTop: 10, fontWeight: "600" }}>
                        {message}
                    </Text>
                )}
                {canClaimRefund && !message && (
                    <TouchableOpacity
                        style={[styles.decisionButton, { backgroundColor: "#FFA500" }]}
                        onPress={() => handleBet("x", "refund")}
                    >
                        <Text style={styles.decisionText}>Reclamar Reembolso 💸</Text>
                    </TouchableOpacity>
                )}

                {/* CASE 2: User already bet but no result yet */}
                {betis && !matchResult && !canClaimRefund && !message && !result && (
                    <Text style={styles.waitingMessage}>
                        Partido sin terminar ...
                    </Text>
                )}

                {/* CASE 3: Result received — show result and buttons */}
                {matchResult && !message && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultText}>
                            🏁 Resultado:{" "}
                            {matchResult === "Team_local"
                                ? room.local_team_name
                                : matchResult === "Team_away"
                                    ? room.away_team_name
                                    : "Empate"}
                        </Text>

                        {/* Accept / Reject buttons */}
                        {!userDecision && !claimAvailable && !message && (
                            <View style={styles.decisionButtons}>
                                <TouchableOpacity
                                    style={[styles.decisionButton, { backgroundColor: "#28A745" }]}
                                    onPress={() => handleBet("approve", "assest")}
                                >
                                    <Text style={styles.decisionText}>Aceptar ✅</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.decisionButton, { backgroundColor: "#FF3B30" }]}
                                    onPress={() => handleBet("reject", "assest")}
                                >
                                    <Text style={styles.decisionText}>Rechazar ❌</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Show user's decision */}
                        {userDecision && !claimAvailable && (
                            <Text style={styles.userDecision}>
                                Has {userDecision === "approve" ? "aceptado" : "rechazado"} el resultado.
                            </Text>
                        )}

                        {/* Claim button */}
                        {claimAvailable && !message && (
                            <TouchableOpacity
                                style={[styles.decisionButton, { backgroundColor: "#007AFF" }]}
                                onPress={() => handleBet("x", "claim")}
                            >
                                <Text style={styles.decisionText}>Reclamar Recompensa 💰</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {
                status && (
                    <ConfirmationMessage
                        success={status === "success"}
                        message={msg}
                        reason={reason}
                        onClose={() => setStatus(null)}
                    />
                )
            }
            {
                readytoSend && (
                    <ConfirmPrediction
                        amount={rooms.min_amount}
                        prediction={selected}
                        teamName={teamSelected}
                        teamLogo={teamSelectedlogo}
                        onConfirm={(data) => {
                            // this runs in your previous screen
                            console.log("CONFIRMED DATA →", data);
                            if (data.type == "usd") {

                                setColateral(true);
                            } else {
                                setColateral(false);

                            }
                            handleBet(data.prediction, "playx");
                            setreadytoSend(false);

                        }}
                        onBack={() => {
                            // go back
                            setreadytoSend(false);
                        }}
                    />
                )
            }
        </View>)
    }
}




const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        padding: 16,
        paddingTop: 60, // space for back button
    },

    // 🔙 Back Button
    backButton: {
        position: "absolute",
        top: 20,
        left: 16,
        backgroundColor: "#fff",
        borderRadius: 50,
        padding: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
        zIndex: 20,
    },

    // 🏠 Header
    header: {
        alignItems: "center",
        marginBottom: 20,
    },
    roomTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#222",
        marginBottom: 6,
        textAlign: "center",
    },
    status: {
        fontSize: 15,
        fontWeight: "600",
    },

    // ⚽ Teams Section
    teamsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    team: {
        flex: 1,
        alignItems: "center",
        maxWidth: 120, // keeps long names from breaking layout
    },
    logo: {
        width: 70,
        height: 70,
        resizeMode: "contain",
        marginBottom: 6,
    },
    teamName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
    },
    vs: {
        fontSize: 16,
        fontWeight: "700",
        color: "#999",
        marginHorizontal: 10,
    },

    // 🕒 Match Info
    time: {
        fontSize: 13,
        color: "#555",
        textAlign: "center",
        marginVertical: 8,
    },
    betStatus: {
        fontSize: 14,
        color: "#007AFF",
        textAlign: "center",
        fontWeight: "600",
        marginBottom: 12,
    },

    // 👥 Users Section
    usersSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
        marginBottom: 10,
    },
    userCard: {
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 14,
        marginRight: 10,
        minWidth: 80,
        alignItems: "center",
    },
    playedCard: {
        backgroundColor: "#D4EDDA",
    },
    notPlayedCard: {
        backgroundColor: "#F8D7DA",
    },
    userName: {
        fontSize: 13,
        fontWeight: "600",
    },
    playedText: {
        color: "#155724",
    },
    notPlayedText: {
        color: "#721C24",
    },
    minAmountContainer: {
        marginTop: 8,
        marginBottom: 8,
        alignItems: "center",
    },
    minAmountLabel: {
        fontSize: 13,
        color: "#6B7280", // soft gray
        fontWeight: "400",
    },
    minAmountValue: {
        fontSize: 15,
        color: "#2563EB", // subtle blue accent
        fontWeight: "500",
        marginTop: 2,
    },
    // 🎯 Options / Betting Section
    optionsContainer: {
        marginTop: 10,
        alignItems: "center",
    },
    optionButton: {
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginVertical: 8,
        width: "90%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    optionText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
    },

    // ✅ Decision / Results Section
    resultContainer: {
        marginTop: 16,
        alignItems: "center",
    },
    resultText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#333",
        marginBottom: 10,
    },
    decisionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "90%",
        marginTop: 10,
    },
    decisionButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },

    decisionText: {
        color: "#ffffff", // make text white for good contrast
        fontWeight: "600",
        fontSize: 16,
        textAlign: "center",
    },
    waitingMessage: {
        fontSize: 14,
        color: "#888",
        marginTop: 10,
        textAlign: "center",
    },
    userDecision: {
        marginTop: 10,
        fontSize: 14,
        color: "#007AFF",
        fontWeight: "600",
        textAlign: "center",
    },
});
