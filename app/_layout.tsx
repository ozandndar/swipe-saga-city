import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { SplashScreen as CustomSplashScreen } from '@/screens/SplashScreen';
import { LoadingScreen } from '@/screens/LoadingScreen';
import '../src/i18n';
import { useLanguageStore } from '@/stores/languageStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useDilemmaStore } from '@/stores/dilemmaStore';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const initLanguage = useLanguageStore(state => state.initLanguage);
  const fetchDilemmas = useDilemmaStore(state => state.fetchDilemmas);

  useEffect(() => {
    const prepare = async () => {
      try {
        await initLanguage();
        await Promise.all([
          new Promise(resolve => setTimeout(resolve, 2500)),
        ]);
        setIsReady(true);
        await SplashScreen.hideAsync();
        await new Promise(resolve => setTimeout(resolve, 2500));
        setIsLoading(false);
      } catch (e) {
        console.warn(e);
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    fetchDilemmas();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        {!isReady ? (
          <CustomSplashScreen />
        ) : isLoading ? (
          <LoadingScreen />
        ) : (
          <Stack screenOptions={{ headerShown: false }} />
        )}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
