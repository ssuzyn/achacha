// src/constants/config.js

// TODO: 실제 운영 API 기본 URL을 확인해주세요.
const PRODUCTION_BASE_URL = 'https://k12d205.p.ssafy.io/'; // 실제 운영 서버

export const API_CONFIG = {
  BASE_URL: PRODUCTION_BASE_URL,
  ENDPOINTS: {
    // 인증 관련 (useAuth.js에서 사용하는 엔드포인트)
    KAKAO_LOGIN: '/api/auth/kakao', // ← 실제 백엔드 경로로 수정

    // 필요에 따라 다른 엔드포인트들을 여기에 추가합니다.
    // 예: GOOGLE_LOGIN: '/auth/google',
    //     GET_USER_PROFILE: '/users/me',
  },
  TIMEOUT: 5000, // API 요청 타임아웃 시간을 5초로 수정
}; 