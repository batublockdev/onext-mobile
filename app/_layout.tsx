import { Slot } from 'expo-router';
import 'react-native-url-polyfill/auto';
import SafeScreen from '../components/SafeScreen';
import { AuthProvider } from '../context/AuthContext';
import { AppProvider } from './contextUser';

export default function RootLayout() {

  return (
    <AuthProvider>
      <SafeScreen >
        <AppProvider>
          <Slot />
        </AppProvider>
      </SafeScreen>
    </AuthProvider >)
}
