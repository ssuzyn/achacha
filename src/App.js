import { QueryClient, QueryClientProvider } from 'react-query';
import { handleError, handleAuthError } from './utils/errorHandler';

// React Query 클라이언트 생성 및 기본 옵션 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // 실패 시 1번만 재시도
      refetchOnWindowFocus: false, // 창 포커스 시 자동 리페치 비활성화
      onError: error => {
        // 인증 에러 처리를 포함한 공통 에러 처리
        handleError(error, { onAuthError: handleAuthError });
      },
    },
    mutations: {
      onError: error => {
        // 인증 에러 처리를 포함한 공통 에러 처리
        handleError(error, { onAuthError: handleAuthError });
      },
    },
  },
});

// 앱 컴포넌트
export default function App() {
  return <QueryClientProvider client={queryClient}>{/* 기존 앱 코드 */}</QueryClientProvider>;
}
