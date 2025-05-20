// 지도에 마커 업데이트
export const updateMapMarkers = (webViewRef, brandStores, selectedBrandId) => {
  const markerImageBase64 =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAABICAYAAAC0hqYWAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATnSURBVHgB3Zs/jNNIFMaffQsksMWmgjJI9LdXg4RTQXcnQUO1oUc6qKA7U1KRk6C+bA/SldCwpqC+0CPhq45uo9PqOP6ted9kxjiOHc94xonDT/LGdmxnPr/vjcczsx454G0Q7Ox43o+UJLu8qZYdXvqZw6a8xHKZkOdNpkny8nwUTckBHllwOBhc5sKH9K3gdYh4GfeiaJ8sMBYi7j7Rr7x6m+oXvoiYlzH5/rj34sXfZIiRkMMg2OOPEbkVkCfGb3CEfjc5SUvIP0HQ7xD9wasBrY6YoxPoRsevOgB5wCIOaLUiQJ+OjyfSBZUsFSIukiQRzdc+qwQWHnM5fqs6sNRa8k6MqT2EnDf3y74sFMJ2+pkj8Se1j9tllcCCEJnYf1GzNVN9PC/oHRy8zO9eyBGZ2O0UAZIEObNQvjkhMqn61G76vCwkf2otaam3ZIF/9ix1hkM6cekSedvb9HkyofePHontU9evi31f3ryhD0+e0Mfnz8mKnMVSIRwNPPCGVBOI2B6NyD93Tut4CPzw9ClZEHHiD9Lfxx9EgyxEgK3d3VQE7jgKmhwdpd+rfcfv3oltRM6SQDRa1e+LixJdJksgBKDw7x8/FusQBksBtQ/2ggh84nslrBZJ8gv/FfbakrtCMsA7c4Z+uHBhfh8XLC3o3p7IBeSGQu07efXqrAwsGHbEkuXz69dkwJBT4j5bbOqZJvmJixfp9L17acFdgwri6M4d/RNk0vumtureutWYCACLnrxyRf+Emb2EtQIyIJvQVbXOqWvX0hz598aNyutuP3yYrhsgkhNC+lQDeLwqUbO1llVSL6ePP7WFwAIdjWMUSPZlWNi1L87nrE9MzkL4swVsAtjQJIId3+9vkSH/PXgg7m72AVj2o7jL6k7rHIMa6//9/Vo2NI6IAmLU07nsDmaPmQ4Ghdc5ffeueLbg/KoKobQsHBE0UWLacLrcQQEhTnr61ogoP4RMaLMR5f+OhHBnMm0ynhfhw+e2CpqbG5snHRkIvzfr1t/UqEy6sktVdT60sQ9Lh7FaUUIwNrFx9uIHYRoA0USBvfgJD3sFuhfJtmzRXM9upxfXaDTm3zQNiLqZnvpvbS3PC2WHtRZ4bVWod45lVHU2oJ1lyDi7MddlylE5JINeRrz2QoThi9ACH589Ey9pRVEtIeblp15m/DHf+sVoVEiafHr1SixrIOrlBlHzfb/o6W590nOSh/l9c0KkyhG1m3G3YDiuaMSq1VEpigZYENLyqBRGA5SNIbYyKmXRAIVCWhqV0miAZaO6rYrKsmiAUiEti8rSaICqCQOISkzrJa6KBlgqREYlpPUy6mpM49Cai8JtsHVM4QAx38zzOgdWzkURoGW8HkLdA7WEyNHTVSe+0WQ0vYjMwDyQVVXHU50Ez6ItZMWJr5XgWYynAq4g8bUTPIuJtRQ3qUHYUgHVwFgI362YmrOYsaUUdSICmnjixzSrUGpRS4hIfM8bklvCnsVk5roRcf1ssZ7AXFuIBFaIyY7Y9JlRhJUQRxYL6yZ4FtuI2FrM2lIKayGSOhZzYimFEyE1LebEUgpXETG1mDNLKZwJkehYzKmlFE6FaFrMqaUUriNSZTHnllI4FwK4sJjLlx+5acRSikaECGYWy7adbjZhKUVjQthiGL8P5Sb+1SiiTQYzvIsm5bvmK6QD2syhqkIbAAAAAElFTkSuQmCC';

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
                  '${markerImageBase64}',
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
