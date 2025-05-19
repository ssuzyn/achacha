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
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.GIVE_AWAY_GIFTICON(gifticonId), {
        uuids,
      });

      if (!response || !response.data) {
        throw new Error('API 응답이 올바르지 않습니다.');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default giveAwayService;
