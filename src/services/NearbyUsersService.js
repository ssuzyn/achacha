import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { PermissionsAndroid, Platform, Alert, AppState } from 'react-native';
import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../store/authStore';
import apiClient from '../api/apiClient';

// BLE 서비스 및 특성 UUID
const SERVICE_UUID = '1bf0cbce-7af3-4b59-93f2-0c4c6d170164'; // 하이픈 포함된 형식
const SERVICE_UUID_NO_HYPHENS = SERVICE_UUID.replace(/-/g, ''); // 하이픈 제거된 형식
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8'; // 하이픈 포함된 형식

class NearbyUsersService {
  constructor() {
    this.deviceId = null; // 초기에는 null로 설정
    this.tokenExpiry = null; // 토큰 만료 시간 저장용
    this.nearbyUsers = [];
    this.isScanning = false;
    this.scanListener = null;
    this.discoveryListener = null;
    this.appStateListener = null;
    this.isAdvertising = false;
    this.serviceUUID = SERVICE_UUID; // 하이픈 포함된 UUID
    this.serviceUUIDNoHyphens = SERVICE_UUID_NO_HYPHENS; // 광고용 (하이픈 제거)
    this.SCAN_DURATION = 5; // 스캔 시간 5초로 설정

    // BleManager 초기화
    BleManager.start({ showAlert: false });

    // BLE 이벤트 리스너 설정
    const BleManagerModule = NativeModules.BleManager;
    this.bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

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

      // 광고 중지
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
      // 토큰 유효성 검사 및 새 토큰 요청
      await this.generateBleToken();

      // 광고 시작
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
      const state = await BleManager.checkState();

      if (state === 'on') {
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
        // Android에서는 블루투스 활성화 요청
        else {
          const enable = await BleManager.enableBluetooth();
          return true;
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

  // 토큰 저장하기
  async saveToken(token, days = 7) {
    try {
      // 토큰 저장
      await AsyncStorage.setItem('bleToken', token);

      // 만료일 설정 (기본 7일)
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + days);
      await AsyncStorage.setItem('bleTokenExpiry', expiry.toISOString());

      this.deviceId = token;
      this.tokenExpiry = expiry;

      console.log('BLE 토큰 저장됨:', token, '만료일:', expiry);
    } catch (error) {
      console.error('BLE 토큰 저장 실패:', error);
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
        // 새 토큰을 authStore에 저장
        await useAuthStore.getState().updateTokens(null, null, tokenValue);
        this.deviceId = tokenValue;
      } else {
        console.error('서버 응답에 토큰이 없습니다:', response.data);
      }

      return response.data;
    } catch (error) {
      console.error('BLE 토큰 생성 중 오류:', error);
      throw error;
    }
  }

  // 서비스 UUID 가져오기
  async getServiceUUID() {
    // 항상 고정된 SERVICE_UUID 사용
    return SERVICE_UUID;
  }

  // 블루투스 초기화 및 권한 설정
  async initialize() {
    // 앱이 포그라운드인지 확인
    if (AppState.currentState !== 'active') {
      console.log('앱이 포그라운드 상태가 아닙니다. BLE 초기화를 건너뜁니다.');
      return false;
    }

    const hasPermissions = await this.requestBluetoothPermissions();
    if (!hasPermissions) {
      console.log('블루투스 권한이 없습니다.');
      return false;
    }

    const isBluetoothOn = await this.checkBluetoothState();
    if (!isBluetoothOn) {
      console.log('블루투스가 꺼져 있습니다.');
      return false;
    }

    try {
      // 토큰 유효성 검사 및 필요 시 새 토큰 요청
      const now = new Date();
      if (!this.deviceId || (this.tokenExpiry && this.tokenExpiry < now)) {
        console.log('BLE 토큰이 없거나 만료됨. 새 토큰 요청...');
        const bleTokenResponse = await this.generateBleToken();

        const tokenValue = bleTokenResponse?.bleToken || bleTokenResponse?.bleTokenValue;

        if (!tokenValue) {
          console.error('BLE 토큰 응답이 올바르지 않습니다:', bleTokenResponse);
          return false;
        }
      }

      console.log('현재 BLE 토큰:', this.deviceId);

      // 광고 시작 (자신의 UUID 알리기)
      await this.startAdvertising();

      // 앱 상태 변경 리스너 설정 (광고 상태 유지를 위해)
      if (this.appStateListener) {
        this.appStateListener.remove();
      }
      this.appStateListener = AppState.addEventListener('change', nextAppState => {
        if (nextAppState === 'active') {
          // 포그라운드로 돌아올 때 광고 재시작
          this.startAdvertising();
        } else if (nextAppState === 'background') {
          // 백그라운드로 갈 때 광고 중지
          this.stopAdvertising();
        }
      });

      return true;
    } catch (error) {
      console.error('BLE 초기화 실패:', error);
      return false;
    }
  }

  // 광고 시작 (자신을 다른 기기에 알림)
  async startAdvertising() {
    // 앱이 포그라운드인지 확인
    if (AppState.currentState !== 'active') {
      return;
    }

    try {
      if (this.isAdvertising) {
        console.log('이미 광고 중입니다.');
        return;
      }

      console.log('\n=== BLE 광고 시작 - 상세 디버그 ===');
      console.log('1. 광고할 디바이스 ID:', this.deviceId);

      if (!this.deviceId) {
        console.error('BLE 토큰이 없습니다. 먼저 로그인이 필요합니다.');
        return false;
      }

      if (NativeModules.BleModule) {
        // 토큰 크기 검사 (13바이트 제한)
        const tokenBytes = new TextEncoder().encode(this.deviceId);

        // UUID 문자열을 실제 바이트로 변환
        const uuidBytes = new Uint8Array(16);
        const uuidNoHyphens = this.serviceUUID.replace(/-/g, '');
        for (let i = 0; i < 16; i++) {
          uuidBytes[i] = parseInt(uuidNoHyphens.substr(i * 2, 2), 16);
        }

        console.log('\n2. 바이트 크기 분석:');
        console.log('- BLE 토큰 바이트 크기:', tokenBytes.length);
        console.log('- 토큰 원본:', this.deviceId);

        console.log('\n3. UUID 분석:');
        console.log('- Service UUID:', this.serviceUUID);
        console.log('- UUID 바이트 크기:', uuidBytes.length);

        // 최종 광고 데이터 생성 (UUID + Token 바이트 배열)
        const finalBytes = new Uint8Array(uuidBytes.length + tokenBytes.length);
        finalBytes.set(uuidBytes, 0); // UUID 바이트를 앞에 배치
        finalBytes.set(tokenBytes, uuidBytes.length); // 토큰 바이트를 뒤에 배치

        console.log('\n4. 최종 광고 데이터:');
        console.log('- 전체 바이트 크기:', finalBytes.length);

        if (tokenBytes.length > 13) {
          console.error('\n❌ BLE 토큰이 너무 큽니다:', tokenBytes.length, '바이트');
          return false;
        }

        try {
          console.log('\n5. 네이티브 모듈로 전송되는 최종 데이터:');
          console.log('- 바이트 배열:', Array.from(finalBytes));
          console.log('- 최종 크기:', finalBytes.length, '바이트');

          // Base64로 인코딩하여 optimized 메서드로 전송
          const base64Data = btoa(String.fromCharCode.apply(null, finalBytes));
          await NativeModules.BleModule.startAdvertisingOptimized(base64Data);
          console.log('\n✅ 광고 시작됨');
          this.isAdvertising = true;
          return true;
        } catch (error) {
          console.error('\n❌ 광고 시작 실패:', error);
          this.isAdvertising = false;
          return false;
        }
      } else {
        console.error('BleModule을 찾을 수 없습니다.');
        return false;
      }
    } catch (error) {
      console.error('광고 시작 실패:', error);
      this.isAdvertising = false;
      return false;
    }
  }

  // 광고 중지
  async stopAdvertising() {
    if (!this.isAdvertising) return;

    try {
      // 각 플랫폼에 맞는 광고 중지 메서드 호출
      if (Platform.OS === 'ios') {
        // iOS에서는 Peripheral 모드 중지
        await this.stopIosPeripheralMode();
      } else {
        // Android에서는 advertiseCallback 중지
        await this.stopAndroidAdvertising();
      }

      this.isAdvertising = false;
      console.log('광고 중지 완료');
    } catch (error) {
      console.error('광고 중지 실패:', error);
    }
  }

  // iOS에서 Peripheral 모드 중지
  async stopIosPeripheralMode() {
    // 별도 구현 필요
  }

  // Android에서 Advertising 중지
  async stopAndroidAdvertising() {
    try {
      const BleModule = NativeModules.BleModule;
      await BleModule.stopAdvertising();
      console.log('Android Advertising 중지됨');
    } catch (error) {
      console.error('Android Advertising 중지 실패:', error);
      throw error;
    }
  }

  // BLE 스캔 시작
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
      // 블루투스 상태 한번 더 체크
      const state = await BleManager.checkState();
      console.log('블루투스 상태:', state);

      if (state !== 'on') {
        console.log('블루투스가 꺼져있습니다.');
        if (onScanComplete) onScanComplete([]);
        return;
      }

      // 권한 다시 체크
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
      console.log('스캔 시간:', this.SCAN_DURATION, '초');

      // Full UUID와 Short UUID 모두 출력
      console.log('원본 서비스 UUID:', this.serviceUUID);

      // Short UUID 생성 (16비트 UUID 포맷)
      const uuidNoHyphens = this.serviceUUID.replace(/-/g, '');
      const shortUuidPrefix = uuidNoHyphens.substring(0, 4); // 앞 4자리(2바이트)만 사용
      const shortUUID = `0000${shortUuidPrefix}-0000-1000-8000-00805f9b34fb`;
      console.log('변환된 Short UUID:', shortUUID);
      console.log(
        'Short UUID 형식 확인:',
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(shortUUID)
      );

      // Short UUID로 스캔 (16비트 UUID)
      console.log('Short UUID로 스캔 시작');
      await BleManager.scan([shortUUID], this.SCAN_DURATION, true);

      // 디버깅을 위한 추가 로그
      this.scanListener = this.bleManagerEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        peripheral => {
          console.log('\n=== 발견된 기기 상세 정보 ===');
          console.log('기기 ID:', peripheral.id);
          console.log('기기 이름:', peripheral.name || '이름 없음');
          console.log('RSSI:', peripheral.rssi);
          console.log('광고 데이터:', peripheral.advertising || '없음');
          if (peripheral.advertising) {
            console.log('서비스 UUID들:', peripheral.advertising.serviceUUIDs || '없음');
            console.log('서비스 데이터:', peripheral.advertising.serviceData || '없음');
            console.log('제조사 데이터:', peripheral.advertising.manufacturerData || '없음');
          }
          console.log('전체 기기 정보:', JSON.stringify(peripheral, null, 2));
          // 모든 기기 처리
          this.handleDiscoveredDevice(peripheral, onUserFound);
        }
      );

