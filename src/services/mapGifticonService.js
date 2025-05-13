import apiClient from '../api/apiClient';

// 지도에서 사용 가능한 기프티콘 목록 조회
export const mapGifticonService = {
  getMapGifticons: (additionalParams = {}) =>
    apiClient.get('gifticons', {
      params: {
        // 고정 파라미터
        scope: 'MY_BOX',
        type: 'PRODUCT',
        sort: 'EXPIRY_ASC',
        size: 100,
        ...additionalParams,
      },
    }),
};
