import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot } from 'expo-router';
import 'react-native-url-polyfill/auto';
import SafeScreen from '../components/SafeScreen';
import { AppProvider } from './contextUser';

export default function RootLayout() {
  return (

    <ClerkProvider tokenCache={tokenCache}>
      <SafeScreen >
        <AppProvider>
          <Slot />
        </AppProvider>
      </SafeScreen>
    </ClerkProvider>);
}
