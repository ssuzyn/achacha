import apiClient from './apiClient';
import { API_CONFIG } from './config';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import axios from 'axios';
import { API_BASE_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 기프티콘 API 서비스
 */
const gifticonService = {
  /**
   * 기프티콘 이미지 메타데이터 조회
   * @param {File} image - 기프티콘 이미지 파일
   * @param {string} gifticonType - 기프티콘 타입 (AMOUNT, PRODUCT)
   * @returns {Promise<Object>} - 메타데이터 조회 결과
   */
  async getGifticonImageMetadata(image, gifticonType) {
    const formData = new FormData();

    // 이미지 파일 추가
    formData.append('image', {
      uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
      type: image.type || 'image/jpeg',
      name: image.fileName || 'image.jpg',
    });

    // 기프티콘 타입 추가 (URL 파라미터 대신 Form 데이터에 추가)
    formData.append('gifticonType', gifticonType);

    try {
      // 타임아웃 설정 증가 및 요청 설정 개선
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.GIFTICON_IMAGE_METADATA,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
          timeout: 60000, // 이미지 처리를 위해 타임아웃 1분으로 설정
        }
      );

      return response.data;
    } catch (error) {
      // 임시 대응: 서버 응답이 없을 경우 임시 데이터 반환 (개발용)
      if (__DEV__ && !error.response) {
        return {
          brandName: '테스트 브랜드',
          gifticonName: '테스트 상품',
          gifticonExpiryDate: new Date().toISOString().split('T')[0],
          gifticonBarcodeNumber: '1234567890',
          gifticonOriginalAmount: gifticonType === 'AMOUNT' ? 10000 : null,
          ocrTrainingDataId: 'test-ocr-id-12345',
        };
      }

      throw error;
    }
  },

  /**
   * 기프티콘 등록
   * @param {Object} gifticonData - 기프티콘 정보
   * @param {File} originalImage - 원본 이미지 파일
   * @param {File} thumbnailImage - 썸네일 이미지 파일
   * @param {File} barcodeImage - 바코드 이미지 파일
   * @returns {Promise<string>} - 등록 결과 메시지
   */
  async registerGifticon(gifticonData, originalImage, thumbnailImage, barcodeImage) {
    try {
      // JSON 문자열로 변환
      const jsonString = JSON.stringify(gifticonData);

      // 임시 파일 경로 생성
      const fileName = 'gifticon.json';
      const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;

      // JSON 문자열을 파일로 저장
      await RNFS.writeFile(filePath, jsonString, 'utf8');

      // FormData 생성
      const formData = new FormData();

      // JSON 파일을 FormData에 추가 (중요: 파일 형식으로 추가하면서 Content-Type 명시)
      // 1. 'gifticon' 필드로 추가 (API 명세에 기본)
      formData.append('gifticon', {
        uri: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'application/json',
        name: fileName,
      });

      // 2. 대체 방법: 'body' 필드로도 추가 (백엔드 개발자가 이 필드명을 사용할 수 있음)
      // 둘 중 하나가 작동하길 바라며 두 방식 모두 시도
      const jsonFile = {
        uri: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'application/json',
        name: fileName,
      };
      formData.append('body', jsonFile);

      // 이미지 파일 추가
      if (originalImage && originalImage.uri) {
        formData.append('originalImage', {
          uri:
            Platform.OS === 'android'
              ? originalImage.uri
              : originalImage.uri.replace('file://', ''),
          type: originalImage.type || 'image/jpeg',
          name: originalImage.fileName || 'original.jpg',
        });
      }

      if (thumbnailImage && thumbnailImage.uri) {
        formData.append('thumbnailImage', {
          uri:
            Platform.OS === 'android'
              ? thumbnailImage.uri
              : thumbnailImage.uri.replace('file://', ''),
          type: thumbnailImage.type || 'image/jpeg',
          name: thumbnailImage.fileName || 'thumbnail.jpg',
        });
      }

      if (barcodeImage && barcodeImage.uri) {
        formData.append('barcodeImage', {
          uri:
            Platform.OS === 'android' ? barcodeImage.uri : barcodeImage.uri.replace('file://', ''),
          type: barcodeImage.type || 'image/jpeg',
          name: barcodeImage.fileName || 'barcode.jpg',
        });
      }

      // 다른 옵션: 직접 URLSearchParams 구성 시도
      const params = new URLSearchParams();
      params.append('jsonData', jsonString);

      // 요청 헤더 설정
      const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      };

      // 요청 보내기
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.REGISTER_GIFTICON, formData, {
        headers,
        timeout: 60000, // 이미지 처리를 위해 타임아웃 증가
        transformRequest: data => {
          // 기존 transformRequest 유지 (axios가 자동으로 boundary를 설정하게 함)
          return data;
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 사용 가능한 기프티콘 목록 조회
   * @param {Object} params - 검색 파라미터
   * @returns {Promise<Object>} 기프티콘 목록 및 페이지 정보
   */
  async getAvailableGifticons(params = {}) {
    try {
      const queryParams = { ...params };
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.AVAILABLE_GIFTICONS, {
        params: queryParams,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 사용 완료된 기프티콘 목록 조회
   * @param {Object} params - 검색 파라미터
   * @returns {Promise<Object>} 기프티콘 목록 및 페이지 정보
   */
  async getUsedGifticons(params = {}) {
    try {
      const queryParams = { ...params };
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USED_GIFTICONS, {
        params: queryParams,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 기프티콘 상세 정보 조회
   * @param {number} gifticonId - 기프티콘 ID
   * @param {string} scope - 조회 범위 (MY_BOX, SHARE_BOX)
   * @returns {Promise<Object>} 기프티콘 상세 정보
   */
  async getGifticonDetail(gifticonId, scope = '') {
    try {
      let endpoint = `${API_CONFIG.ENDPOINTS.GIFTICON_DETAIL}/${gifticonId}`;

      // scope 파라미터가 있으면 URL에 추가
      if (scope) {
        endpoint += `?scope=${scope}`;
      }

      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 사용 가능한 기프티콘 바코드 조회
   * @param {number} gifticonId - 기프티콘 ID
   * @returns {Promise<Object>} 바코드 정보
   */
  async getAvailableGifticonBarcode(gifticonId) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.AVAILABLE_GIFTICON_BARCODE}/${gifticonId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 사용 완료된 기프티콘 바코드 조회
   * @param {number} gifticonId - 기프티콘 ID
   * @returns {Promise<Object>} 바코드 정보
   */
  async getUsedGifticonBarcode(gifticonId) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.USED_GIFTICON_BARCODE}/${gifticonId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 기프티콘을 사용 완료 상태로 변경
   * @param {number} gifticonId - 기프티콘 ID
   * @param {string} usageType - 사용 유형 (SELF_USE, SHARE_USE)
   * @returns {Promise<string>} 처리 결과 메시지
   */
  async markGifticonAsUsed(gifticonId, usageType = 'SELF_USE') {
    try {
      const response = await apiClient.patch(
        `${API_CONFIG.ENDPOINTS.MARK_GIFTICON_USED}/${gifticonId}`,
        { usageType }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 기프티콘 삭제
   * @param {number} gifticonId - 기프티콘 ID
   * @returns {Promise<string>} 처리 결과 메시지
   */
  async deleteGifticon(gifticonId) {
    try {
      const response = await apiClient.delete(
        `${API_CONFIG.ENDPOINTS.DELETE_GIFTICON}/${gifticonId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 기프티콘을 쉐어박스에 공유
   * @param {number} gifticonId - 기프티콘 ID
   * @param {number} shareBoxId - 쉐어박스 ID
   * @returns {Promise<string>} 처리 결과 메시지
   */
  async shareGifticon(gifticonId, shareBoxId) {
    try {
      const response = await apiClient.post(
        `${API_CONFIG.ENDPOINTS.SHARE_GIFTICON}/${gifticonId}`,
        { shareBoxId }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 기프티콘 공유 취소
   * @param {number} gifticonId - 기프티콘 ID
   * @returns {Promise<string>} 처리 결과 메시지
   */
  async cancelShareGifticon(gifticonId) {
    try {
      const response = await apiClient.delete(
        `${API_CONFIG.ENDPOINTS.CANCEL_SHARE_GIFTICON}/${gifticonId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 기프티콘 바코드 정보 조회 (범위 지정 가능)
   * @param {number} gifticonId - 기프티콘 ID
   * @param {string} scope - 조회 범위 (MY_BOX, SHARE_BOX)
   * @returns {Promise<Object>} 바코드 정보
   */
  async getGifticonBarcode(gifticonId, scope = '') {
    try {
      let endpoint = `${API_CONFIG.ENDPOINTS.GIFTICON_BARCODE}/${gifticonId}`;

      // scope 파라미터가 있으면 URL에 추가
      if (scope) {
        endpoint += `?scope=${scope}`;
      }

      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 금액권 기프티콘 사용
   * @param {number} gifticonId - 기프티콘 ID
   * @param {number} usageAmount - 사용 금액
   * @returns {Promise<string>} 처리 결과 메시지
   */
  async useAmountGifticon(gifticonId, usageAmount) {
    try {
      const response = await apiClient.post(
        `${API_CONFIG.ENDPOINTS.USE_AMOUNT_GIFTICON}/${gifticonId}`,
        { usageAmount }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 금액권 기프티콘 사용 내역 조회
   * @param {number} gifticonId - 기프티콘 ID
   * @returns {Promise<Array>} 사용 내역 배열
   */
  async getAmountGifticonUsageHistory(gifticonId) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.AMOUNT_GIFTICON_USAGE_HISTORY}/${gifticonId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 금액권 기프티콘 사용 내역 수정
   * @param {number} gifticonId - 기프티콘 ID
   * @param {number} usageHistoryId - 사용 내역 ID
   * @param {number} usageAmount - 수정할 사용 금액
   * @returns {Promise<string>} 처리 결과 메시지
   */
  async updateAmountGifticonUsageHistory(gifticonId, usageHistoryId, usageAmount) {
    try {
      const response = await apiClient.patch(
        `${API_CONFIG.ENDPOINTS.AMOUNT_GIFTICON_USAGE_HISTORY}/${gifticonId}/${usageHistoryId}`,
        { usageAmount }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 기프티콘 뿌리기
   * @param {Object} dropData - 뿌리기 정보
   * @param {number} dropData.gifticonId - 기프티콘 ID
   * @param {number} dropData.latitude - 위도
   * @param {number} dropData.longitude - 경도
   * @param {number} dropData.radius - 반경 (미터)
   * @param {number} dropData.maxParticipants - 최대 참가자 수
   * @param {string} dropData.expiryTime - 만료 시간 (ISO 형식)
   * @returns {Promise<string>} 처리 결과 메시지
   */
  async dropGifticon(dropData) {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.DROP_GIFTICON, dropData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 뿌려진 기프티콘 목록 조회
   * @param {Object} params - 검색 파라미터
   * @returns {Promise<Array>} 뿌려진 기프티콘 목록
   */
  async getDroppedGifticons(params = {}) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.DROPPED_GIFTICONS, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 금액권 기프티콘 사용 내역 삭제
   * @param {number} gifticonId - 기프티콘 ID
   * @param {number} usageHistoryId - 사용 내역 ID
   * @returns {Promise<string>} 처리 결과 메시지
   */
  async deleteAmountGifticonUsageHistory(gifticonId, usageHistoryId) {
    try {
      const response = await apiClient.delete(
        `${API_CONFIG.ENDPOINTS.AMOUNT_GIFTICON_USAGE_HISTORY}/${gifticonId}/${usageHistoryId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 상품형 기프티콘 사용 완료 처리
   * @param {number} gifticonId - 기프티콘 ID
   * @returns {Promise<string>} 처리 결과 메시지
   */
  async markProductGifticonAsUsed(gifticonId) {
    try {
      const response = await apiClient.patch(
        `${API_CONFIG.ENDPOINTS.USE_PRODUCT_GIFTICON}/${gifticonId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default gifticonService;
