import { Platform, Alert, Linking } from 'react-native';
import Geofencing from '@rn-bridge/react-native-geofencing';
import { geoNotificationService } from './geoNotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    this.brandStores = [];
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

  // 백그라운드에서 지오펜싱 체크
  async checkGeofences(location) {
    if (!this.initialized || !this.userGifticons || this.userGifticons.length === 0) {
      console.log('[GeofencingService] 지오펜스 체크 불가: 초기화되지 않았거나 기프티콘 없음');
      return;
    }

    try {
      console.log('[GeofencingService] 현재 위치로 지오펜스 체크 중');

      // 현재 위치
      const { latitude, longitude } = location.coords;

      // 등록된 지오펜스 가져오기
      const registeredGeofences = await Geofencing.getRegisteredGeofences();

      if (!registeredGeofences || registeredGeofences.length === 0) {
        console.log('[GeofencingService] 등록된 지오펜스 없음');
        return;
      }

      // 최근 알림 시간 가져오기 - 단기간 중복 방지용
      let recentNotifications = {};
      try {
        const recentNotificationsStr = await AsyncStorage.getItem('RECENT_NOTIFICATIONS');
        if (recentNotificationsStr) {
          recentNotifications = JSON.parse(recentNotificationsStr);
        }
      } catch (error) {
        console.error('[GeofencingService] 최근 알림 로드 오류:', error);
      }

      // 매장 데이터 확인
      if (!this.brandStores || !Array.isArray(this.brandStores) || this.brandStores.length === 0) {
        console.log('[GeofencingService] 매장 데이터 없음');
        return;
      }

      // 현재 시간
      const now = Date.now();

      // 알림 쿨다운 시간 (30분 = 1800000 밀리초)
      const NOTIFICATION_COOLDOWN = 30 * 60 * 1000;

      // 각 브랜드별 매장 확인
      for (const brandData of this.brandStores) {
        const { brandId, stores } = brandData;

        // 해당 브랜드의 기프티콘이 있는지 확인
        const brandGifticon = this.userGifticons.find(g => g.brandId === parseInt(brandId));
        if (!brandGifticon) continue;

        // 이 세션에서 이미 알림을 보낸 브랜드인지 확인 (앱 재시작 시 리셋)
        if (this.notifiedBrandIdsThisSession.has(parseInt(brandId))) {
          // 충분한 시간이 지났는지 확인 (30분)
          const lastNotifyTime = recentNotifications[`brand_${brandId}`] || 0;
          if (now - lastNotifyTime < NOTIFICATION_COOLDOWN) {
            console.log(
              `[GeofencingService] 브랜드 ${brandId} 알림 쿨다운 중 (${Math.floor((NOTIFICATION_COOLDOWN - (now - lastNotifyTime)) / 60000)}분 남음)`
            );
            continue;
          }

          // 쿨다운 지났으면 세션 기록 초기화
          this.notifiedBrandIdsThisSession.delete(parseInt(brandId));
        }

        // 각 매장의 위치와 현재 위치 비교
        for (const store of stores) {
          const storeLatitude = parseFloat(store.y);
          const storeLongitude = parseFloat(store.x);

          if (isNaN(storeLatitude) || isNaN(storeLongitude)) continue;

          // 거리 계산
          const distance = this.calculateDistance(
            latitude,
            longitude,
            storeLatitude,
            storeLongitude
          );

          // 반경 내에 있는지 확인 (500m)
          if (distance <= 500) {
            console.log(
              `[GeofencingService] 매장 근처 감지: 브랜드 ${brandId}, 매장 ${store.place_name}, 거리 ${distance.toFixed(0)}m`
            );

            // 알림 보내기
            try {
              await geoNotificationService.requestGeoNotification(brandGifticon.gifticonId);

              // 알림 보낸 기록 저장 (세션 및 최근 알림 시간)
              this.notifiedBrandIdsThisSession.add(parseInt(brandId));
              recentNotifications[`brand_${brandId}`] = now;
              await AsyncStorage.setItem(
                'RECENT_NOTIFICATIONS',
                JSON.stringify(recentNotifications)
              );

              console.log(`[GeofencingService] 알림 전송 성공: ${brandGifticon.gifticonName}`);
              break; // 이 브랜드의 다음 매장은 확인하지 않음
            } catch (error) {
              console.error('[GeofencingService] 알림 전송 실패:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('[GeofencingService] 지오펜스 체크 중 오류:', error);
    }
  }

  // 두 지점 간의 거리 계산 (하버사인 공식)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 미터 단위 거리
  }
  // 지오펜스 설정
  async setupGeofences(brandResults, selectedBrand) {
    console.log(
      '[GeofencingService] setupGeofences 호출됨. brandResults:',
      brandResults,
      'selectedBrand:',
      selectedBrand
    );
    console.log('[GeofencingService] 현재 userGifticons:', this.userGifticons);

    if (!brandResults || !Array.isArray(brandResults) || brandResults.length === 0) {
      console.error(
        '[GeofencingService] setupGeofences: 유효하지 않거나 비어있는 매장 데이터',
        brandResults
      );
      return;
    }

    console.log('[GeofencingService] setupGeofences 시작:', {
      브랜드_수: brandResults.length,
      선택된_브랜드: selectedBrand || '없음',
    });

    if (this.initializing) {
      await new Promise(r => setTimeout(r, 1000));
    }

    try {
      if (!this.initialized) {
        console.log('[GeofencingService] 초기화되지 않음, 초기화 시도');
        await this.initGeofencing();
      }

      if (!this.userGifticons || this.userGifticons.length === 0) {
        console.log('[GeofencingService] 기프티콘 없음, 지오펜스 설정 취소');
        // 기존 지오펜스 제거
        const registered = await Geofencing.getRegisteredGeofences();
        if (registered && registered.length > 0) {
          for (const id of registered) await Geofencing.removeGeofence(id);
        }
        return;
      }

      // 매장 정보 저장
      this.brandStores = brandResults;
      console.log('[GeofencingService] 매장 정보 저장됨:', brandResults.length);

      try {
        // AsyncStorage에도 저장
        await AsyncStorage.setItem('GEOFENCE_STORE_DATA', JSON.stringify(brandResults));
        console.log('[GeofencingService] 매장 정보 AsyncStorage에 저장됨');
      } catch (error) {
        console.error('[GeofencingService] AsyncStorage 저장 오류:', error);
      }

      // 알림 기록 초기화
      this.notifiedBrandIdsThisSession.clear();

      // 기존 지오펜스 제거
      console.log('[GeofencingService] 기존 지오펜스 제거 시도');
      try {
        const registeredGeofences = await Geofencing.getRegisteredGeofences();
        console.log('[GeofencingService] 제거할 지오펜스:', registeredGeofences);

        if (registeredGeofences && registeredGeofences.length > 0) {
          for (const id of registeredGeofences) {
            try {
              await Geofencing.removeGeofence(id);
              console.log(`[GeofencingService] 지오펜스 ${id} 제거됨`);
            } catch (removeError) {
              console.error(`[GeofencingService] 지오펜스 ${id} 제거 오류:`, removeError);
            }
          }
        }
      } catch (error) {
        console.error('[GeofencingService] 지오펜스 제거 중 오류:', error);
      }

      // 새 지오펜스 설정
      console.log('[GeofencingService] 새 지오펜스 설정 시작');
      let count = 0;
      const successfulGeofences = [];

      for (const brandResult of brandResults) {
        const { brandId, stores } = brandResult;

        if (!stores || !Array.isArray(stores) || stores.length === 0) {
          console.log(`[GeofencingService] 브랜드 ${brandId}의 매장 데이터 없음`);
          continue;
        }

        // 선택된 브랜드가 있으면 해당 브랜드만 설정
        if (
          selectedBrand !== null &&
          selectedBrand !== undefined &&
          brandId.toString() !== selectedBrand.toString()
        ) {
          console.log(
            `[GeofencingService] 브랜드 ${brandId} 건너뜀 (선택된 브랜드: ${selectedBrand})`
          );
          continue;
        }

        // 해당 브랜드의 기프티콘이 있는지 확인
        const hasGifticon = this.userGifticons.some(g => g.brandId === parseInt(brandId));
        if (!hasGifticon) {
          console.log(`[GeofencingService] 브랜드 ${brandId}의 기프티콘 없음, 건너뜀`);
          continue;
        }

        console.log(`[GeofencingService] 브랜드 ${brandId}의 매장 수:`, stores.length);

        // 대표 매장 하나만 지오펜스로 등록 (성능 최적화)
        const representativeStore = stores[0];
        const geofenceId = `${brandId}`;

        try {
          const storeLatitude = parseFloat(representativeStore.y);
          const storeLongitude = parseFloat(representativeStore.x);

          if (isNaN(storeLatitude) || isNaN(storeLongitude)) {
            console.error(`[GeofencingService] 브랜드 ${brandId} 좌표 변환 오류`);
            continue;
          }

          console.log(
            `[GeofencingService] 지오펜스 추가 시도: 브랜드 ${brandId}, 위치 (${storeLatitude}, ${storeLongitude})`
          );

          await Geofencing.addGeofence({
            id: geofenceId,
            latitude: storeLatitude,
            longitude: storeLongitude,
            radius: 500,
            notifyOnEntry: true,
            notifyOnExit: false,
          });

          successfulGeofences.push(geofenceId);
          count++;
          console.log(`[GeofencingService] 지오펜스 추가 성공: 브랜드 ${brandId}`);
        } catch (error) {
          console.error(
            `[GeofencingService] 지오펜스 설정 실패: 브랜드 ${brandId}, 매장 ${representativeStore.place_name}`,
            error
          );
        }
      }

      console.log(`[GeofencingService] 지오펜스 설정 완료: ${count}개 설정됨`);

      // 설정 확인
      try {
        const finalGeofences = await Geofencing.getRegisteredGeofences();
        console.log('[GeofencingService] 최종 등록된 지오펜스:', finalGeofences);
        return successfulGeofences;
      } catch (error) {
        console.error('[GeofencingService] 최종 지오펜스 확인 중 오류:', error);
        return successfulGeofences;
      }
    } catch (error) {
      console.error('[GeofencingService] setupGeofences - 설정 중 오류:', error);
      return [];
    }
  }

  async cleanup() {
    try {
      console.log('[GeofencingService] 정리 시작');

      // 등록된 지오펜스 제거
      if (this.initialized) {
        try {
          const geofenceIds = await Geofencing.getRegisteredGeofences();
          if (geofenceIds && geofenceIds.length > 0) {
            console.log('[GeofencingService] 등록된 지오펜스 제거 중:', geofenceIds);
            for (const id of geofenceIds) {
              try {
                await Geofencing.removeGeofence(id);
                console.log(`[GeofencingService] 지오펜스 ${id} 제거됨`);
              } catch (removeError) {
                console.error(`[GeofencingService] 지오펜스 ${id} 제거 오류:`, removeError);
              }
            }
          }
        } catch (geofenceError) {
          console.error('[GeofencingService] 지오펜스 제거 중 오류:', geofenceError);
        }
      }

      // 상태 초기화
      this.initialized = false;
      this.initializing = false;
      this.notifiedBrandIdsThisSession.clear();

      console.log('[GeofencingService] 정리 완료');
    } catch (error) {
      console.error('[GeofencingService] 정리 중 오류 발생:', error);
    }
  }
}

export default GeofencingService;
