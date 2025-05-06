import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreenComponent from '../screens/SplashScreen';
import BottomTabBar from '../components/common/BottomTabBar';

// 일반 import로 변경
import PermissionScreen from '../screens/PermissionScreen';
import LoginScreen from '../screens/LoginScreen';
import GuideFirstScreen from '../screens/GuideScreen';
import NotificationScreen from '../screens/NotificationScreen';
import RegisterMainScreen from '../screens/gifticon-management/RegisterMainScreen';
import RegisterDetailScreen from '../screens/gifticon-management/RegisterDetailScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      {/* 로그인 및 온보딩 화면 (탭바 없음) */}
      <Stack.Screen name="Splash" component={SplashScreenComponent} />
      <Stack.Screen name="GuideFirst" component={GuideFirstScreen} />
      <Stack.Screen name="Permission" component={PermissionScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* 기타 화면 */}
      <Stack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterMainScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="RegisterDetail"
        component={RegisterDetailScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />

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
