import React, { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { styled } from 'nativewind';

// Styled 컴포넌트 생성
const StyledView = styled(View);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const onLayoutRootView = useCallback(async () => {
    // This callback hides the native splash screen once the app layout is ready.
    // The timed navigation logic is handled within SplashScreenComponent.
    try {
      await SplashScreen.hideAsync();
      console.log("Native splash screen hidden by App.js");
    } catch (e) {
      console.warn("Failed to hide native splash screen:", e);
    }
  }, []);

  return (
    <StyledView className="flex-1" onLayout={onLayoutRootView}>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </StyledView>
  );
}
