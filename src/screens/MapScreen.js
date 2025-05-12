import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, AppState } from 'react-native';
import KakaoMapWebView from '../components/map/KakaoMapView';
import GifticonBottomSheet from '../components/GifticonBottomSheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
import GeofencingService from '../services/GeofencingService';
import { useNavigation } from '@react-navigation/native';

const MapScreen = () => {
  const navigation = useNavigation();
  const [selectedBrand, setSelectedBrand] = useState(null);
  const mapRef = useRef(null);
  const geofencingServiceRef = useRef();
  const appState = useRef(AppState.currentState);

  // 목데이터
  const [gifticons] = useState([
    {
      gifticonId: 123,
      gifticonName: '아메리카노',
      gifticonType: 'PRODUCT',
      gifticonExpiryDate: '2025-05-09',
      brandId: 45,
      brandName: '스타벅스',
      scope: 'MY_BOX',
      userId: 78,
      userName: '홍길동',
      shareBoxId: null,
      shareBoxName: null,
      thumbnailPath: '/images/gifticons/thumbnail/123.jpg',
    },
    {
      gifticonId: 124,
      gifticonName: '카페라떼',
      gifticonType: 'PRODUCT',
      gifticonExpiryDate: '2025-05-09',
      brandId: 45,
      brandName: '스타벅스',
      scope: 'SHARE_BOX',
      userId: 78,
      userName: '홍길동',
      shareBoxId: 90,
      shareBoxName: '스터디 그룹',
      thumbnailPath: '/images/gifticons/thumbnail/124.jpg',
    },
    {
      gifticonId: 125,
      gifticonName: '아이스 아메리카노 R',
      gifticonType: 'PRODUCT',
      gifticonExpiryDate: '2025-05-20',
      brandId: 46,
      brandName: '투썸플레이스',
      scope: 'MY_BOX',
      userId: 78,
      userName: '홍길동',
      shareBoxId: null,
      shareBoxName: null,
      thumbnailPath: '/images/gifticons/thumbnail/125.jpg',
    },
    {
      gifticonId: 126,
      gifticonName: '싱글레귤러',
      gifticonType: 'PRODUCT',
      gifticonExpiryDate: '2025-05-15',
      brandId: 47,
      brandName: '배스킨라빈스',
      scope: 'MY_BOX',
      userId: 78,
      userName: '홍길동',
      shareBoxId: null,
      shareBoxName: null,
      thumbnailPath: '/images/gifticons/thumbnail/126.jpg',
    },
    {
      gifticonId: 127,
      gifticonName: '델리시볼 도시락',
      gifticonType: 'PRODUCT',
      gifticonExpiryDate: '2025-05-18',
      brandId: 48,
      brandName: 'CU',
      scope: 'MY_BOX',
      userId: 78,
      userName: '홍길동',
      shareBoxId: null,
      shareBoxName: null,
      thumbnailPath: '/images/gifticons/thumbnail/127.jpg',
    },
    {
      gifticonId: 128,
      gifticonName: '김혜자도시락',
      gifticonType: 'PRODUCT',
      gifticonExpiryDate: '2025-05-25',
      brandId: 48,
      brandName: 'CU',
      scope: 'SHARE_BOX',
      userId: 78,
      userName: '홍길동',
      shareBoxId: 91,
      shareBoxName: '동기 모임',
      thumbnailPath: '/images/gifticons/thumbnail/128.jpg',
    },
    {
      gifticonId: 129,
      gifticonName: '햄부리또',
      gifticonType: 'PRODUCT',
      gifticonExpiryDate: '2025-05-12',
      brandId: 48,
      brandName: 'CU',
      scope: 'MY_BOX',
      userId: 78,
      userName: '홍길동',
      shareBoxId: null,
      shareBoxName: null,
      thumbnailPath: '/images/gifticons/thumbnail/129.jpg',
    },
    {
      gifticonId: 130,
      gifticonName: 'CU 모바일 상품권 5천원권',
      gifticonType: 'VOUCHER',
      gifticonExpiryDate: '2025-12-31',
      brandId: 48,
      brandName: 'CU',
      scope: 'MY_BOX',
      userId: 78,
      userName: '홍길동',
      shareBoxId: null,
      shareBoxName: null,
      thumbnailPath: '/images/gifticons/thumbnail/130.jpg',
    },
    {
      gifticonId: 131,
      gifticonName: '더블팥 빙수',
      gifticonType: 'PRODUCT',
      gifticonExpiryDate: '2025-06-10',
      brandId: 49,
      brandName: 'GS25',
      scope: 'MY_BOX',
      userId: 78,
      userName: '홍길동',
      shareBoxId: null,
      shareBoxName: null,
      thumbnailPath: '/images/gifticons/thumbnail/131.jpg',
    },
    {
      gifticonId: 132,
      gifticonName: '왕구마 붕어빵',
      gifticonType: 'PRODUCT',
      gifticonExpiryDate: '2025-06-15',
      brandId: 49,
      brandName: 'GS25',
      scope: 'MY_BOX',
      userId: 78,
      userName: '홍길동',
      shareBoxId: null,
      shareBoxName: null,
      thumbnailPath: '/images/gifticons/thumbnail/132.jpg',
    },
  ]);

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

  // 첫 렌더링 시 지오펜싱 초기화
  useEffect(() => {
    // 최초 렌더링 시 인스턴스 생성
    if (!geofencingServiceRef.current) {
      console.log('GeofencingService 인스턴스 생성');
      geofencingServiceRef.current = new GeofencingService(uniqueBrands);
    }

    console.log('MapScreen 마운트 - 지오펜싱 초기화 시작');

    const initGeofencing = async () => {
      if (geofencingServiceRef.current && !geofencingServiceRef.current.initialized) {
        console.log('initGeofencing 함수 호출됨');
        try {
          await geofencingServiceRef.current.initGeofencing();
          console.log('지오펜싱 초기화 성공');
        } catch (error) {
          console.error('지오펜싱 초기화 중 오류:', error);
        }
      } else {
        console.log('지오펜싱이 이미 초기화되었습니다.');
      }
    };

    initGeofencing();

    // AppState 이벤트 핸들러
    const handleAppStateChange = async nextAppState => {
      console.log(`앱 상태 변경: ${appState.current} -> ${nextAppState}`);
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        geofencingServiceRef.current &&
        !geofencingServiceRef.current.initializing // 초기화 중이 아닐 때만
      ) {
        console.log('앱이 포그라운드로 돌아왔습니다 - 지오펜싱 재초기화');
        geofencingServiceRef.current.resetInitialized();
        await geofencingServiceRef.current.initGeofencing();
      }
      appState.current = nextAppState;
    };

    // 이벤트 리스너 설정
    console.log('앱 상태 변경 리스너 설정');
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // 컴포넌트 언마운트 시 정리
    return () => {
      console.log('MapScreen 언마운트 - 정리 작업 시작');
      subscription.remove();
      if (geofencingServiceRef.current) {
        geofencingServiceRef.current.cleanup();
      }
      console.log('MapScreen 정리 작업 완료');
    };
  }, []);

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
  const handleStoresFound = storeResults => {
    console.log('매장 검색 결과 수신:', storeResults.length);
    if (geofencingServiceRef.current) {
      geofencingServiceRef.current.setupGeofences(storeResults, selectedBrand);
    }
  };

  // 기프티콘 사용 처리 함수
  const handleUseGifticon = id => {
    console.log(`기프티콘 ${id} 사용됨`);
  };

  // 브랜드 선택 처리 함수
  const handleSelectBrand = brandId => {
    // 숫자형으로 변환하여 비교
    const currentBrandId = selectedBrand !== null ? Number(selectedBrand) : null;
    const newBrandId = brandId !== null ? Number(brandId) : null;

    // 같은 브랜드를 다시 선택하면 선택 해제
    if (currentBrandId === newBrandId) {
      setSelectedBrand(null);
    } else {
      setSelectedBrand(newBrandId);
    }
  };

  // 현재 위치로 이동하는 함수
  const moveToCurrentLocation = () => {
    if (mapRef.current && mapRef.current.moveToCurrentLocation) {
      mapRef.current.moveToCurrentLocation();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {/* 브랜드 목록과 선택한 브랜드 넘겨줌 */}
        <KakaoMapWebView
          ref={mapRef}
          uniqueBrands={uniqueBrands}
          selectedBrand={selectedBrand}
          onSelectBrand={handleSelectBrand}
          onStoresFound={handleStoresFound}
        />
      </View>
      <TouchableOpacity style={styles.locationButton} onPress={moveToCurrentLocation}>
        <Icon name="my-location" size={24} color="#278CCC" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.giftButton}
        onPress={() => navigation.navigate('GiveAwayScreen')}
      >
        <Icon name="card-giftcard" size={24} color="#278CCC" />
      </TouchableOpacity>
      <GifticonBottomSheet
        gifticons={filteredGifticons}
        onUseGifticon={handleUseGifticon}
        onSelectBrand={handleSelectBrand}
        selectedBrand={selectedBrand}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 20,
    fontFamily: 'Pretendard-ExtraBold',
  },
  mapContainer: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  locationButton: {
    position: 'absolute',
    top: 40,
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
    top: 105,
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
