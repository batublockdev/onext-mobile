import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeScreen = ({ children }) => {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions(); // ✅ HERE
    const isTablet = width >= 768;
    return (
        <View
            style={{
                flex: 1,
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
                paddingLeft: insets.left,
                paddingRight: insets.right,
                backgroundColor: "#0D0D0D",
                alignItems: "center", // center on iPad
            }}
        >
            <View
                style={{
                    flex: 1,
                    width: "100%",
                    maxWidth: isTablet ? 700 : "100%",  // 👈 KEY FOR IPAD
                }}
            >
                {children}
            </View>
        </View>
    );
};


export default SafeScreen