import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { KAKAO_MAP_API_KEY } from '@env';
import useLocationTracking from '../hooks/useLocationTracking';

const { width, height } = Dimensions.get('window');

const KakaoMapWebView = () => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const webViewRef = useRef(null);
  const { location, errorMsg } = useLocationTracking();
  const [debugMessage, setDebugMessage] = useState(''); // 디버깅용

  // 웹뷰에서 메시지를 받아 처리하는 함수
  const handleMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log(`[${data.type}] ${data.message}`);

      // 디버깅을 위해 상태에 저장
      setDebugMessage(`마지막 메시지: [${data.type}] ${data.message || 'no message'}`);

      if (data.type === 'mapLoaded' && data.success) {
        setMapLoaded(true);
        console.log('맵 로드됨, 위치 정보:', location ? '있음' : '없음');

        // 지연 후 위치 이동 시도 (맵이 완전히 렌더링될 시간 확보)
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

    // 자바스크립트 eval 확인을 위한 추가 코드
    const checkScript = `
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'debug',
        message: '스크립트 실행 체크: kakao 객체 유무=' + (typeof kakao !== 'undefined')
      }));
    `;
    webViewRef.current.injectJavaScript(`${checkScript}; true;`);

    // 지도 이동 스크립트
    const script = `
      try {
        if (typeof kakao !== 'undefined' && kakao.maps) {
          var moveLatLng = new kakao.maps.LatLng(${latitude}, ${longitude});
          
          // 전역 맵 객체 확인
          if (typeof map !== 'undefined') {
            map.setCenter(moveLatLng);
            
            // 기존 마커 제거 (중복 방지)
            if (window.currentMarker) {
              window.currentMarker.setMap(null);
            }
            
            // 현재 위치 마커 추가
            var markerPosition = new kakao.maps.LatLng(${latitude}, ${longitude});
            window.currentMarker = new kakao.maps.Marker({
              position: markerPosition
            });
            window.currentMarker.setMap(map);
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'moveSuccess',
              message: '현재 위치로 이동 완료: ' + ${latitude} + ', ' + ${longitude}
            }));
          } else {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: 'map 객체가 정의되지 않았습니다.'
            }));
          }
        } else {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            message: 'kakao 객체가 정의되지 않았습니다.'
          }));
        }
      } catch (error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'error',
          message: '현재 위치로 이동 실패: ' + error.message
        }));
      }
      true;
    `;

    webViewRef.current.injectJavaScript(script);
  };

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
      <!-- 지도를 표시할 div -->
      <div id="map"></div>

      <script>
        // 전역 맵 변수 선언
        var map = null;
        
        // 디버그 메시지 표시 함수
        function debugLog(message) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'log',
              message: message
            }));
          }
        }

        // 에러 메시지 표시 함수
        function debugError(message) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: message
            }));
          }
        }

        // 페이지 로드 완료 시 지도 초기화
        document.addEventListener('DOMContentLoaded', function() {
          debugLog('DOM 로드됨, 카카오맵 SDK 로드 시작...');
          
          // 카카오맵 SDK 스크립트 로드
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
                
                // 초기 지도 옵션 (나중에 현재 위치로 업데이트됨)
                var mapOption = { 
                  center: new kakao.maps.LatLng(37.566826, 126.9786567), // 서울 시청 (기본값)
                  level: 3
                };

                debugLog('지도 생성 중...');
                map = new kakao.maps.Map(mapContainer, mapOption);
                
                debugLog('지도 생성 성공!');
                
                // 지도 로드 성공 메시지 전송
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'mapLoaded',
                    success: true,
                    message: '카카오맵 로드 완료'
                  }));
                }
              } catch (error) {
                debugError('지도 생성 중 오류: ' + error.message);
                
                // 지도 로드 실패 메시지 전송
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

      {/* 디버그용 정보 표시 (개발 중 확인용) */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>
          맵 로드: {mapLoaded ? '완료' : '대기중'} | 위치:{' '}
          {location
            ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
            : '없음'}
        </Text>
        <Text style={styles.debugText}>{debugMessage}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height * 0.9,
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
  debugContainer: {
    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  debugText: {
    color: '#fff',
    fontSize: 10,
  },
});

export default KakaoMapWebView;
