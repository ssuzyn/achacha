import apiClient from '../api/apiClient';
import { BASE_URL, API_CONFIG, handleApiError, endpointUrl } from '../api/config';
import authService from '../api/authService';

const giveAwayService = {
  /**
   * 기프티콘 뿌리기 API 호출
   * @param {number} gifticonId - 뿌릴 기프티콘 ID
   * @param {Array<number>} userIds - 주변에 있는 사용자 ID 목록
   * @returns {Promise} API 응답
   */
  giveAwayGifticon: async (gifticonId, userIds) => {
    try {
      const token = await authService.getAccessToken();

      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      // API URL 생성
      const apiUrl = endpointUrl(BASE_URL, API_CONFIG.ENDPOINTS.GIVE_AWAY_GIFTICON(gifticonId));

      // 디버깅 로그 추가
      console.log('기프티콘 뿌리기 요청 URL:', apiUrl);
      console.log('요청 데이터:', { gifticonId, userIds });

      // apiClient를 사용하여 API 호출
      const response = await apiClient.post(
        apiUrl,
        { userIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('기프티콘 뿌리기 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('기프티콘 뿌리기 API 오류:', error);
      const errorInfo = handleApiError(error);

      // 에러 로깅 및 처리
      console.error(`기프티콘 뿌리기 실패: ${errorInfo.message}`);
      console.error('에러 상세 정보:', {
        url: endpointUrl(BASE_URL, API_CONFIG.ENDPOINTS.GIVE_AWAY_GIFTICON(gifticonId)),
        gifticonId,
        userIds,
        error: error.response ? error.response.data : error.message,
      });

      throw error;
    }
  },
};

export default giveAwayService;
