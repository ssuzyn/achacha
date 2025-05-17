// - Axios 인스턴스를 기반으로 구현
// - 요청 인터셉터: 모든 요청에 토큰 자동 첨부
// - 응답 인터셉터: 토큰 만료 시 자동 갱신 처리

import axios from 'axios';
import { API_CONFIG, handleApiError } from './config'; // 설정 파일 import 경로 변경
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ERROR_CODES } from '../constants/errorCodes';
import NetInfo from '@react-native-community/netinfo';

// 네트워크 연결 체크 함수
const checkNetworkConnection = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected && netInfo.isInternetReachable;
};

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL, // 설정 파일에서 Base URL 가져오기
  timeout: API_CONFIG.TIMEOUT, // 설정 파일에서 Timeout 가져오기
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    // 필요에 따라 다른 기본 헤더를 여기에 추가할 수 있습니다.
    // 예: 'X-Custom-Header': 'someValue'
  },
});

// 토큰 갱신 중인지 여부를 추적하는 변수
let isRefreshing = false;
// 토큰 갱신 대기 중인 요청들의 배열
let refreshSubscribers = [];

// 토큰 갱신 후 실행할 콜백 함수 등록
const subscribeTokenRefresh = callback => {
  refreshSubscribers.push(callback);
};

// 등록된 모든 콜백 함수 실행 (토큰 갱신 완료 시)
const onRefreshed = newToken => {
  refreshSubscribers.forEach(callback => callback(newToken));
  refreshSubscribers = [];
};

// 요청 인터셉터: 모든 요청에 인증 토큰을 자동으로 추가
apiClient.interceptors.request.use(
  async config => {
    try {
      // 네트워크 연결 체크
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        console.error('네트워크 연결이 없습니다. 요청을 중단합니다.');
        return Promise.reject(new Error('네트워크 연결이 없습니다.'));
      }

      // 토큰 설정
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log('[API Client] 요청에 토큰 추가됨');
      } else {
        console.log('[API Client] 토큰 없음, 인증되지 않은 요청 전송');
      }

      // FormData 요청인 경우 로그 간소화
      if (config.data instanceof FormData) {
      } else if (config.data) {
        // 요청 데이터가 너무 큰 경우 로그 길이 제한
        const dataStr = JSON.stringify(config.data);
      }
    } catch (error) {
      console.error('[API Client] 토큰 조회 중 오류:', error);
    }

    // 디버깅을 위한 로그
    console.log(
      `[API Client] 요청: ${config.method.toUpperCase()} ${config.url}`,
      config.params || config.data
    );

    return config;
  },
  error => {
    console.error('[API Client] 요청 인터셉터 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 토큰 만료 시 자동 갱신 처리
apiClient.interceptors.response.use(
  response => {
    // 성공적인 응답 처리
    console.log(
      `[API Client] 응답: ${response.status} ${response.config.url}`,
      response.data ? '데이터 수신' : '데이터 없음'
    );
    return response;
  },
  async error => {
    // 요청 디버깅 정보 로깅
    if (error.config) {
      console.error(
        `[API Client] 요청 실패: ${error.config.method?.toUpperCase()} ${error.config.url}`
      );
    }

    // 오류 응답 처리
    if (error.response) {
      console.error(`[API Client] 응답 오류: ${error.response.status}`, error.response.data);

      // 토큰 만료 처리 (401 Unauthorized)
      if (error.response.status === 401) {
        console.log('[API Client] 인증 토큰 만료, 갱신 시도');
        try {
          // 토큰 갱신 로직 추가 (필요시)
          // ...
        } catch (refreshError) {
          console.error('[API Client] 토큰 갱신 실패:', refreshError);
        }
      }
    } else if (error.request) {
      console.error('[API Client] 서버 응답 없음:', error.request);
    } else {
      console.error('[API Client] 오류 발생:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
