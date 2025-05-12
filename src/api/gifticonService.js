import apiClient from './apiClient';
import { API_CONFIG } from './config';
import { Platform } from 'react-native';

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
    
    // 이미지 타입 및 파일명 디버그 로그
    console.log('[API] 이미지 타입:', image.type || 'image/jpeg');
    console.log('[API] 파일명:', image.fileName || 'image.jpg');
    
    // 이미지 파일 추가
    formData.append('image', {
      uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
      type: image.type || 'image/jpeg',
      name: image.fileName || 'image.jpg',
    });
    
    // 기프티콘 타입 추가 (URL 파라미터 대신 Form 데이터에 추가)
    formData.append('gifticonType', gifticonType);

    try {
      console.log('[API] 기프티콘 메타데이터 요청 시작:', `${API_CONFIG.ENDPOINTS.GIFTICON_IMAGE_METADATA}`);
      
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
      
      console.log('[API] 기프티콘 메타데이터 응답 성공');
      return response.data;
    } catch (error) {
      console.error('기프티콘 이미지 메타데이터 조회 실패:', error);
      
      // 오류 상세 정보 로그
      if (error.response) {
        // 서버에서 응답이 왔지만 상태 코드가 2xx 범위를 벗어난 경우
        console.error('서버 응답 오류:', error.response.status, error.response.data);
      } else if (error.request) {
        // 요청은 전송되었지만 응답이 수신되지 않은 경우
        console.error('서버 응답 없음 (요청 정보):', error.request);
      } else {
        // 요청 설정 중 오류가 발생한 경우
        console.error('요청 설정 오류:', error.message);
      }
      
      // 임시 대응: 서버 응답이 없을 경우 임시 데이터 반환 (개발용)
      if (__DEV__ && !error.response) {
        console.warn('[API] 개발 모드에서 임시 메타데이터 반환');
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
