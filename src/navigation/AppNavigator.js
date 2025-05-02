import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PermissionScreen from '../screens/PermissionScreen';
// import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SplashScreenComponent from '../screens/SplashScreen';
import GuideFirstScreen from '../screens/GuideScreen';
import BottomTabBar from '../components/common/BottomTabBar';

const Stack = createNativeStackNavigator();

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

export default AppNavigator;
