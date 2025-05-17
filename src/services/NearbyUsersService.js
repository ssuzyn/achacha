import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { PermissionsAndroid, Platform, Alert, AppState } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../store/authStore';
import apiClient from '../api/apiClient';

// BLE 서비스 및 특성 UUID
const SERVICE_UUID = '1bf0cbce-7af3-4b59-93f2-0c4c6d170164'; // 하이픈 포함된 형식
const SERVICE_UUID_NO_HYPHENS = SERVICE_UUID.replace(/-/g, ''); // 하이픈 제거된 형식

class NearbyUsersService {
  constructor() {
    this.deviceId = null; // 초기에는 null로 설정
    this.tokenExpiry = null; // 토큰 만료 시간 저장용
    this.nearbyUsers = [];
    this.isScanning = false;
    this.isAdvertising = false;
    this.serviceUUID = SERVICE_UUID; // 하이픈 포함된 UUID
    this.serviceUUIDNoHyphens = SERVICE_UUID_NO_HYPHENS; // 광고용 (하이픈 제거)
    this.SCAN_DURATION = 5000; // 스캔 시간 5초로 설정 (밀리초 단위)
    this.scanSubscription = null;
    this.manager = new BleManager();

    // 앱 상태 변경 이벤트 리스너 설정
    this.setupAppStateListener();

    // 저장된 토큰 불러오기
    this.loadStoredToken();
  }

