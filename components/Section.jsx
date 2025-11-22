function Section({ title, children }) {
    return (
        <View style={{ marginTop: 30 }}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.sectionShow}>Show All</Text>
            </View>
            <View style={styles.sectionContent}>{children}</View>
        </View>
    );
}
