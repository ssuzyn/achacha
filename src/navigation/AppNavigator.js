import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import PermissionScreen from '../screens/PermissionScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SplashScreenComponent from '../screens/SplashScreen';
import GuideFirstScreen from '../screens/GuideScreen';
import BottomTabBar from '../components/common/BottomTabBar';
import { config } from '../components/ui/gluestack-ui-provider';
import { GluestackUIProvider } from '@gluestack-ui/themed';

const Stack = createNativeStackNavigator();

// 각 화면을 GluestackUIProvider로 감싸는 HOC(Higher-Order Component)
const withGluestack = Component => {
  return props => (
    <GluestackUIProvider config={config}>
      <Component {...props} />
    </GluestackUIProvider>
  );
};

// 각 화면을 Gluestack 컨텍스트로 감싸기
const WrappedSplashScreen = withGluestack(SplashScreenComponent);
const WrappedGuideScreen = withGluestack(GuideFirstScreen);
const WrappedPermissionScreen = withGluestack(PermissionScreen);
const WrappedLoginScreen = withGluestack(LoginScreen);

// --- 앱 시작 시 권한 확인 로직은 SplashScreenComponent 내부 로직 또는 다른 상태 관리 로직으로 대체됨 ---

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      {/* 로그인 및 온보딩 화면 (탭바 없음) */}
      <Stack.Screen name="Splash" component={WrappedSplashScreen} />
      <Stack.Screen name="GuideFirst" component={WrappedGuideScreen} />
      <Stack.Screen name="Permission" component={WrappedPermissionScreen} />
      <Stack.Screen name="Login" component={WrappedLoginScreen} />

      {/* 메인 탭바 화면 */}
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
};

// 메인 네비게이터 (탭바가 있는 화면들)
const MainNavigator = () => {
  // 탭바 화면들도 필요하다면 withGluestack으로 래핑할 수 있습니다
  return <BottomTabBar />;
};

// 임시 알림 화면
const NotificationScreen = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 20,
      backgroundColor: config.light['--color-background'],
    }}
  >
    <Text>알림 화면</Text>
  </View>
);

export default AppNavigator;
