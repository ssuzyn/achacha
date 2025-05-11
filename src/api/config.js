// 공통 설정 값만 해당 파일에 추가해서 사용

const PRODUCTION_BASE_URL = 'https://k12d205.p.ssafy.io/'; // 실제 운영 서버

export const API_CONFIG = {
  BASE_URL: PRODUCTION_BASE_URL,
  ENDPOINTS: {
    // 인증 관련 엔드포인트
    KAKAO_LOGIN: '/api/auth/kakao', // 카카오 로그인
    LOGOUT: '/api/auth/logout', // 로그아웃
    REFRESH_TOKEN: '/api/auth/refresh', // 토큰 갱신
    USER_PROFILE: '/api/users/me', // 사용자 정보 조회

    // 기타 엔드포인트들을 여기에 추가합니다.
    // 예: GET_USERS: '/api/users',
    //     CREATE_USER: '/api/users',
  },
  TIMEOUT: 5000, // API 요청 타임아웃 시간을 5초로 설정
};
