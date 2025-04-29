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
      const allGranted = permissions.every(
        permission => statuses[permission] === PermissionsAndroid.RESULTS.GRANTED
      );
      if (!allGranted) {
        console.warn('[usePermissions] Android 12+ Bluetooth/Location permissions denied.'); // Alert 대신 경고 로그
        return false; // 여전히 성공 여부는 반환
      }
      // Android 6 (API 23) ~ 11 (API 30) 위치 권한 요청
    } else if (Platform.Version >= 23) {
      const locationPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (!locationPermission) {
        const statusResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (statusResult !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('[usePermissions] Location permission denied for Bluetooth scan.'); // Alert 대신 경고 로그
          return false; // 성공 여부 반환
        }
      }
    }
    return true;
  }, []); // 이 함수는 외부 상태에 의존하지 않으므로 빈 배열

  // 모든 권한을 순차적으로 요청하는 함수
  const requestAllPermissions = useCallback(async () => {
    setPermissionsStatus('checking');
    let finalOutcome = {
      // 각 권한 결과를 저장할 객체
      notification: false,
      bluetoothLocation: false,
      mediaLibrary: false,
    };

    try {
      // 1. 알림 권한 요청
      console.log('[usePermissions] Requesting Notification permissions...');
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      finalOutcome.notification = notificationStatus === 'granted';
      if (!finalOutcome.notification) {
        console.warn('[usePermissions] Notification permission denied.'); // Alert 대신 경고 로그
      }
      console.log(`[usePermissions] Notification permission: ${notificationStatus}`);

      // 2. 블루투스 및 위치 권한 요청 (Android) - 이전 결과와 관계없이 실행
      console.log('[usePermissions] Requesting Bluetooth/Location permissions...');
      const androidPermissionsGranted = await handleAndroidBluetoothPermissions();
      finalOutcome.bluetoothLocation = androidPermissionsGranted;
      // 내부 로그는 handleAndroidBluetoothPermissions 에서 처리

      // 3. 갤러리 권한 요청 - 이전 결과와 관계없이 실행
      console.log('[usePermissions] Requesting Media Library permissions...');
      const { status: mediaLibraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      finalOutcome.mediaLibrary = mediaLibraryStatus === 'granted';
      if (!finalOutcome.mediaLibrary) {
        console.warn('[usePermissions] Media Library permission denied.'); // Alert 대신 경고 로그
      }
      console.log(`[usePermissions] Media Library permission: ${mediaLibraryStatus}`);

      // 모든 요청 시도 후 상태를 'success'로 설정 (프로세스 완료 의미)
      setPermissionsStatus('success');
      console.log('[usePermissions] Permission request process completed.', finalOutcome);
      // 함수 반환 값은 필요에 따라 사용할 수 있음 (예: 최종 권한 상태 객체)
      return finalOutcome;
    } catch (error) {
      console.error('[usePermissions] Error requesting permissions:', error);
      setPermissionsStatus('fail'); // 심각한 오류 시에만 fail 상태
      Alert.alert('권한 요청 오류', '권한을 요청하는 중 오류가 발생했습니다.');
      return finalOutcome; // 오류 시에도 현재까지의 결과 반환
    }
  }, [handleAndroidBluetoothPermissions]); // handleAndroidBluetoothPermissions 함수가 의존성

  // 훅 사용 컴포넌트에 상태와 요청 함수 반환
  return { permissionsStatus, requestAllPermissions };
};
