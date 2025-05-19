import React, { useCallback, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet, LogBox, Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabBarProvider } from './src/context/TabBarContext';
import { HeaderBarProvider } from './src/context/HeaderBarContext';
import { ThemeProvider } from 'react-native-elements';
import theme from './src/theme/theme';
import * as Font from 'expo-font';
import { navigationRef } from './src/navigation/NavigationService';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppQueryClientProvider from './src/context/QueryClientProvider';
import useAuthStore from './src/store/authStore';
import { Linking } from 'react-native';
import NavigationService from './src/navigation/NavigationService';
// FCM 알림 관련 서비스 import
import {
  requestUserPermission,
  handleForegroundMessage,
  setupBackgroundHandler,
  handleNotificationOpen,
  setupTokenRefresh,
} from './src/services/NotificationService';
import ShareMenu from 'react-native-share-menu';
// Toast 메시지 추가
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/utils/toastService';
// 네이티브 알림 리스너 추가
import NotificationListener from './src/components/notification/NotificationListener';

// 특정 경고 무시 설정
LogBox.ignoreLogs([
  'Unexpected call to useState in a strict pure component',
  'Non-serializable values were found in the navigation state',
  'Component is not a function',
]);

// 텍스트 컴포넌트에 전역 스타일 적용
const setDefaultFontFamily = () => {
  // 폰트 굵기에 따른 폰트 패밀리 매핑 함수
  const getFontFamily = style => {
    // 기본 폰트 패밀리
    let fontWeight = null;

    // style에서 fontWeight 추출
    if (style) {
      if (Array.isArray(style)) {
        // 배열 스타일에서 마지막에 정의된 fontWeight를 사용
        for (let i = style.length - 1; i >= 0; i--) {
          if (style[i] && style[i].fontWeight) {
            fontWeight = style[i].fontWeight;
            break;
          }
        }
      } else if (typeof style === 'object' && style.fontWeight) {
        fontWeight = style.fontWeight;
      }
    }

    // fontWeight에 따른 적절한 폰트 패밀리 반환
    if (fontWeight === '100' || fontWeight === 100) return 'Pretendard-Thin';
    if (fontWeight === '200' || fontWeight === 200) return 'Pretendard-ExtraLight';
    if (fontWeight === '300' || fontWeight === 300) return 'Pretendard-Light';
    if (fontWeight === '400' || fontWeight === 400 || fontWeight === 'normal')
      return 'Pretendard-Regular';
    if (fontWeight === '500' || fontWeight === 500) return 'Pretendard-Medium';
    if (fontWeight === '600' || fontWeight === 600) return 'Pretendard-SemiBold';
    if (fontWeight === '700' || fontWeight === 700 || fontWeight === 'bold')
      return 'Pretendard-Bold';
    if (fontWeight === '800' || fontWeight === 800) return 'Pretendard-ExtraBold';
    if (fontWeight === '900' || fontWeight === 900) return 'Pretendard-Black';

    // 기본값
    return 'Pretendard-Regular';
  };

  // 기본 Text 컴포넌트 오버라이드
  const defaultTextProps = Object.getOwnPropertyDescriptor(Text, 'render');
  if (defaultTextProps) {
    const oldRender = defaultTextProps.value;
    const newRender = function (...args) {
      const origin = oldRender.call(this, ...args);
      const fontFamily = getFontFamily(origin.props.style);

      // 기존 스타일을 유지하면서 fontFamily만 새로 적용
      return React.cloneElement(origin, {
        style: [
          {
            fontFamily,
            includeFontPadding: false,
            textAlignVertical: 'center',
          },
          // fontWeight가 있는 경우 그대로 유지 (숫자를 문자열로 변환하지 않도록)
          origin.props.style,
        ],
        allowFontScaling: false,
      });
    };

    Object.defineProperty(Text, 'render', {
      ...defaultTextProps,
      value: newRender,
    });
  }

  // TextInput 컴포넌트 오버라이드
  const defaultTextInputProps = Object.getOwnPropertyDescriptor(TextInput, 'render');
  if (defaultTextInputProps) {
    const oldRender = defaultTextInputProps.value;
    const newRender = function (...args) {
      const origin = oldRender.call(this, ...args);
      const fontFamily = getFontFamily(origin.props.style);

      // 기존 스타일을 유지하면서 fontFamily만 새로 적용
      return React.cloneElement(origin, {
        style: [
          {
            fontFamily,
            includeFontPadding: false,
            textAlignVertical: 'center',
          },
          // fontWeight가 있는 경우 그대로 유지
          origin.props.style,
        ],
        allowFontScaling: false,
      });
    };

    Object.defineProperty(TextInput, 'render', {
      ...defaultTextInputProps,
      value: newRender,
    });
  }
};

