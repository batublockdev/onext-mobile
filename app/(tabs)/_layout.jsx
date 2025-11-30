import { useAuth } from '@clerk/clerk-expo';
import { useUser } from "@clerk/clerk-react";
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import 'react-native-get-random-values'; // MUST be first
import PinVerification from '../../components/pin';
const { decryptOnly } = require('../../self-wallet/wallet');
import { Keypair, StrKey } from 'stellar-sdk';
import { useApp } from '../contextUser';

const TabsLayout = () => {

    const { isSignedIn } = useAuth()
    const { user } = useUser();
    const { userx, setUserx, keypair, setKeypair } = useApp();
    const [loadingMessage, setLoadingMessage] = useState('Please enter your PIN to continue.');
    const [pinStatus, setPinStatus] = useState(null); // "success", "error", or null
    const [isLoading, setisLoading] = useState(false);


    useEffect(() => {
        console.log("User ID:", user.id); // Log the user ID to verify it's being accessed correctly
        const fetchUser = async () => {

            try {
                const response = await fetch('http://192.168.1.2:8383/api/user', {
                    method: 'POST', // must be POST to send body
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_user: user.id }), // send your user ID here
                });

                if (!response.ok) {
                    console.error('Server responded with error:', response.status);
                    return;
                }

                const data = await response.json();
                console.log('Fetched user data:', data);
                setUserx(data); // Update context with new user data
                handleClick();

                if (!data || (Array.isArray(data) && data.length === 0)) {
                    console.log('No user data found');

                }

            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUser();
    }, []);
    const handleClick = () => {
        if (!keypair) {

            setisLoading(true);
        }
    }

    const handlePinComplete = async (pin) => {
        try {
            console.log("PIN completado:", pin);
            console.log("Userx data:", userx);
            const keyUser = await decryptOnly(userx[0].encrypted_data, pin);
            const ky = Keypair.fromRawEd25519Seed(keyUser.key);
            setKeypair(ky);
            setisLoading(false);
            setPinStatus("success");
        } catch (error) {
            setLoadingMessage("PIN incorrecto, intente de nuevo.");
            setPinStatus("error");
            setisLoading(true);

        }
    }


    if (!isSignedIn) return <Redirect href={'/(auth)/sign-in'} />


    return (<>{
        !isLoading && (<Tabs
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: "#000703ff",
                    borderTopColor: "#0E1F2F",
                },

                tabBarActiveTintColor: "#35D787",
                tabBarActiveBackgroundColor: "#010302ff",
                tabBarInactiveTintColor: "#777",
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" color={color} size={size} />
                    ),
                    headerShown: false,
                    tabBarLabel: "Home",
                }}
            />

            <Tabs.Screen
                name="rooms"
                options={{
                    title: "Salones",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people" color={color} size={size} />
                    ),
                    headerShown: false,
                    tabBarLabel: "Salones",
                }}
            />

            <Tabs.Screen
                name="summiter"
                options={{
                    title: "Perfil",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" color={color} size={size} />
                    ),
                    headerShown: false,
                    tabBarLabel: "Summiter",
                }}
            />
        </Tabs>)}
        {
            isLoading && (
                <PinVerification
                    mode="verify"
                    status={pinStatus}

                    message={loadingMessage}
                    onComplete={handlePinComplete}

                />
            )
        }</>
    )

}

export default TabsLayout