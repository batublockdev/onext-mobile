import { useEffect, useState } from 'react';

import { Link } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";

import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { teamLogos } from "./teamLogos";
export default function ConfirmPrediction({
    amount,
    prediction,
    teamName,
    teamLogo,
    onConfirm,
    onBack

}) {
    const [option, setOption] = useState("usd"); // "trust" | "usd" | null
    const [trustFee, settrustFee] = useState(0); // "trust" | "usd" | null
    const [usdFee, setusdFee] = useState(0); // "trust" | "usd" | null
    const [total, setTotal] = useState(0); // "trust" | "usd" | null
    const [amountFormatted, setAmountFormatted] = useState(0); // "trust" | "usd" | null

    console.log(amount)
    useEffect(() => {

        async function fetchData() {
            console.log("Original Amount:", amount);
            amount = amount / 10000000;
            amount = await getUsdToCop(amount);
            console.log("Formatted Amount in COP:", amount, formatCOP(amount));
            setAmountFormatted(amount);
            settrustFee(amount * 0.10)
            setusdFee(amount * 0.20)
            setTotal(amount + (amount * 0.20));

        }
        fetchData();
    }, [amount]);
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
    useEffect(() => {
        let fee = option === "trust" ? 0 : usdFee;
        setTotal(amountFormatted + fee);
    }, [option]);


    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backIcon} onPress={onBack}>
                <Ionicons name="chevron-back" size={28} color="#35D787" />
            </TouchableOpacity>
            {/* Top Label */}


            {/* Team */}
            <View style={styles.teamContainer}>
                <Image source={teamLogos[teamLogo]} style={styles.logo} />
                <Text style={styles.teamName}>{teamName}</Text>
            </View>

            {/* Options */}
            <View style={styles.optionRow}>
                {/* USD */}
                <TouchableOpacity
                    style={[
                        styles.optionCard,
                        option === "usd" && styles.optionSelected
                    ]}
                    onPress={() => setOption("usd")}
                >
                    <Text style={styles.optionTitle}>COP</Text>
                    <Text style={styles.optionSub}>+ {formatCOP(usdFee)}</Text>
                </TouchableOpacity>
                {/* TRUST */}
                <TouchableOpacity
                    style={[
                        styles.optionCard,
                        option === "trust" && styles.optionSelected
                    ]}
                    onPress={() => setOption("trust")}
                >
                    <Text style={styles.optionTitle}>Trust</Text>
                    <Text style={styles.optionSub}>+ {formatCOP(trustFee)} TRUST</Text>
                </TouchableOpacity>

            </View>
            <View style={styles.feeBox}>
                <Text style={styles.feeTitle}>Tarifa de Honestidad</Text>
                <Text style={styles.feeText}>
                    Esta tarifa existe para promover la participación responsable dentro del sistema.
                    Se reembolsa completamente siempre que los usuarios registren la información correcta
                    y sigan las reglas del proceso. Solo se retiene cuando se detecta incumplimiento
                    o uso inadecuado de la plataforma.
                </Text>
            </View>

            {/* Total */}
            <View style={{ alignItems: "center", marginVertical: 8 }}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>{formatCOP(total)}</Text>

                <Text style={styles.smallAmount}>
                    {option === "trust"
                        ? `${formatCOP(trustFee)} TRUST fee`
                        : option === "usd"
                            ? `${formatCOP(usdFee)} fee`
                            : "No fee selected"}
                </Text>
            </View>

            {/* Continue */}
            <TouchableOpacity style={styles.continueBtn} onPress={() => {
                if (!option) return;

                const fee = option === "trust" ? trustFee : usdFee;

                onConfirm({
                    type: option,
                    fee,
                    total,
                    amount,
                    prediction,
                    teamName
                });
            }}>
                <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        elevation: 999,
        flex: 1,
        padding: 20,
        paddingTop: 55,

        alignItems: "center",
        justifyContent: "flex-start", // or "center" if you want everything centered
        backgroundColor: "#0A0F14",
    },


    backIcon: {
        position: "absolute",
        top: 20,
        left: 20,
        padding: 6,
        zIndex: 10
    },

    label: {
        fontSize: 22,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 25,
        color: "#FFFFFF",
        letterSpacing: 0.3,
    },

    /* TEAM */
    teamContainer: {
        alignItems: "center",
        marginBottom: 30
    },

    logo: {
        width: 58,
        height: 58,
        borderRadius: 12,
        resizeMode: "contain",
        marginBottom: 10
    },

    teamName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    /* OPTIONS */
    optionRow: {
        flexDirection: "row",
        gap: 15,
        marginBottom: 25,
        width: "100%",
    },

    optionCard: {
        flex: 1,
        backgroundColor: "#12171D",
        paddingVertical: 18,
        paddingHorizontal: 12,
        borderRadius: 14,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#1E252D",
    },

    optionSelected: {
        backgroundColor: "#1A222C",
        borderColor: "#35D787",
        shadowColor: "#35D787",
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },

    optionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 3,
    },

    optionSub: {
        fontSize: 14,
        fontWeight: "500",
        color: "#9CA3AF",
    },

    /* FEE BOX */
    feeBox: {
        width: "100%",
        backgroundColor: "#12171D",
        padding: 16,
        borderRadius: 14,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: "#1E252D",
    },

    feeTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 4,
    },

    feeText: {
        fontSize: 14,
        color: "#9CA3AF",
        lineHeight: 20,
    },

    /* TOTAL */
    totalLabel: {
        fontSize: 15,
        color: "#9CA3AF",
    },

    totalAmount: {
        fontSize: 34,
        fontWeight: "800",
        marginVertical: 4,
        color: "#FFFFFF",
    },

    smallAmount: {
        fontSize: 14,
        color: "#9CA3AF",
    },

    /* BUTTON */
    continueBtn: {
        marginTop: 20,
        backgroundColor: "#35D787",
        width: "100%",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        shadowColor: "#35D787",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },

    continueText: {
        fontSize: 18,
        fontWeight: "800",
        color: "#000",
        letterSpacing: 0.5,
    },

    /* OTHER */
    errorText: {
        fontSize: 14,
        color: "#FF6A6A",
        marginTop: 5
    },
});