// AppWrapper 컴포넌트 - 폰트 설정 초기화
const AppWrapper = ({ children }) => {
  useEffect(() => {
    setDefaultFontFamily();
  }, []);

  return children;
};

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const linking = {
  prefixes: ['achacha://'],
  config: {
    screens: {
      Main: {
        screens: {
          TabSharebox: {
            path: 'sharebox',
            parse: {
              code: code => code,
            },
          },
          // ...다른 탭
        },
      },
      // ...다른 스크린
    },
  },
};

export default function App() {
  const [isReady, setIsReady] = useState(false);
  // Zustand 스토어의 토큰 복원 함수
  const restoreAuth = useAuthStore(state => state.restoreAuth);

  // FCM 설정 초기화
  useEffect(() => {
    const initFCM = async () => {
      // 푸시 알림 권한 요청
      const permissionEnabled = await requestUserPermission();

      if (permissionEnabled) {
        // 포그라운드 메시지 처리 구독
        const unsubscribeForeground = handleForegroundMessage();

        // 백그라운드 메시지 핸들러 설정
        setupBackgroundHandler();

        // 알림 클릭 이벤트 처리 - navigationRef가 준비된 후에만 처리
        // 앱이 완전히 로드된 후에 알림 핸들러 설정
        const handleNavigationReady = () => {
          if (navigationRef.current) {
            handleNotificationOpen(navigationRef.current);
          } else {
            // navigationRef가 아직 준비되지 않았다면 짧은 지연 후 재시도
            setTimeout(handleNavigationReady, 500);
          }
        };
        
        // 앱 로딩이 완료된 후 실행
        setIsReady(prevIsReady => {
          if (prevIsReady) {
            handleNavigationReady();
          }
          return prevIsReady;
        });

        // 토큰 갱신 리스너 설정
        const unsubscribeTokenRefresh = setupTokenRefresh();

        // 컴포넌트 언마운트 시 리소스 정리
        return () => {
          unsubscribeForeground();
          unsubscribeTokenRefresh();
        };
      }
    };

    initFCM();
  }, []);

  useEffect(() => {
    const init = async () => {
      await restoreAuth(); // Zustand의 토큰 복원(비동기)
      // 복원이 끝난 뒤에만 딥링크 처리
      Linking.getInitialURL().then(url => {
        if (url) {
          NavigationService.handleDeepLink(url);
        }
      });
      // 실시간 딥링크(앱 실행 중)도 동일하게 처리
      const subscription = Linking.addEventListener('url', event => {
        NavigationService.handleDeepLink(event.url);
      });
      return () => subscription.remove();
    };
    init();
  }, []);

  // 공유 인텐트(이미지) 처리: react-native-share-menu 사용
  useEffect(() => {
    // 앱이 공유 인텐트로 처음 시작될 때
    ShareMenu.getInitialShare(item => {
      if (item && item.data && item.mimeType && item.mimeType.startsWith('image/')) {
        navigationRef.current?.navigate('Register', { sharedImageUri: item.data });
      }
    });

    // 앱 실행 중에 새로운 공유가 들어올 때
    const listener = ShareMenu.addNewShareListener(item => {
      if (item && item.data && item.mimeType && item.mimeType.startsWith('image/')) {
        navigationRef.current?.navigate('Register', { sharedImageUri: item.data });
      }
    });

    return () => {
      listener.remove();
    };
  }, []);

  // 폰트 및 인증 상태 로딩 함수
  const loadResources = async () => {
    try {
      // 폰트 로딩
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

      // 인증 상태 복원
      await restoreAuth();
    } catch (error) {
      console.error('리소스 로딩 중 오류 발생:', error);
    } finally {
      setIsReady(true);
    }
  };

  // 앱 초기화 시 리소스 로드
  useEffect(() => {
    loadResources();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    // 모든 리소스가 준비되었을 때만 스플래시 화면 숨기기
    if (isReady) {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.error('스플래시 화면 숨기기 실패:', e);
      }
    }
  }, [isReady]);

  // 리소스 로딩이 완료될 때까지 아무것도 렌더링하지 않음
  if (!isReady) {
    return null;
  }

  return (
    <AppWrapper>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* React Query Provider 추가 */}
        <AppQueryClientProvider>
          <ThemeProvider theme={theme}>
            <SafeAreaProvider>
              <View style={styles.container} onLayout={onLayoutRootView}>
                <HeaderBarProvider>
                  <TabBarProvider>
                    <NavigationContainer ref={navigationRef} linking={linking}>
                      <AppNavigator />
                      {/* 네이티브 알림 리스너 추가 */}
                      <NotificationListener />
                      <StatusBar style="auto" />
                    </NavigationContainer>
                  </TabBarProvider>
                </HeaderBarProvider>
              </View>
            </SafeAreaProvider>
          </ThemeProvider>
        </AppQueryClientProvider>
        {/* Toast 메시지 컴포넌트 추가 */}
        <Toast config={toastConfig} />
      </GestureHandlerRootView>
    </AppWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
