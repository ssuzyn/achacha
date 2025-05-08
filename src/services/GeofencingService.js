import { Platform, Alert, Linking } from 'react-native';
import Geofencing from '@rn-bridge/react-native-geofencing';
import * as Notifications from 'expo-notifications';

class GeofencingService {
  constructor(uniqueBrands) {
    this.uniqueBrands = uniqueBrands;
    this.initialized = false;
    this.initializing = false; // 초기화 중인지 추적하기 위한 플래그
  }

  // 지오펜싱 초기화
  async initGeofencing() {
    // 이미 초기화 중이거나 초기화 완료된 경우 건너뜀
    if (this.initializing || this.initialized) {
      console.log('지오펜싱이 이미 초기화 중이거나 초기화되어 있습니다.');
      return;
    }

    this.initializing = true; // 초기화 시작 표시
    console.log('====== 지오펜싱 초기화 시작 ======');
    try {
      // 이미 초기화되었다면 실행하지 않음
      if (this.initialized) {
        console.log('이미 초기화됨. 건너뜀.');
        return;
      }

      console.log('백그라운드 위치 권한 확인 중...');
      // 백그라운드 위치 권한 확인
      const hasPermission = await this.checkBackgroundLocationPermission();
      console.log('백그라운드 위치 권한 확인 결과:', hasPermission);

      if (!hasPermission) {
        console.log('위치 권한이 없어 지오펜싱을 초기화할 수 없습니다.');
        return;
      }

      console.log('위치 권한 요청 중...');
      // 위치 권한 요청
      const locationPermission = await Geofencing.requestLocation({
        allowAlways: true, // 백그라운드 위치 권한 요청
      });

      console.log('위치 권한 상태:', locationPermission);

      console.log('지오펜스 진입 이벤트 리스너 설정 중...');
      // 지오펜스 이벤트 리스너 설정
      Geofencing.onEnter(ids => {
        console.log('지오펜스 진입:', ids);
        if (ids && ids.length > 0) {
          const geofenceId = ids[0];
          const [brandId, storeName] = geofenceId.split('_');
          this.sendNotification(brandId, storeName);
        }
      });

      console.log('지오펜스 이탈 이벤트 리스너 설정 중...');
      // 지오펜스 이탈 이벤트 리스너
      Geofencing.onExit(ids => {
        console.log('지오펜스 이탈:', ids);
      });

      this.initialized = true;
      console.log('====== 지오펜싱 초기화 완료 ======');
    } catch (error) {
      console.error('지오펜싱 초기화 실패: ', error);
      this.initialized = false; // 초기화 실패 시 플래그 재설정
    } finally {
      this.initializing = false; // 초기화 과정 종료 표시
    }
  }

  // 백그라운드 위치 권한 확인
  async checkBackgroundLocationPermission() {
    try {
      // 위치 권한 상태 확인
      const authStatus = await Geofencing.getLocationAuthorizationStatus();
      console.log('현재 위치 권한 상태:', authStatus);

      // Android 10 이상에서 백그라운드 위치 권한이 없는 경우
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
    } catch (error) {
      console.error('위치 권한 확인 중 오류:', error);
      return false;
    }
  }

  // 알림 설정 메서드
  async setupNotifications() {
    try {
      // 알림 핸들러 설정
      Notifications.setNotificationHandler({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      });

      // 알림 채널 설정 (안드로이드)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: '기프티콘 알림',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#56AEE9',
          sound: true,
        });
      }

      // 알림 권한 요청
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('알림 권한 상태:', status);

      return status === 'granted';
    } catch (error) {
      console.log('알림 설정 실패:', error);
      return false;
    }
  }

  // 알림 전송 함수
  async sendNotification(brandId, storeName) {
    try {
      const brand = this.uniqueBrands.find(b => b.brandId.toString() === brandId);

      if (!brand) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '근처에서 사용 가능한 기프티콘이 있어요!',
          body: `${brand.brandName} 매장이 근처에 있습니다. 기프티콘을 사용해보세요!`,
          data: { brandId, storeName },
        },
        trigger: null, // 즉시 알림
      });
      console.log('알림 전송 완료');
    } catch (error) {
      console.log('알림 전송 실패:', error);
    }
  }

  // 지오펜스 설정 함수
  async setupGeofences(brandResults, selectedBrand) {
    // 초기화 중이면 잠시 대기
    if (this.initializing) {
      console.log('지오펜싱 초기화 중입니다. 잠시 대기...');
      // 최대 3초 대기 (초기화가 완료될 때까지)
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!this.initializing) break;
      }
    }

    try {
      if (!this.initialized) {
        console.log('지오펜싱이 초기화되지 않았습니다.');
        return;
      }

      // 백그라운드 위치 권한 확인
      const authStatus = await Geofencing.getLocationAuthorizationStatus();
      if (authStatus !== 'Always') {
        console.log('백그라운드 위치 권한이 없어 지오펜스 설정을 건너뜁니다.');
        return;
      }

      // 기존 등록된 지오펜스 모두 가져오기
      const registeredGeofences = await Geofencing.getRegisteredGeofences();
      console.log('등록된 지오펜스:', registeredGeofences);

      // 기존 지오펜스 제거
      if (registeredGeofences && registeredGeofences.length > 0) {
        for (const id of registeredGeofences) {
          await Geofencing.removeGeofence(id);
        }
      }

      // 각 브랜드별 매장에 대한 지오펜스 설정
      for (const brandResult of brandResults) {
        const { brandId, brandName, stores } = brandResult;

        // 선택된 브랜드가 있고, 현재 브랜드가 선택된 브랜드가 아니면 스킵
        if (selectedBrand !== null && brandId.toString() !== selectedBrand.toString()) {
          continue;
        }

        for (const store of stores) {
          const geofenceId = `${brandId}_${store.place_name}`;

          try {
            await Geofencing.addGeofence({
              id: geofenceId,
              latitude: parseFloat(store.y),
              longitude: parseFloat(store.x),
              radius: 200, // 미터 단위 (50)
              notifyOnEntry: true,
              notifyOnExit: false,
            });
            console.log(`지오펜스 설정 완료: ${store.place_name}(${brandName})`);
          } catch (error) {
            console.error(`지오펜스 설정 실패: ${store.place_name}`, error);
          }
        }
      }
    } catch (error) {
      console.error('지오펜스 설정 중 오류 발생:', error);
    }
  }

  // 지오펜싱 정리 함수
  async cleanup() {
    try {
      // 등록된 지오펜스 목록 가져오기
      const geofenceIds = await Geofencing.getRegisteredGeofences();
      if (geofenceIds && geofenceIds.length > 0) {
        // 각 지오펜스 ID에 대해 개별적으로 제거
        geofenceIds.forEach(id => {
          Geofencing.removeGeofence(id)
            .then(() => console.log(`지오펜스 제거 완료: ${id}`))
            .catch(err => console.error(`지오펜스 제거 실패: ${id}`, err));
        });
      } else {
        console.log('제거할 지오펜스가 없습니다');
      }

      // 이벤트 리스너 제거
      if (typeof Geofencing.removeOnEnterListener === 'function') {
        Geofencing.removeOnEnterListener();
      }

      if (typeof Geofencing.removeOnExitListener === 'function') {
        Geofencing.removeOnExitListener();
      }
    } catch (error) {
      console.error('지오펜스 정리 중 오류:', error);
    }
  }
  // initialized 플래그 리셋
  resetInitialized() {
    this.initialized = false;
    this.initializing = false;
  }
}

export default GeofencingService;
