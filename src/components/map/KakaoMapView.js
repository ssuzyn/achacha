import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Dimensions, Text, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { KAKAO_REST_API_KEY } from '@env';
import useLocationTracking from '../../hooks/useLocationTracking';
import { updateMapMarkers, filterMarkersByBrand } from '../../utils/mapMarkerUtils';
import GeofencingService from '../../services/GeofencingService';
import { getKakaoMapHtml } from './KakaoMapHtml';

const { width } = Dimensions.get('window');

const KakaoMapView = forwardRef(({ uniqueBrands, selectedBrand, onSelectBrand }, ref) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const webViewRef = useRef(null);
  const { location, errorMsg } = useLocationTracking();
  const [debugMessage, setDebugMessage] = useState('');
  const geofencingService = new GeofencingService(uniqueBrands);
  const [prevLocation, setPrevLocation] = useState(null); // 이전 위치 저장 - 위치 변화량을 계산하는 데 사용
  const searchTimerRef = useRef(null); // 디바운스 처리를 위한 타이머 참조 - 연속적인 위치 업데이트 최적화에 사용

  // mapScreen의 moveToCurrentLocation에 접근
  useImperativeHandle(ref, () => ({
    moveToCurrentLocation: () => moveToCurrentLocation(),
  }));

  // 위치 정보가 확인된 후에만 지오펜싱 초기화
  useEffect(() => {
    if (location) {
      geofencingService.initGeofencing();
    }
  }, [location]);

  // 컴포넌트 언마운트 시 지오펜싱 정리
  useEffect(() => {
    return () => {
      geofencingService.cleanup();
    };
  }, []);

  // 웹뷰에서 메시지를 받아 처리하는 함수
  const handleMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      setDebugMessage(`마지막 메시지: [${data.type}] ${data.message || 'no message'}`);

      if (data.type === 'mapLoaded' && data.success) {
        setMapLoaded(true);
        console.log('맵 로드됨, 위치 정보:', location ? '있음' : '없음');

        setTimeout(() => {
          if (location) {
            moveToCurrentLocation();
          }
        }, 1000);
      }

      // 마커 클릭 이벤트
      if (data.type === 'markerClick') {
        // 타입 변환 처리
        const currentBrandId = selectedBrand !== null ? Number(selectedBrand) : null;
        const clickedBrandId = Number(data.brandId);

        // 부모 컴포넌트로 브랜드 id 전달
        if (currentBrandId === clickedBrandId) {
          console.log('같은 브랜드 다시 클릭: 선택 해제');
          onSelectBrand(null);
        } else {
          console.log('새 브랜드 선택:', clickedBrandId);
          onSelectBrand(clickedBrandId);
        }
      }
    } catch (error) {
      console.error('메시지 파싱 오류:', error);
      setDebugMessage(`메시지 파싱 오류: ${error.message}`);
    }
  };

  // 위치 정보가 변경될 때마다 실행
  useEffect(() => {
    if (location && mapLoaded && webViewRef.current) {
      console.log('위치 정보 변경됨, 맵 업데이트 시도');
      moveToCurrentLocation();
    }
  }, [location, mapLoaded]);

  // 현재 위치로 맵 이동하는 함수
  const moveToCurrentLocation = () => {
    if (!location || !webViewRef.current) {
      console.log('위치 이동 불가: 위치 정보 또는 webViewRef 없음');
      return;
    }

    const { latitude, longitude } = location.coords;
    console.log(`위치 이동 시도: ${latitude}, ${longitude}`);

    const script = `
      try {
        if (typeof kakao !== 'undefined' && kakao.maps) {
          var moveLatLng = new kakao.maps.LatLng(${latitude}, ${longitude});
          
          if (typeof map !== 'undefined') {
            map.setCenter(moveLatLng);
          
          if (window.currentLocationMarker) {
            window.currentLocationMarker.setMap(null);
          }
            
          // 사용자 현재 위치 표시  
          window.currentLocationMarker = new kakao.maps.Circle({
            center: new kakao.maps.LatLng(${latitude}, ${longitude}),
            radius: 8, 
            strokeWeight: 10,
            strokeColor: '#4A90E2',
            strokeOpacity: 1,
            fillColor: '#FFFFFF',
            fillOpacity: 1
          });
          window.currentLocationMarker.setMap(map);
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'moveSuccess',
              message: '현재 위치로 이동 완료: ' + ${latitude} + ', ' + ${longitude}
            }));
          }
        }
      } catch (error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'error',
          message: '현재 위치 표시 실패: ' + error.message
        }));
      }
      true;
    `;

    webViewRef.current.injectJavaScript(script);
  };

  // 일정 거리 이상 이동 시 위치 변경을 감지하기 위한 거리 계산 함수
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// 디바운스 함수
const debouncedSearchNearbyStores = () => {
  if (searchTimerRef.current) {
    clearTimeout(searchTimerRef.current);
  }
  
  searchTimerRef.current = setTimeout(() => {
    searchNearbyStores();
  }, 1000); // 1초 디바운스
};

  // 매장 검색 함수
  const searchNearbyStores = async () => {
    if (!location || !uniqueBrands || uniqueBrands.length === 0) {
      console.log('조건 미충족으로 리턴');
      return;
    }

    const { latitude, longitude } = location.coords;
    console.log(`검색 위치: ${latitude}, ${longitude}`);

    try {
      const searchPromises = uniqueBrands.map(async brand => {
        console.log(`브랜드 검색 중: ${brand.brandName}`);
        const response = await fetch(
          `https://dapi.kakao.com/v2/local/search/keyword.json?` +
            `query=${encodeURIComponent(brand.brandName)}&` +
            `x=${longitude}&` +
            `y=${latitude}&` +
            `radius=500&` +
            `sort=distance`,
          {
            headers: {
              Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
            },
          }
        );

        if (!response.ok) {
          console.error(`API 응답 오류: ${response.status}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
          brandId: brand.brandId,
          brandName: brand.brandName,
          stores: data.documents,
        };
      });

      const results = await Promise.all(searchPromises);

      // 전체 매장 데이터 저장(지오펜스 재설정에 사용)
      window.allStoreData = results;

      // WebView로 매장 데이터 전송
      updateMapMarkers(webViewRef, results);

      // 모든 매장에 대한 지오펜스 설정
      geofencingService.setupGeofences(results, selectedBrand);
    } catch (error) {
      console.error('매장 검색 실패:', error);
    }
  };

  // 위치가 변경되거나 브랜드 목록이 변경될 때 매장 검색 실행
  useEffect(() => {
    // 초기 검색 여부와 상관없이 위치가 변경될 때마다 매장 검색 실행
    if (location && mapLoaded && uniqueBrands) {
      console.log('위치 변경 감지: 주변 매장 재검색');
      searchNearbyStores();
    }
  }, [location, mapLoaded, uniqueBrands]);

  // 선택된 브랜드가 변경될 때는 필터링, 지오펜스 재설정
  useEffect(() => {
    if (mapLoaded && webViewRef.current) {
      filterMarkersByBrand(webViewRef, selectedBrand);

      // 모든 매장 데이터가 있으면 지오펜스도 재설정
      if (window.allStoreData) {
        geofencingService.setupGeofences(window.allStoreData, selectedBrand);
      }
    }
  }, [selectedBrand, mapLoaded]);

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: getKakaoMapHtml() }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        onError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView 오류:', nativeEvent);
        }}
        onHttpError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          console.error('HTTP 오류:', nativeEvent);
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 'auto',
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  webView: {
    flex: 1,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffeeee',
    borderRadius: 5,
    margin: 10,
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
  },
});

export default KakaoMapView;
