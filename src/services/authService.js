// - API 클라이언트를 활용하여 실제 인증 API 호출 함수 구현
// - 로그인, 로그아웃, 토큰 갱신, 사용자 정보 조회 등의 함수 제공

import apiClient from '../api/apiClient';
import { API_CONFIG } from '../api/config';

/**
 * 카카오 로그인 API 호출
 * @param {string} kakaoAccessToken - 카카오에서 받은 액세스 토큰
 * @returns {Promise} 서버 응답 데이터
 */
export const loginWithKakao = async kakaoAccessToken => {
  const response = await apiClient.post(API_CONFIG.ENDPOINTS.KAKAO_LOGIN, {
    kakaoAccessToken,
  });
  return response.data;
};

/**
 * 토큰 갱신 API 호출
 * @param {string} refreshToken - 리프레시 토큰
 * @returns {Promise} 새로운 액세스 토큰과 리프레시 토큰
 */
export const refreshTokens = async refreshToken => {
  const response = await apiClient.post(API_CONFIG.ENDPOINTS.REFRESH_TOKEN, {
    refreshToken,
  });
  return response.data;
};

/**
 * 사용자 정보 조회 API 호출
 * @returns {Promise} 사용자 정보
 */
export const getUserProfile = async () => {
  const response = await apiClient.get(API_CONFIG.ENDPOINTS.USER_PROFILE);
  return response.data;
};

/**
 * 로그아웃 API 호출
 * @returns {Promise} 로그아웃 결과
 */
export const logout = async () => {
  const response = await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT);
  return response.data;
};
