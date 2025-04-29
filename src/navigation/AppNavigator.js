import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PermissionScreen from '../screens/PermissionScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SplashScreenComponent from '../screens/SplashScreen';
import GuideFirstScreen from '../screens/GuideFirstScreen';

const Stack = createNativeStackNavigator();

// --- 앱 시작 시 권한 확인 로직은 SplashScreenComponent 내부 로직 또는 다른 상태 관리 로직으로 대체됨 ---

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreenComponent} />
      <Stack.Screen name="GuideFirst" component={GuideFirstScreen} />
      <Stack.Screen name="Permission" component={PermissionScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* 다른 스크린들을 여기에 추가할 수 있습니다 */}
    </Stack.Navigator>
  );
};

export default AppNavigator;
