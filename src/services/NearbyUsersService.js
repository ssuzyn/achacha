import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { PermissionsAndroid, Platform, Alert, AppState } from 'react-native';
import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules } from 'react-native';

// BLE 서비스 및 특성 UUID
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

class NearbyUsersService {
  constructor() {
    this.deviceId = this.generateShortUuid();
    this.nearbyUsers = [];
    this.isScanning = false;
    this.scanListener = null;
    this.discoveryListener = null;
    this.appStateListener = null;
    this.isAdvertising = false;

    // BleManager 초기화
    BleManager.start({ showAlert: false });

    // BLE 이벤트 리스너 설정
    const BleManagerModule = NativeModules.BleManager;
    this.bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

    // 앱 상태 변경 이벤트 리스너 설정
    this.setupAppStateListener();
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
      // 필요한 경우 광고 재시작
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
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ];

          const results = await PermissionsAndroid.requestMultiple(permissions);

          return (
            results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === 'granted' &&
            results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === 'granted' &&
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

    // 광고 시작 (자신의 UUID 알리기)
    await this.startAdvertising();

    return true;
  }

  // 광고 시작 (자신을 다른 기기에 알림)
  async startAdvertising() {
    // 앱이 포그라운드인지 확인
    if (AppState.currentState !== 'active') {
      return;
    }

    try {
      // 각 플랫폼에 맞는 광고 메서드 호출
      if (Platform.OS === 'ios') {
        // iOS에서는 Peripheral 모드 시작
        await this.startIosPeripheralMode();
      } else {
        // Android에서는 advertiseCallback 사용
        await this.startAndroidAdvertising();
      }

      this.isAdvertising = true;
      console.log('광고 시작 완료. 기기 ID:', this.deviceId);
    } catch (error) {
      console.error('광고 시작 실패:', error);
    }
  }

  // iOS에서 Peripheral 모드 시작
  async startIosPeripheralMode() {
    // react-native-ble-manager는 iOS에서 Peripheral 모드를 직접 지원하지 않습니다.
    // 다른 라이브러리를 사용해야 할 수 있습니다.
    console.log('iOS Peripheral 모드는 별도 라이브러리가 필요할 수 있습니다.');
  }

  // Android에서 Advertising 시작
  async startAndroidAdvertising() {
    // react-native-ble-manager는 Android에서 Advertising을 직접 지원하지 않습니다.
    // 별도의 네이티브 코드 구현이 필요할 수 있습니다.
    console.log('Android Advertising은 별도 구현이 필요할 수 있습니다.');
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
    // 별도 구현 필요
  }

  // BLE 스캔 시작
  async startScan(onUserFound, onScanComplete) {
    // 앱이 포그라운드인지 확인
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
      // 이전 스캔 결과 초기화
      this.nearbyUsers = [];

      // 스캔 상태 변경
      this.isScanning = true;

      // 이벤트 리스너 설정
      this.scanListener = this.bleManagerEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        peripheral => {
          // 100m 내의 기기만 필터링 (대략적인 RSSI 값: -80 ~ -90 dBm)
          if (peripheral.rssi && peripheral.rssi >= -90) {
            this.handleDiscoveredDevice(peripheral, onUserFound);
          }
        }
      );

      // 스캔 완료 이벤트 처리
      this.stopScanListener = this.bleManagerEmitter.addListener('BleManagerStopScan', () => {
        this.isScanning = false;
        if (this.scanListener) {
          this.scanListener.remove();
          this.scanListener = null;
        }
        if (this.stopScanListener) {
          this.stopScanListener.remove();
          this.stopScanListener = null;
        }
        console.log('스캔 완료. 발견된 사용자:', this.nearbyUsers.length);
        if (onScanComplete) onScanComplete(this.nearbyUsers);
      });

      // 스캔 시작
      await BleManager.scan([SERVICE_UUID], 5, true);
    } catch (error) {
      this.isScanning = false;
      console.error('스캔 시작 실패:', error);
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
      // 이미 처리한 기기인지 확인
      const existingIndex = this.nearbyUsers.findIndex(user => user.id === peripheral.id);
      if (existingIndex !== -1) {
        // 이미 발견한 기기면 RSSI 업데이트
        this.nearbyUsers[existingIndex].rssi = peripheral.rssi;
        this.nearbyUsers[existingIndex].distance = this.calculateDistance(peripheral.rssi);
        return;
      }

      // 연결 시도
      await BleManager.connect(peripheral.id);

      // 같은 앱을 사용하는 사용자인지 확인 (서비스 UUID로 필터링)
      const peripheralInfo = await BleManager.retrieveServices(peripheral.id);

      if (
        peripheralInfo.services &&
        peripheralInfo.services.some(service => service.uuid === SERVICE_UUID)
      ) {
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
      }

      // 연결 해제
      await BleManager.disconnect(peripheral.id);
    } catch (error) {
      console.error('기기 정보 조회 실패:', error);

      // 연결되어 있는 경우 연결 해제 시도
      try {
        await BleManager.disconnect(peripheral.id);
      } catch (disconnectError) {
        // 무시
      }
    }
  }

  // UUID 디코딩 (바이트 배열 -> 문자열)
  decodeUUID(data) {
    try {
      // 데이터가 바이트 배열이면 문자열로 변환
      if (Array.isArray(data)) {
        return String.fromCharCode.apply(null, data);
      }
      return String(data);
    } catch (error) {
      console.error('UUID 디코딩 실패:', error);
      return 'unknown';
    }
  }

  // 문자열을 바이트 배열로 변환
  encodeUUID(uuid) {
    try {
      // 문자열을 바이트 배열로 변환
      const bytes = [];
      for (let i = 0; i < uuid.length; i++) {
        bytes.push(uuid.charCodeAt(i));
      }
      return bytes;
    } catch (error) {
      console.error('UUID 인코딩 실패:', error);
      return [];
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

  // 가장 가까운 사용자 가져오기
  getNearestUser() {
    if (this.nearbyUsers.length === 0) return null;

    return this.nearbyUsers.reduce((nearest, user) => {
      return user.distance < nearest.distance ? user : nearest;
    }, this.nearbyUsers[0]);
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
