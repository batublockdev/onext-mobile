import { useAuth } from '@clerk/clerk-expo';
import { useUser } from "@clerk/clerk-react";
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-get-random-values'; // MUST be first
import { Keypair } from 'stellar-sdk';
import PinVerification from '../../components/pin';
import { useApp } from '../contextUser';

const { execution, createAccount, Trustline, fund } = require('../../self-wallet/wallet');
const TabsLayout = () => {

    const { isSignedIn } = useAuth()
    const { user } = useUser();
    const { userx, setUserx } = useApp();

    const [existUser, setexistUser] = useState(true);

    const handlePinComplete = async (pin) => {
        // Call the wallet creation function with the PIN as password
        const { mnemonic, publicKey, keystore, id_app, secrect } = await execution(pin);
        console.log("Mnemonic:", mnemonic);
        console.log("Public Key:", publicKey);
        console.log("key secrect", secrect);


        try {
            const newUser = Keypair.fromSecret(secrect);
            await createAccount(newUser.publicKey());
            await Trustline(newUser);
            await fund(newUser.publicKey());
        } catch (error) {
            console.log('error ', error);
            res.status(500)
        }



        try {
            const response = await fetch('http://192.168.1.8:8383/api/usersave', {
                method: 'POST', // must be POST to send body
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_user: user.id, pub_key: publicKey, pr_code: keystore, tokenNotification: "x", username: user.firstName, user_email: user.emailAddresses[0].emailAddress, id_app: id_app }), // send your user ID here
            });

            if (!response.ok) {
                console.error('Server responded with error:', response.status);
                return;
            }
            const data = await response.json();
            console.log('User data saved successfully:', data);
            setUserx(data); // Update context with new user data


        } catch (error) {
            console.error('Error fetching user data:', error);
        }

        setexistUser(true);
        // Here you can call your create account function
    };

    useEffect(() => {
        console.log("User ID:", user.id); // Log the user ID to verify it's being accessed correctly
        const fetchUser = async () => {
            try {
                const response = await fetch('http://192.168.1.8:8383/api/user', {
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
                    setexistUser(false);

                }

            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUser();
    }, []);

    if (!isSignedIn) return <Redirect href={'/(auth)/sign-in'} />
    if (!existUser) {
        return (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

            <PinVerification
                mode="register"
                onComplete={handlePinComplete}
            />
        </View>)
    } else {

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
}

export default TabsLayout