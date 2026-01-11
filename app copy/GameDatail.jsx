import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ConfirmationMessage from "../components/ConfimationComponent";
import { ERROR_MESSAGES } from "../components/error";
import PinVerification from "../components/pin";
import { teamLogos } from "../components/teamLogos";
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

    const [needsCorrection, setNeedsCorrection] = useState(false);


    const winner = match.result;
    const router = useRouter();

    const [rooms, setRooms] = useState([]);

    const [matchResult, setMatchResult] = useState(null);   // e.g. "Team_local"
    const [userDecision, setUserDecision] = useState(null); // "accepted" or "rejected"
    const [claimAvailable, setClaimAvailable] = useState(false);
    const [status, setStatus] = useState(null); // null | "success" | "error".
    const [readytoSend, setreadytoSend] = useState(null); // null | "success" | "error"

    const [pinSend, setpinSend] = useState(null); // null | "success" | "error"

    const [reason, setReason] = useState("");
    const [msg, setMsg] = useState("");

    const { userx, keypair } = useApp();
    const [isLoading, setIsLoading] = useState(false);
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
    const handleResult = (res, actionType) => {
        console.log("Selected result:", res);
        setSelected(res);
        setpinSend(actionType);
        if (res != null) {

            setIsLoading(true);
        }

    }
    const action = (pin) => {
        if (pinSend === "summit") {
            Result(pin);
        } else if (pinSend === "asses") {
            Result(pin);
        }
        else if (pinSend === "claim") {
            handleClaim(pin);
        }
    }
    const handleClaim = async (pin) => {
        console.log("User claimed rewards!");

        try {

            //fn execute_distribution(gameId: i128)
            setLoadingMessage("Reclamando recompensa")

            const keypairUser = keypair;
            //async function claim(address, setting, claimType, keypairUser)
            const value = await claim(userx[0].pub_key, match.match_id, "Supreme", keypairUser);
            console.log("Resultado claim: ", value)
            const valueItems = value._value;
            const valUsd = valueItems[0]._value._attributes;
            const valTrust = valueItems[1]._value._attributes;

            const usd = BigInt(valUsd.lo._value);
            const trust = BigInt(valTrust.lo._value);
            let claim1 = false;
            let claim2 = false;
            if (match.honest1 == userx[0].pub_key && match.honest1_cliam == false) {
                claim1 = true;
            } else if (match.honest2 == userx[0].pub_key && match.honest2_cliam == false) {
                claim2 = true;
            }
            const amountUsd = (Number(usd) / 10_000_000).toFixed(2);
            const amountTrust = (Number(trust) / 10_000_000).toFixed(2);
            let honest1 = match.honest1;
            let honest2 = match.honest2;
            setMsg(`Has reclamado ${amountUsd} USD y ${amountTrust} en Trust`);
            try {

                setLoadingMessage("Saving user data...");
                try {
                    const response = await fetch('https://trustappbackendlive-production.up.railway.app/api/updatesupreme', {
                        method: 'POST', // must be POST to send body
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id_game: match.match_id, honest1, honest2, adm: match.adm, externalUser: match.externalUser, result: match.result, distributed: match.distributed, honest1_cliam: claim1, honest2_cliam: claim2 }), // send your user ID here
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
                setIsLoading(false);


            } catch (error) {
                console.error('Error fetching user data:', error);
            }
            setStatus("success");
            setIsLoading(false);

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
    const Result = async (pin) => {
        console.log("PIN received in GameDetail:", pin);
        try {
            console.log("Userx in GameDetail:", userx);
            const keypairUser = keypair; let honest1 = match.honest1;
            let honest2 = match.honest2;
            let result = match.result;
            if (match.honest1 == null) {
                honest1 = userx[0].pub_key;
            } else if (match.honest2 == null) {
                honest2 = userx[0].pub_key;

            }
            if (pinSend === "summit") {
                result = selected;
                setLoadingMessage("Enviando resultado al contrato...");
                //(address, description, game_id, team, keypairUser)
                await setResult_supremCourt(userx[0].pub_key, "", match.match_id, selected, keypairUser);
            }
            else if (pinSend === "asses") {
                setLoadingMessage("Submitting assessment to the contract...");
                await AssestResult_supremCourt(userx[0].pub_key, match.match_id, selected, keypairUser);
            }
            setIsLoading(false);
            setLoadingMessage("Saving user data...");
            try {
                const response = await fetch('https://trustappbackendlive-production.up.railway.app/api/updatesupreme', {
                    method: 'POST', // must be POST to send body
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_game: match.match_id, honest1, honest2, adm: match.adm, externalUser: match.externalUser, result: result, distributed: false, honest1_cliam: false, honest2_cliam: false }), // send your user ID here
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


        } catch (error) {
            setIsLoading(false);

            if (error == "Invalid password or corrupted keystore") {
                console.log("contraseña")
                setStatus("error");
                setReason(reason);
            } else {
                console.error("Error creating room:", error);
                console.log("contraseñadd")

                const { reason, code } = parseContractError(error);
                const errorMsg =
                    error.message || error.reason || "An unexpected error occurred.";

                setStatus("error");
                setReason(errorMsg);
            }

            return;
        }
    }
    return (<>
        {
            !isLoading && (
                <View style={styles.container}>

                    {/* HEADER */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={console.log("hpta")}>
                            <Ionicons name="arrow-back" size={26} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{match.league}</Text>
                        <View style={{ width: 26 }} />
                    </View>

                    {/* CARD */}
                    <View style={styles.card}>
                        <Text style={styles.subTitle}>{match.league}, {match.date}</Text>

                        <View style={styles.teamsRow}>
                            {/* LOCAL */}
                            <View style={styles.teamSection}>
                                <Image source={teamLogos[match.logo1]} style={styles.logo} />
                                <Text style={styles.teamName}>{match.team1}</Text>
                            </View>

                            {/* SCORE */}
                            <Text style={styles.score}>{"Vs"}</Text>

                            {/* AWAY */}
                            <View style={styles.teamSection}>
                                <Image source={teamLogos[match.logo2]} style={styles.logo} />
                                <Text style={styles.teamName}>{match.team2}</Text>
                            </View>
                        </View>

                        {result && (
                            <Text style={styles.minuteText}>{minute}</Text>
                        )}

                    </View>
                    {match.distributed && (
                        <View style={styles.rewardBox}>
                            <Text style={styles.rewardTitle}>🎉 Premiamos tu honestidad</Text>
                            <Text style={styles.rewardSubtitle}>
                                Gracias por contribuir con un resultado justo.
                            </Text>

                            <TouchableOpacity
                                style={styles.rewardButton}
                                onPress={() => handleResult("x", "claim")}
                            >
                                <Text style={styles.rewardButtonText}>Reclama tu recompensa</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* WINNER BOX */}
                    {winner && !match.distributed && (
                        <View style={styles.winnerBox}>
                            <Text style={styles.winnerText}>Winner: {winner}</Text>
                        </View>
                    )}

                    {/* --- RESULT CONFIRMATION BOX --- */}
                    <View style={styles.box}>
                        {winner && !match.distributed && !confirmed && !needsCorrection && (
                            <>
                                <Text style={styles.boxText}>
                                    Is this result correct?
                                </Text>

                                <View style={styles.row}>
                                    <TouchableOpacity
                                        style={styles.btnYes}
                                        onPress={() => handleResult("approve", "asses")}
                                    >
                                        <Text style={styles.btnText}>Yes</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.btnNo}
                                        onPress={() => handleResult("reject", "asses")}
                                    >
                                        <Text style={styles.btnText}>No</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}


                        {/* --- IF NO RESULT YET --- */}
                        {!winner && !match.distributed && (
                            <>
                                <Text style={styles.boxText}>Select the match result</Text>
                                <View style={styles.row}>
                                    <TouchableOpacity onPress={() => handleResult("Team_local", "summit")} style={styles.optionBtn}>
                                        <Text style={styles.btnText}>{match.team1}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => handleResult("Tie", "summit")} style={styles.optionBtn}>
                                        <Text style={styles.btnText}>Tie</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => handleResult("Team_away", "summit")} style={styles.optionBtn}>
                                        <Text style={styles.btnText}>{match.team2}</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                    </View></View>
            )
        }

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
            isLoading && (
                <PinVerification
                    mode="verify"
                    message={loadingMessage}
                    onComplete={action}

                />
            )
        }
    </>

    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
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
        fontWeight: "700",
        color: "#000",
    },

    /* CARD */
    card: {
        marginTop: 20,
        backgroundColor: "#F5F5F5",
        borderRadius: 20,
        padding: 22,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    subTitle: {
        color: "#666",
        fontSize: 15,
        marginBottom: 14,
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
        color: "#222",
        textAlign: "center",
    },
    logo: {
        width: 72,
        height: 72,
        resizeMode: "contain",
    },
    score: {
        fontSize: 38,
        fontWeight: "900",
        color: "#000",
        marginHorizontal: 5,
    },

    minuteText: {
        marginTop: 12,
        color: "#888",
        fontSize: 14,
        fontWeight: "500",
    },

    /* WINNER BOX */
    winnerBox: {
        marginTop: 20,
        padding: 16,
        backgroundColor: "#D9F5DC",
        borderRadius: 14,
        shadowColor: "#2E7D32",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    winnerText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#2E7D32",
        textAlign: "center",
    },

    /* BOTTOM BOX */
    box: {
        marginTop: 25,
        backgroundColor: "#000000ff",
        padding: 18,
        borderRadius: 18,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
    },
    boxText: {
        color: "#fff",
        fontSize: 15,
        marginBottom: 12,
        fontWeight: "600",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 6,
    },

    btnYes: {
        backgroundColor: "#27ae60",
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
        backgroundColor: "#3b3b3d",
        paddingVertical: 14,
        borderRadius: 10,
        width: "32%",
        alignItems: "center",
        elevation: 2,
    },
    btnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },

    /* --- REWARD BOX --- */
    rewardBox: {
        marginTop: 25,
        backgroundColor: "#1B1B1D",
        padding: 20,
        borderRadius: 18,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
        alignItems: "center",
    },
    rewardTitle: {
        color: "#FFD700",
        fontSize: 20,
        fontWeight: "800",
        marginBottom: 6,
        textAlign: "center",
    },
    rewardSubtitle: {
        color: "#fff",
        fontSize: 14,
        opacity: 0.8,
        textAlign: "center",
        marginBottom: 20,
    },
    rewardButton: {
        backgroundColor: "#27ae60",
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 12,
        elevation: 4,
    },
    rewardButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    }
});
