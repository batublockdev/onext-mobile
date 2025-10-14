import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

export function useSignOut() {
    const { signOut } = useAuth();
    const router = useRouter();

    const signOutUser = async () => {
        try {
            await signOut(); // Clerk logout
            router.replace("/sign-in"); // Redirect to your login route
        } catch (err) {
            console.error("Sign out error:", err);
            Alert.alert("Error", "Failed to sign out");
        }
    };

    return { signOutUser };
}
