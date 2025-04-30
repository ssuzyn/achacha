import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import PermissionScreen from '../screens/PermissionScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SplashScreenComponent from '../screens/SplashScreen';
import GuideFirstScreen from '../screens/GuideFirstScreen';
import BottomTabBar from '../components/common/BottomTabBar';
import theme from '../theme';

const Stack = createNativeStackNavigator();

// --- 앱 시작 시 권한 확인 로직은 SplashScreenComponent 내부 로직 또는 다른 상태 관리 로직으로 대체됨 ---

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      {/* 로그인 및 온보딩 화면 (탭바 없음) */}
      <Stack.Screen name="Splash" component={SplashScreenComponent} />
      <Stack.Screen name="GuideFirst" component={GuideFirstScreen} />
      <Stack.Screen name="Permission" component={PermissionScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* 메인 탭바 화면 */}
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
};

// 메인 네비게이터 (탭바가 있는 화면들)
const MainNavigator = () => {
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
      backgroundColor: theme.colors.background,
    }}
  >
    <Text>알림 화면</Text>
  </View>
);

export default AppNavigator;
