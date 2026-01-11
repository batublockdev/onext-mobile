import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ERROR_MESSAGES } from "../components/error";
import LoadingOverlay from "../components/loadingCompnent";
import TeamShield from "../components/TeamShield";
import { useApp } from "./contextUser";
const {
    setResult_supremCourt,
    AssestResult_supremCourt,
    claim
} = require("../SmartContract/smartcontractOperation");
const { decryptOnly } = require('../self-wallet/wallet');

export default function GameDetails({ }) {

    const match = useLocalSearchParams();
    console.log("data", match)
    const [confirmed, setConfirmed] = useState(false);
    const [pin, setPin] = useState("false");
    const [loadingx, setIsLoading] = useState(false);

    const [needsCorrection, setNeedsCorrection] = useState(false);
    console.log("match.logo1", match.logo1);

    let winner = match.result;
    if (match.result == "Team_local") {
        winner = match.team1;
    } else if (match.result == "Team_away") {
        winner = match.team2;
    } else if (match.result == "Tie") {
        winner = "Empate";
    }
    const router = useRouter();

    const [rooms, setRooms] = useState([]);

    const [matchResult, setMatchResult] = useState(null);   // e.g. "Team_local"
    const [userDecision, setUserDecision] = useState(null); // "accepted" or "rejected"
    const [claimAvailable, setClaimAvailable] = useState(false);
    const [status, setStatus] = useState(null); // null | "success" | "error".
    const [readytoSend, setreadytoSend] = useState(null); // null | "success" | "error"
    const [msgLoading, setMsgLoading] = useState("Cargando");

    const [pinSend, setpinSend] = useState(null); // null | "success" | "error"

    const [reason, setReason] = useState("");
    const [msg, setMsg] = useState("");

    const { userx, keypair } = useApp();
    const [loadingMessage, setLoadingMessage] = useState("Verifying PIN...");
    const [done, setdone] = useState(false);
    const [selected, setSelected] = useState(null);

    let result = "";
    function parseContractError(error) {
        const match = String(error).match(/Error\(Contract, #(\d+)\)/);
        if (match) {
            const code = parseInt(match[1]);
            const reason = ERROR_MESSAGES[code] || `Unknown error (code ${code})`;
            return { code, reason };
        }
        return { code: null, reason: "Unexpected error occurred." };
    }


    const handleClaim = async () => {
        setIsLoading(true);
        setStatus("loading");

        setMsgLoading("Recibiendo")
        try {

            //fn execute_distribution(gameId: i128)
            setLoadingMessage("Recibiendo")

            const keypairUser = keypair;
            const value = await claim(userx[0].pub_key, match.match_id, "Supreme", keypairUser);
            console.log("Resultado claim: ", value)
            const valueItems = value._value;
            const valUsd = valueItems[0]._value._attributes;
            const valTrust = valueItems[1]._value._attributes;

            const usd = BigInt(valUsd.lo._value);
            const trust = BigInt(valTrust.lo._value);
            console.log(match.honest1_claim)
            console.log(match.honest2_claim)
            console.log(match.honest1);
            console.log(match.honest2);
            console.log(userx[0].pub_key);

            let claim1 = match.honest1_claim;
            let claim2 = match.honest2_claim;
            if (match.honest1 == userx[0].pub_key && match.honest1_claim == "false") {
                console.log("The First one")

                claim1 = true;
            } else if (match.honest2 == userx[0].pub_key && match.honest2_claim == "false") {
                console.log("The second one")
                claim2 = true;

            }
            const amountUsd = (Number(usd) / 10_000_000).toFixed(2);
            const amountTrust = (Number(trust) / 10_000_000).toFixed(2);
            setMsg(`+ ${amountUsd} y + ${amountTrust} Trust`);

            try {

                setLoadingMessage("Saving user data...");
                try {
                    const response = await fetch('https://trustappbackendlive-production.up.railway.app/api/updatesupreme', {
                        method: 'POST', // must be POST to send body
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id_game: match.match_id, honest1: match.honest1, honest2: match.honest2, adm: match.adm, externalUser: match.externalUser, result: match.result, distributed: match.distributed, honest1_claim: claim1, honest2_claim: claim2 }), // send your user ID here
                    });

                    if (!response.ok) {
                        console.log('Server responded with error:', response.status);
                        return;
                    }
                    setUserDecision(selected)
                    const data = await response.json();
                    console.log('User data saved successfully:', data);


                } catch (error) {
                    console.log('Error fetching user data:', error);
                }
                setStatus("success");


            } catch (error) {
                console.log('Error fetching user data:', error);
            }
            setStatus("success");
            setMsgLoading("Hecho")

        } catch (error) {

            console.log("error", error);
            const { reason, code } = parseContractError(error);
            console.log("error", code);
            setStatus("error");
            setReason(reason);
            return;
        }

    };
    const Result = async (answer, type) => {
        setIsLoading(true);
        setStatus("loading");

        setMsgLoading("Enviando ...")
        try {
            console.log("Userx in GameDetail:", userx);
            const keypairUser = keypair;
            let honest1 = match.honest1;
            let honest2 = match.honest2;
            let result = match.result;
            if (match.honest1 == null) {
                honest1 = userx[0].pub_key;
            } else if (match.honest2 == null) {
                honest2 = userx[0].pub_key;

            }
            if (type === "summit") {
                result = answer;
                setLoadingMessage("Enviando resultado al contrato...");
                //(address, description, game_id, team, keypairUser)
                await setResult_supremCourt(userx[0].pub_key, "", match.match_id, answer, keypairUser);
            }
            else if (type === "asses") {
                setLoadingMessage("Submitting assessment to the contract...");
                await AssestResult_supremCourt(userx[0].pub_key, match.match_id, answer, keypairUser);
            }
            setLoadingMessage("Saving user data...");
            try {
                const response = await fetch('https://trustappbackendlive-production.up.railway.app/api/updatesupreme', {
                    method: 'POST', // must be POST to send body
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_game: match.match_id, honest1, honest2, adm: match.adm, externalUser: match.externalUser, result: result, distributed: false, honest1_claim: false, honest2_claim: false }), // send your user ID here
                });

                if (!response.ok) {
                    console.log('Server responded with error:', response.status);
                    return;
                }
                setUserDecision(selected)
                const data = await response.json();
                console.log('User data saved successfully:', data);


            } catch (error) {
                console.log('Error fetching user data:', error);
            }
            setStatus("success");
            setMsgLoading("Hecho")


        } catch (error) {

            if (error == "Invalid password or corrupted keystore") {
                console.log("contraseña")
                setStatus("error");
                setReason(reason);
            } else {
                console.log("Error creating room:", error);
                console.log("contraseñadd")

                const { reason, code } = parseContractError(error);
                const errorMsg =
                    error.message || error.reason || "An unexpected error occurred.";

                setStatus("error");
                setMsgLoading(reason);
            }

            return;
        }
    }
    return (<>

        <View style={styles.container}>
            <LoadingOverlay
                visible={loadingx}
                status={status}
                message={msgLoading}
                onAutoClose={() => setIsLoading(false)}
                onClose={() => {
                    setIsLoading(false); router.push({
                        pathname: "/",
                    })
                }}
            />
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push({
                    pathname: "/",
                })}>
                    < Ionicons name="arrow-back" size={26} color="#38f038ff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{match.league}</Text>
                <View style={{ width: 26 }} />
            </View>

            {/* CARD */}
            <View style={styles.card}>
                <Text style={styles.subTitle}>Fecha {match.week} {match.date}</Text>

                <View style={styles.teamsRow}>
                    {/* LOCAL */}
                    <View style={styles.teamSection}>
                        <TeamShield
                            colors={JSON.parse(match.logo1)}
                            width={45}
                            height={61}
                        />
                        <Text style={styles.teamName}>{match.team1}</Text>
                    </View>

                    {/* SCORE */}
                    <Text style={styles.score}>{"Vs"}</Text>

                    {/* AWAY */}
                    <View style={styles.teamSection}>
                        <TeamShield
                            colors={JSON.parse(match.logo2)}
                            width={45}
                            height={61}
                        />
                        <Text style={styles.teamName}>{match.team2}</Text>
                    </View>
                </View>

                {result && (
                    <Text style={styles.minuteText}>{minute}</Text>
                )}

            </View>
            {match.distributed && (
                <View style={styles.rewardBox}>
                    <Text style={styles.rewardTitle}> Premiamos tu honestidad</Text>
                    <Text style={styles.rewardSubtitle}>
                        Gracias por contribuir con un resultado justo.
                    </Text>

                    <TouchableOpacity
                        style={styles.rewardButton}
                        onPress={() => handleClaim()}
                    >
                        <Text style={styles.rewardButtonText}>Recibir</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* WINNER BOX */}
            {winner && !match.distributed && (
                <View style={styles.winnerBox}>
                    <Text style={styles.winnerText}>Ganador: {winner}</Text>
                </View>
            )}

            {/* --- RESULT CONFIRMATION BOX --- */}
            <View style={styles.box}>
                {winner && !match.distributed && !confirmed && !needsCorrection && (
                    <>
                        <Text style={styles.boxText}>
                            ¿Confirmas que el resultado es correcto?
                        </Text>

                        <View style={styles.row}>
                            <TouchableOpacity
                                style={styles.btnYes}
                                onPress={() => Result("approve", "asses")}
                            >
                                <Text style={styles.btnText}>Yes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.btnNo}
                                onPress={() => Result("reject", "asses")}
                            >
                                <Text style={styles.btnText}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}


                {/* --- IF NO RESULT YET --- */}
                {!winner && !match.distributed && (
                    <>
                        <Text style={styles.boxText}>¿Cual fue el equipo ganador?</Text>
                        <View style={styles.row}>
                            <TouchableOpacity onPress={() => Result("Team_local", "summit")} style={styles.optionBtn}>
                                <Text style={styles.btnText}>{match.team1}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => Result("Tie", "summit")} style={styles.optionBtn}>
                                <Text style={styles.btnText}>Empate</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => Result("Team_away", "summit")} style={styles.optionBtn}>
                                <Text style={styles.btnText}>{match.team2}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

            </View></View >



    </>

    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0D0D0D",
        padding: 16,
    },

    /* HEADER */
    header: {
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#FFF",
        letterSpacing: 0.3,
    },

    /* CARD */
    card: {
        marginTop: 25,
        backgroundColor: "#161616",
        borderRadius: 18,
        padding: 22,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
        borderWidth: 1,
        borderColor: "#222",
    },

    subTitle: {
        color: "#6B7280",
        fontSize: 14,
        marginBottom: 18,
        fontWeight: "500",
    },

    teamsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
    },

    teamSection: {
        alignItems: "center",
        width: "32%",
    },
    teamName: {
        marginTop: 8,
        fontSize: 15,
        fontWeight: "600",
        color: "#FFF",
        textAlign: "center",
    },
    logo: {
        width: 72,
        height: 72,
        resizeMode: "contain",
    },
    score: {
        fontSize: 34,
        fontWeight: "900",
        color: "#35D787",
        marginHorizontal: 5,
    },

    minuteText: {
        marginTop: 14,
        color: "#6B7280",
        fontSize: 14,
        fontWeight: "500",
    },

    /* WINNER BOX */
    winnerBox: {
        marginTop: 22,
        padding: 16,
        backgroundColor: "#102515",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#35D78733",
        shadowColor: "#35D787",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
    },
    winnerText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#35D787",
        textAlign: "center",
    },

    /* RESULT BOX */
    box: {
        marginTop: 26,
        backgroundColor: "#161616",
        padding: 20,
        borderRadius: 18,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 1,
        borderColor: "#222",
    },
    boxText: {
        color: "#FFF",
        fontSize: 15,
        marginBottom: 14,
        fontWeight: "600",
        opacity: 0.9,
        textAlign: "center",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },

    btnYes: {
        backgroundColor: "#35D787",
        paddingVertical: 14,
        borderRadius: 12,
        width: "48%",
        alignItems: "center",
        elevation: 3,
    },
    btnNo: {
        backgroundColor: "#c0392b",
        paddingVertical: 14,
        borderRadius: 12,
        width: "48%",
        alignItems: "center",
        elevation: 3,
    },

    optionBtn: {
        backgroundColor: "#2A2A2A",
        paddingVertical: 14,
        borderRadius: 10,
        width: "32%",
        alignItems: "center",
        elevation: 3,
        borderWidth: 1,
        borderColor: "#333",
    },
    btnText: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "600",
    },

    /* REWARD BOX */
    rewardBox: {
        marginTop: 25,
        backgroundColor: "#131313",
        padding: 22,
        borderRadius: 18,
        shadowColor: "#000",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#222",
    },
    rewardTitle: {
        color: "#35D787",
        fontSize: 21,
        fontWeight: "800",
        marginBottom: 8,
        textAlign: "center",
    },
    rewardSubtitle: {
        color: "#BBB",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 20,
    },
    rewardButton: {
        backgroundColor: "#35D787",
        paddingVertical: 14,
        paddingHorizontal: 35,
        borderRadius: 12,
        elevation: 4,
    },
    rewardButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "700",
    },
});