import { View, Text } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const SafeScreen = ({ children }) => {
    const insets = useSafeAreaInsets()
    return (
        <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: "#0D0D0D", }}>
            {children}
        </View>
    )
}

export default SafeScreen