      // 스캔 완료 이벤트 처리
      this.stopScanListener = this.bleManagerEmitter.addListener('BleManagerStopScan', () => {
        console.log('\n=== 스캔 완료 ===');
        console.log('총 발견된 기기 수:', this.nearbyUsers.length);

        this.isScanning = false;
        if (this.scanListener) {
          this.scanListener.remove();
          this.scanListener = null;
        }
        if (this.stopScanListener) {
          this.stopScanListener.remove();
          this.stopScanListener = null;
        }

        if (onScanComplete) onScanComplete(this.nearbyUsers);
      });
    } catch (error) {
      console.error('스캔 시작 실패. 에러:', error);
      this.isScanning = false;
      if (onScanComplete) onScanComplete([]);
    }
  }

  // 스캔 중지
  async stopScan() {
    if (!this.isScanning) return;

    try {
      await BleManager.stopScan();
      this.isScanning = false;

      // 이벤트 리스너 제거
      if (this.scanListener) {
        this.scanListener.remove();
        this.scanListener = null;
      }
      if (this.stopScanListener) {
        this.stopScanListener.remove();
        this.stopScanListener = null;
      }

      console.log('스캔 중지 완료');
    } catch (error) {
      console.error('스캔 중지 실패:', error);
    }
  }

  // 발견된 기기 처리
  async handleDiscoveredDevice(peripheral, onUserFound) {
    try {
      console.log('기기 발견:', {
        id: peripheral.id,
        name: peripheral.name || '이름 없음',
        rssi: peripheral.rssi,
      });

      // 이미 처리한 기기인지 확인
      const existingIndex = this.nearbyUsers.findIndex(user => user.id === peripheral.id);
      if (existingIndex !== -1) {
        // 이미 발견한 기기면 RSSI 업데이트
        this.nearbyUsers[existingIndex].rssi = peripheral.rssi;
        this.nearbyUsers[existingIndex].distance = this.calculateDistance(peripheral.rssi);
        return;
      }

      console.log('새 기기에 연결 시도:', peripheral.id);

      // 연결 시도
      await BleManager.connect(peripheral.id);
      console.log('기기에 연결됨, 서비스 조회 중:', peripheral.id);

      // 같은 앱을 사용하는 사용자인지 확인 (서비스 UUID로 필터링)
      const peripheralInfo = await BleManager.retrieveServices(peripheral.id);
      console.log('기기 서비스 목록:', peripheralInfo.services?.map(s => s.uuid) || '서비스 없음');

      if (
        peripheralInfo.services &&
        peripheralInfo.services.some(
          service => service.uuid.toLowerCase() === SERVICE_UUID.toLowerCase()
        )
      ) {
        console.log('일치하는 SERVICE_UUID 발견:', SERVICE_UUID);

        // 앱 UUID 읽기 시도
        try {
          const serviceUUID = peripheralInfo.services.find(
            service => service.uuid === SERVICE_UUID
          ).uuid;
          const characteristic = await BleManager.read(
            peripheral.id,
            serviceUUID,
            CHARACTERISTIC_UUID
          );

          // 읽은 데이터 처리 (앱 UUID)
          const deviceUUID = this.decodeUUID(characteristic);

          // 거리 계산
          const distance = this.calculateDistance(peripheral.rssi);

          // 근처 사용자 목록에 추가
          const user = {
            id: peripheral.id,
            name: peripheral.name || '알 수 없음',
            deviceUUID: deviceUUID, // 앱 UUID
            rssi: peripheral.rssi,
            distance: distance, // 미터 단위의 대략적인 거리
            timestamp: new Date().getTime(),
          };

          this.nearbyUsers.push(user);

          // 콜백 호출
          if (onUserFound) onUserFound(user);
        } catch (error) {
          console.error('UUID 읽기 실패:', error);
        }
      } else {
        console.log('SERVICE_UUID 불일치. 찾는 UUID:', SERVICE_UUID);
      }

      // 연결 해제
      console.log('기기 연결 해제:', peripheral.id);
      await BleManager.disconnect(peripheral.id);
    } catch (error) {
      console.error('기기 정보 조회 실패:', error);

      // 연결되어 있는 경우 연결 해제 시도
      try {
        console.log('오류 후 연결 해제 시도:', peripheral.id);
        await BleManager.disconnect(peripheral.id);
      } catch (disconnectError) {
        // 무시
      }
    }
  }

  // UUID를 UTF-8로 인코딩
  encodeUUID(uuid) {
    try {
      const encoder = new TextEncoder();
      return Array.from(encoder.encode(uuid));
    } catch (error) {
      console.error('UUID 인코딩 실패:', error);
      return [];
    }
  }

  // UTF-8 데이터를 UUID로 디코딩
  decodeUUID(data) {
    try {
      if (Array.isArray(data)) {
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(new Uint8Array(data));
      }
      return String(data);
    } catch (error) {
      console.error('UUID 디코딩 실패:', error);
      return 'unknown';
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
    // 이벤트 리스너 제거
    if (this.scanListener) {
      this.scanListener.remove();
      this.scanListener = null;
    }
    if (this.stopScanListener) {
      this.stopScanListener.remove();
      this.stopScanListener = null;
    }
    if (this.appStateListener) {
      this.appStateListener.remove();
      this.appStateListener = null;
    }

    // 스캔 중지
    if (this.isScanning) {
      this.stopScan();
    }

    // 광고 중지
    if (this.isAdvertising) {
      this.stopAdvertising();
    }
  }
}

export default new NearbyUsersService();
