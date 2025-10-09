import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import SafeScreen from '../../components/SafeScreen';


export default function AuthRoutesLayout() {
    const { isSignedIn } = useAuth()

    if (isSignedIn) return <Redirect href={'/'} />


    return (
        <SafeScreen >

            <Stack />
        </SafeScreen >
    )
}