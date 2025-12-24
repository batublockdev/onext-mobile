import { Redirect, Stack } from 'expo-router';
import TrustFullScreenLoading from '../../components/TrustFullScreenLoading';
import { useAuth } from '../../context/AuthContext';

export default function AuthRoutesLayout() {

    const { session, loading } = useAuth()

    if (loading) {
        return <TrustFullScreenLoading />;
    }

    if (session) {
        return <Redirect href="/" options={{ headerShown: false }} />;;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}