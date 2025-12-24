import { useRouter } from "expo-router";
import { Alert } from "react-native";

export function useSignOut() {
    const router = useRouter();

    const signOutUser = async () => {
        try {
            router.replace("/sign-in"); // Redirect to your login route
        } catch (err) {
            console.log("Sign out error:", err);
            Alert.alert("Error", "Failed to sign out");
        }
    };

    return { signOutUser };
}
