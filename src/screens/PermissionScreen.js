import React, { useEffect } from 'react';
import {
  PermissionsAndroid,
  NativeModules,
  NativeEventEmitter,
  Platform,
  Image,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import BleManager from 'react-native-ble-manager';
import { useNavigation } from '@react-navigation/native';
import PermissionItem from '../components/PermissionItem';
import { usePermissions } from '../hooks/usePermissions';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// 색상 상수 정의
const COLORS = {
  primary: '#56AEE9',
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  buttonPrimary: '#56AEE9',
};

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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.centerContainer}>
            <View style={styles.headerContainer}>
              <View style={styles.titleContainer}>
                <Image
                  source={require('../../assets/splash-icon.png')}
                  style={{ width: 60, height: 22, marginRight: 8 }}
                  resizeMode="contain"
                />
                <Text style={styles.titleText}>이용을 위해</Text>
              </View>
              <Text style={[styles.titleText, styles.textCenter]}>아래 권한을 허용해주세요.</Text>
            </View>

            <View style={styles.permissionsContainer}>
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
            style={[styles.button, permissionsStatus === 'checking' && styles.buttonDisabled]}
            onPress={handlePressNext}
            disabled={permissionsStatus === 'checking'}
          >
            <Text style={styles.buttonText}>
              {permissionsStatus === 'checking' ? '권한 확인 중...' : '다음'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  textCenter: {
    textAlign: 'center',
  },
  permissionsContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default PermissionScreen;
