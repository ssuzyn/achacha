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

  // 기프티콘 이미지 상태 초기화
  resetGifticonImages: () =>
    set({
      currentGifticonId: null,
      currentOriginalImageUri: null,
      currentEditedImageUri: null,
    }),
}));

export default useGifticonStore;
