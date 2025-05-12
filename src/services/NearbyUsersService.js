import { Platform } from 'react-native';
import * as Location from 'expo-location';

class LocalScanNearbyUsersService {
  constructor() {
    this.initialized = false;
    this.userId = null;
    this.serverUrl = 'YOUR_BACKEND_API_URL'; // 결과 저장용 백엔드 API
    this.scanDuration = 5000; // 5초 스캔
    this.scanRadius = 100; // 100m 반경
  }

  // 초기화 및 사용자 ID 설정
  async init(userId) {
    if (this.initialized) return true;

    this.userId = userId;
    const permissionResult = await this.requestLocationPermissions();

    if (permissionResult) {
      this.initialized = true;
      console.log('LocalScanNearbyUsersService 초기화 완료');
    }

    return this.initialized;
  }

  // 위치 권한 요청 - 포그라운드만 필요
  async requestLocationPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('위치 권한이 거부되었습니다');
        return false;
      }

      return true;
    } catch (error) {
      console.error('위치 권한 요청 중 오류:', error);
      return false;
    }
  }

  // 근처 사용자 스캔 시작
  async startSharingLocation() {
    // 이 방식에서는 위치 공유가 필요하지 않음
    // 스캔할 때만 일시적으로 위치 사용
    console.log('위치 공유는 필요하지 않습니다 - 스캔할 때만 위치 사용');
    return true;
  }

  // 위치 공유 중지
  stopSharingLocation() {
    // 아무 작업도 필요하지 않음
  }

  // 주변 사용자 검색 - 로컬 스캔 후 백엔드로 결과 전송
  async findNearbyUsers() {
    if (!this.initialized || !this.userId) {
      console.log('서비스가 초기화되지 않았거나 사용자 ID가 설정되지 않았습니다');
      return [];
    }

    try {
      console.log(`${this.scanDuration / 1000}초 동안 주변 사용자 스캔 시작...`);

      // 현재 위치 가져오기
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // 로컬 스캔 시작 - 실제 앱에서는 BLE 등을 사용할 수 있음
      // 여기서는 목업 스캔을 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, this.scanDuration));

      // 스캔된 사용자 목록 (목업 데이터)
      const scannedUsers = this.generateMockScannedUsers();

      console.log(`스캔 완료: ${scannedUsers.length}명의 사용자 발견`);

      // 스캔 결과를 백엔드로 전송
      const scanResult = {
        userId: this.userId,
        scanTime: new Date().toISOString(),
        location: {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        },
        scannedUsers: scannedUsers,
      };

      // 결과 서버로 전송
      try {
        const response = await fetch(`${this.serverUrl}/api/user-scans/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scanResult),
        });

        if (!response.ok) {
          console.warn('스캔 결과 저장 실패:', response.status);
          // 실패해도 로컬 결과는 반환
        }
      } catch (uploadError) {
        console.error('스캔 결과 업로드 오류:', uploadError);
        // 네트워크 오류가 있어도 스캔 결과는 반환
      }

      // 스캔 결과 반환 (서버 응답을 기다리지 않고 즉시 반환)
      return scannedUsers.map(user => ({
        id: user.deviceId,
        name: user.deviceName || `사용자${Math.floor(Math.random() * 1000)}`,
        distance: user.distance,
        emoji: null,
      }));
    } catch (error) {
      console.error('주변 사용자 스캔 중 오류:', error);
      return [];
    }
  }

  // 목업 스캔 결과 생성 (실제 구현에서는 BLE 또는 다른 P2P 기술 사용)
  generateMockScannedUsers() {
    const userCount = Math.floor(Math.random() * 5) + 3; // 3-7명의 사용자
    const users = [];

    for (let i = 0; i < userCount; i++) {
      users.push({
        deviceId: `device-${Date.now()}-${i}`,
        deviceName: `User-${i + 1}`,
        distance: Math.floor(Math.random() * 90) + 10, // 10-100m
        rssi: -(Math.floor(Math.random() * 40) + 60), // -60 ~ -100 dBm (BLE 신호 강도)
        lastSeen: new Date().toISOString(),
      });
    }

    return users;
  }

  // 서비스 정리
  cleanup() {
    this.initialized = false;
    console.log('로컬 스캔 서비스 정리 완료');
  }
}

export default LocalScanNearbyUsersService;
