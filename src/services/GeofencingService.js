import { Platform, Alert, Linking } from 'react-native';
import Geofencing from '@rn-bridge/react-native-geofencing';
import { geoNotificationService } from './geoNotificationService';

// 싱글톤 인스턴스를 저장할 변수
let instance = null;

class GeofencingService {
  constructor() {
    // 이미 인스턴스가 있으면 그 인스턴스를 반환
    if (instance) {
      console.log('[GeofencingService] 기존 인스턴스 반환');
      return instance;
    }

    // 새 인스턴스 생성
    instance = this;
    this.initialized = false;
    this.initializing = false;
    this.notifiedBrandIdsThisSession = new Set();
    this.userGifticons = [];
    this.uniqueBrands = [];
    console.log('[GeofencingService] 새 인스턴스 생성됨');
  }

  // 기프티콘 목록 업데이트
  updateUserGifticons(gifticons) {
    console.log('[GeofencingService] updateUserGifticons 호출됨.');

    if (gifticons && gifticons.gifticons && Array.isArray(gifticons.gifticons)) {
      this.userGifticons = gifticons.gifticons;
      console.log(
        `[GeofencingService] 사용자 기프티콘 목록 업데이트: ${this.userGifticons.length}개`
      );

      // 브랜드별 기프티콘 수 로깅
      const brandCounts = {};
      this.userGifticons.forEach(g => {
        brandCounts[g.brandId] = (brandCounts[g.brandId] || 0) + 1;
      });
      console.log('[GeofencingService] 업데이트된 기프티콘의 브랜드별 카운트:', brandCounts);
    } else {
      console.error('[GeofencingService] updateUserGifticons - 유효하지 않은 기프티콘 목록 구조.');
      this.userGifticons = [];
    }
  }

