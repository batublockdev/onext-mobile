export default {

    expo: {
        "name": "Trust App",
        "slug": "mobile",
        "version": "1.0.2",
        "orientation": "default",
        "icon": "./assets/images/icon.png",
        "scheme": "mobile",
        "userInterfaceStyle": "automatic",
        "newArchEnabled": true,
        "ios": {
            "supportsTablet": true,
            "buildNumber": "3",
            "bundleIdentifier": "com.batublockdev.mobile"
        },
        "android": {
            "adaptiveIcon": {
                "backgroundColor": "#0B0F14"
            },
            "versionCode": 3,

            "permissions": [
                "INTERNET"
            ],
            "edgeToEdgeEnabled": true,
            "predictiveBackGestureEnabled": false,
            "package": "com.batublockdev.mobile"
        },
        "web": {
            "output": "static",
            "favicon": "./assets/images/favicon.png"
        },
        "plugins": [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    "image": "./assets/images/splash-icon.png",
                    "imageWidth": 200,
                    "resizeMode": "contain",
                    "backgroundColor": "#ffffff",
                    "dark": {
                        "backgroundColor": "#000000"
                    }
                }
            ],
            "expo-web-browser"
        ],
        "experiments": {
            "typedRoutes": true,
            "reactCompiler": true
        },
        "extra": {
            "router": {},
            "eas": {
                "projectId": "1f719a5e-f35a-4ef5-b258-7a81a8e44281"
            }
        },
        "owner": "batublockdev",
        "runtimeVersion": {
            "policy": "appVersion"
        },
        "updates": {
            "url": "https://u.expo.dev/1f719a5e-f35a-4ef5-b258-7a81a8e44281"
        }
    }


}