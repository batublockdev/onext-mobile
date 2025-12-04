import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
const { width } = Dimensions.get("window");
import { Link, useRouter } from 'expo-router';

const slides = [
    {
        title: "Plataforma de Acuerdos",
        text: "Crea y administra acuerdos claros entre usuarios, registrados de forma transparente en la blockchain.",
        bg: "#F1F4FF",
    },
    {
        title: "Smart Contracts",
        text: "Cada acuerdo utiliza un contrato inteligente que almacena la información de forma segura y verificable.",
        bg: "#E8F9F1",
    },
    {
        title: "Transparencia y Control",
        text: "Las condiciones del acuerdo son visibles para ambas partes y no pueden modificarse una vez creadas.",
        bg: "#FFF6E8",
    },
    {
        title: "Privacidad Local",
        text: "Tus claves privadas permanecen siempre en tu dispositivo. No se comparten ni almacenan en servidores.",
        bg: "#EAF7FF",
    },
    {
        title: "Aclaración Importante",
        text: "La app facilita el registro de acuerdos entre usuarios. No garantiza resultados externos ni interviene en disputas personales.",
        bg: "#FDECEC",
    },
];

export default function Onboarding({ onLoginPress }) {
    const flatListRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-slide
    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % slides.length;
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setCurrentIndex(nextIndex);
        }, 8000);

        return () => clearInterval(interval);
    }, [currentIndex]);

    const onScroll = event => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor="transparent" translucent />

            {/* SLIDES */}
            <FlatList
                ref={flatListRef}
                data={slides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={[styles.slide, { backgroundColor: item.bg }]}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.text}>{item.text}</Text>
                    </View>
                )}
                onScroll={onScroll}
                keyExtractor={(_, i) => i.toString()}
            />

            {/* PUNTOS DE PROGRESO ARRIBA DE LOS BOTONES */}
            <View style={styles.dotsContainer}>
                {slides.map((_, i) => (
                    <View
                        key={i}
                        style={[styles.dot, currentIndex === i && styles.activeDot]}
                    />
                ))}
            </View>

            {/* ZONA FIJA DE ABAJO */}
            <View style={styles.bottom}>
                <TouchableOpacity style={styles.loginBtn} onPress={onLoginPress}>
                    <Text style={styles.loginText}>Iniciar sesión</Text>
                </TouchableOpacity>

                <TouchableOpacity >
                    <Link href="/sign-up">

                        <Text style={styles.createText}>¿No tienes cuenta? Crear una</Text>
                    </Link>
                </TouchableOpacity>

                <Text style={styles.termsText}>

                    Al continuar, aceptas nuestros
                    <Text style={styles.termsLink}> Términos y Condiciones</Text>.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000ff",
        paddingBottom: 30,
    },
    slide: {
        width: width,
        padding: 40,
        justifyContent: "center",
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#000",
    },
    text: {
        fontSize: 16,
        color: "#333",
        marginTop: 10,
        width: "85%",
    },
    dotsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",   // ⬅️ alinea a la izquierda
        marginTop: 20,
        marginBottom: 10,
        paddingHorizontal: 20,          // ⬅️ para separarlo del borde
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#555",
        marginRight: 6,
    },
    activeDot: {
        width: 16,
        backgroundColor: "#0AF", // color activo
    },
    bottom: {
        position: "absolute",
        bottom: 100,
        width: "100%",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    loginBtn: {
        backgroundColor: "#000",
        paddingVertical: 14,
        borderRadius: 12,
        width: "100%",
        alignItems: "center",
        marginBottom: 12,
    },
    loginText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },
    createText: {
        fontSize: 14,
        color: "#000",
        marginBottom: 20,
    },
    termsText: {
        fontSize: 12,
        color: "#555",
        textAlign: "center",
        marginTop: 5,
    },
    termsLink: {
        color: "#000",
        fontWeight: "600",
    },
});
