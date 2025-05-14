import { create } from 'zustand';

/**
 * 기프티콘 관련 상태를 관리하는 Zustand 스토어
 */
const useGifticonStore = create(set => ({
  // 이미지 관련 상태
  gifticonImages: {}, // { gifticonId: { original: uri, edited: uri } }

  // 현재 작업 중인 기프티콘 이미지 상태
  currentGifticonId: null,
  currentOriginalImageUri: null,
  currentEditedImageUri: null,

  // 바코드 관련 정보 추가
  barcodeInfo: {}, // { gifticonId: { value: string, format: string, boundingBox: object, imageUri: string } }
  currentBarcodeInfo: null,

  // 이미지 설정 (편집 전/후 모두 저장)
  setGifticonImages: (gifticonId, originalUri, editedUri) =>
    set(state => ({
      gifticonImages: {
        ...state.gifticonImages,
        [gifticonId]: {
          original: originalUri,
          edited: editedUri || originalUri, // 편집된 이미지가 없으면 원본 사용
        },
      },
    })),

  // 현재 작업 중인 기프티콘 이미지 설정
  setCurrentGifticon: (gifticonId, originalUri, editedUri) =>
    set({
      currentGifticonId: gifticonId,
      currentOriginalImageUri: originalUri,
      currentEditedImageUri: editedUri || originalUri,
    }),

  // 편집된 이미지만 업데이트
  updateEditedImage: (gifticonId, editedUri) =>
    set(state => {
      // 이미 저장된 기프티콘 이미지가 있는 경우
      if (state.gifticonImages[gifticonId]) {
        return {
          gifticonImages: {
            ...state.gifticonImages,
            [gifticonId]: {
              ...state.gifticonImages[gifticonId],
              edited: editedUri,
            },
          },
          // 현재 작업 중인 기프티콘이면 현재 상태도 업데이트
          ...(state.currentGifticonId === gifticonId ? { currentEditedImageUri: editedUri } : {}),
        };
      }

      // 저장된 기프티콘 이미지가 없는 경우 (예상치 못한 상황)
      console.warn(`ID ${gifticonId}에 대한 기프티콘 이미지 정보가 없습니다.`);
      return state;
    }),

  // 현재 작업 중인 편집된 이미지 업데이트
  updateCurrentEditedImage: editedUri =>
    set(state => ({
      currentEditedImageUri: editedUri,
      // 현재 작업 중인 기프티콘 ID가 있으면 저장된 이미지도 업데이트
      gifticonImages: state.currentGifticonId
        ? {
            ...state.gifticonImages,
            [state.currentGifticonId]: {
              original: state.currentOriginalImageUri,
              edited: editedUri,
            },
          }
        : state.gifticonImages,
    })),

  // 바코드 정보 설정 추가
  setBarcodeInfo: (gifticonId, barcodeValue, barcodeFormat, boundingBox, barcodeImageUri) =>
    set(state => ({
      barcodeInfo: {
        ...state.barcodeInfo,
        [gifticonId]: {
          value: barcodeValue,
          format: barcodeFormat,
          boundingBox: boundingBox,
          imageUri: barcodeImageUri,
        },
      },
      // 현재 작업 중인 기프티콘이면 현재 바코드 정보도 업데이트
      ...(state.currentGifticonId === gifticonId
        ? {
            currentBarcodeInfo: {
              value: barcodeValue,
              format: barcodeFormat,
              boundingBox: boundingBox,
              imageUri: barcodeImageUri,
            },
          }
        : {}),
    })),

  // 현재 작업 중인 바코드 정보 설정
  setCurrentBarcodeInfo: (barcodeValue, barcodeFormat, barcodeBoundingBox, barcodeImageUri) =>
    set(state => ({
      ...state,
      currentBarcodeInfo: {
        value: barcodeValue,
        format: barcodeFormat,
        boundingBox: barcodeBoundingBox,
        imageUri: barcodeImageUri,
      },
    })),

  // 바코드 이미지만 업데이트
  updateBarcodeImage: (gifticonId, barcodeImageUri) =>
    set(state => {
      // 이미 저장된 바코드 정보가 있는 경우
      if (state.barcodeInfo[gifticonId]) {
        return {
          barcodeInfo: {
            ...state.barcodeInfo,
            [gifticonId]: {
              ...state.barcodeInfo[gifticonId],
              imageUri: barcodeImageUri,
            },
          },
          // 현재 작업 중인 기프티콘이면 현재 바코드 정보도 업데이트
          ...(state.currentGifticonId === gifticonId
            ? {
                currentBarcodeInfo: {
                  ...state.currentBarcodeInfo,
                  imageUri: barcodeImageUri,
                },
              }
            : {}),
        };
      }
      return state;
    }),

  // 바코드 값만 업데이트
  updateBarcodeValue: (gifticonId, barcodeValue) =>
    set(state => {
      // 이미 저장된 바코드 정보가 있는 경우
      if (state.barcodeInfo[gifticonId]) {
        return {
          barcodeInfo: {
            ...state.barcodeInfo,
            [gifticonId]: {
              ...state.barcodeInfo[gifticonId],
              value: barcodeValue,
            },
          },
          // 현재 작업 중인 기프티콘이면 현재 바코드 정보도 업데이트
          ...(state.currentGifticonId === gifticonId
            ? {
                currentBarcodeInfo: {
                  ...state.currentBarcodeInfo,
                  value: barcodeValue,
                },
              }
            : {}),
        };
      }
      return state;
    }),

  // 기프티콘 이미지 상태 초기화
  resetGifticonImages: () =>
    set({
      currentGifticonId: null,
      currentOriginalImageUri: null,
      currentEditedImageUri: null,
      currentBarcodeInfo: null,
    }),
}));

export default useGifticonStore;
