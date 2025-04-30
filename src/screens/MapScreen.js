import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, Dimensions, ActivityIndicator } from "react-native";
import KakaoMapView from "../components/KakaoMapView";

const { width, height } = Dimensions.get('window');

const MapScreen = () => {
  const [mapReady, setMapReady] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // 화면 방향 변경 감지
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      // 화면 방향이 변경되면 지도 재로드를 위한 키 업데이트
      setRetryKey(prev => prev + 1);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // 지도 로드 완료 콜백
  const handleMapReady = () => {
    setMapReady(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerText}>기프티콘 MAP</Text>
      </View>
      
      <View style={styles.mapContainer}>
        <KakaoMapView
          key={`map-view-${retryKey}`} // 화면 방향 변경 시 지도 리로드
          latitude={37.5665} // 구미2사업장 좌표
          longitude={126.978}
          level={5} // 확대 레벨
          height={height * 0.75} // 화면 높이의 75%
          width={'100%'}
          onMapReady={handleMapReady}
        />
        
        {!mapReady && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3396F4" />
            <Text style={styles.loadingText}>지도를 초기화하는 중입니다...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default MapScreen;