import React from "react";
import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { KAKAO_MAP_API_KEY } from "@env";
import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { WebView } from "react-native-webview";

const KakaoMapView = ({
  latitude,
  longitude,
  level,
  width,
  height,
  onMapReady,
}) => {
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 디버깅을 위한 콘솔 로그 주입
  const injectedJavaScript = `
    console.log = function(message) {
      window.ReactNativeWebView.postMessage(JSON.stringify({type: 'console', message}));
    };
    console.error = function(message) {
      window.ReactNativeWebView.postMessage(JSON.stringify({type: 'error', message}));
    };
    true;
  `;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; }
          #map { width: 100%; height: 100%; }
        </style>
        <script defer src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY&autoload=false"></script>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // 디버깅용 타임아웃 - 5초 후에도 지도가 로드되지 않으면 오류 메시지 전송
          const timeout = setTimeout(() => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'timeout',
              message: 'Map initialization timed out'
            }));
          }, 5000);
          
          try {
            kakao.maps.load(function() {
              try {
                console.log('Kakao Map SDK loaded');
                const mapContainer = document.getElementById('map');
                const mapOption = { 
                  center: new kakao.maps.LatLng(${latitude}, ${longitude}),
                  level: ${level}
                };
                
                console.log('Creating map with options:', JSON.stringify(mapOption));
                const map = new kakao.maps.Map(mapContainer, mapOption);
                
                // 맵 생성 성공 시 타임아웃 제거
                clearTimeout(timeout);
                
                // 지도가 로드되었음을 알림
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'ready',
                  message: 'map_ready'
                }));
                
                console.log('Map initialization complete');
              } catch (e) {
                console.error('Error initializing map: ' + e.message);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'error',
                  message: e.message
                }));
              }
            });
          } catch (e) {
            console.error('Error loading Kakao Maps SDK: ' + e.message);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: e.message
            }));
          }
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "console") {
        console.log("WebView log:", data.message);
      } else if (data.type === "error") {
        console.error("WebView error:", data.message);
        setError(data.message);
      } else if (data.type === "timeout") {
        console.warn("WebView timeout:", data.message);
        setError("Map loading timed out. Please check your connection.");
      } else if (data.type === "ready") {
        console.log("Map is ready!");
        setIsLoading(false);
        onMapReady && onMapReady();
      }
    } catch (e) {
      console.log("Raw message from WebView:", event.nativeEvent.data);
    }
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setError(`WebView error: ${nativeEvent.description}`);
        }}
      />
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>오류: {error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  webView: {
    flex: 1,
  },
  errorContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 0, 0, 0.7)",
    padding: 10,
  },
  errorText: {
    color: "white",
    textAlign: "center",
  },
});

export default KakaoMapView;
