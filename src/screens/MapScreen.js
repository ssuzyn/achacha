import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import KakaoMapWebView from '../components/KakaoMapView';
import GifticonBottomSheet from '../components/GifticonBottomSheet';

const MapScreen = () => {
  const [gifticons, setGifticons] = useState([
    {
      id: '1',
      brand: '스타벅스',
      menuName: '아이스 카페 아메리카노 T',
      expiryDate: '2025-05-09',
      imageUrl: { uri: 'https://via.placeholder.com/40' },
    },
    {
      id: '2',
      brand: '스타벅스',
      menuName: '아이스 카페 아메리카노 T',
      expiryDate: '2025-05-09',
      imageUrl: { uri: 'https://via.placeholder.com/40' },
    },
    {
      id: '3',
      brand: '투썸플레이스',
      menuName: '아이스 아메리카노 R',
      expiryDate: '2025-05-20',
      imageUrl: { uri: 'https://via.placeholder.com/40' },
    },
    {
      id: '4',
      brand: '배스킨라빈스',
      menuName: '싱글레귤러',
      expiryDate: '2025-05-15',
      imageUrl: { uri: 'https://via.placeholder.com/40' },
    },
  ]);

  // 기프티콘 사용 처리 함수
  const handleUseGifticon = id => {
    console.log(`기프티콘 ${id} 사용됨`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerText}>기프티콘 Map</Text>
      </View>

      <View style={styles.mapContainer}>
        <KakaoMapWebView />
      </View>

      <GifticonBottomSheet
        gifticons={gifticons}
        onUseGifticon={handleUseGifticon}
        style={styles.bottomSheet}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
  },
  bottomSheet: {
    flex: 1,
    zIndex: 10,
  },
});

export default MapScreen;
