import apiClient from '../api/apiClient';
import { API_CONFIG } from '../api/config';

export const giveAwayService = {
  // 기프티콘 뿌리기 API
  giveAwayGifticon: async (gifticonId, uuids) => {
    if (!gifticonId) {
      throw new Error('기프티콘 ID가 필요합니다.');
    }

    if (!uuids || !Array.isArray(uuids) || uuids.length === 0) {
      throw new Error('유효한 사용자 ID 배열이 필요합니다.');
    }

    try {
      console.log('[API] 기프티콘 뿌리기 요청:', {
        gifticonId,
        uuids,
        endpoint: API_CONFIG.ENDPOINTS.GIVE_AWAY_GIFTICON(gifticonId),
      });

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.GIVE_AWAY_GIFTICON(gifticonId), {
        uuids,
      });

      if (!response || !response.data) {
        throw new Error('API 응답이 올바르지 않습니다.');
      }

      console.log('[API] 기프티콘 뿌리기 응답:', {
        status: response.status,
        data: response.data,
        headers: response.headers,
      });

      return response.data;
    } catch (error) {
      console.error('[API] 기프티콘 뿌리기 실패:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
        endpoint: error.config?.url,
      });
      throw error;
    }
  },
};

export default giveAwayService;
