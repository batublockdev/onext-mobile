import { useAuth } from '@clerk/clerk-expo';
import { useUser } from "@clerk/clerk-react";
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useEffect } from 'react';
import 'react-native-get-random-values'; // MUST be first

import { useApp } from '../contextUser';

const TabsLayout = () => {


    const { isSignedIn } = useAuth()
    const { user } = useUser();
    const { userx, setUserx } = useApp();



    useEffect(() => {
        console.log("User ID:", user.id); // Log the user ID to verify it's being accessed correctly
        const fetchUser = async () => {
            try {
                const response = await fetch('https://backendtrustapp-production.up.railway.app/api/user', {
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


                if (!data || (Array.isArray(data) && data.length === 0)) {
                    console.log('No user data found');

                }

            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        /* <PinVerification
     mode="register"
     onComplete={handlePinComplete}
 />*/
        fetchUser();
    }, []);

    if (!isSignedIn) return <Redirect href={'/(auth)/sign-in'} />


    return (<><Tabs>
        <Tabs.Screen
            name="index"
            options={{
                title: "Home",
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="home-outline" color={color} size={size} />
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
                    <Ionicons name="people-outline" color={color} size={size} />
                ),
                headerShown: false,
                tabBarLabel: "Salones",
            }}
        />

        <Tabs.Screen
            name="summiter"
            options={{
                title: "Summiter",
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="construct-outline" color={color} size={size} />
                ),
                headerShown: false,
                tabBarLabel: "Summiter",
            }}
        />
    </Tabs></>
    )

}

export default TabsLayout