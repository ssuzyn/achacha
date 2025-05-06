import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import KakaoMapWebView from '../components/KakaoMapView';
import GifticonBottomSheet from '../components/GifticonBottomSheet';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MapScreen = () => {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const mapRef = useRef(null);

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

  // 선택된 브랜드에 따라 필터링
  const filteredGifticons = selectedBrand
    ? gifticons.filter(item => item.brandId === selectedBrand)
    : gifticons;

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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerText}>기프티콘 Map</Text>
        </View>
      </SafeAreaView>

      <View style={styles.mapContainer}>
        {/* 브랜드 목록과 선택한 브랜드 넘겨줌 */}
        <KakaoMapWebView
          ref={mapRef}
          uniqueBrands={uniqueBrands}
          selectedBrand={selectedBrand}
          onSelectBrand={handleSelectBrand}
        />
      </View>
      <TouchableOpacity style={styles.locationButton} onPress={moveToCurrentLocation}>
        <Icon name="my-location" size={24} color="#278CCC" />
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
  safeArea: {
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
  },
  locationButton: {
    position: 'absolute',
    top: 100,
    right: 13,
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
