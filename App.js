import React, { useCallback, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabBarProvider } from './src/context/TabBarContext';
import { HeaderBarProvider } from './src/context/HeaderBarContext';
import { ThemeProvider } from 'react-native-elements';
import theme from './src/theme/theme';
import * as Font from 'expo-font';
import { navigationRef } from './src/navigation/NavigationService';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// 특정 경고 무시 설정
LogBox.ignoreLogs([
  'Unexpected call to useState in a strict pure component',
  'Non-serializable values were found in the navigation state',
  'Component is not a function',
]);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  // 폰트 로딩 함수
  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        'Pretendard-Thin': require('./src/assets/fonts/Pretendard-Thin.otf'),
        'Pretendard-ExtraLight': require('./src/assets/fonts/Pretendard-ExtraLight.otf'),
        'Pretendard-Light': require('./src/assets/fonts/Pretendard-Light.otf'),
        'Pretendard-Regular': require('./src/assets/fonts/Pretendard-Regular.otf'),
        'Pretendard-Medium': require('./src/assets/fonts/Pretendard-Medium.otf'),
        'Pretendard-SemiBold': require('./src/assets/fonts/Pretendard-SemiBold.otf'),
        'Pretendard-Bold': require('./src/assets/fonts/Pretendard-Bold.otf'),
        'Pretendard-ExtraBold': require('./src/assets/fonts/Pretendard-ExtraBold.otf'),
        'Pretendard-Black': require('./src/assets/fonts/Pretendard-Black.otf'),
      });
    } catch (error) {
      // 오류 처리
    } finally {
      setIsReady(true);
    }
  };

  // 앱 초기화 시 폰트 로드
  useEffect(() => {
    loadFonts();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    // 모든 리소스가 준비되었을 때만 스플래시 화면 숨기기
    if (isReady) {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // 오류 처리
      }
    }
  }, [isReady]);

  // 폰트 로딩이 완료될 때까지 아무것도 렌더링하지 않음
  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={theme}>
        <SafeAreaProvider>
          <View style={styles.container} onLayout={onLayoutRootView}>
            <HeaderBarProvider>
              <TabBarProvider>
                <NavigationContainer ref={navigationRef}>
                  <AppNavigator />
                  <StatusBar style="auto" />
                </NavigationContainer>
              </TabBarProvider>
            </HeaderBarProvider>
          </View>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
