import apiClient from './apiClient';
import { API_CONFIG } from './config';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

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
    try {
      // JSON 문자열로 변환
      const jsonString = JSON.stringify(gifticonData);
      console.log('[API] 기프티콘 등록 데이터:', jsonString);

      // 임시 파일 경로 생성
      const fileName = 'gifticon.json';
      const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
      console.log('[API] JSON 임시 파일 경로:', filePath);

      // JSON 문자열을 파일로 저장
      await RNFS.writeFile(filePath, jsonString, 'utf8');
      console.log('[API] JSON 파일 저장 완료');

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
        console.log('[API] 원본 이미지 추가됨:', originalImage.uri);
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
        console.log('[API] 썸네일 이미지 추가됨:', thumbnailImage.uri);
      }

      if (barcodeImage && barcodeImage.uri) {
        formData.append('barcodeImage', {
          uri:
            Platform.OS === 'android' ? barcodeImage.uri : barcodeImage.uri.replace('file://', ''),
          type: barcodeImage.type || 'image/jpeg',
          name: barcodeImage.fileName || 'barcode.jpg',
        });
        console.log('[API] 바코드 이미지 추가됨:', barcodeImage.uri);
      }

      // FormData 내용 확인 (디버깅용)
      console.log('[API] FormData 내용:');
      if (formData._parts) {
        formData._parts.forEach((part, index) => {
          console.log(
            `[${index}] ${part[0]}: ${typeof part[1] === 'object' ? JSON.stringify(part[1]) : part[1]}`
          );
        });
      }

      // 다른 옵션: 직접 URLSearchParams 구성 시도
      const params = new URLSearchParams();
      params.append('jsonData', jsonString);

      // API 요청 전송 (Content-Type 명시)
      console.log('[API] 기프티콘 등록 요청 시작');

      // 요청 헤더 설정
      const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      };

      // 요청 보내기
      console.log('[API] 요청 헤더:', headers);
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.REGISTER_GIFTICON, formData, {
        headers,
        timeout: 60000, // 이미지 처리를 위해 타임아웃 증가
        transformRequest: data => {
          // 기존 transformRequest 유지 (axios가 자동으로 boundary를 설정하게 함)
          return data;
        },
      });

      console.log('[API] 기프티콘 등록 응답 성공:', response.data);

      // 임시 파일 삭제
      try {
        await RNFS.unlink(filePath);
        console.log('[API] 임시 JSON 파일 삭제 완료');
      } catch (cleanupError) {
        console.warn('[API] 임시 파일 삭제 중 오류:', cleanupError);
      }

      return response.data;
    } catch (error) {
      console.error('기프티콘 등록 실패:', error);

      // 오류 상세 정보 로깅
      if (error.response) {
        // 서버에서 응답이 왔지만 상태 코드가 2xx 범위를 벗어난 경우
        console.error('서버 응답 오류:', error.response.status, error.response.data);
        console.error('응답 헤더:', error.response.headers);
      } else if (error.request) {
        // 요청은 전송되었지만 응답이 수신되지 않은 경우
        console.error('서버 응답 없음 (요청 정보):', error.request);
      } else {
        // 요청 설정 중 오류가 발생한 경우
        console.error('요청 설정 오류:', error.message);
      }

      throw error;
    }
  },

  /**
   * 사용 가능한 기프티콘 목록 조회
   * @param {Object} params - 조회 파라미터
   * @param {string} params.scope - 조회 범위 ('MY_BOX'/'SHARE_BOX'/'ALL')
   * @param {string} params.type - 기프티콘 타입 필터 ('PRODUCT'/'AMOUNT')
   * @param {string} params.sort - 정렬 방식 ('CREATED_DESC': 등록순, 'EXPIRY_ASC': 임박순)
   * @param {number} params.page - 페이지 번호
   * @param {number} params.size - 페이지당 항목 수
   * @returns {Promise<Object>} - 기프티콘 목록 조회 결과
   */
  async getAvailableGifticons(params = {}) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.GET_GIFTICONS, { params });
      return response.data;
    } catch (error) {
      console.error('[API] 기프티콘 목록 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 사용 완료된 기프티콘 목록 조회
   * @param {Object} params - 조회 파라미터
   * @param {string} params.type - 기프티콘 타입 필터 ('PRODUCT'/'AMOUNT')
   * @param {number} params.page - 페이지 번호
   * @param {number} params.size - 페이지당 항목 수
   * @returns {Promise<Object>} - 사용 완료 기프티콘 목록 조회 결과
   */
  async getUsedGifticons(params = {}) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.GET_USED_GIFTICONS, { params });
      return response.data;
    } catch (error) {
      console.error('[API] 사용 완료 기프티콘 목록 조회 실패:', error);
      throw error;
    }
  },
};

export default gifticonService;
