import axios from 'axios';
import { API_CONFIG } from '../constants/config'; // 설정 파일 import 경로 변경
import AsyncStorage from '@react-native-async-storage/async-storage';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,   // 설정 파일에서 Base URL 가져오기
  timeout: API_CONFIG.TIMEOUT,     // 설정 파일에서 Timeout 가져오기
  headers: {
    'Content-Type': 'application/json',
    // 필요에 따라 다른 기본 헤더를 여기에 추가할 수 있습니다.
    // 예: 'X-Custom-Header': 'someValue'
  },
});

// (옵션) 요청 인터셉터: 모든 요청에 공통 로직을 추가할 때 유용합니다.
// 예를 들어, 모든 요청 헤더에 인증 토큰(JWT)을 자동으로 추가할 수 있습니다.
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (e) {
      // 토큰 읽기 실패 시 아무것도 하지 않음
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// (옵션) 응답 인터셉터: 모든 응답에 공통 로직을 추가할 때 유용합니다.
// 예를 들어, 특정 API 에러 코드(예: 401 Unauthorized)를 감지하여 자동으로 로그아웃 처리 등을 할 수 있습니다.
/*
apiClient.interceptors.response.use(
  (response) => {
    // 정상 응답은 그대로 반환
    return response;
  },
  (error) => {
    // if (error.response && error.response.status === 401) {
    //   // 예: 토큰 만료 또는 인증 실패 시 로그아웃 처리 로직
    //   console.log('Unauthorized! Logging out...');
    //   // 여기서 로그아웃 함수를 호출하거나, 로그인 화면으로 리디렉션할 수 있습니다.
    // }
    return Promise.reject(error);
  }
);
*/

export default apiClient; 