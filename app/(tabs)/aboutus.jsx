import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";

const legalContent = {
    privacy: [
        { title: "Última actualización: 3 de diciembre de 2025", text: "" },
        { title: "1. Información que recopilamos", text: "Nombre de usuario, correo electrónico, acuerdos creados y estado de los smart contracts." },
        { title: "2. Cómo usamos tu información", text: "Facilitar la creación y seguimiento de acuerdos, mejorar la app y comunicarnos contigo sobre novedades." },
        { title: "3. Seguridad", text: "Claves privadas se almacenan solo en el dispositivo. Implementamos medidas técnicas para proteger tus datos." },
        { title: "4. Contacto", text: "soporte@[tuapp].com" },
    ],
    terms: [
        { title: "Última actualización: 3 de diciembre de 2025", text: "" },
        { title: "1. Uso de la app", text: "Debes ser mayor de 18 años. La app facilita la creación y seguimiento de acuerdos en smart contracts; no garantiza cumplimiento entre usuarios." },
        { title: "2. Cuentas y seguridad", text: "Eres responsable de mantener tu cuenta y claves privadas seguras." },
        { title: "3. Acuerdos entre usuarios", text: "Todos los acuerdos se registran en smart contracts. La app solo facilita su creación y seguimiento; disputas son responsabilidad de los usuarios." },
        { title: "4. Contacto", text: "soporte@[tuapp].com" },
    ],
    disclaimer: [
        { title: "Última actualización: 3 de diciembre de 2025", text: "" },
        { title: "1. Aviso legal", text: "La app no garantiza el cumplimiento del acuerdo, solo la ejecución correcta del smart contract." },
        { title: "2. Riesgo", text: "Errores en claves, configuración o uso de la app pueden afectar los contratos." },
        { title: "3. Limitación de responsabilidad", text: "No somos responsables de disputas, pérdidas o daños derivados del uso de la app o de acuerdos entre usuarios." },
        { title: "4. Contacto", text: "soporte@[tuapp].com" },
    ],
};

const LegalMenu = () => {
    const [open, setOpen] = useState(null); // 'privacy', 'terms', 'disclaimer'

    return (
        <View style={styles.container}>
            <Text style={styles.menuTitle}>Documentos Legales</Text>

            <TouchableOpacity style={styles.menuBtn} onPress={() => setOpen('privacy')}>
                <Text style={styles.menuBtnText}>Política de Privacidad</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuBtn} onPress={() => setOpen('terms')}>
                <Text style={styles.menuBtnText}>Términos y Condiciones</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuBtn} onPress={() => setOpen('disclaimer')}>
                <Text style={styles.menuBtnText}>Disclaimer / Aviso Legal</Text>
            </TouchableOpacity>

            {open && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={styles.header}>
                            {open === 'privacy' ? 'Política de Privacidad' : open === 'terms' ? 'Términos y Condiciones' : 'Disclaimer'}
                        </Text>
                        <ScrollView style={styles.scroll}>
                            {legalContent[open].map((section, index) => (
                                <View key={index}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    <Text style={styles.paragraph}>{section.text}</Text>
                                </View>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(null)}>
                            <Text style={styles.closeBtnText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#121212', justifyContent: 'center' },
    menuTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
    menuBtn: { backgroundColor: '#35D787', padding: 14, borderRadius: 10, marginBottom: 12 },
    menuBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 16 },
    modal: { flex: 1, backgroundColor: '#1E1E1E', borderRadius: 16, padding: 16 },
    header: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 12, textAlign: 'center' },
    scroll: { flex: 1 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginTop: 16, marginBottom: 6 },
    paragraph: { fontSize: 14, lineHeight: 20, color: '#ccc', marginBottom: 8 },
    closeBtn: { backgroundColor: '#35D787', paddingVertical: 12, borderRadius: 10, marginTop: 12, alignItems: 'center' },
    closeBtnText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});

export default LegalMenu;
