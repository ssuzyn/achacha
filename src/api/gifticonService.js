import apiClient from './apiClient';
import { API_CONFIG } from './config';

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
    formData.append('image', {
      uri: image.uri,
      type: image.type || 'image/jpeg',
      name: image.fileName || 'image.jpg',
    });

    try {
      const response = await apiClient.post(
        `${API_CONFIG.ENDPOINTS.GIFTICON_IMAGE_METADATA}?gifticonType=${gifticonType}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('기프티콘 이미지 메타데이터 조회 실패:', error);
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
    const formData = new FormData();

    // 기프티콘 정보 JSON 문자열로 변환하여 추가
    formData.append('gifticon', JSON.stringify(gifticonData));

    // 이미지 파일 추가
    if (originalImage) {
      formData.append('originalImage', {
        uri: originalImage.uri,
        type: originalImage.type || 'image/jpeg',
        name: originalImage.fileName || 'original.jpg',
      });
    }

    if (thumbnailImage) {
      formData.append('thumbnailImage', {
        uri: thumbnailImage.uri,
        type: thumbnailImage.type || 'image/jpeg',
        name: thumbnailImage.fileName || 'thumbnail.jpg',
      });
    }

    if (barcodeImage) {
      formData.append('barcodeImage', {
        uri: barcodeImage.uri,
        type: barcodeImage.type || 'image/jpeg',
        name: barcodeImage.fileName || 'barcode.jpg',
      });
    }

    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.REGISTER_GIFTICON, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('기프티콘 등록 실패:', error);
      throw error;
    }
  },
};

export default gifticonService;
