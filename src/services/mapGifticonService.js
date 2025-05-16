import axios from 'axios';
import { BASE_URL, API_CONFIG, handleApiError, endpointUrl } from '../api/config';
import authService from '../api/authService';

const mapGifticonService = {
  // 지도에서 사용 가능한 기프티콘 목록 조회
  getMapGifticons: async (additionalParams = {}) => {
    try {
      const token = await authService.getAccessToken();

      // 개발 환경에서 토큰이 없을 경우 임시 토큰 생성
      const authToken = token || authService.generateDevToken();

      // API URL 생성
      const apiUrl = endpointUrl(BASE_URL, API_CONFIG.ENDPOINTS.GET_GIFTICONS);

      // 디버깅 로그 추가
      console.log('기프티콘 목록 조회 요청 URL:', apiUrl);
      console.log('요청 파라미터:', additionalParams);

      // API 호출
      const response = await axios.get(apiUrl, {
        headers: {
          ...API_CONFIG.headers,
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          // 고정 파라미터
          scope: 'MY_BOX',
          type: 'PRODUCT',
          sort: 'EXPIRY_ASC',
          size: 100,
          ...additionalParams,
        },
        timeout: API_CONFIG.TIMEOUT,
      });

      console.log('기프티콘 목록 조회 응답:', response.data);
      console.log('[mapGifticonService] Authorization:', `Bearer ${authToken}`);
      return response.data;
    } catch (error) {
      console.error('기프티콘 목록 조회 API 오류:', error);
      const errorInfo = handleApiError(error);

      // 에러 로깅 및 처리
      console.error(`기프티콘 목록 조회 실패: ${errorInfo.message}`);
      console.error('에러 상세 정보:', {
        url: endpointUrl(BASE_URL, API_CONFIG.ENDPOINTS.GET_GIFTICONS),
        params: additionalParams,
        error: error.response ? error.response.data : error.message,
      });

      // 에러가 발생했을 때 빈 배열을 반환하여 앱이 크래시되지 않도록 합니다.
      return [];
    }
  },
};

export default mapGifticonService;
