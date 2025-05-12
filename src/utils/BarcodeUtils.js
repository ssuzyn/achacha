import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import { Platform, NativeModules } from 'react-native';
import PhotoManipulator from 'react-native-photo-manipulator';

// 네이티브 모듈 가져오기
const { BarcodeNativeModule } = NativeModules;

/**
 * 이미지에서 바코드를 감지하는 함수
 */
export const detectBarcode = async imageUri => {
  try {
    console.log('[바코드 감지] 시작:', imageUri);

    // 네이티브 모듈이 존재하는지 확인
    if (BarcodeNativeModule) {
      // 네이티브 모듈 사용하여 바코드 감지
      console.log('[바코드 감지] 네이티브 모듈 사용');
      const result = await BarcodeNativeModule.detectBarcode(imageUri);
      console.log('[바코드 감지] 네이티브 결과:', result);

      if (result.success) {
        return {
          success: true,
          barcodes: result.barcodes.map(barcode => {
            // boundingBox 정보 확인 및 정규화
            const boundingBox = barcode.boundingBox
              ? {
                  x: barcode.boundingBox.x,
                  y: barcode.boundingBox.y,
                  width: barcode.boundingBox.width,
                  height: barcode.boundingBox.height,
                }
              : null;

            // 코너 포인트 정보 추가 (더 정확한 바코드 영역을 위해)
            return {
              value: barcode.value,
              format: barcode.format,
              boundingBox: boundingBox,
              cornerPoints: barcode.cornerPoints || null,
            };
          }),
        };
      } else {
        console.log('[바코드 감지] 네이티브 모듈 - 바코드 찾지 못함');
        return {
          success: false,
          message: result.message || '이미지에서 바코드를 찾을 수 없습니다.',
        };
      }
    } else {
      // 네이티브 모듈이 없는 경우 기존 방식 사용
      console.log('[바코드 감지] 기존 모듈 사용');
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
          cornerPoints: barcode.cornerPoints || null,
        })),
      };
    }
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
    if (!barcode.boundingBox && !barcode.cornerPoints) {
      console.log('[바코드 추출] 바코드 위치 정보 없음');

      // 바코드 값은 있지만 바운딩 박스가 없는 경우
      // 이미지 중앙 영역을 바코드 영역으로 간주하고 크롭
      return cropWithDefaultBoundingBox(imageUri, barcode);
    }

    // 네이티브 모듈이 존재하면 네이티브 방식으로 크롭 (코너 포인트 활용)
    if (BarcodeNativeModule) {
      try {
        console.log('[바코드 추출] 네이티브 모듈로 크롭 시도');

        // 바운딩 박스와 코너 포인트 정보 전달
        const { x, y, width, height } = barcode.boundingBox || { x: 0, y: 0, width: 0, height: 0 };

        // cornerPoints 파라미터 처리
        const cornerPointsArray = barcode.cornerPoints || [];

        // 네이티브 모듈을 사용하여 바코드 영역 크롭
        const cropResult = await BarcodeNativeModule.cropBarcodeArea(
          imageUri,
          x,
          y,
          width,
          height,
          cornerPointsArray
        );

        if (cropResult.success && cropResult.croppedImageUri) {
          console.log('[바코드 추출] 네이티브 크롭 성공:', cropResult.croppedImageUri);
          return {
            success: true,
            croppedImageUri: cropResult.croppedImageUri,
            barcodeValue: barcode.value,
            barcodeFormat: barcode.format,
            boundingBox: barcode.boundingBox,
            cropInfo: {
              x: cropResult.cropX,
              y: cropResult.cropY,
              width: cropResult.cropWidth,
              height: cropResult.cropHeight,
            },
          };
        } else {
          console.log('[바코드 추출] 네이티브 크롭 실패, JS 방식으로 전환');
        }
      } catch (nativeError) {
        console.error('[바코드 추출] 네이티브 크롭 에러:', nativeError);
        // 네이티브 크롭 실패 시 JS 방식으로 진행
      }
    }

    // 바코드 영역만 정확하게 크롭 (JS 방식 - 코너 포인트가 없는 경우 폴백)
    const { x, y, width, height } = barcode.boundingBox;

    // 코너 포인트가 있는 경우 보다 정확한 바코드 영역 계산
    let cropRegion;

    if (barcode.cornerPoints && barcode.cornerPoints.length >= 4) {
      // 모든 코너 포인트 중 최소/최대 좌표 찾기
      let minX = Number.MAX_SAFE_INTEGER;
      let minY = Number.MAX_SAFE_INTEGER;
      let maxX = Number.MIN_VALUE;
      let maxY = Number.MIN_VALUE;

      for (const point of barcode.cornerPoints) {
        if (point.x < minX) minX = point.x;
        if (point.y < minY) minY = point.y;
        if (point.x > maxX) maxX = point.x;
        if (point.y > maxY) maxY = point.y;
      }

      // 코너 포인트 기반 영역에 최소한의 여백 추가
      const cornerWidth = maxX - minX;
      const cornerHeight = maxY - minY;

      // 바코드 종류 확인
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

      // 여백 계산 - 가로는 유지, 세로는 최소화하거나 약간 잘라냄
      const paddingX = cornerWidth * (is1DBarcode ? 0.2 : 0.15); // 가로: 1D 20%, 2D 15%
      const paddingY = cornerHeight * -0.05; // 세로는 -5%로 설정하여 약간 잘라냄

      cropRegion = {
        x: Math.max(0, Math.floor(minX - paddingX)),
        y: Math.max(0, Math.floor(minY - paddingY)),
        width: Math.ceil(cornerWidth + paddingX * 2),
        height: Math.ceil(cornerHeight + paddingY * 2),
      };

      console.log('[바코드 추출] 코너 포인트 기반 정확한 크롭 영역:', JSON.stringify(cropRegion));
    } else {
      // 코너 포인트가 없는 경우 바운딩 박스를 기반으로 여백 추가
      // x, y, width, height가 전달되는지 확인, 없으면 left, top으로 대체
      const left = x !== undefined ? x : barcode.boundingBox.left;
      const top = y !== undefined ? y : barcode.boundingBox.top;
      const barcodeWidth = width !== undefined ? width : barcode.boundingBox.width;
      const barcodeHeight = height !== undefined ? height : barcode.boundingBox.height;

      // 바코드 영역 로깅
      console.log(
        '[바코드 추출] 감지된 바코드 영역:',
        JSON.stringify({ left, top, width: barcodeWidth, height: barcodeHeight })
      );

      // 바코드 종류 확인
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

      // 최소한의 여백 계산 - 가로는 유지, 세로는 최소화
      const paddingX = barcodeWidth * (is1DBarcode ? 0.2 : 0.15); // 가로: 1D 20%, 2D 15%
      const paddingY = barcodeHeight * -0.05; // 세로는 -5%로 설정하여 약간 잘라냄

      // 크롭 영역 계산 - 정확하게 바코드 영역만
      cropRegion = {
        x: Math.max(0, Math.floor(left - paddingX)),
        y: Math.max(0, Math.floor(top - paddingY)),
        width: Math.ceil(barcodeWidth + paddingX * 2),
        height: Math.ceil(barcodeHeight + paddingY * 2),
      };

      console.log('[바코드 추출] 바운딩 박스 기반 정확한 크롭 영역:', JSON.stringify(cropRegion));
    }

    // 이미지 URI 처리 (file:// 접두사가 필요한 경우 처리)
    let processedUri = imageUri;
    if (Platform.OS === 'android' && !imageUri.startsWith('file://')) {
      processedUri = `file://${imageUri}`;
      console.log('[바코드 추출] 안드로이드 이미지 URI 처리:', processedUri);
    }

    try {
      // PhotoManipulator를 사용하여 이미지 크롭
      const croppedImageUri = await PhotoManipulator.crop(processedUri, cropRegion);
      console.log('[바코드 추출] 성공:', croppedImageUri);

      // 결과 반환
      return {
        success: true,
        croppedImageUri: croppedImageUri,
        barcodeValue: barcode.value,
        barcodeFormat: barcode.format,
        boundingBox: barcode.boundingBox,
        cropInfo: cropRegion,
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
          width: 1000, // 너비 1000픽셀 (1D 바코드는 가로가 더 넓음)
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
