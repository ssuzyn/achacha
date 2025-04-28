import React, { useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    // Perform any necessary setup or data fetching here if needed outside of SplashScreen component
    // For now, we primarily rely on SplashScreen.js for checks
  }, []);

  const onLayoutRootView = useCallback(async () => {
    // This tells the splash screen to hide immediately once the app main layout is ready.
    // Our actual splash logic (timers, checks) is inside src/screens/Splash/SplashScreen.js
    try {
      await SplashScreen.hideAsync();
      console.log("Native splash screen hidden by App.js");
    } catch (e) {
      console.warn("Failed to hide native splash screen:", e);
    }
  }, []);

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </View>
  );
}
