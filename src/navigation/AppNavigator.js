import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PermissionScreen from '../screens/PermissionScreen';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

// --- 앱 시작 시 권한 확인 로직 (개선 필요) ---
// 실제 앱에서는 AsyncStorage나 다른 저장소를 사용하여
// 이전에 권한을 허용했는지 여부를 확인하는 로직이 필요합니다.
// 여기서는 임시로 항상 PermissionScreen부터 시작하도록 설정합니다.
const checkInitialRoute = () => {
  const permissionsPreviouslyGranted = false; // 실제 로직으로 대체 필요
  return permissionsPreviouslyGranted ? 'Home' : 'Permission';
};
// ---------------------------------------------

const AppNavigator = () => {
  // const initialRouteName = checkInitialRoute(); // 앱 시작 시 권한 확인 로직 적용 시 사용

  return (
    // initialRouteName="Permission" : 항상 권한 화면부터 시작
    // initialRouteName={initialRouteName} : 권한 상태 체크 로직 적용 시 사용
    <Stack.Navigator initialRouteName="Permission">
      <Stack.Screen
        name="Permission"
        component={PermissionScreen}
        options={{ headerShown: false }} // 권한 화면 헤더 숨기기
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }} // 권한 화면 헤더 숨기기
      />
      {/* 다른 스크린들을 여기에 추가할 수 있습니다 */}
    </Stack.Navigator>
  );
};

export default AppNavigator; 