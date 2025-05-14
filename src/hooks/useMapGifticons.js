import { useQuery, useInfiniteQuery } from '@tanstack/react-query'; // useInfiniteQuery는 페이지네이션이나 무한 스크롤에 사용
import { mapGifticonService } from '../services/mapGifticonService';

/**
 * 지도에서 표시할 기프티콘 목록 조회
 * @param {Object} params - 추가 검색 파라미터
 * @returns {Object} 기프티콘 데이터, 로딩 상태 등
 *
 * @typedef {Object} GifticonData
 * @property {Array} gifticons - 기프티콘 목록
 * @property {boolean} hasNextPage - 다음 페이지 존재 여부
 * @property {string} nextPage - 다음 페이지 번호
 */
export const useMapGifticons = (params = {}) => {
  return useQuery({
    queryKey: ['mapGifticons', params],
    queryFn: async () => {
      const { data } = await mapGifticonService.getMapGifticons(params);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
