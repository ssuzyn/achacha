import React, { useCallback, useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet, LogBox, Text, TextInput, Platform, AppState } from 'react-native';
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
import { KAKAO_REST_API_KEY } from '@env';
import Geofencing from '@rn-bridge/react-native-geofencing';

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

// 지오펜싱 관련 import 추가
import GeofencingService from './src/services/GeofencingService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

// 백그라운드 위치 추적을 위한 task 이름 정의
const LOCATION_TRACKING = 'background-location-tracking';

// 백그라운드 위치 추적 Task 정의
TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
  if (error) {
    console.error('[BackgroundLocationTask] 오류:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    const location = locations[0];
    if (location) {
      console.log('[BackgroundLocationTask] 위치 업데이트:', location);

      try {
        // AsyncStorage에서 기프티콘 불러오기
        const gifticonsStr = await AsyncStorage.getItem('USER_GIFTICONS');

        if (!gifticonsStr) {
          console.log('[AsyncStorage] 백그라운드에서 읽은 기프티콘: null');
          return;
        }

        let gifticons;
        try {
          gifticons = JSON.parse(gifticonsStr);
        } catch (parseError) {
          console.error('[AsyncStorage] JSON 파싱 오류:', parseError);
          return;
        }

        if (!Array.isArray(gifticons)) {
          console.error('[AsyncStorage] 기프티콘 데이터가 배열이 아님');
          return;
        }

        // GeofencingService 인스턴스 생성 및 데이터 주입
        const geofencingService = new GeofencingService();
        geofencingService.userGifticons = gifticons;

        // 지오펜싱 초기화 후 위치 기반 체크
        if (!geofencingService.initialized) {
          await geofencingService.initGeofencing();
        }

        // 현재 위치 기반으로 지오펜스 체크
        await geofencingService.checkGeofences(location);
      } catch (error) {
        console.error('[BackgroundLocationTask] 처리 중 오류:', error);
      }
    }
  }
});

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
  const [navigationReady, setNavigationReady] = useState(false);
  const [pendingShareItem, setPendingShareItem] = useState(null);
  // Zustand 스토어의 토큰 복원 함수
  const restoreAuth = useAuthStore(state => state.restoreAuth);
  // 지오펜싱 서비스 참조
  const geofencingServiceRef = useRef(null);

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

  // 위치 권한 요청 함수
  const requestLocationPermissions = async () => {
    try {
      // 포그라운드 위치 권한 요청
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        console.log('[App] 포그라운드 위치 권한이 거부됨');
        return false;
      }

      // 백그라운드 위치 권한 요청 (Android만)
      if (Platform.OS === 'android') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

        if (backgroundStatus !== 'granted') {
          console.log('[App] 백그라운드 위치 권한이 거부됨');
          return false;
        }
      }

      console.log('[App] 위치 권한 획득 성공');
      return true;
    } catch (error) {
      console.error('[App] 위치 권한 요청 오류:', error);
      return false;
    }
  };

  // 백그라운드 위치 추적 시작
  const startBackgroundLocationTracking = async () => {
    try {
      // 이미 등록된 태스크가 있는지 확인
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING).catch(
        () => false
      );

      if (hasStarted) {
        console.log('[App] 이미 백그라운드 위치 추적 중');
        return;
      }

      // 백그라운드 위치 추적 시작
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 300000, // 5분마다
        distanceInterval: 100, // 100미터마다
        deferredUpdatesInterval: 300000, // 배터리 최적화
        deferredUpdatesDistance: 100,
        foregroundService: {
          notificationTitle: '위치 추적 중',
          notificationBody: '주변 매장 알림 서비스가 실행 중입니다',
        },
        pausesUpdatesAutomatically: false,
      });

      console.log('[App] 백그라운드 위치 추적 시작됨');
    } catch (error) {
      console.error('[App] 백그라운드 위치 추적 시작 오류:', error);
    }
  };

  const fetchInitialStoreData = async () => {
    try {
      console.log('[App] 초기 매장 데이터 로드 시작');

      // 1. 기프티콘 데이터 확인
      const storedGifticons = await AsyncStorage.getItem('USER_GIFTICONS');
      if (!storedGifticons) {
        console.log('[App] 기프티콘 데이터가 없어 매장 검색 불가');
        return;
      }

      // 2. 기프티콘에서 브랜드 정보 추출
      const gifticons = JSON.parse(storedGifticons);
      if (!Array.isArray(gifticons) || gifticons.length === 0) {
        console.log('[App] 유효한 기프티콘 없음');
        return;
      }

      // 중복 없는 브랜드 정보 추출
      const uniqueBrands = gifticons.reduce((acc, gifticon) => {
        if (!acc[gifticon.brandId]) {
          acc[gifticon.brandId] = {
            brandId: gifticon.brandId,
            brandName: gifticon.brandName,
          };
        }
        return acc;
      }, {});

      const brandsList = Object.values(uniqueBrands);
      console.log('[App] 추출된 브랜드:', brandsList.map(b => b.brandName).join(', '));

      // 3. 현재 위치 가져오기
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (!location || !location.coords) {
        console.log('[App] 위치 정보를 가져올 수 없음');
        return;
      }

      const { latitude, longitude } = location.coords;
      console.log('[App] 현재 위치:', latitude, longitude);

      // 4. 브랜드별 주변 매장 검색
      const storeResults = [];

      for (const brand of brandsList) {
        try {
          console.log(`[App] ${brand.brandName} 주변 매장 검색 중...`);

          const response = await fetch(
            `https://dapi.kakao.com/v2/local/search/keyword.json?` +
              `query=${encodeURIComponent(brand.brandName)}&` +
              `x=${longitude}&` +
              `y=${latitude}&` +
              `radius=500&` +
              `sort=distance`,
            {
              headers: {
                Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
              },
            }
          );

          if (!response.ok) {
            console.log(`[App] ${brand.brandName} 검색 실패:`, response.status);
            continue;
          }

          const data = await response.json();
          console.log(`[App] ${brand.brandName} 검색 결과: ${data.documents.length}개 매장`);

          if (data.documents.length > 0) {
            storeResults.push({
              brandId: brand.brandId,
              brandName: brand.brandName,
              stores: data.documents,
            });
          }
        } catch (error) {
          console.error(`[App] ${brand.brandName} 검색 중 오류:`, error);
        }
      }

      // 5. 검색 결과가 있으면 저장 및 지오펜스 설정
      if (storeResults.length > 0) {
        console.log(
          '[App] 총 매장 데이터:',
          storeResults.reduce((sum, brand) => sum + brand.stores.length, 0)
        );

        // AsyncStorage에 저장
        await AsyncStorage.setItem('GEOFENCE_STORE_DATA', JSON.stringify(storeResults));
        console.log('[App] 매장 데이터 저장 완료');

        // 지오펜싱 서비스에 데이터 설정 및 지오펜스 등록
        if (geofencingServiceRef.current) {
          geofencingServiceRef.current.brandStores = storeResults;
          await geofencingServiceRef.current.setupGeofences(storeResults);

          // 설정 확인
          const geofences = await Geofencing.getRegisteredGeofences();
          console.log('[App] 지오펜스 설정 완료:', geofences?.length || 0);
        }
      } else {
        console.log('[App] 주변에 매장 없음');
      }
    } catch (error) {
      console.error('[App] 초기 매장 데이터 로드 중 오류:', error);
    }
  };

  // 지오펜싱 초기화
  const initializeGeofencing = async () => {
    try {
      // 지오펜싱 서비스 인스턴스 생성
      if (!geofencingServiceRef.current) {
        geofencingServiceRef.current = new GeofencingService();
        console.log('[App] 지오펜싱 서비스 인스턴스 생성');
      }

      // 기존 저장된 기프티콘 데이터 로드
      const storedGifticons = await AsyncStorage.getItem('USER_GIFTICONS');
      if (storedGifticons) {
        try {
          const gifticons = JSON.parse(storedGifticons);
          if (Array.isArray(gifticons) && gifticons.length > 0) {
            geofencingServiceRef.current.updateUserGifticons({ gifticons });
            console.log('[App] 저장된 기프티콘 로드:', gifticons.length);
          }
        } catch (error) {
          console.error('[App] 저장된 기프티콘 파싱 오류:', error);
        }
      }

      // 위치 권한 요청
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) {
        console.log('[App] 위치 권한 획득 실패');
        return;
      }

      // 지오펜싱 초기화
      await geofencingServiceRef.current.initGeofencing();

      // 매장 데이터 로드
      await fetchInitialStoreData();

      // 백그라운드 위치 추적 시작
      await startBackgroundLocationTracking();

      console.log('[App] 지오펜싱 초기화 완료');
    } catch (error) {
      console.error('[App] 지오펜싱 초기화 오류:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await restoreAuth(); // Zustand의 토큰 복원(비동기)

      // 지오펜싱 초기화
      await initializeGeofencing();

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

  // 공유 인텐트(이미지) 처리
  useEffect(() => {
    ShareMenu.getInitialShare(item => {
      if (item && item.data && item.mimeType && item.mimeType.startsWith('image/')) {
        // navigationReady가 false면 일단 보류
        if (!navigationReady) {
          setPendingShareItem(item);
        } else {
          navigationRef.current?.navigate('Register', { sharedImageUri: item.data });
        }
      }
    });

    const listener = ShareMenu.addNewShareListener(item => {
      if (item && item.data && item.mimeType && item.mimeType.startsWith('image/')) {
        navigationRef.current?.navigate('Register', { sharedImageUri: item.data });
      }
    });

    return () => {
      listener.remove();
    };
  }, [navigationReady]);

  // navigationReady가 true가 되면 보류된 공유 인텐트 처리
  useEffect(() => {
    if (navigationReady && pendingShareItem) {
      navigationRef.current?.navigate('Register', { sharedImageUri: pendingShareItem.data });
      setPendingShareItem(null);
    }
  }, [navigationReady, pendingShareItem]);

  // 앱 상태 변경 감지 (백그라운드에서 포그라운드로)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && geofencingServiceRef.current) {
        // 앱이 포그라운드로 돌아왔을 때 지오펜싱 초기화 상태 확인
        if (!geofencingServiceRef.current.initialized) {
          console.log('[App] 앱 활성화 상태 - 지오펜싱 초기화');
          geofencingServiceRef.current.initGeofencing();
        }
      }
    });

    return () => {
      subscription.remove();
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
                    <NavigationContainer
                      ref={navigationRef}
                      linking={linking}
                      onReady={() => setNavigationReady(true)}
                    >
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
