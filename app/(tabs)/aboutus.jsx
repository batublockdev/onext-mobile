import { useState } from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DisclaimerModal from "../../components/disclaimer";

const LegalMenu = () => {
    const [open, setOpen] = useState(null); // 'privacy', 'terms', 'disclaimer'
    function formatCOP() {
        setOpen(false)
    }
    return (
        <View style={styles.container}>
            <Text style={styles.menuTitle}>Documentos Legales</Text>

            <TouchableOpacity style={styles.menuBtn} onPress={() =>
                Linking.openURL(
                    "https://landing-page-trustapp.vercel.app/politica-de-privacidad"
                )
            }>
                <Text style={styles.menuBtnText}>Política de Privacidad</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuBtn} onPress={() => Linking.openURL(
                "https://landing-page-trustapp.vercel.app/terminos-y-condiciones"
            )}>
                <Text style={styles.menuBtnText}>Términos y Condiciones</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuBtn} onPress={() => setOpen(true)}>
                <Text style={styles.menuBtnText}>Disclaimer / Aviso Legal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuBtn} onPress={() => Linking.openURL(
                "https://stellar.expert/explorer/public/contract/CA3UB5N7S6XXXHEZGZ6GJU5OVIIX5OQ7TAQ7X65BWY4YK3MWLVZF4ZL3"
            )}>
                <Text style={styles.menuBtnText}>Mirar contrato</Text>
            </TouchableOpacity>
            <DisclaimerModal visible={open} onAccept={formatCOP} ></DisclaimerModal>

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
