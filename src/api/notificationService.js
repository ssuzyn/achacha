import apiClient from './apiClient';
import { API_CONFIG } from './config';
import gifticonService from './gifticonService';

/**
 * 알림 설정 관련 기능을 제공하는 서비스
 *
 * API 엔드포인트:
 * - GET /api/notification-settings - 알림 설정 목록 조회
 * - PATCH /api/notifications-settings/types/{type} - 알림 타입별 활성화/비활성화
 * - PATCH /api/notifications-settings/expiration-cycle - 알림 주기 설정
 * - GET /api/notifications - 알림 내역 목록 조회
 * - GET /api/notifications/count - 미확인 알림 개수 조회
 * - PATCH /api/notifications/read - 알림 읽음 일괄 처리
 */
const notificationService = {
  /**
   * 알림 설정 목록 조회
   * @returns {Promise<Array>} 알림 설정 목록
   */
  async getNotificationSettings() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.NOTIFICATION_SETTINGS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 알림 타입별 활성화/비활성화 설정
   * @param {string} type - 알림 타입 (LOCATION_BASED, EXPIRY_DATE, RECEIVE_GIFTICON, USAGE_COMPLETE, SHAREBOX_GIFTICON, SHAREBOX_USAGE_COMPLETE, SHAREBOX_MEMBER_JOIN, SHAREBOX_DELETED)
   * @param {boolean} enabled - 활성화 여부
   * @returns {Promise<Object>} 업데이트 결과
   */
  async updateNotificationTypeStatus(type, enabled) {
    try {
      // API 엔드포인트 생성
      const endpoint = API_CONFIG.ENDPOINTS.NOTIFICATION_SETTINGS_TYPE(type);

      // API 요청 데이터
      const requestData = { isEnabled: enabled };

      const response = await apiClient.patch(endpoint, requestData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 유효기간 만료 알림 주기 설정
   * @param {string} expirationCycle - 알림 주기 (ONE_DAY, TWO_DAYS, THREE_DAYS, ONE_WEEK, ONE_MONTH, TWO_MONTHS, THREE_MONTHS)
   * @returns {Promise<string>} 업데이트 결과 메시지
   */
  async updateExpirationCycle(expirationCycle) {
    try {
      // 유효한 알림 주기 값 검증
      const validCycles = [
        'ONE_DAY',
        'TWO_DAYS',
        'THREE_DAYS',
        'ONE_WEEK',
        'ONE_MONTH',
        'TWO_MONTHS',
        'THREE_MONTHS',
      ];

      if (!validCycles.includes(expirationCycle)) {
        throw new Error('유효하지 않은 알림 주기 값입니다.');
      }

      // API 요청 데이터
      const requestData = { expirationCycle };

      const response = await apiClient.patch(
        API_CONFIG.ENDPOINTS.NOTIFICATION_SETTINGS_EXPIRATION_CYCLE,
        requestData
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 알림 내역 목록 조회
   * @param {Object} params - 조회 파라미터
   * @param {string} [params.sort='CREATED_DESC'] - 정렬 방식 (CREATED_DESC: 최신순)
   * @param {string} [params.page] - 페이지 번호
   * @param {number} [params.size=6] - 페이지당 항목 수
   * @returns {Promise<Object>} 알림 내역 목록 및 페이지 정보
   */
  async getNotifications(params = {}) {
    try {
      // 기본값 설정
      const defaultParams = {
        sort: 'CREATED_DESC',
        size: 6,
      };

      // 기본값과 사용자 지정 파라미터 병합
      const queryParams = { ...defaultParams, ...params };

      const response = await apiClient.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS, {
        params: queryParams,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 읽지 않은 알림 개수 조회
   * @returns {Promise<Object>} - 읽지 않은 알림 개수
   */
  async getUnreadNotificationsCount() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS_COUNT);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 모든 알림 읽음 처리
   * @returns {Promise<Object>} - 읽음 처리 결과
   */
  async markAllNotificationsAsRead() {
    try {
      const response = await apiClient.patch(API_CONFIG.ENDPOINTS.NOTIFICATIONS_READ);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 기프티콘 상세 정보 조회
   * @param {number} gifticonId - 기프티콘 ID
   * @returns {Promise<Object>} - 기프티콘 상세 정보
   */
  async getGifticonDetail(gifticonId) {
    try {
      // gifticonService를 사용하여 기프티콘 상세 정보 조회
      // 알림에서는 MY_BOX 기준으로 확인
      return await gifticonService.getGifticonDetail(gifticonId, 'MY_BOX');
    } catch (error) {
      throw error;
    }
  },

  /**
   * FCM 토큰 업데이트
   * @param {string} token - FCM 토큰
   * @returns {Promise<Object>} 업데이트 결과
   */
  async updateFcmToken(token) {
    try {
      const response = await apiClient.post('/api/notifications/token', { token });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default notificationService;