  // 앱 상태 변경 이벤트 리스너 설정
  setupAppStateListener() {
    this.appStateListener = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // 포그라운드 상태
        console.log('앱이 포그라운드로 돌아왔습니다. BLE 작업을 재개합니다.');
        this.resumeBleOperations();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // 백그라운드 또는 낫러닝상태
        console.log('앱이 백그라운드로 전환되었습니다. BLE 작업을 중지합니다.');
        this.pauseBleOperations();
      }
    });
  }

  // BLE 작업 일시 중지 (백그라운드 진입 시)
  async pauseBleOperations() {
    try {
      // 스캔 중지
      if (this.isScanning) {
        await this.stopScan();
      }

      // 광고 중지 - BLE-PLX에서는 별도로 관리해야 함
      if (this.isAdvertising) {
        await this.stopAdvertising();
      }
    } catch (error) {
      console.error('BLE 작업 중지 실패:', error);
    }
  }

  // BLE 작업 재개 (포그라운드 복귀 시)
  async resumeBleOperations() {
    try {
      console.log('[AppState] resumeBleOperations 호출됨');

      const now = new Date();
      if (this.deviceId && this.tokenExpiry && this.tokenExpiry > now) {
        console.log(
          '[resumeBleOperations] 유효한 BLE 토큰이 이미 존재합니다. 토큰 재발급을 건너뜁니다.'
        );
      } else {
        console.log('[resumeBleOperations] BLE 토큰이 없거나 만료됨. 새 토큰 요청...');
        await this.generateBleToken();
      }

      await this.startAdvertising();
    } catch (error) {
      console.error('BLE 작업 재개 실패:', error);
    }
  }

  // 디바이스 UUID 가져오기
  getDeviceId() {
    return this.deviceId;
  }

  // 전체 UUID 생성
  generateFullUuid() {
    return uuidv4();
  }

  // 짧은 UUID 생성 (12자)
  generateShortUuid() {
    // 표준 UUID 생성
    const fullUuid = uuidv4();

    // 하이픈 제거 및 앞 12자리만 사용
    return fullUuid.replace(/-/g, '').substring(0, 12);
  }

  // 새 짧은 UUID 생성
  generateNewUuid() {
    this.deviceId = this.generateShortUuid();
    return this.deviceId;
  }

  // 블루투스 상태 확인 및 활성화 요청
  async checkBluetoothState() {
    try {
      const state = await this.manager.state();

      if (state === 'PoweredOn') {
        return true;
      } else {
        // iOS에서는 시스템 설정으로 이동하도록 안내
        if (Platform.OS === 'ios') {
          Alert.alert(
            '블루투스가 꺼져 있습니다',
            '설정에서 블루투스를 켜주세요.',
            [{ text: '확인', onPress: () => console.log('OK Pressed') }],
            { cancelable: false }
          );
          return false;
        }
        // Android에서는 활성화 요청
        else {
          if (state === 'PoweredOff') {
            Alert.alert(
              '블루투스가 꺼져 있습니다',
              '블루투스를 켜주세요.',
              [{ text: '확인', onPress: () => console.log('OK Pressed') }],
              { cancelable: false }
            );
          }
          return false;
        }
      }
    } catch (error) {
      console.error('블루투스 상태 확인 실패:', error);
      return false;
    }
  }

  // 블루투스 권한 요청 (Android)
  async requestBluetoothPermissions() {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 31) {
          // Android 12 이상
          const permissions = [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ];

          const results = await PermissionsAndroid.requestMultiple(permissions);

          return (
            results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === 'granted' &&
            results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === 'granted' &&
            results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE] === 'granted' &&
            results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === 'granted'
          );
        } else {
          // Android 12 미만
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: '위치 권한 필요',
              message: '근처 사용자를 찾기 위해 위치 권한이 필요합니다.',
              buttonNeutral: '나중에 묻기',
              buttonNegative: '취소',
              buttonPositive: '확인',
            }
          );

          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (error) {
        console.error('권한 요청 오류:', error);
        return false;
      }
    }

    return true; // iOS는 항상 true 반환 (권한은 앱 설치 시 요청)
  }

  // 저장된 토큰 불러오기
  async loadStoredToken() {
    try {
      const bleToken = useAuthStore.getState().bleToken;
      if (bleToken) {
        this.deviceId = bleToken;
        console.log('저장된 BLE 토큰 불러옴:', this.deviceId);
      }
    } catch (error) {
      console.error('저장된 BLE 토큰 불러오기 실패:', error);
    }
  }

  // BLE 토큰 생성 API 호출
  async generateBleToken() {
    try {
      console.log('BLE 토큰 요청 시작, 현재 토큰:', this.deviceId);

      const response = await apiClient.post('/api/ble', {
        bleTokenValue: this.deviceId, // 현재 가지고 있는 토큰 값 (없으면 null)
      });

      console.log('BLE 토큰 응답:', response.data);

      // bleToken 필드를 찾아서 사용 (서버가 이 필드로 응답함)
      const tokenValue = response.data?.bleToken;

      if (tokenValue) {
        console.log('새 BLE 토큰 받음:', tokenValue);
        await useAuthStore.getState().updateTokens(null, null, tokenValue);
        this.deviceId = tokenValue;

        // 새 토큰의 만료 시간 설정
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7); // 7일 후 만료로 설정
        this.tokenExpiry = expiry;
        console.log('[generateBleToken] 새 토큰 만료 시간 설정됨:', this.tokenExpiry);
      } else {
        console.error('서버 응답에 토큰이 없습니다:', response.data);
      }

      return response.data;
    } catch (error) {
      console.error('BLE 토큰 생성 중 오류:', error);
      throw error;
    }
  }

  // 블루투스 초기화 및 권한 설정
  async initialize() {
    console.log('NearbyUsersService: initialize 함수 시작');

    // 로그인 상태 확인
    const isLoggedIn = useAuthStore.getState().isLoggedIn;
    if (!isLoggedIn) {
      console.log('[Initialize] 사용자가 로그인하지 않았습니다. BLE 초기화를 건너뜁니다.');
      return false;
    }

    if (AppState.currentState !== 'active') {
      console.log('[Initialize] 앱이 포그라운드 상태가 아닙니다. BLE 초기화를 건너뜁니다.');
      return false;
    }

    const hasPermissions = await this.requestBluetoothPermissions();
    if (!hasPermissions) {
      console.log('[Initialize] 블루투스 권한이 없습니다.');
      return false;
    }

    const isBluetoothOn = await this.checkBluetoothState();
    if (!isBluetoothOn) {
      console.log('[Initialize] 블루투스가 꺼져 있습니다.');
      return false;
    }

    try {
      const now = new Date();
      console.log('[Initialize] 토큰 유효성 검사 전:');
      console.log('[Initialize]   - this.deviceId:', this.deviceId);
      console.log('[Initialize]   - this.tokenExpiry:', this.tokenExpiry);
      console.log('[Initialize]   - now:', now);
      if (this.tokenExpiry) {
        console.log('[Initialize]   - 만료됨? (this.tokenExpiry < now):', this.tokenExpiry < now);
      }

      if (!this.deviceId || (this.tokenExpiry && this.tokenExpiry < now)) {
        console.log('[Initialize] BLE 토큰이 없거나 만료됨. 새 토큰 요청...');
        const bleTokenResponse = await this.generateBleToken();
        if (!this.deviceId) {
          console.error(
            '[Initialize] generateBleToken 호출 후에도 유효한 BLE 토큰을 얻지 못했습니다.'
          );
          return false;
        }
      }

      console.log('[Initialize] 현재 사용할 BLE 토큰:', this.deviceId);
      // 광고 시작은 별도 API나 네이티브 구현이 필요하며, BLE-PLX는 기본적으로 지원하지 않음
      // await this.startAdvertising();
      return true;
    } catch (error) {
      console.error('[Initialize] BLE 초기화 실패:', error);
      return false;
    }
  }

  // 광고 시작 (자신을 다른 기기에 알림)
  async startAdvertising() {
    console.log('BLE-PLX에서는 광고를 직접 지원하지 않습니다. 네이티브 모듈을 사용하세요.');
    return false;
  }

  // 광고 중지
  async stopAdvertising() {
    // BLE-PLX는 광고 중지 기능을 기본적으로 제공하지 않음
    console.log('BLE-PLX에서는 광고 중지를 직접 지원하지 않습니다. 네이티브 모듈을 사용하세요.');
    return false;
  }

  // BLE 스캔 시작 - BLE-PLX 버전
  async startScan(onUserFound, onScanComplete) {
    if (AppState.currentState !== 'active') {
      console.log('앱이 포그라운드 상태가 아닙니다. 스캔을 시작할 수 없습니다.');
      if (onScanComplete) onScanComplete([]);
      return;
    }

    if (this.isScanning) {
      console.log('이미 스캔 중입니다.');
      return;
    }

    try {
      // 블루투스 상태 확인
      const state = await this.manager.state();
      console.log('블루투스 상태:', state);

      if (state !== 'PoweredOn') {
        console.log('블루투스가 켜져있지 않습니다. 현재 상태:', state);
        if (onScanComplete) onScanComplete([]);
        return;
      }

      // 권한 확인
      const hasPermissions = await this.requestBluetoothPermissions();
      console.log('블루투스 권한 상태:', hasPermissions);

      if (!hasPermissions) {
        console.log('블루투스 권한이 없습니다.');
        if (onScanComplete) onScanComplete([]);
        return;
      }

      // 이전 스캔 결과 초기화
      this.nearbyUsers = [];
      this.isScanning = true;

      console.log('\n=== BLE 스캔 시작 ===');
      console.log('현재 디바이스 ID:', this.deviceId);
      console.log('스캔 시간:', this.SCAN_DURATION / 1000, '초');
      console.log('서비스 UUID:', this.serviceUUID);

      // 스캔 시작 - BLE-PLX 방식
      this.scanSubscription = this.manager.startDeviceScan(
        [this.serviceUUID], // 서비스 UUID로 필터링
        // null, // null을 사용하여 모든 기기 스캔
        { allowDuplicates: false }, // 중복 발견 방지
        (error, device) => {
          if (error) {
            console.error('스캔 중 오류:', error);
            return;
          }

          if (device) {
            console.log('기기 발견:', {
              id: device.id,
              name: device.name || '이름 없음',
              rssi: device.rssi,
            });

            this.handleDiscoveredDevice(device, onUserFound);
          }
        }
      );

      // 지정된 시간 후 스캔 중지
      setTimeout(() => {
        this.stopScan();
        console.log('\n=== 스캔 완료 ===');
        console.log('총 발견된 기기 수:', this.nearbyUsers.length);
        if (onScanComplete) onScanComplete(this.nearbyUsers);
      }, this.SCAN_DURATION);
    } catch (error) {
      console.error('스캔 시작 실패. 에러:', error);
      this.isScanning = false;
      if (onScanComplete) onScanComplete([]);
    }
  }

  // 스캔 중지 - BLE-PLX 버전
  stopScan() {
    if (!this.isScanning) return;

    try {
      this.manager.stopDeviceScan();
      this.isScanning = false;

      if (this.scanSubscription) {
        this.scanSubscription = null;
      }

      console.log('스캔 중지 완료');
    } catch (error) {
      console.error('스캔 중지 실패:', error);
    }
  }

  // 발견된 기기 처리 - BLE-PLX 버전
  async handleDiscoveredDevice(device, onUserFound) {
    try {
      console.log('기기 발견:', {
        id: device.id,
        name: device.name || '이름 없음',
        rssi: device.rssi,
      });

      // 이미 처리한 기기인지 확인
      const existingIndex = this.nearbyUsers.findIndex(user => user.uuid === device.id);
      if (existingIndex !== -1) {
        // 이미 발견한 기기면 RSSI 업데이트
        this.nearbyUsers[existingIndex].rssi = device.rssi;
        this.nearbyUsers[existingIndex].distance = this.calculateDistance(device.rssi);
        return;
      }

      // 서비스가 맞는지 확인
      // 광고 데이터 추출 - BLE-PLX에서는 직접 접근할 수 없어 연결 필요할 수 있음
      let deviceUUID = device.id;
      let deviceName = device.name || '알 수 없음';

      // BLE-PLX에서는 제조업체 데이터를 직접 접근하는 방법이 제한적이므로,
      // 필요하다면 연결 후 특성 읽기가 필요할 수 있음

      // 거리 계산
      const distance = this.calculateDistance(device.rssi);

      // 근처 사용자 목록에 추가
      const user = {
        id: device.id,
        name: deviceName,
        uuid: deviceUUID, // 앱 UUID
        rssi: device.rssi,
        distance: distance, // 미터 단위의 대략적인 거리
        timestamp: new Date().getTime(),
        deviceId: device.id, // GiveAwayScreen과 호환되도록 추가
      };

      this.nearbyUsers.push(user);

      // 콜백 호출
      if (onUserFound) onUserFound(user);
    } catch (error) {
      console.error('기기 처리 중 오류:', error);
    }
  }

  // RSSI를 거리(미터)로 변환
  calculateDistance(rssi) {
    // 간단한 거리 계산식 (대략적인 추정)
    // txPower는 1미터 거리에서의 RSSI 값 (보통 -59 ~ -65 dBm)
    const txPower = -59;
    if (rssi === 0) {
      return -1; // 계산 불가
    }

    const ratio = (rssi * 1.0) / txPower;
    if (ratio < 1.0) {
      return Math.pow(ratio, 10);
    } else {
      return 0.89976 * Math.pow(ratio, 7.7095) + 0.111;
    }
  }

  // 모든 근처 사용자 가져오기
  getAllNearbyUsers() {
    return [...this.nearbyUsers];
  }

  // 100m 이내의 사용자만 필터링
  getNearbyUsersWithin100m() {
    return this.nearbyUsers.filter(user => user.distance <= 100);
  }

  // 리소스 정리
  cleanup() {
    // 스캔 중지
    if (this.isScanning) {
      this.stopScan();
    }

    // 앱 상태 리스너 제거
    if (this.appStateListener) {
      this.appStateListener.remove();
      this.appStateListener = null;
    }

    // 광고 중지 (네이티브 모듈 사용시)
    if (this.isAdvertising) {
      this.stopAdvertising();
    }

    // 모든 구독 취소
    if (this.scanSubscription) {
      this.scanSubscription = null;
    }

    // BLE 매니저 파괴 (선택적)
    this.manager.destroy();
  }
}

export default new NearbyUsersService();
