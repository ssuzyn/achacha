import React, { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import { KAKAO_MAP_API_KEY } from "@env";

const { width, height } = Dimensions.get("window");

const KakaoMapWebView = () => {
  const [mapLoaded, setMapLoaded] = useState(false);

  // 웹뷰에서 메시지를 받아 처리하는 함수
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      console.log(`[${data.type}] ${data.message}`);

      if (data.type === "mapLoaded" && data.success) {
        setMapLoaded(true);
      }
    } catch (error) {
      console.error("메시지 파싱 오류:", error);
    }
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
        // 디버그 메시지 표시 함수 - 콘솔 로그만 표시
        function debugLog(message) {
          // 메시지를 React Native로 전송
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'log',
              message: message
            }));
          }
        }

        // 에러 메시지 표시 함수
        function debugError(message) {
          // 에러를 React Native로 전송
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: message
            }));
          }
        }

        // 페이지 로드 완료 시 지도 초기화
        document.addEventListener('DOMContentLoaded', function() {
          // 카카오맵 SDK 스크립트 로드
          const script = document.createElement('script');
          script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false';
          
          script.onload = function() {
            debugLog('카카오맵 SDK 스크립트 로드 완료, 초기화 시작...');
            
            kakao.maps.load(function() {
              // SDK 로드 후 지도 초기화
              try {
                var mapContainer = document.getElementById('map');
                if (!mapContainer) {
                  debugError('맵 컨테이너를 찾을 수 없습니다.');
                  return;
                }
                
                var mapOption = { 
                  center: new kakao.maps.LatLng(36.1073502, 128.4152258),
                  level: 3
                };

                debugLog('지도 생성 중...');
                var map = new kakao.maps.Map(mapContainer, mapOption);
                
                debugLog('지도 생성 성공!');
                
                // 지도 로드 성공 메시지 전송
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'mapLoaded',
                    success: true
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
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("WebView 오류:", nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("HTTP 오류:", nativeEvent);
        }}
      />
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
});

export default KakaoMapWebView;
