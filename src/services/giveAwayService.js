import apiClient from '../api/apiClient';
import { API_CONFIG } from '../api/config';

export const giveAwayService = {
  // 기프티콘 뿌리기 API
  giveAwayGifticon: async (gifticonId, userIds) => {
    try {
      console.log('[API] 기프티콘 뿌리기 요청:', {
        gifticonId,
        userIds,
      });

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.GIVE_AWAY_GIFTICON(gifticonId), {
        userIds,
      });

      console.log('[API] 기프티콘 뿌리기 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('[API] 기프티콘 뿌리기 실패:', error);
      throw error;
    }
  },
};

export default giveAwayService;
