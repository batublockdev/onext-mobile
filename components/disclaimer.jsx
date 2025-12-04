import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

export default function DisclaimerModal({ visible, onAccept }) {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <ScrollView showsVerticalScrollIndicator={false}>

                        <Text style={styles.title}>Aviso Importante</Text>

                        {/* Acuerdos */}
                        <Text style={styles.sectionTitle}>Acuerdos entre usuarios</Text>
                        <Text style={styles.text}>
                            Esta aplicación permite que dos usuarios creen y gestionen un acuerdo privado
                            sobre el resultado de un encuentro deportivo. La aplicación no participa ni decide
                            el resultado, solo facilita el registro y el cumplimiento del acuerdo entre las partes.
                        </Text>

                        {/* Responsabilidad */}
                        <Text style={styles.sectionTitle}>Responsabilidad de los usuarios</Text>
                        <Text style={styles.text}>
                            Los usuarios deben registrar el resultado dentro de las primeras 5 horas después de que termine
                            el encuentro. Son responsables de la veracidad de la información y de resolver diferencias
                            directamente entre ellos.
                        </Text>

                        {/* Tarifas */}
                        <Text style={styles.sectionTitle}>Tarifas del sistema</Text>

                        <Text style={styles.subtitle}>1. Tarifa de funcionamiento – 5%</Text>
                        <Text style={styles.text}>
                            Esta tarifa se aplica cuando ambos usuarios registran y confirman el resultado
                            dentro de las primeras 5 horas. Cubre infraestructura, mantenimiento del sistema y herramientas
                            de verificación automática.
                        </Text>

                        <Text style={styles.subtitle}>2. Tarifa de verificación comunitaria – 7%</Text>
                        <Text style={styles.text}>
                            Si los usuarios no ingresan un resultado dentro del plazo o existe discrepancia,
                            la comunidad puede participar en la verificación. Dado que este proceso requiere más recursos,
                            la tarifa se ajusta al 7%.
                        </Text>

                        <Text style={styles.subtitle}>3. Tarifa de honestidad (retornable)</Text>
                        <Text style={styles.text}>
                            Al crear un acuerdo, cada usuario aporta una tarifa de honestidad totalmente retornable.
                            Esta tarifa se devuelve si el usuario participa correctamente, proporcionando información real,
                            enviando resultados a tiempo y cumpliendo las reglas del sistema. Solo se retiene si se detecta
                            comportamiento deshonesto o incumplimiento.
                        </Text>


                        {/* Comunidad */}
                        <Text style={styles.sectionTitle}>Intervención comunitaria</Text>
                        <Text style={styles.text}>
                            Cuando no se registra un resultado a tiempo o existe un desacuerdo, la comunidad puede ayudar
                            mediante un proceso de verificación adicional según las reglas establecidas.
                        </Text>

                        {/* Uso autónomo */}
                        <Text style={styles.sectionTitle}>Uso autónomo</Text>
                        <Text style={styles.text}>
                            El usuario participa de manera libre y autónoma. Esta aplicación no ofrece servicios financieros,
                            predicciones ni juegos de azar. Es un sistema neutral para gestionar acuerdos privados entre usuarios.
                        </Text>

                    </ScrollView>

                    <TouchableOpacity style={styles.button} onPress={onAccept}>
                        <Text style={styles.buttonText}>Aceptar y Continuar</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    container: {
        backgroundColor: "#FFF",
        borderRadius: 12,
        padding: 20,
        maxHeight: "85%",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 12,
    },
    sectionTitle: {
        marginTop: 15,
        fontWeight: "bold",
        fontSize: 17,
        color: "#222",
    },
    subtitle: {
        marginTop: 10,
        fontWeight: "600",
        fontSize: 15,
        color: "#333",
    },
    text: {
        fontSize: 14,
        color: "#444",
        marginTop: 4,
        lineHeight: 20,
    },
    button: {
        marginTop: 15,
        paddingVertical: 14,
        backgroundColor: "#35D787",
        borderRadius: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16,
    },
});
