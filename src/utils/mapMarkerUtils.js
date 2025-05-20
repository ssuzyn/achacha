// 지도에 마커 업데이트
export const updateMapMarkers = (webViewRef, brandStores, selectedBrandId) => {
  if (!webViewRef.current) return;

  const script = `
      (function() {
        try {
          // 전역 변수로 브랜드별 마커 그룹 저장
          window.brandMarkers = {};
          
          // 기존 마커가 있으면 모두 제거
          if (window.allMarkers) {
            window.allMarkers.forEach(marker => marker.setMap(null));
          }
          
          window.allMarkers = [];
          
          // 브랜드별로 마커 생성 및 저장
          const brandStoresData = ${JSON.stringify(brandStores)};
          const currentSelectedBrandId = ${selectedBrandId === null || selectedBrandId === undefined ? 'null' : Number(selectedBrandId)};
          
          brandStoresData.forEach(brandData => {
            const brandId = Number(brandData.brandId);
            
            // 이 브랜드의 마커 배열 초기화
            window.brandMarkers[brandId] = [];
            
            brandData.stores.forEach(store => {
              const marker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(store.y, store.x),
                title: store.place_name,
                image: new kakao.maps.MarkerImage(
                  'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                  new kakao.maps.Size(24, 35)
                )
              });
              
              // 마커에 브랜드 정보 저장
              marker.brandId = brandId;
              marker.brandName = brandData.brandName;
              
              // 클릭 이벤트 추가
              kakao.maps.event.addListener(marker, 'click', function() {
                console.log('마커 클릭:', brandId, brandData.brandName);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'markerClick',
                  store: store,
                  brandId: brandId,
                  brandName: brandData.brandName
                }));
              });
              
              // 선택된 브랜드에 따라 마커 표시 여부 결정
              if (currentSelectedBrandId === null || Number(marker.brandId) === currentSelectedBrandId) {
                marker.setMap(map);
              } else {
                marker.setMap(null);
              }
              
              // 브랜드별 배열과 전체 배열에 추가
              window.brandMarkers[brandId].push(marker);
              window.allMarkers.push(marker);
            });
          });
          
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markersCreated',
            message: \`총 \${window.allMarkers.length}개의 마커 생성됨 (필터 적용됨)\`
          }));
        } catch (error) {
          console.error('마커 생성 중 오류:', error);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            message: '마커 생성 오류: ' + error.message
          }));
        }
      })();
      true;
    `;

  webViewRef.current.injectJavaScript(script);
};

// 선택된 브랜드에 따라 마커 필터링
export const filterMarkersByBrand = (webViewRef, selectedBrandId) => {
  if (!webViewRef.current) return;

  const script = `
      (function() {
        try {
          // 선택된 브랜드 ID (null 또는 숫자)
          const selectedId = ${selectedBrandId === null ? 'null' : Number(selectedBrandId)};
          
          // brandMarkers가 없으면 초기화되지 않은 것
          if (!window.brandMarkers) {
            console.error('브랜드 마커가 초기화되지 않았습니다');
            return;
          }
          
          // 모든 마커 숨기기
          if (window.allMarkers) {
            window.allMarkers.forEach(marker => marker.setMap(null));
          }
          
          // 선택에 따라 마커 표시
          if (selectedId === null) {
            // 선택 없을 경우: 모든 마커 표시
            console.log('선택 없음: 모든 마커 표시');
            window.allMarkers.forEach(marker => marker.setMap(map));
          } else {
            // 특정 브랜드 선택: 해당 브랜드의 마커만 표시
            console.log('브랜드 선택:', selectedId, '의 마커만 표시');
            
            const selectedMarkers = window.brandMarkers[selectedId] || [];
            selectedMarkers.forEach(marker => marker.setMap(map));
          }
          
          // 필터링 결과 전송
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'filterComplete',
            selectedBrandId: selectedId,
            message: selectedId === null 
              ? '모든 마커를 표시합니다' 
              : \`브랜드 ID \${selectedId}의 마커만 표시합니다\`
          }));
        } catch (error) {
          console.error('필터링 중 오류:', error);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            message: '필터링 오류: ' + error.message
          }));
        }
      })();
      true;
    `;

  webViewRef.current.injectJavaScript(script);
};
