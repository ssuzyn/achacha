// 변경 후 최종 코드
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Dimensions, Text, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { KAKAO_REST_API_KEY } from '@env';
import useLocationTracking from '../../hooks/useLocationTracking';
import { updateMapMarkers, filterMarkersByBrand } from '../../utils/mapMarkerUtils';
import GeofencingService from '../../services/GeofencingService';
import { getKakaoMapHtml } from './KakaoMapHtml';

const { width } = Dimensions.get('window');
let geofencingServiceInstance = null;

const KakaoMapView = forwardRef(({ uniqueBrands, selectedBrand, onSelectBrand }, ref) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const webViewRef = useRef(null);
  const { location, errorMsg } = useLocationTracking();
  const [debugMessage, setDebugMessage] = useState('');
  const [prevLocation, setPrevLocation] = useState(null);
  const searchTimerRef = useRef(null);

  useEffect(() => {
    if (!geofencingServiceInstance && uniqueBrands) {
      geofencingServiceInstance = new GeofencingService(uniqueBrands);
      console.log('GeofencingService 인스턴스 생성 (싱글톤)');
    }
  }, [uniqueBrands]);

  useImperativeHandle(ref, () => ({
    moveToCurrentLocation: () => moveToCurrentLocation(),
  }));

  useEffect(() => {
    if (location) {
      geofencingServiceInstance.initGeofencing();
    }
  }, [location]);

  useEffect(() => {
    return () => {
      geofencingServiceInstance.cleanup();
    };
  }, []);

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

      if (data.type === 'markerClick') {
        const currentBrandId = selectedBrand !== null ? Number(selectedBrand) : null;
        const clickedBrandId = Number(data.brandId);

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

  useEffect(() => {
    if (location && mapLoaded && webViewRef.current) {
      console.log('위치 정보 변경됨, 맵 업데이트 시도');
      moveToCurrentLocation();
    }
  }, [location, mapLoaded]);

  const moveToCurrentLocation = () => {
    if (!location || !webViewRef.current) {
      console.log('위치 이동 불가: 위치 정보 또는 webViewRef 없음');
      return;
    }

    const { latitude, longitude } = location.coords;

    const script = `
      try {
        if (typeof kakao !== 'undefined' && kakao.maps) {
          var moveLatLng = new kakao.maps.LatLng(${latitude}, ${longitude});
          
          if (typeof map !== 'undefined') {
            map.setCenter(moveLatLng);
          
          if (window.currentLocationMarker) {
            window.currentLocationMarker.setMap(null);
          }
            
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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const debouncedSearchNearbyStores = () => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    console.log('디바운스 타이머 설정: 1초 후 검색 예정');
    searchTimerRef.current = setTimeout(() => {
      console.log('디바운스 타이머 만료: 검색 실행');
      searchNearbyStores();
    }, 1000);
  };

  const testFiltering = brandId => {
    if (!webViewRef.current) return;

    const script = `
    (function() {
      try {
        if (!window.brandMarkers) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            message: '브랜드 마커가 초기화되지 않았습니다'
          }));
          return;
        }
        
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'debug',
          message: '브랜드 마커 정보: ' + JSON.stringify(Object.keys(window.brandMarkers))
        }));
      } catch (error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'error',
          message: '필터링 테스트 오류: ' + error.message
        }));
      }
    })();
    true;
  `;

    webViewRef.current.injectJavaScript(script);
  };

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
        console.log(`${brand.brandName} 검색 결과: ${data.documents.length}개 매장 찾음`);

        return {
          brandId: brand.brandId,
          brandName: brand.brandName,
          stores: data.documents,
        };
      });

      const results = await Promise.all(searchPromises);
      console.log(
        '총 매장 수:',
        results.reduce((sum, brand) => sum + brand.stores.length, 0)
      );

      window.allStoreData = results;
      updateMapMarkers(webViewRef, results);

      if (!geofencingServiceInstance.initialized) {
        console.log('지오펜싱 재초기화 시도');
        await geofencingServiceInstance.initGeofencing();
      }

      console.log('지오펜스 설정 시작');
      geofencingServiceInstance.setupGeofences(results, selectedBrand);
      console.log('지오펜스 설정 완료');
    } catch (error) {
      console.error('매장 검색 실패:', error);
    }
  };

  useEffect(() => {
    if (location && mapLoaded && uniqueBrands) {
      const { latitude, longitude } = location.coords;

      const shouldSearchAgain =
        !prevLocation ||
        calculateDistance(prevLocation.latitude, prevLocation.longitude, latitude, longitude) > 100;

      if (shouldSearchAgain) {
        console.log('유의미한 위치 변경 감지: 100m 이상 이동');
        // 디바운스 적용하여 검색 실행
        debouncedSearchNearbyStores();
        setPrevLocation({ latitude, longitude });
      } else {
        console.log('작은 위치 변경 무시: 100m 이내 이동');
      }
    }
  }, [location, mapLoaded, uniqueBrands]);

  useEffect(() => {
    if (mapLoaded && webViewRef.current) {
      console.log('브랜드 선택 변경 감지:', selectedBrand);
      filterMarkersByBrand(webViewRef, selectedBrand);

      setTimeout(() => {
        testFiltering(selectedBrand);
      }, 500);
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
