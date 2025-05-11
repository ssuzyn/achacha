import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import { Platform } from 'react-native';
import PhotoManipulator from 'react-native-photo-manipulator';

/**
 * 이미지에서 바코드를 감지하는 함수
 */
export const detectBarcode = async imageUri => {
  try {
    console.log('[바코드 감지] 시작:', imageUri);
    const barcodes = await BarcodeScanning.scan(imageUri);
    console.log('[바코드 감지] 결과:', barcodes);

    if (barcodes.length === 0) {
      console.log('[바코드 감지] 바코드를 찾지 못함');
      return { success: false, message: '이미지에서 바코드를 찾을 수 없습니다.' };
    }

    // 바코드 정보 반환
    return {
      success: true,
      barcodes: barcodes.map(barcode => ({
        value: barcode.value,
        format: barcode.format,
        boundingBox: barcode.boundingBox,
      })),
    };
  } catch (error) {
    console.error('[바코드 감지] 오류:', error);
    return { success: false, message: '바코드 감지 중 오류가 발생했습니다.', error };
  }
};

/**
 * 이미지에서 바코드 영역만 정확하게 추출하는 함수
 * 직접 좌표를 사용하여 바코드 영역을 잘라냄
 */
export const detectAndCropBarcode = async imageUri => {
  try {
    console.log('[바코드 추출] 시작:', imageUri);

    // 바코드 스캐닝
    const result = await detectBarcode(imageUri);

    if (!result.success) {
      console.log('[바코드 추출] 바코드 감지 실패');
      return result;
    }

    // 첫 번째 바코드만 처리 (여러 개가 있는 경우)
    const barcode = result.barcodes[0];

    // 바코드 값과 포맷 로그
    console.log('[바코드 추출] 감지된 바코드:', barcode.value, barcode.format);

    // 바코드 위치 정보 확인
    if (!barcode.boundingBox) {
      console.log('[바코드 추출] 바코드 위치 정보 없음');

      // 바코드 값은 있지만 바운딩 박스가 없는 경우
      // 이미지 중앙 영역을 바코드 영역으로 간주하고 크롭
      return cropWithDefaultBoundingBox(imageUri, barcode);
    }

    // 바코드 영역만 정확하게 크롭
    const { left, top, width, height } = barcode.boundingBox;

    // 바코드 영역 로깅
    console.log('[바코드 추출] 감지된 바코드 영역:', JSON.stringify(barcode.boundingBox));

    // 바코드 영역에 여백 추가 (정확한 인식을 위해)
    // 바코드 타입에 따라 여백 조정 (1D 바코드는 가로로 더 길기 때문에 세로 여백 더 많이 필요)
    const is1DBarcode = [
      'CODE_128',
      'CODE_39',
      'CODE_93',
      'CODABAR',
      'EAN_13',
      'EAN_8',
      'ITF',
      'UPC_A',
      'UPC_E',
    ].includes(barcode.format);

    // 1D 바코드는 가로로 더 길어서 세로 여백을 더 많이 줌
    const paddingX = width * (is1DBarcode ? 0.05 : 0.1);
    const paddingY = height * (is1DBarcode ? 0.2 : 0.1);

    // 크롭 영역 계산 - 정확하게 바코드 영역만
    const cropRegion = {
      x: Math.max(0, Math.floor(left - paddingX)),
      y: Math.max(0, Math.floor(top - paddingY)),
      width: Math.ceil(width + paddingX * 2),
      height: Math.ceil(height + paddingY * 2),
    };

    console.log('[바코드 추출] 크롭 영역:', JSON.stringify(cropRegion));

    // 이미지 URI 처리 (file:// 접두사가 필요한 경우 처리)
    let processedUri = imageUri;
    if (Platform.OS === 'android' && !imageUri.startsWith('file://')) {
      processedUri = `file://${imageUri}`;
      console.log('[바코드 추출] 안드로이드 이미지 URI 처리:', processedUri);
    }

    try {
      // PhotoManipulator를 사용하여 이미지 크롭 - 정확하게 바코드 영역만
      const croppedImageUri = await PhotoManipulator.crop(processedUri, cropRegion);
      console.log('[바코드 추출] 성공:', croppedImageUri);

      // 결과 반환
      return {
        success: true,
        croppedImageUri: croppedImageUri,
        barcodeValue: barcode.value,
        barcodeFormat: barcode.format,
        boundingBox: barcode.boundingBox,
      };
    } catch (cropError) {
      console.error('[바코드 추출] 크롭 실패:', cropError);

      // 크롭 실패 시 대체 방법으로 시도
      return cropWithDefaultBoundingBox(imageUri, barcode);
    }
  } catch (error) {
    console.error('[바코드 추출] 전체 프로세스 오류:', error);
    return { success: false, message: '바코드 처리 중 오류가 발생했습니다.', error };
  }
};

