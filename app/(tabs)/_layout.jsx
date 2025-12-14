import { useAuth } from '@clerk/clerk-expo';
import { useUser } from "@clerk/clerk-react";
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import 'react-native-get-random-values'; // MUST be first
import { Keypair } from 'stellar-sdk';
import AppError from '../../components/e404';
import PinVerification from '../../components/pin';
import TrustFullScreenLoading from '../../components/TrustFullScreenLoading';
import { useNotifications } from '../../hook/useNotifications';
import { useApp } from '../contextUser';
const { decryptOnly } = require('../../self-wallet/wallet');

const TabsLayout = () => {

    const { isSignedIn } = useAuth()
    const { user } = useUser();
    const { userx, setUserx, keypair, setKeypair } = useApp();
    const [loadingMessage, setLoadingMessage] = useState('Please enter your PIN to continue.');
    const [pinStatus, setPinStatus] = useState(null); // "success", "error", or null
    const [isLoading, setisLoading] = useState(false);
    const [isLoadingAnimation, setisLoadingAnimation] = useState(false);
    const getToken = useNotifications();
    const [error404, setError404] = useState(false);



    useEffect(() => {
        setisLoadingAnimation(true)
        const fetchUser = async () => {
            if (isSignedIn) {

                try {
                    const response = await fetch('https://backendtrustapp-production.up.railway.app/api/user', {
                        method: 'POST', // must be POST to send body
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id_user: user.id }), // send your user ID here
                    });

                    if (!response.ok) {
                        console.log('Server responded with error:', response.status);
                        return;
                    }

                    const data = await response.json();
                    console.log('Fetched user data:', data);
                    setUserx(data);
                    // Update context with new user dataif()
                    if (user.id == "user_36mxXZLXwQHlcfGpGGRISaqLLmV") {
                        handlePinComplete("0000")
                    } else {
                        handleClick(data);

                    }


                    if (!data || (Array.isArray(data) && data.length === 0)) {
                        console.log('No user data found');

                    }

                } catch (error) {
                    console.log('user data:', error);
                    setisLoadingAnimation(false);
                }

            }

        };

        fetchUser();
    }, [isSignedIn]);



    const handleClick = (userloading) => {

        if (!keypair) {
            if (!userloading || userloading !== null) {
                console.log("Userx data available:", userloading);

                if (!userloading[0]?.encrypted_data) {
                    console.log("No encrypted data found for user.");
                    setisLoadingAnimation(false);
                    return;
                }

                setisLoading(true);
            }
        } else {
            setisLoadingAnimation(false);

        }
    }

    const handlePinComplete = async (pin) => {
        try {
            console.log("Userx data:", userx);
            const keyUser = await decryptOnly(userx[0].encrypted_data, pin);
            const ky = Keypair.fromRawEd25519Seed(keyUser.key);

            setKeypair(ky);
            setisLoading(false);
            setPinStatus("success");
            setisLoadingAnimation(false);



        } catch (error) {
            console.log(error)
            setLoadingMessage("PIN incorrecto, intente de nuevo.");
            if (user.id == "user_36mxXZLXwQHlcfGpGGRISaqLLmV") {
                setLoadingMessage("Escribe 0000");
            }
            setPinStatus("error");
            setisLoading(true);

        }
    }


    if (!isSignedIn) return <Redirect href={'/(auth)/sign-in'} />


    return (
        error404 ? (
            <AppError onRetry={() => onRefresh()} />
        ) : (<>{
            !isLoading && (
                <Tabs
                    screenOptions={{
                        tabBarStyle: {
                            backgroundColor: "#000703ff",
                            borderTopColor: "#0E1F2F",
                        },
                        tabBarActiveTintColor: "#35D787",
                        tabBarInactiveTintColor: "#777",
                        headerShown: false,
                        tabBarShowLabel: false,   // ← hides labels
                    }}
                >

                    <Tabs.Screen
                        name="index"
                        options={{
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons name="home-outline" color={color} size={size} />
                            ),
                        }}
                    />

                    <Tabs.Screen
                        name="rooms"
                        options={{
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons name="people-outline" color={color} size={size} />
                            ),
                        }}
                    />

                    <Tabs.Screen
                        name="summiter"
                        options={{
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons name="person-circle-outline" color={color} size={size} />
                            ),
                        }}
                    />

                    <Tabs.Screen
                        name="aboutus"
                        options={{
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons name="information-circle-outline" color={color} size={size} />
                            ),
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
            }
            {
                !isLoading && isLoadingAnimation && (
                    <TrustFullScreenLoading />
                )
            }</>)
    )

}

export default TabsLayout