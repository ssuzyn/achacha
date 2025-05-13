import { useQuery, useInfiniteQuery } from '@tanstack/react-query'; // useInfiniteQuery는 페이지네이션이나 무한 스크롤에 사용
import { mapGifticonService } from '../services/mapGifticonService';

// 지도에서 표시할 기프티콘 목록 조회
export const useMapGifticons = (params = {}) => {
  return useQuery({
    queryKey: ['mapGifticons', params],
    queryFn: async () => {
      const { data } = await mapGifticonService.getMapGifticons(params);
      return data;
    },
  });
};
