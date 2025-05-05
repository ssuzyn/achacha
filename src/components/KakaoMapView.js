import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { KAKAO_MAP_API_KEY, KAKAO_REST_API_KEY } from '@env';
import useLocationTracking from '../hooks/useLocationTracking';

const { width, height } = Dimensions.get('window');

const KakaoMapWebView = ({ uniqueBrands, selectedBrand }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const webViewRef = useRef(null);
  const { location, errorMsg } = useLocationTracking();
  const [debugMessage, setDebugMessage] = useState('');

  // 웹뷰에서 메시지를 받아 처리하는 함수
  const handleMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log(`[${data.type}] ${data.message}`);

      setDebugMessage(`마지막 메시지: [${data.type}] ${data.message || 'no message'}`);

      if (data.type === 'mapLoaded' && data.success) {
        setMapLoaded(true);
        console.log('맵 로드됨, 위치 정보:', location ? '있음' : '없음');

        setTimeout(() => {
          if (location) {
            console.log('위치 이동 시도...');
            moveToCurrentLocation();
          }
        }, 1000);
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
            
          // 사용자 현재 위치 표시  
          window.currentLocationMarker = new kakao.maps.Circle({
            center: new kakao.maps.LatLng(${latitude}, ${longitude}),
            radius: 8, // 실제 위치 표시는 더 작은 반경
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

  // 매장 검색 함수
  const searchNearbyStores = async () => {
    console.log('searchNearbyStores 시작');
    console.log('location:', location);
    console.log('uniqueBrands:', uniqueBrands);

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
        // console.log(`${brand.brandName} 검색 결과:`, data);

        return {
          brandId: brand.brandId,
          brandName: brand.brandName,
          stores: data.documents,
        };
      });

      const results = await Promise.all(searchPromises);
      // console.log('모든 검색 결과:', results);

      // WebView로 매장 데이터 전송
      updateMapMarkers(results);
    } catch (error) {
      console.error('매장 검색 실패:', error);
    }
  };

  // 지도에 마커 업데이트
  const updateMapMarkers = brandStores => {
    if (!webViewRef.current) return;

    const script = `
     (function() {
       if (window.storeMarkers) {
         window.storeMarkers.forEach(marker => marker.setMap(null));
         window.storeMarkers = [];
       }
       
       window.storeMarkers = [];
       const brandStores = ${JSON.stringify(brandStores)};
       
       brandStores.forEach(brandData => {
         brandData.stores.forEach(store => {
           const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'; // 추후 svg 파일로 변경 예정
           const imageSize = new kakao.maps.Size(24, 35);
           const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
           
           const marker = new kakao.maps.Marker({
             position: new kakao.maps.LatLng(store.y, store.x),
             title: store.place_name,
             image: markerImage 
           });
           
           // 마커에 브랜드 정보 저장
           marker.brandId = brandData.brandId;
           marker.brandName = brandData.brandName;
           
           // 마커 클릭 이벤트
           kakao.maps.event.addListener(marker, 'click', function() {
             window.ReactNativeWebView.postMessage(JSON.stringify({
               type: 'markerClick',
               store: store,
               brandId: brandData.brandId,
               brandName: brandData.brandName
             }));
           });
           
           marker.setMap(map);
           window.storeMarkers.push(marker);
         });
       });
     })();
     true;
    `;

    webViewRef.current.injectJavaScript(script);
  };

  // 선택된 브랜드에 따라 마커 필터링
  const filterMarkersByBrand = selectedBrandId => {
    if (!webViewRef.current) return;

    const script = `
     (function() {
       if (window.storeMarkers) {
         window.storeMarkers.forEach(marker => {
           if (${selectedBrandId === null} || marker.brandId === ${selectedBrandId}) {
             marker.setMap(map);
           } else {
             marker.setMap(null);
           }
         });
       }
     })();
     true;
   `;

    webViewRef.current.injectJavaScript(script);
  };

  // 위치가 변경되거나 브랜드 목록이 변경될 때 매장 검색 실행
  useEffect(() => {
    if (location && mapLoaded && uniqueBrands) {
      searchNearbyStores();
    }
  }, [location, mapLoaded, uniqueBrands]);

  // 선택된 브랜드가 변경될 때 마커 필터링
  useEffect(() => {
    if (mapLoaded) {
      filterMarkersByBrand(selectedBrand);
    }
  }, [selectedBrand, mapLoaded]);

  // 카카오맵 HTML 코드
  const htmlContent = `
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
     <title>카카오맵</title>
     <style>
       body, html { margin: 0; padding: 0; width: 100%; height: 100%; }
       #map { width: 100%; height: 100%; }
     </style>
   </head>
   <body>
     <div id="map"></div>

     <script>
       var map = null;
       var storeMarkers = [];
       
       function debugLog(message) {
         if (window.ReactNativeWebView) {
           window.ReactNativeWebView.postMessage(JSON.stringify({
             type: 'log',
             message: message
           }));
         }
       }

       function debugError(message) {
         if (window.ReactNativeWebView) {
           window.ReactNativeWebView.postMessage(JSON.stringify({
             type: 'error',
             message: message
           }));
         }
       }

       document.addEventListener('DOMContentLoaded', function() {
         debugLog('DOM 로드됨, 카카오맵 SDK 로드 시작...');
         
         const script = document.createElement('script');
         script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false';
         
         script.onload = function() {
           debugLog('카카오맵 SDK 스크립트 로드 완료');
           
           kakao.maps.load(function() {
             debugLog('카카오맵 SDK 초기화 완료, 지도 생성 시작');
             
             try {
               var mapContainer = document.getElementById('map');
               if (!mapContainer) {
                 debugError('맵 컨테이너를 찾을 수 없습니다.');
                 return;
               }
               
               var mapOption = { 
                 center: new kakao.maps.LatLng(37.566826, 126.9786567),
                 level: 3
               };

               debugLog('지도 생성 중...');
               map = new kakao.maps.Map(mapContainer, mapOption);
               
               debugLog('지도 생성 성공!');
               
               if (window.ReactNativeWebView) {
                 window.ReactNativeWebView.postMessage(JSON.stringify({
                   type: 'mapLoaded',
                   success: true,
                   message: '카카오맵 로드 완료'
                 }));
               }
             } catch (error) {
               debugError('지도 생성 중 오류: ' + error.message);
               
               if (window.ReactNativeWebView) {
                 window.ReactNativeWebView.postMessage(JSON.stringify({
                   type: 'mapLoaded',
                   success: false,
                   error: error.message
                 }));
               }
             }
           });
         };
         
         script.onerror = function(error) {
           debugError('카카오맵 SDK 로드 실패: ' + error);
         };
         
         document.head.appendChild(script);
       });
     </script>
   </body>
   </html>
 `;

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
        source={{ html: htmlContent }}
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
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

export default KakaoMapWebView;
