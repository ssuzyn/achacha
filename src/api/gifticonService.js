import apiClient from './apiClient';
import { API_CONFIG } from './config';
import { Platform } from 'react-native';
import RNFetchBlob from 'react-native-blob-util';

// Blob 관련 경고: React Native에서 Blob 처리가 필요한 경우
// 'react-native-blob-util' 또는 'react-native-fetch-blob' 라이브러리 설치 필요
// 예: import RNFetchBlob from 'react-native-blob-util';

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
      console.log(
        '[API] 기프티콘 메타데이터 요청 시작:',
        `${API_CONFIG.ENDPOINTS.GIFTICON_IMAGE_METADATA}`
      );

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
    const jsonString = JSON.stringify(gifticonData);
    console.log('[API] 기프티콘 등록 데이터:', jsonString);

    try {
      // react-native-blob-util을 사용하여 multipart 요청 구성
      // 이 방식은 각 파트의 Content-Type을 명시적으로 설정할 수 있음
      const formData = [];

      // JSON 부분 - application/json으로 명시적 지정
      formData.push({
        name: 'body',
        data: jsonString,
        type: 'application/json',
      });

      // 이미지 파일 추가
      if (originalImage && originalImage.uri) {
        formData.push({
          name: 'originalImage',
          filename: originalImage.fileName || 'original.jpg',
          type: originalImage.type || 'image/jpeg',
          data: RNFetchBlob.wrap(
            Platform.OS === 'android' ? originalImage.uri : originalImage.uri.replace('file://', '')
          ),
        });
      }

      if (thumbnailImage && thumbnailImage.uri) {
        formData.push({
          name: 'thumbnailImage',
          filename: thumbnailImage.fileName || 'thumbnail.jpg',
          type: thumbnailImage.type || 'image/jpeg',
          data: RNFetchBlob.wrap(
            Platform.OS === 'android'
              ? thumbnailImage.uri
              : thumbnailImage.uri.replace('file://', '')
          ),
        });
      }

      if (barcodeImage && barcodeImage.uri) {
        formData.push({
          name: 'barcodeImage',
          filename: barcodeImage.fileName || 'barcode.jpg',
          type: barcodeImage.type || 'image/jpeg',
          data: RNFetchBlob.wrap(
            Platform.OS === 'android' ? barcodeImage.uri : barcodeImage.uri.replace('file://', '')
          ),
        });
      }

      console.log('[API] 기프티콘 등록 요청 시작 (RNFetchBlob 사용)');

      // 서버의 URL을 가져옴
      const apiBaseUrl = apiClient.defaults.baseURL || '';
      const url = `${apiBaseUrl}${API_CONFIG.ENDPOINTS.REGISTER_GIFTICON}`;
      console.log('[API] 요청 URL:', url);

      // 인증 토큰을 가져옴 (apiClient의 기본 헤더나 다른 방식으로 가져오기)
      const authHeader = apiClient.defaults.headers.common.Authorization || '';

      // RNFetchBlob으로 직접 요청
      const response = await RNFetchBlob.fetch(
        'POST',
        url,
        {
          Authorization: authHeader,
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
        formData
      );

      // 응답 파싱
      const status = response.info().status;
      const responseData = response.json();

      console.log('[API] 응답 상태 코드:', status);
      console.log('[API] 기프티콘 등록 응답 성공:', responseData);

      return responseData;
    } catch (error) {
      console.error('기프티콘 등록 실패:', error);

      // RNFetchBlob 오류 상세 정보 로깅
      if (error.info) {
        console.error('응답 정보:', error.info());
        try {
          const responseBody = error.json ? error.json() : error.data;
          console.error('응답 본문:', responseBody);
        } catch (e) {
          console.error('응답 본문 파싱 실패:', error.data);
        }
      }

      throw error;
    }
  },
};

export default gifticonService;
