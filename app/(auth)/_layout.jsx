import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import TrustFullScreenLoading from '../../components/TrustFullScreenLoading';

export default function AuthRoutesLayout() {
    const { isLoaded, isSignedIn } = useAuth();

    // 1. Show loading animation while Clerk initializes
    if (!isLoaded) {
        return <TrustFullScreenLoading />;
    }

    // 2. If user is signed in → redirect to main app
    if (isSignedIn) {
        return <Redirect href="/" options={{ headerShown: false }} />;
    }

    // 3. Otherwise show the authentication stack
    return <Stack screenOptions={{ headerShown: false }} />;
}