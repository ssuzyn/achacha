import apiClient from './apiClient';
import { API_CONFIG } from './config';

/**
 * 쉐어박스 API 서비스
 */
const shareBoxService = {
  /**
   * 사용자의 쉐어박스 목록 조회
   * @returns {Promise<Object>} - 쉐어박스 목록 조회 결과
   */
  async getShareBoxes() {
    try {
      console.log('[API] 쉐어박스 목록 조회 요청 시작');
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.SHARE_BOXES}`);
      console.log('[API] 쉐어박스 목록 조회 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('[API] 쉐어박스 목록 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 쉐어박스 생성
   * @param {Object} shareBoxData - 쉐어박스 정보
   * @returns {Promise<Object>} - 쉐어박스 생성 결과
   */
  async createShareBox(shareBoxData) {
    try {
      console.log('[API] 쉐어박스 생성 요청 시작:', shareBoxData);
      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.SHARE_BOXES}`, shareBoxData);
      console.log('[API] 쉐어박스 생성 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('[API] 쉐어박스 생성 실패:', error);
      throw error;
    }
  },

  /**
   * 쉐어박스 삭제
   * @param {number} shareBoxId - 쉐어박스 ID
   * @returns {Promise<Object>} - 쉐어박스 삭제 결과
   */
  async deleteShareBox(shareBoxId) {
    try {
      console.log('[API] 쉐어박스 삭제 요청 시작:', shareBoxId);
      const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.SHARE_BOXES}/${shareBoxId}`);
      console.log('[API] 쉐어박스 삭제 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('[API] 쉐어박스 삭제 실패:', error);
      throw error;
    }
  },

  /**
   * 쉐어박스 상세 조회
   * @param {number} shareBoxId - 쉐어박스 ID
   * @returns {Promise<Object>} - 쉐어박스 상세 조회 결과
   */
  async getShareBoxDetail(shareBoxId) {
    try {
      console.log('[API] 쉐어박스 상세 조회 요청 시작:', shareBoxId);
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.SHARE_BOXES}/${shareBoxId}`);
      console.log('[API] 쉐어박스 상세 조회 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('[API] 쉐어박스 상세 조회 실패:', error);
      throw error;
    }
  },
};

export default shareBoxService;
