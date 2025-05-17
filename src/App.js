import { QueryClient, QueryClientProvider } from 'react-query';
import { handleError, handleAuthError } from './utils/errorHandler';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { navigationRef } from './navigation/NavigationService';
import { useEffect } from 'react';
import notificationHelper from './utils/notificationHelper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabBarProvider } from './context/TabBarContext';
import { HeaderBarProvider } from './context/HeaderBarContext';

// React Query 클라이언트 생성 및 기본 옵션 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // 실패 시 1번만 재시도
      refetchOnWindowFocus: false, // 창 포커스 시 자동 리페치 비활성화
      onError: error => {
        // 인증 에러 처리를 포함한 공통 에러 처리
        handleError(error, { onAuthError: handleAuthError });
      },
    },
    mutations: {
      onError: error => {
        // 인증 에러 처리를 포함한 공통 에러 처리
        handleError(error, { onAuthError: handleAuthError });
      },
    },
  },
});

// 앱 컴포넌트
export default function App() {
  // FCM 알림 초기화
  useEffect(() => {
    // FCM 및 로컬 푸시 알림 초기화
    let unsubscribeForeground;
    const setupNotifications = async () => {
      // 로컬 푸시 알림 설정 (로컬 알림 처리)
      notificationHelper.setupLocalNotifications();

      // FCM 초기화 및 이벤트 리스너 설정 (원격 알림 처리)
      unsubscribeForeground = await notificationHelper.initializeNotifications();
    };

    setupNotifications();

    // 클린업 함수
    return () => {
      if (unsubscribeForeground) {
        unsubscribeForeground();
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <TabBarProvider>
          <HeaderBarProvider>
            <NavigationContainer ref={navigationRef}>
              <AppNavigator />
            </NavigationContainer>
          </HeaderBarProvider>
        </TabBarProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
