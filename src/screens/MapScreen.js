import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import KakaoMapWebView from '../components/KakaoMapView';
import GifticonBottomSheet from '../components/GifticonBottomSheet';

const MapScreen = () => {
  const [selectedBrand, setSelectedBrand] = useState(null);

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
    setSelectedBrand(selectedBrand === brandId ? null : brandId);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerText}>기프티콘 Map</Text>
        </View>
      </SafeAreaView>

      <View style={styles.mapContainer}>
        {/* KakaoMapWebView에 브랜드 목록과 선택한 브랜드 넘겨줌 */}
        <KakaoMapWebView uniqueBrands={uniqueBrands} selectedBrand={selectedBrand} />
      </View>

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
});

export default MapScreen;
