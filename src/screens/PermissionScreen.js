import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  PermissionsAndroid,
  NativeModules,
  NativeEventEmitter,
  Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import BleManager from 'react-native-ble-manager';
import { useNavigation } from '@react-navigation/native';
import PermissionItem from '../components/PermissionItem';
import { usePermissions } from '../hooks/usePermissions';
import theme from '../theme';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const PermissionScreen = () => {
  const navigation = useNavigation();
  const { permissionsStatus, requestAllPermissions } = usePermissions();

  // BleManager 초기화
  useEffect(() => {
    BleManager.start({ showAlert: false })
      .then(() => {
        console.log('BleManager initialized');
      })
      .catch(error => {
        console.error('BleManager initialization error:', error);
      });

    // 이벤트 리스너 등록 (옵션)
    const handlerDiscover = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      peripheral => {
        console.log('Discovered peripheral: ', peripheral);
      }
    );
    const handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', () => {
      console.log('Scan stopped');
    });

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      handlerDiscover.remove();
      handlerStop.remove();
    };
  }, []);

  // "다음" 버튼 클릭 핸들러
  const handlePressNext = async () => {
    // 훅에서 반환된 요청 함수 호출
    await requestAllPermissions();
    // 네비게이션은 useEffect에서 처리
  };

  // permissionsStatus 상태 변경 감지하여 네비게이션 처리
  useEffect(() => {
    if (permissionsStatus === 'success') {
      console.log('Permission request process finished, navigating to Login.');
      navigation.navigate('Login');
    } else if (permissionsStatus === 'fail') {
      // 심각한 오류 발생 시 (훅 내부 Alert 후 추가 동작 필요 시)
      console.error('Permission request process failed critically.');
      // Alert.alert(...) 제거 또는 다른 오류 처리 로직 추가
    }
    // 'checking' 이나 'idle' 상태에서는 아무것도 하지 않음
  }, [permissionsStatus, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.mainContentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>
              <Text style={styles.appName}>ㅇㅊㅊ</Text> 이용을 위해
            </Text>
            <Text style={styles.headerTitle}>아래 권한을 허용해주세요.</Text>
          </View>

          <View style={styles.permissionsListContainer}>
            <PermissionItem
              iconName="notifications"
              title="알림"
              description="기프티콘 유효기간 및 위치 기반 알림을 받기 위해 알림 권한이 필요합니다."
            />
            <PermissionItem
              iconName="bluetooth"
              title="블루투스"
              description="기프티콘 공유 및 위치 기반 알림 기능을 위해 블루투스 권한이 필요합니다."
            />
            <PermissionItem
              iconName="location-pin"
              title="위치"
              description="근처 매장 정보와 설정 변경 내 지도를 제공하기 위해 위치 권한이 필요합니다."
            />
            <PermissionItem
              iconName="photo-library"
              title="갤러리"
              description="기프티콘 이미지 업로드를 위하여 갤러리 접근 권한이 필요합니다."
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handlePressNext}
          disabled={permissionsStatus === 'checking'}
        >
          <Text style={styles.buttonText}>
            {permissionsStatus === 'checking' ? '권한 확인 중...' : '다음'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.layout.screen.paddingHorizontal,
    paddingTop: 40,
    paddingBottom: 30,
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
  },
  mainContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.layout.spacing.xxl,
    width: '100%',
  },
  headerTitle: {
    ...theme.typography.headingStyles.h3,
    color: theme.colors.text,
    textAlign: 'center',
  },
  appName: {
    color: theme.colors.primary,
    fontSize: theme.typography.responsiveFont(28),
    fontWeight: theme.typography.fontWeights.bold,
  },
  permissionsListContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: theme.colors.buttonPrimary,
    paddingVertical: 15,
    borderRadius: theme.border.radius.medium,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  buttonText: {
    ...theme.typography.buttonStyles.medium,
    color: theme.colors.buttonText,
  },
});

export default PermissionScreen;
