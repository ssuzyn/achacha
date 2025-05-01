import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

/**
 * 사용자 위치 정보를 관리하는 커스텀 훅
 */
const useLocationTracking = () => {
  const [location, setLocation] = useState(null); // 현재 위치 정보
  const [errorMsg, setErrorMsg] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null); // 위치 권한 상태

  useEffect(() => {
    (async () => {
      // 위치 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setErrorMsg('위치 권한이 거부되었습니다.');
        return;
      }

      try {
        // 현재 사용자 위치 가져오기
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // 정확성
          timeInterval: 5000, // 업데이트 간 최소 대기 시간
        });

        setLocation(currentLocation);
        console.log('현재 위치:', currentLocation);
      } catch (error) {
        setErrorMsg('위치 정보를 가져오는데 실패했습니다: ' + error.message);
        console.error('위치 정보 오류:', error);
      }
    })();
  }, []);

  // 위치 변경 감지
  const startLocationTracking = async () => {
    if (permissionStatus !== 'granted') {
      setErrorMsg('위치 권한이 필요합니다.');
      return false;
    }

    try {
      // 위치 업데이트
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // 10초마다 업데이트
          distanceInterval: 100, // 100미터 이동마다 업데이트
        },
        newLocation => {
          setLocation(newLocation);
          console.log('위치 업데이트:', newLocation);
        }
      );

      return locationSubscription;
    } catch (error) {
      setErrorMsg('위치 추적 시작 중 오류: ' + error.message);
      console.error('위치 추적 오류:', error);
      return false;
    }
  };

  return {
    location,
    errorMsg,
    permissionStatus,
    startLocationTracking,
  };
};

export default useLocationTracking;
