import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { PermissionsAndroid, Platform, Alert, AppState, NativeModules } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../store/authStore';
import apiClient from '../api/apiClient';

// BLE 서비스 및 특성 UUID
const SERVICE_UUID = '1bf0cbce-7af3-4b59-93f2-0c4c6d170164'; // 하이픈 포함된 형식
const SERVICE_UUID_NO_HYPHENS = SERVICE_UUID.replace(/-/g, ''); // 하이픈 제거된 형식

// BLE 광고 권한 요청 함수 (Android 12+)
async function requestBleAdvertisePermission() {
  if (Platform.OS === 'android' && Platform.Version >= 31) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      {
        title: 'BLE 광고 권한 요청',
        message: '주변 기기와 통신하려면 BLE 광고 권한이 필요합니다.',
        buttonNeutral: '나중에',
        buttonNegative: '거부',
        buttonPositive: '허용',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

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
    // 앱이 포그라운드인지 확인
    if (AppState.currentState !== 'active') {
      return false;
    }

    // Android 12+ BLE 광고 권한 체크
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      const hasAdvertisePermission = await requestBleAdvertisePermission();
      if (!hasAdvertisePermission) {
        console.error('BLE 광고 권한이 없습니다. 광고를 시작할 수 없습니다.');
        return false;
      }
    }

    try {
      if (this.isAdvertising) {
        console.log('이미 광고 중입니다.');
        return true;
      }

      // 광고 시작 전 서비스 UUID, 토큰 로그
      console.log('[BLE 광고] 서비스 UUID:', this.serviceUUID);
      console.log('[BLE 광고] 광고할 디바이스 ID(토큰):', this.deviceId);

      if (!this.deviceId) {
        console.error('BLE 토큰이 없습니다. 먼저 로그인이 필요합니다.');
        return false;
      }

      // 네이티브 모듈 사용 (BleModule)
      if (NativeModules.BleModule) {
        try {
          // UUID 문자열을 실제 바이트로 변환
          const uuidBytes = new TextEncoder().encode(this.serviceUUID);
          const tokenBytes = new TextEncoder().encode(this.deviceId);

          console.log('\n2. 광고 데이터 준비:');
          console.log('- Service UUID:', this.serviceUUID);
          console.log('- BLE 토큰:', this.deviceId);
          console.log('- 토큰 바이트 크기:', tokenBytes.length);

          // Base64로 인코딩하기 위한 준비
          // UUID와 토큰을 하나의 바이트 배열로 합치기
          // 주의: 이 방식은 BleModule.kt의 startAdvertisingOptimized 메서드와 호환되어야 함

          // UUID 문자열을 바이트 배열로 변환 (16바이트)
          const uuidNoHyphens = this.serviceUUID.replace(/-/g, '');
          const uuidArray = new Uint8Array(16);

          // UUID 문자열을 16진수로 파싱하여 바이트 배열에 저장
          for (let i = 0; i < 16; i++) {
            uuidArray[i] = parseInt(uuidNoHyphens.substr(i * 2, 2), 16);
          }

          // UUID와 토큰 바이트를 합친 배열 생성
          const combinedBytes = new Uint8Array(uuidArray.length + tokenBytes.length);
          combinedBytes.set(uuidArray, 0);
          combinedBytes.set(tokenBytes, uuidArray.length);

          // Base64로 인코딩
          const base64Data = btoa(String.fromCharCode.apply(null, combinedBytes));

          console.log('\n3. 최종 광고 데이터:');
          console.log('- 전체 바이트 크기:', combinedBytes.length);
          console.log('- Base64 인코딩 데이터 준비 완료');

          // 네이티브 모듈 호출
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

  // 서비스 데이터 디코딩
  decodeServiceData(data) {
    try {
      if (typeof data === 'string') {
        // Base64 문자열 처리
        if (data.startsWith('data:')) {
          // Base64 URI 스키마 처리
          const base64Data = data.split(',')[1];
          return atob(base64Data);
        } else {
          // 일반 Base64 문자열
          return atob(data);
        }
      } else if (data instanceof Uint8Array || Array.isArray(data)) {
        // 바이트 배열을 문자열로 변환
        return Array.from(data)
          .map(byte => String.fromCharCode(byte))
          .join('');
      }
      // 그 외 형식은 문자열로 반환
      return String(data);
    } catch (error) {
      console.error('서비스 데이터 디코딩 실패:', error);
      return String(data);
    }
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

      // 정확한 16비트 UUID 준비 (0x1BF0 형식 변환)
      const uuidNoHyphens = this.serviceUUID.replace(/-/g, '');
      const shortUuidHex = uuidNoHyphens.substring(0, 4).toLowerCase(); // 앞 4자리(2바이트)만 사용
      const scanUUID = `0000${shortUuidHex}-0000-1000-8000-00805f9b34fb`;

      console.log('원본 UUID:', this.serviceUUID);
      console.log('16비트 UUID Hex:', shortUuidHex);
      console.log('스캔에 사용할 16비트 UUID:', scanUUID);

      // 처음에는 필터링 없이 모든 기기 스캔 (디버그용)
      const useFiltering = true; // 필터링 사용 여부 (true로 설정)

      // 스캔 시작 - BLE-PLX 방식
      this.scanSubscription = this.manager.startDeviceScan(
        useFiltering ? [scanUUID] : null, // UUID 필터링 사용
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error('스캔 중 오류:', error);
            return;
          }

          if (device) {
            console.log(
              `\n발견된 기기: ${device.id} (${device.name || '이름 없음'}) RSSI: ${device.rssi}`
            );

            // 서비스 UUID 확인
            if (device.serviceUUIDs) {
              // 우리 서비스 UUID가 있는지 확인
              const hasMatchingService = device.serviceUUIDs.some(
                uuid => uuid.toLowerCase() === scanUUID.toLowerCase()
              );

              if (hasMatchingService) {
                // 이 기기와 연결하여 서비스 데이터 읽기 시도
                this.handleDiscoveredDevice(device, onUserFound);
              }
            } else {
              // 테스트: 필터링을 사용하지 않을 때는 모든 기기 로깅
              if (!useFiltering) {
                console.log('서비스 UUID 없음');
                // 필터링 없이 모든 기기 처리 (디버깅용)
                this.handleDiscoveredDevice(device, onUserFound);
              }
            }
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
      // 이미 처리한 기기인지 확인
      const existingIndex = this.nearbyUsers.findIndex(user => user.uuid === device.id);
      if (existingIndex !== -1) {
        // 이미 발견한 기기면 RSSI 업데이트
        this.nearbyUsers[existingIndex].rssi = device.rssi;
        this.nearbyUsers[existingIndex].distance = this.calculateDistance(device.rssi);
        return;
      }

      console.log('발견된 기기 상세 정보:', {
        id: device.id,
        name: device.name || '이름 없음',
        rssi: device.rssi,
      });

      // device에 있는 모든 속성 로깅
      console.log('기기 전체 속성:', Object.keys(device));

      // Short UUID 확인 (광고와 동일한 방식 사용)
      const uuidNoHyphens = this.serviceUUID.replace(/-/g, '');
      const shortUuidHex = uuidNoHyphens.substring(0, 4).toLowerCase();
      const expectedShortUUID = `0000${shortUuidHex}-0000-1000-8000-00805f9b34fb`.toLowerCase();

      // 기기가 해당 서비스 UUID를 광고하는지 확인
      const hasMatchingService =
        device.serviceUUIDs &&
        device.serviceUUIDs.some(uuid => uuid.toLowerCase() === expectedShortUUID);

      if (hasMatchingService) {
        console.log('일치하는 Short UUID 발견:', expectedShortUUID);
        console.log('전체 serviceUUIDs:', JSON.stringify(device.serviceUUIDs));

        let bleToken = null;

        // manufacturerData 확인 (일부 기기에서는 여기에 데이터가 있을 수 있음)
        if (device.manufacturerData) {
          console.log('제조업체 데이터:', device.manufacturerData);
        }

        // BLE-PLX에서 serviceData에 접근하는 방법
        if (device.serviceData) {
          console.log('수신된 Service Data 전체:', JSON.stringify(device.serviceData));

          // 모든 키 확인
          const serviceDataKeys = Object.keys(device.serviceData);
          console.log('Service Data 키 목록:', serviceDataKeys);

          // 모든 키에 대해 시도해보기
          for (const key of serviceDataKeys) {
            console.log(`키 "${key}"의 서비스 데이터:`, device.serviceData[key]);

            // 시도: 이 키의 데이터가 우리 토큰인지 확인
            try {
              const possibleToken = this.decodeServiceData(device.serviceData[key]);
              console.log(`키 "${key}"에서 디코딩된 가능한 토큰:`, possibleToken);

              // 유효한 토큰인지 확인 (예: 길이, 형식 등)
              if (possibleToken && possibleToken.length > 0) {
                bleToken = possibleToken;
                console.log('적합한 BLE 토큰 발견:', bleToken);
                break;
              }
            } catch (e) {
              console.log(`키 "${key}" 데이터 디코딩 실패:`, e.message);
            }
          }

          // expectedShortUUID로 시도했는데 실패했다면
          if (!bleToken && serviceDataKeys.length > 0) {
            // 첫 번째 키로 시도
            const firstKey = serviceDataKeys[0];
            try {
              bleToken = this.decodeServiceData(device.serviceData[firstKey]);
              console.log('첫 번째 키로 추출한 BLE 토큰:', bleToken);
            } catch (e) {
              console.log('첫 번째 키 디코딩 실패:', e.message);
            }
          }
        } else {
          console.log('Service Data가 없습니다.');
        }

        // 거리 계산
        const distance = this.calculateDistance(device.rssi);

        // 이모지 결정
        const emojiOptions = [
          require('../assets/images/emoji1.png'),
          require('../assets/images/emoji2.png'),
          require('../assets/images/emoji3.png'),
          require('../assets/images/emoji4.png'),
          require('../assets/images/emoji5.png'),
        ];
        const emoji = emojiOptions[Math.floor(Math.random() * emojiOptions.length)];

        // 사용자 이름 생성 (bleToken 또는 기본값)
        const userName = `사용자${this.nearbyUsers.length + 1}`;

        // 근처 사용자 목록에 추가
        const user = {
          id: device.id,
          name: userName,
          uuid: device.id,
          serviceUUID: expectedShortUUID,
          bleToken: bleToken,
          rssi: device.rssi,
          distance: distance,
          timestamp: new Date().getTime(),
          deviceId: device.id,
          emoji: emoji,
        };

        this.nearbyUsers.push(user);
        console.log(
          '사용자 추가됨:',
          user.name,
          '거리:',
          distance.toFixed(2),
          'm',
          '세부정보:',
          JSON.stringify(user)
        );

        // 콜백 호출
        if (onUserFound) onUserFound(user);
      } else {
        console.log('Short UUID 불일치. 다른 앱의 기기로 판단');
        if (device.serviceUUIDs) {
          console.log('기기의 Service UUIDs:', JSON.stringify(device.serviceUUIDs));
          console.log('기대했던 Short UUID:', expectedShortUUID);
        } else {
          console.log('기기에 Service UUIDs가 없습니다.');
        }
      }
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