  // 지오펜싱 초기화
  async initGeofencing() {
    if (this.initializing || this.initialized) {
      console.log(
        '[GeofencingService] 이미 초기화 중이거나 완료됨. 초기화 중:',
        this.initializing,
        '초기화 완료:',
        this.initialized
      );
      return;
    }

    this.initializing = true;
    console.log('[GeofencingService] 지오펜싱 초기화 시작');

    try {
      // 백그라운드 위치 권한 확인
      const hasPermission = await this.checkBackgroundLocationPermission();
      if (!hasPermission) {
        console.log('[GeofencingService] 위치 권한 부족으로 초기화 중단.');
        this.initializing = false;
        return;
      }

      // 위치 권한 요청
      await Geofencing.requestLocation({ allowAlways: true });

      // 지오펜스 진입 이벤트 리스너 설정
      Geofencing.onEnter(ids => {
        console.log('[GeofencingService] onEnter - 지오펜스 진입 IDs:', ids);

        if (ids && ids.length > 0) {
          const geofenceId = ids[0];
          const geofenceBrandId = parseInt(geofenceId, 10);

          console.log('[GeofencingService] onEnter - 브랜드 ID:', geofenceBrandId);

          if (!isNaN(geofenceBrandId)) {
            // 중복 알림 방지 체크
            if (!this.notifiedBrandIdsThisSession.has(geofenceBrandId)) {
              // 기프티콘 목록 체크
              console.log(
                `[GeofencingService] onEnter - userGifticons 목록 길이: ${this.userGifticons.length}`
              );

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
                console.log(
                  `[GeofencingService] onEnter - 알림 보낼 gifticonId: ${gifticonIdToSend} (브랜드 ID: ${geofenceBrandId}, 기프티콘명: ${relevantGifticon.gifticonName})`
                );

                geoNotificationService
                  .requestGeoNotification(gifticonIdToSend)
                  .then(() => {
                    console.log(
                      `[GeofencingService] onEnter - API.requestGeoNotification 성공: gifticonId ${gifticonIdToSend}`
                    );
                    this.notifiedBrandIdsThisSession.add(geofenceBrandId);
                  })
                  .catch(error => {
                    console.error(
                      `[GeofencingService] onEnter - API.requestGeoNotification 실패: gifticonId ${gifticonIdToSend}`,
                      error
                    );
                  });
              } else {
                console.log(
                  `[GeofencingService] onEnter - brandId ${geofenceBrandId}에 해당하는 사용 가능한 기프티콘 없음.`
                );
              }
            } else {
              console.log(
                `[GeofencingService] onEnter - 이미 알림 보낸 브랜드 ID: ${geofenceBrandId}`
              );
            }
          } else {
            console.error(
              '[GeofencingService] onEnter - 유효하지 않은 브랜드 ID 형식:',
              geofenceId
            );
          }
        }
      });

      // 지오펜스 이탈 이벤트 리스너 설정
      Geofencing.onExit(ids => {
        console.log('[GeofencingService] onExit - 지오펜스 이탈 IDs:', ids);
      });

      this.initialized = true;
      console.log('[GeofencingService] 지오펜싱 초기화 완료');
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

    console.log('[GeofencingService] 현재 위치 권한 상태:', authStatus);

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
    // 초기화 중이면 잠시 대기
    if (this.initializing) {
      console.log('[GeofencingService] 초기화 중, 잠시 대기 중...');
      await new Promise(r => setTimeout(r, 1000));
    }

    try {
      if (!this.initialized) {
        console.log('[GeofencingService] setupGeofences - 초기화되지 않아 건너뜀.');
        return;
      }

      // 싱글톤 인스턴스의 상태 확인
      console.log('[GeofencingService] setupGeofences - 싱글톤 인스턴스 ID:', this);
      console.log(
        '[GeofencingService] setupGeofences - userGifticons 상태:',
        this.userGifticons
          ? `배열: ${Array.isArray(this.userGifticons)}, 길이: ${this.userGifticons.length}`
          : '정의되지 않음'
      );

      if (this.userGifticons && this.userGifticons.length > 0) {
        // 브랜드 ID 목록 로깅
        const brandIds = [...new Set(this.userGifticons.map(g => g.brandId))];
        console.log('[GeofencingService] setupGeofences - 존재하는 브랜드 ID들:', brandIds);
      }

      if (!this.userGifticons || this.userGifticons.length === 0) {
        console.warn(
          '[GeofencingService] setupGeofences - userGifticons가 비어있어 지오펜스 설정 안 함.'
        );

        // 기존 지오펜스 제거
        const registered = await Geofencing.getRegisteredGeofences();
        if (registered && registered.length > 0) {
          console.log(
            '[GeofencingService] setupGeofences - userGifticons 비어있어 기존 지오펜스 제거.'
          );
          for (const id of registered) await Geofencing.removeGeofence(id);
        }

        return;
      }

      // 알림 기록 초기화
      this.notifiedBrandIdsThisSession.clear();
      console.log('[GeofencingService] setupGeofences - 알림 기록 초기화됨.');

      // 기존 지오펜스 제거
      const registeredGeofences = await Geofencing.getRegisteredGeofences();
      if (registeredGeofences && registeredGeofences.length > 0) {
        for (const id of registeredGeofences) await Geofencing.removeGeofence(id);
        console.log(
          `[GeofencingService] setupGeofences - 기존 지오펜스 ${registeredGeofences.length}개 제거됨.`
        );
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
          const geofenceId = `${brandId}`; // 문자열로 변환

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

      console.log(`[GeofencingService] setupGeofences - 총 ${count}개의 지오펜스 설정 완료.`);
    } catch (error) {
      console.error('[GeofencingService] setupGeofences - 설정 중 오류:', error);
    }
  }

  // 정리 함수
  async cleanup() {
    console.log('[GeofencingService] 지오펜싱 정리 시작');

    try {
      // 등록된 지오펜스 제거
      const geofenceIds = await Geofencing.getRegisteredGeofences();
      if (geofenceIds && geofenceIds.length > 0) {
        for (const id of geofenceIds) await Geofencing.removeGeofence(id);
        console.log(`[GeofencingService] cleanup - 지오펜스 ${geofenceIds.length}개 제거됨.`);
      }

      // 이벤트 리스너 제거
      if (typeof Geofencing.removeOnEnterListener === 'function')
        Geofencing.removeOnEnterListener();
      if (typeof Geofencing.removeOnExitListener === 'function') Geofencing.removeOnExitListener();

      console.log('[GeofencingService] 지오펜싱 정리 완료');
    } catch (error) {
      console.error('[GeofencingService] 지오펜싱 정리 중 오류:', error);
    }
  }

  // 초기화 상태 리셋
  resetInitialized() {
    console.log('[GeofencingService] 초기화 상태 리셋됨.');
    this.initialized = false;
    this.initializing = false;
  }

  // 싱글톤 인스턴스 리셋 (테스트용)
  static resetInstance() {
    if (instance) {
      console.log('[GeofencingService] 싱글톤 인스턴스 리셋');
      instance.cleanup();
      instance = null;
    }
  }
}

export default GeofencingService;
