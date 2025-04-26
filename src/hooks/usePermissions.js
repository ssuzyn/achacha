import { useState, useCallback } from 'react';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
// BleManager 관련 코드는 이 훅에서 직접 사용하지 않으므로 제거합니다.
// BleManager 초기화는 앱의 다른 부분(예: PermissionScreen 또는 App.js)에서 관리되어야 합니다.

/**
 * 앱에 필요한 주요 권한들을 요청하는 커스텀 훅.
 * @returns {object} permissionsStatus: 권한 상태 ('idle', 'checking', 'success', 'fail')
 * @returns {function} requestAllPermissions: 모든 권한 요청을 시작하는 함수 (Promise<boolean> 반환: 성공/실패)
 */
export const usePermissions = () => {
  const [permissionsStatus, setPermissionsStatus] = useState('idle'); // idle, checking, success, fail

  // Android 블루투스/위치 권한 처리 로직 (기존 PermissionScreen의 함수)
  const handleAndroidBluetoothPermissions = useCallback(async () => {
    // Android 12 (API 31) 이상 권한 요청
    if (Platform.Version >= 31) {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];
      const statuses = await PermissionsAndroid.requestMultiple(permissions);
      console.log('[usePermissions] Android 12+ Permissions Status:', statuses);
      const allGranted = permissions.every(permission => statuses[permission] === PermissionsAndroid.RESULTS.GRANTED);
      if (!allGranted) {
        Alert.alert('블루투스/위치 권한 거부됨', 'Android 12 이상에서는 블루투스 스캔, 연결 및 위치 권한이 필요합니다.');
        return false;
      }
    // Android 6 (API 23) ~ 11 (API 30) 위치 권한 요청
    } else if (Platform.Version >= 23) {
      const locationPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (!locationPermission) {
        const statusResult = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (statusResult !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('위치 권한 거부됨', '블루투스 스캔을 위해 위치 권한이 필요합니다.');
          return false;
        }
      }
    }
    return true;
  }, []); // 이 함수는 외부 상태에 의존하지 않으므로 빈 배열

  // 모든 권한을 순차적으로 요청하는 함수
  const requestAllPermissions = useCallback(async () => {
    setPermissionsStatus('checking');
    let allGranted = true;

    try {
      // 1. 알림 권한 요청
      console.log('[usePermissions] Requesting Notification permissions...');
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (notificationStatus !== 'granted') {
        Alert.alert('알림 권한 거부됨', '앱 설정에서 알림 권한을 허용해주세요.');
        allGranted = false;
      }
      console.log(`[usePermissions] Notification permission: ${notificationStatus}`);

      // 2. 블루투스 및 위치 권한 요청 (Android) - 이전 권한이 성공한 경우 진행 (선택 사항)
      if (allGranted || true) { // 모든 권한이 필수라고 가정하고 진행 (필수가 아니면 조건 수정)
        console.log('[usePermissions] Requesting Bluetooth/Location permissions...');
        const androidPermissionsGranted = await handleAndroidBluetoothPermissions();
        if (!androidPermissionsGranted) {
          console.log('[usePermissions] Android Bluetooth/Location permissions denied.');
          allGranted = false;
        } else {
          console.log('[usePermissions] Android Bluetooth/Location permissions granted.');
        }
      }

      // 3. 갤러리 권한 요청 - 이전 권한이 성공한 경우 진행 (선택 사항)
      if (allGranted || true) { // 모든 권한이 필수라고 가정하고 진행
        console.log('[usePermissions] Requesting Media Library permissions...');
        const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (mediaLibraryStatus !== 'granted') {
          Alert.alert('갤러리 접근 권한 거부됨', '앱 설정에서 갤러리 접근 권한을 허용해주세요.');
          allGranted = false;
        }
        console.log(`[usePermissions] Media Library permission: ${mediaLibraryStatus}`);
      }

      // 최종 결과 처리
      if (allGranted) {
        setPermissionsStatus('success');
        console.log('[usePermissions] 모든 필수 권한 요청 완료.');
        return true; // 성공 반환
      } else {
        setPermissionsStatus('fail');
        console.log('[usePermissions] 일부 필수 권한이 거부됨.');
        // 실패 시 추가 Alert은 필요에 따라 유지 또는 제거
        // Alert.alert('권한 필요', '앱을 사용하려면 모든 필수 권한을 허용해야 합니다. 앱 설정에서 권한을 변경해주세요.');
        return false; // 실패 반환
      }
    } catch (error) {
      console.error("[usePermissions] Error requesting permissions:", error);
      setPermissionsStatus('fail');
      Alert.alert('권한 요청 오류', '권한을 요청하는 중 오류가 발생했습니다.');
      return false; // 실패 반환
    }
  }, [handleAndroidBluetoothPermissions]); // handleAndroidBluetoothPermissions 함수가 의존성

  // 훅 사용 컴포넌트에 상태와 요청 함수 반환
  return { permissionsStatus, requestAllPermissions };
}; 