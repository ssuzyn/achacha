import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  AppState,
  StatusBar,
  Alert,
} from 'react-native';
import KakaoMapView from '../components/map/KakaoMapView';
import GifticonBottomSheet from '../components/GifticonBottomSheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
import GeofencingService from '../services/GeofencingService';
import { useNavigation } from '@react-navigation/native';
import { mapGifticonService } from '../services/mapGifticonService';
import { geoNotificationService } from '../services/geoNotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geofencing from '@rn-bridge/react-native-geofencing';

const MapScreen = () => {
  const navigation = useNavigation();
  const [selectedBrand, setSelectedBrand] = useState(null);
  const mapRef = useRef(null);
  const geofencingServiceRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const [gifticons, setGifticons] = useState([]);

  // 기프티콘 데이터 로드
  const loadGifticons = async () => {
    try {
      const response = await mapGifticonService.getMapGifticons();
      const gifticonsArray = response.gifticons || [];
      setGifticons(gifticonsArray);

      // 기프티콘 AsyncStorage에 저장 (백그라운드 처리용)
      await AsyncStorage.setItem('USER_GIFTICONS', JSON.stringify(gifticonsArray));
      console.log('[MapScreen] 기프티콘 AsyncStorage에 저장됨:', gifticonsArray.length);

      // GeofencingService에 기프티콘 목록 전달 (싱글톤 인스턴스 가져오기)
      if (!geofencingServiceRef.current) {
        geofencingServiceRef.current = new GeofencingService();
      }
      geofencingServiceRef.current.updateUserGifticons(response);

      return response;
    } catch (error) {
      console.error('[MapScreen] 기프티콘 목록 로드 실패:', error);
      setGifticons([]);
      return null;
    }
  };

  useEffect(() => {
    // 테스트용: 매장 데이터가 있는지 로깅
    const checkStoreData = async () => {
      try {
        const storeData = await AsyncStorage.getItem('GEOFENCE_STORE_DATA');
        console.log('[MapScreen] 저장된 매장 데이터 확인:', storeData ? '있음' : '없음');

        if (storeData) {
          const parsedData = JSON.parse(storeData);
          console.log('[MapScreen] 저장된 매장 수:', parsedData.length);
        }
      } catch (e) {
        console.error('[MapScreen] 매장 데이터 확인 중 오류:', e);
      }
    };

    checkStoreData();
  }, []);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    // GeofencingService 인스턴스 가져오기 (싱글톤)
    geofencingServiceRef.current = new GeofencingService();

    const initialize = async () => {
      // 기프티콘 목록 로드
      await loadGifticons();
    };

    initialize();

    // 30분마다 기프티콘 목록 새로고침
    const refreshInterval = setInterval(
      () => {
        loadGifticons();
      },
      30 * 60 * 1000
    );

    // 컴포넌트 언마운트 시 정리
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  // 기프티콘 목록에서 브랜드 정보 추출(중복 없이)
  const getUniqueBrands = () => {
    const uniqueBrands = gifticons.reduce((acc, gifticon) => {
      if (!acc[gifticon.brandId]) {
        acc[gifticon.brandId] = {
          brandId: gifticon.brandId,
          brandName: gifticon.brandName,
        };
      }
      return acc;
    }, {});

    return Object.values(uniqueBrands);
  };

  const uniqueBrands = getUniqueBrands();

  // uniqueBrands 변경 시 서비스에 전달
  useEffect(() => {
    if (geofencingServiceRef.current) {
      geofencingServiceRef.current.uniqueBrands = uniqueBrands;
    }
  }, [uniqueBrands]);

  // 선택된 브랜드에 따라 필터링
  const filteredGifticons = selectedBrand
    ? gifticons.filter(item => item.brandId === selectedBrand)
    : gifticons;

  // 매장 검색 결과 처리 콜백
  const handleStoresFound = async storeResults => {
    console.log('[MapScreen] 매장 검색 결과 수신:', storeResults.length);
    console.log('[MapScreen] 매장 데이터 구조:', JSON.stringify(storeResults.slice(0, 1)));

    if (!geofencingServiceRef.current) {
      console.error('[MapScreen] 지오펜싱 서비스 참조가 없음');
      return;
    }

    // 기프티콘이 없는 경우 먼저 로드
    if (
      !geofencingServiceRef.current.userGifticons ||
      geofencingServiceRef.current.userGifticons.length === 0
    ) {
      console.log('[MapScreen] 기프티콘 목록이 비어있음, 로드 시도');
      await loadGifticons();

      // 로드 후에도 여전히 비어있는지 확인
      if (
        !geofencingServiceRef.current.userGifticons ||
        geofencingServiceRef.current.userGifticons.length === 0
      ) {
        console.warn('[MapScreen] 기프티콘 로드 후에도 목록이 비어있음');
      } else {
        console.log(
          '[MapScreen] 기프티콘 로드 성공:',
          geofencingServiceRef.current.userGifticons.length
        );
      }
    }

    // 지오펜스 설정 진행
    console.log('[MapScreen] 지오펜스 설정 시작, 서비스 참조:', geofencingServiceRef.current);
    try {
      // storeResults 데이터 구조 확인
      console.log(
        '[MapScreen] 매장 데이터 구조 확인:',
        storeResults.map(br => ({
          brandId: br.brandId,
          storeCount: br.stores ? br.stores.length : 0,
        }))
      );

      // 지오펜스 설정 결과 저장
      const setupResult = await geofencingServiceRef.current.setupGeofences(
        storeResults,
        selectedBrand
      );

      // 설정 후 등록된 지오펜스 확인
      const registeredGeofences = await Geofencing.getRegisteredGeofences();
      console.log('[MapScreen] 지오펜스 설정 완료, 등록된 지오펜스:', registeredGeofences);

      // 지오펜스 정보를 저장소에 저장 (백그라운드에서 활용하기 위함)
      await AsyncStorage.setItem('GEOFENCE_STORE_DATA', JSON.stringify(storeResults));
      console.log('[MapScreen] 매장 데이터 AsyncStorage에 저장 완료');

      return setupResult;
    } catch (error) {
      console.error('[MapScreen] 지오펜스 설정 중 오류:', error);
    }
  };

  // 기프티콘 사용 처리 함수
  const handleUseGifticon = id => {
    console.log(`[MapScreen] 기프티콘 ${id} 사용됨`);
  };

  // 브랜드 선택 처리 함수
  const handleSelectBrand = brandId => {
    // 숫자형으로 변환하여 비교
    const currentBrandId = selectedBrand !== null ? Number(selectedBrand) : null;
    const newBrandId = brandId !== null ? Number(brandId) : null;

    console.log(`[MapScreen] 브랜드 선택 변경 - 현재: ${currentBrandId}, 새로운: ${newBrandId}`);

    // 같은 브랜드를 다시 선택하면 선택 해제
    if (currentBrandId === newBrandId) {
      console.log('[MapScreen] 같은 브랜드 다시 선택 - 선택 해제');
      setSelectedBrand(null);
    } else {
      console.log(`[MapScreen] 새 브랜드 선택: ${newBrandId}`);
      setSelectedBrand(newBrandId);
    }
  };

  // 현재 위치로 이동하는 함수
  const moveToCurrentLocation = () => {
    if (mapRef.current && mapRef.current.moveToCurrentLocation) {
      console.log('[MapScreen] 현재 위치로 이동');
      mapRef.current.moveToCurrentLocation();
    }
  };

  // 테스트용 - 지오펜스 진입 이벤트 시뮬레이션 함수
  const testGeofenceTrigger = () => {
    if (!geofencingServiceRef.current) {
      Alert.alert('오류', '지오펜싱 서비스가 초기화되지 않았습니다.');
      return;
    }

    // 기프티콘 목록 확인
    const userGifticons = geofencingServiceRef.current.userGifticons || [];

    if (userGifticons.length === 0) {
      Alert.alert('알림', '기프티콘 목록이 비어 있습니다.');
      return;
    }

    // 테스트할 브랜드 ID (예: CU)
    const testBrandId = 6;

    // 해당 브랜드의 기프티콘 찾기
    const relevantGifticon = userGifticons.find(g => g.brandId === testBrandId);

    if (relevantGifticon) {
      Alert.alert(
        '테스트 정보',
        `브랜드 ID ${testBrandId}의 기프티콘을 찾았습니다:\n` +
          `- 이름: ${relevantGifticon.gifticonName}\n` +
          `- ID: ${relevantGifticon.gifticonId}\n` +
          `- 만료일: ${relevantGifticon.gifticonExpiryDate}\n\n` +
          '실제 지오펜스 진입 이벤트가 발생하면 이 기프티콘에 대한 알림이 자동으로 전송됩니다.',
        [
          { text: '확인' },
          {
            text: 'API 테스트',
            onPress: async () => {
              try {
                console.log(
                  `[MapScreen] API 테스트: gifticonId=${relevantGifticon.gifticonId} 전송`
                );
                const result = await geoNotificationService.requestGeoNotification(
                  relevantGifticon.gifticonId
                );
                console.log('[MapScreen] API 테스트 성공:', result);
                Alert.alert('성공', 'API 호출이 성공적으로 완료되었습니다!');
              } catch (error) {
                console.error('[MapScreen] API 테스트 실패:', error);
                Alert.alert('오류', `API 호출 실패: ${error.message}`);
              }
            },
          },
        ]
      );
    } else {
      Alert.alert('알림', `브랜드 ID ${testBrandId}에 해당하는 기프티콘이 없습니다.`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />

      <View style={styles.mapContainer}>
        <KakaoMapView
          ref={mapRef}
          uniqueBrands={uniqueBrands}
          selectedBrand={selectedBrand}
          onSelectBrand={handleSelectBrand}
          onStoresFound={handleStoresFound}
        />
      </View>

      {/* 현재 위치 버튼 */}
      <TouchableOpacity style={styles.locationButton} onPress={moveToCurrentLocation}>
        <Icon name="my-location" size={24} color="#278CCC" />
      </TouchableOpacity>

      {/* 기프티콘 뿌리기 화면 이동 버튼 */}
      <TouchableOpacity
        style={styles.giftButton}
        onPress={() => navigation.navigate('GiveAwayScreen')}
      >
        <Icon name="card-giftcard" size={24} color="#278CCC" />
      </TouchableOpacity>

      {/* 테스트 버튼 (개발 중에만 사용) */}
      <TouchableOpacity style={[styles.giftButton, { top: 175 }]} onPress={testGeofenceTrigger}>
        <Icon name="location-on" size={24} color="red" />
      </TouchableOpacity>

      {/* 기프티콘 목록 하단 시트 */}
      <GifticonBottomSheet
        gifticons={filteredGifticons}
        onUseGifticon={handleUseGifticon}
        onSelectBrand={handleSelectBrand}
        selectedBrand={selectedBrand}
      />
    </SafeAreaView>
  );
};

// 스타일
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  mapContainer: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  locationButton: {
    position: 'absolute',
    top: 55,
    right: 6,
    width: 45,
    height: 45,
    borderRadius: 24,
    backgroundColor: 'rgba(229, 244, 254, 0.8)',
    borderColor: '#56AEE9',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftButton: {
    position: 'absolute',
    top: 115,
    right: 6,
    width: 45,
    height: 45,
    borderRadius: 24,
    backgroundColor: 'rgba(229, 244, 254, 0.8)',
    borderColor: '#56AEE9',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapScreen;
