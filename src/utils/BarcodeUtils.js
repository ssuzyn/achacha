import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import { Platform } from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';

/**
 * 이미지에서 바코드를 감지하는 함수
 */
export const detectBarcode = async imageUri => {
  try {
    const barcodes = await BarcodeScanning.scan(imageUri);

    if (barcodes.length === 0) {
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
    console.error('바코드 감지 오류:', error);
    return { success: false, message: '바코드 감지 중 오류가 발생했습니다.', error };
  }
};

/**
 * 이미지에서 바코드를 감지하고 해당 영역만 크롭하는 유틸리티 함수
 */
export const detectAndCropBarcode = async imageUri => {
  try {
    // 바코드 스캐닝
    const result = await detectBarcode(imageUri);

    if (!result.success) {
      return result;
    }

    // 첫 번째 바코드만 처리 (여러 개가 있는 경우)
    const barcode = result.barcodes[0];

    // 바코드 위치 정보 확인
    if (!barcode.boundingBox) {
      return {
        success: false,
        message: '바코드 위치 정보를 찾을 수 없습니다.',
        barcodeValue: barcode.value,
        barcodeFormat: barcode.format,
      };
    }

    // 바코드 영역만 크롭
    const { left, top, width, height } = barcode.boundingBox;

    // 여백 추가 (보기 좋게 10% 정도 추가)
    const padding = Math.min(width, height) * 0.1;

    const cropResult = await ImageCropPicker.openCropper({
      path: imageUri,
      cropRect: {
        x: Math.max(0, left - padding),
        y: Math.max(0, top - padding),
        width: width + padding * 2,
        height: height + padding * 2,
      },
      cropperCircleOverlay: false,
      freeStyleCropEnabled: false,
      disableCropperColorSetters: true,
      includeBase64: false,
    });

    // 결과 반환
    return {
      success: true,
      croppedImageUri: cropResult.path,
      barcodeValue: barcode.value,
      barcodeFormat: barcode.format,
      boundingBox: barcode.boundingBox,
    };
  } catch (error) {
    console.error('바코드 감지 및 크롭 오류:', error);
    return { success: false, message: '바코드 처리 중 오류가 발생했습니다.', error };
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
