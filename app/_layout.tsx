import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot } from 'expo-router';
import 'react-native-url-polyfill/auto';
import GlobalBanner from '../components/GlobalBanner';
import SafeScreen from '../components/SafeScreen';
import { AppProvider } from './contextUser';

export default function RootLayout() {

  return (
    <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}>
      <SafeScreen >
        <GlobalBanner></GlobalBanner>
        <AppProvider>
          <Slot />
        </AppProvider>
      </SafeScreen>
    </ClerkProvider >);
}
