import { Platform } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NearbyUsersService {
  constructor() {
    this.initialized = false;
    this.locationSubscription = null;
    this.userId = null;
    this.serverUrl = 'YOUR_API_SERVER_URL'; // 백엔드 서버 URL
    this.searchRadius = 100; // 기본 검색 반경을 100m로 설정
  }

  // 초기화 및 사용자 ID 설정
  async init(userId) {
    if (this.initialized) return;
    
    this.userId = userId;
    const permissionResult = await this.requestLocationPermissions();
    
    if (permissionResult) {
      this.initialized = true;
      console.log('NearbyUsersService 초기화 완료 (반경: 100m)');
    }
    
    return this.initialized;
  }

  // 위치 권한 요청
  async requestLocationPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('위치 권한이 거부되었습니다');
        return false;
      }
      
      if (Platform.OS === 'android') {
        const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus.status !== 'granted') {
          console.log('백그라운드 위치 권한이 거부되었습니다');
          // 포그라운드 권한만으로도 작동은 가능하므로 true 반환
        }
      }
      
      return true;
    } catch (error) {
      console.error('위치 권한 요청 중 오류:', error);
      return false;
    }
  }

  // 내 위치 공유 시작
  async startSharingLocation() {
    if (!this.initialized || this.locationSubscription) return;

    try {
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5, // 5미터마다 업데이트 (더 정확한 위치 추적)
          timeInterval: 5000,  // 5초마다 업데이트 (더 빈번한 업데이트)
        },
        async (location) => {
          await this.updateMyLocation(location.coords);
        }
      );
      
      console.log('위치 공유 시작됨');
      return true;
    } catch (error) {
      console.error('위치 공유 시작 중 오류:', error);
      return false;
    }
  }

  // 내 위치 업데이트
  async updateMyLocation(coords) {
    if (!this.userId) return;
    
    try {
      const locationData = {
        userId: this.userId,
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp: new Date().toISOString(),
        appStatus: 'active' // 앱 상태 
      };
      
      // 서버로 위치 정보 전송
      const response = await fetch(`${this.serverUrl}/api/user-locations/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });
      
      if (!response.ok) {
        throw new Error('위치 업데이트 실패');
      }
      
      // 로컬 스토리지에도 저장
      await AsyncStorage.setItem('lastKnownLocation', JSON.stringify(locationData));
      
      console.log('위치 업데이트 완료:', coords);
    } catch (error) {
      console.error('위치 업데이트 중 오류:', error);
    }
  }

  // 위치 공유 중지
  stopSharingLocation() {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
      console.log('위치 공유 중지됨');
    }
  }

  // 100m 반경 내 사용자 검색 - 명확히 100m로 고정
  async findNearbyUsers() {
    if (!this.initialized || !this.userId) {
      console.log('서비스가 초기화되지 않았거나 사용자 ID가 설정되지 않았습니다');
      return [];
    }
    
    try {
      // 현재 위치 가져오기
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      // 서버에 100m 반경 내 사용자 요청
      const response = await fetch(`${this.serverUrl}/api/user-locations/nearby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          radius: 100, // 항상 100m로 고정
          activeOnly: true // 현재 활성 상태인 사용자만 (옵션)
        }),
      });
      
      if (!response.ok) {
        throw new Error('주변 사용자 검색 실패');
      }
      
      const nearbyUsers = await response.json();
      console.log(`100m 반경 내 ${nearbyUsers.length}명의 사용자를 찾았습니다`);
      
      return nearbyUsers;
    } catch (error) {
      console.error('주변 사용자 검색 중 오류:', error);
      return [];
    }
  }

  // 정리
  cleanup() {
    this.stopSharingLocation();
    this.initialized = false;
  }
}

export default NearbyUsersService;