/**
 * 바코드 위치 정보가 없거나 크롭에 실패했을 때 사용하는 백업 함수
 * 이미지 중앙 영역을 바코드로 간주하고 크롭
 */
const cropWithDefaultBoundingBox = async (imageUri, barcode) => {
  try {
    console.log('[바코드 추출] 기본 영역으로 시도');

    // 이미지 URI 처리
    let processedUri = imageUri;
    if (Platform.OS === 'android' && !imageUri.startsWith('file://')) {
      processedUri = `file://${imageUri}`;
    }

    // 바코드 형식에 따라 크롭 영역 조정
    // 1D 바코드는 가로로 더 길고, QR 코드는 정사각형에 가까움
    const is1DBarcode = [
      'CODE_128',
      'CODE_39',
      'CODE_93',
      'CODABAR',
      'EAN_13',
      'EAN_8',
      'ITF',
      'UPC_A',
      'UPC_E',
    ].includes(barcode.format);

    // 바코드 타입에 맞는 기본 크롭 영역 설정
    const cropRegion = is1DBarcode
      ? {
          x: 50, // 왼쪽에서 50픽셀
          y: 100, // 위에서 100픽셀
          width: 800, // 너비 800픽셀
          height: 300, // 높이 300픽셀 (1D 바코드는 세로가 더 짧음)
        }
      : {
          x: 100, // 왼쪽에서 100픽셀
          y: 100, // 위에서 100픽셀
          width: 600, // 너비 600픽셀
          height: 600, // 높이 600픽셀 (2D 바코드는 정사각형에 가까움)
        };

    console.log('[바코드 추출] 기본 크롭 영역:', JSON.stringify(cropRegion));

    try {
      // 크롭 시도
      const croppedImageUri = await PhotoManipulator.crop(processedUri, cropRegion);
      console.log('[바코드 추출] 기본 영역 크롭 성공:', croppedImageUri);

      return {
        success: true,
        croppedImageUri: croppedImageUri,
        barcodeValue: barcode.value,
        barcodeFormat: barcode.format,
        boundingBox: null, // 실제 바운딩 박스는 없음
      };
    } catch (cropError) {
      console.error('[바코드 추출] 기본 영역 크롭 실패:', cropError);

      // 마지막 대안: 원본 이미지 그대로 반환 (크롭 실패해도 바코드 값은 있으므로)
      return {
        success: true,
        croppedImageUri: imageUri, // 원본 이미지 URI 그대로 반환
        barcodeValue: barcode.value,
        barcodeFormat: barcode.format,
        boundingBox: null,
        message: '바코드 이미지 크롭에 실패했지만 바코드 번호는 인식했습니다.',
      };
    }
  } catch (error) {
    console.error('[바코드 추출] 대체 크롭 오류:', error);

    // 최종 대안: 원본 이미지 그대로 반환
    return {
      success: true,
      croppedImageUri: imageUri,
      barcodeValue: barcode.value,
      barcodeFormat: barcode.format,
      boundingBox: null,
      message: '바코드 영역 추출에 실패했지만 바코드 번호는 인식했습니다.',
    };
  }
};

/**
 * 바코드 포맷을 사람이 읽을 수 있는 형태로 변환
 */
export const getBarcodeFormatName = format => {
  const formatMap = {
    UNKNOWN: '알 수 없음',
    ALL_FORMATS: '모든 형식',
    CODE_128: 'CODE 128',
    CODE_39: 'CODE 39',
    CODE_93: 'CODE 93',
    CODABAR: 'CODABAR',
    DATA_MATRIX: 'DATA MATRIX',
    EAN_13: 'EAN-13',
    EAN_8: 'EAN-8',
    ITF: 'ITF',
    QR_CODE: 'QR CODE',
    UPC_A: 'UPC-A',
    UPC_E: 'UPC-E',
    PDF417: 'PDF417',
    AZTEC: 'AZTEC',
  };

  return formatMap[format] || format;
};
