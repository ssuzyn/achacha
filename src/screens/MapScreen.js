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
  ]);

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
        <KakaoMapWebView />
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
