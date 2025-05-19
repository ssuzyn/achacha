import { Platform, Alert, Linking } from 'react-native';
import Geofencing from '@rn-bridge/react-native-geofencing';
import { geoNotificationService } from './geoNotificationService';

// 싱글톤 인스턴스를 저장할 변수
let instance = null;

class GeofencingService {
  constructor() {
    // 이미 인스턴스가 있으면 그 인스턴스를 반환
    if (instance) {
      return instance;
    }

    // 새 인스턴스 생성
    instance = this;
    this.initialized = false;
    this.initializing = false;
    this.notifiedBrandIdsThisSession = new Set();
    this.userGifticons = [];
    this.uniqueBrands = [];
  }

  // 기프티콘 목록 업데이트
  updateUserGifticons(gifticons) {
    if (gifticons && gifticons.gifticons && Array.isArray(gifticons.gifticons)) {
      this.userGifticons = gifticons.gifticons;
    } else {
      console.error('[GeofencingService] updateUserGifticons - 유효하지 않은 기프티콘 목록 구조.');
      this.userGifticons = [];
    }
  }

  // 지오펜싱 초기화
  async initGeofencing() {
    if (this.initializing || this.initialized) {
      return;
    }

    this.initializing = true;

    try {
      // 백그라운드 위치 권한 확인
      const hasPermission = await this.checkBackgroundLocationPermission();
      if (!hasPermission) {
        this.initializing = false;
        return;
      }

      // 위치 권한 요청
      await Geofencing.requestLocation({ allowAlways: true });

      // 지오펜스 진입 이벤트 리스너 설정
      Geofencing.onEnter(ids => {
        if (ids && ids.length > 0) {
          const geofenceId = ids[0];
          const geofenceBrandId = parseInt(geofenceId, 10);

          if (!isNaN(geofenceBrandId)) {
            // 중복 알림 방지 체크
            if (!this.notifiedBrandIdsThisSession.has(geofenceBrandId)) {
              if (!this.userGifticons || this.userGifticons.length === 0) {
                console.error(
                  '[GeofencingService] onEnter - userGifticons가 비어있어 알림 처리 불가.'
                );
                return;
              }

              // 해당 브랜드 ID와 일치하는 첫 번째 기프티콘 찾기
              const relevantGifticon = this.userGifticons.find(g => g.brandId === geofenceBrandId);

              if (relevantGifticon && relevantGifticon.gifticonId) {
                const gifticonIdToSend = relevantGifticon.gifticonId;
                geoNotificationService
                  .requestGeoNotification(gifticonIdToSend)
                  .then(() => {
                    this.notifiedBrandIdsThisSession.add(geofenceBrandId);
                  })
                  .catch(error => {
                    console.error(
                      `[GeofencingService] onEnter - API.requestGeoNotification 실패: gifticonId ${gifticonIdToSend}`,
                      error
                    );
                  });
              }
            }
          }
        }
      });

      // 지오펜스 이탈 이벤트 리스너 설정
      Geofencing.onExit(ids => {});

      this.initialized = true;
    } catch (error) {
      console.error('[GeofencingService] 지오펜싱 초기화 실패:', error);
      this.initialized = false;
    } finally {
      this.initializing = false;
    }
  }

  // 백그라운드 위치 권한 확인
  async checkBackgroundLocationPermission() {
    const authStatus = await Geofencing.getLocationAuthorizationStatus();

    if (Platform.OS === 'android' && Platform.Version >= 29 && authStatus !== 'Always') {
      Alert.alert(
        '백그라운드 위치 권한 필요',
        '기프티콘 알림 기능을 사용하려면 "항상 허용" 위치 권한이 필요합니다. 설정에서 이 앱의 위치 권한을 "항상 허용"으로 변경해주세요.',
        [
          { text: '나중에', style: 'cancel' },
          {
            text: '설정으로 이동',
            onPress: () => {
              Linking.openSettings();
            },
          },
        ]
      );
      return false;
    }

    return true;
  }

  // 지오펜스 설정
  async setupGeofences(brandResults, selectedBrand) {
    if (this.initializing) {
      await new Promise(r => setTimeout(r, 1000));
    }

    try {
      if (!this.initialized) {
        return;
      }

      if (!this.userGifticons || this.userGifticons.length === 0) {
        // 기존 지오펜스 제거
        const registered = await Geofencing.getRegisteredGeofences();
        if (registered && registered.length > 0) {
          for (const id of registered) await Geofencing.removeGeofence(id);
        }
        return;
      }

      // 알림 기록 초기화
      this.notifiedBrandIdsThisSession.clear();

      // 기존 지오펜스 제거
      const registeredGeofences = await Geofencing.getRegisteredGeofences();
      if (registeredGeofences && registeredGeofences.length > 0) {
        for (const id of registeredGeofences) await Geofencing.removeGeofence(id);
      }

      // 새 지오펜스 설정
      let count = 0;
      for (const brandResult of brandResults) {
        const { brandId, stores } = brandResult;

        // 선택된 브랜드가 있으면 해당 브랜드만 설정
        if (selectedBrand !== null && brandId.toString() !== selectedBrand.toString()) {
          continue;
        }

        for (const store of stores) {
          const geofenceId = `${brandId}`;

          try {
            await Geofencing.addGeofence({
              id: geofenceId,
              latitude: parseFloat(store.y),
              longitude: parseFloat(store.x),
              radius: 500,
              notifyOnEntry: true,
              notifyOnExit: false,
            });
            count++;
          } catch (error) {
            console.error(
              `[GeofencingService] setupGeofences - 지오펜스 설정 실패: 브랜드 ${brandId}, 매장 ${store.place_name}`,
              error
            );
          }
        }
      }
    } catch (error) {
      console.error('[GeofencingService] setupGeofences - 설정 중 오류:', error);
    }
  }

  // 정리 함수
  async cleanup() {
    try {
      // 등록된 지오펜스 제거
      const geofenceIds = await Geofencing.getRegisteredGeofences();
      if (geofenceIds && geofenceIds.length > 0) {
        for (const id of geofenceIds) await Geofencing.removeGeofence(id);
      }

      // 이벤트 리스너 제거
      if (typeof Geofencing.removeOnEnterListener === 'function')
        Geofencing.removeOnEnterListener();
      if (typeof Geofencing.removeOnExitListener === 'function') Geofencing.removeOnExitListener();
    } catch (error) {
      console.error('[GeofencingService] 지오펜싱 정리 중 오류:', error);
    }
  }

  // 초기화 상태 리셋
  resetInitialized() {
    this.initialized = false;
    this.initializing = false;
  }

  // 싱글톤 인스턴스 리셋 (테스트용)
  static resetInstance() {
    if (instance) {
      instance.cleanup();
      instance = null;
    }
  }
}

export default GeofencingService;
