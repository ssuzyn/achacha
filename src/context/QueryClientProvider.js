import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 전역으로 사용할 QueryClient 인스턴스 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // 기본값: 실패 시 1번 재시도
      staleTime: 60 * 1000, // 데이터가 신선하다고 간주되는 시간 (60초)
      cacheTime: 5 * 60 * 1000, // 캐시에 데이터가 유지되는 시간 (5분)
      refetchOnWindowFocus: false, // 창 포커스 시 자동 재요청 비활성화
      useErrorBoundary: false, // 에러 발생 시 Error Boundary 사용 안 함
    },
    mutations: {
      useErrorBoundary: false,
    },
  },
});

/**
 * 앱 전체에서 React Query를 사용하기 위한 Provider 컴포넌트
 */
export const AppQueryClientProvider = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default AppQueryClientProvider;
