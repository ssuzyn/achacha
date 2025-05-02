import React, { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabBarProvider } from './src/context/TabBarContext';
import { HeaderBarProvider } from './src/context/HeaderBarContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const onLayoutRootView = useCallback(async () => {
    // This callback hides the native splash screen once the app layout is ready.
    // The timed navigation logic is handled within SplashScreenComponent.
    try {
      await SplashScreen.hideAsync();
      console.log('Native splash screen hidden by App.js');
    } catch (e) {
      console.warn('Failed to hide native splash screen:', e);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.container} onLayout={onLayoutRootView}>
        <HeaderBarProvider>
          <TabBarProvider>
            <NavigationContainer>
              <AppNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </TabBarProvider>
        </HeaderBarProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
