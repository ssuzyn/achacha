import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 인증 관련 상태를 관리하는 Zustand 스토어
- Zustand 기반 전역 상태 관리
- 인증 정보 저장 및 관리 (토큰, 사용자 정보 등)
- AsyncStorage와 연동하여 영구 저장소 처리
 */

const useAuthStore = create((set, get) => ({
  // 상태
  user: null,
  isLoggedIn: false,
  accessToken: null,
  refreshToken: null,
  loginType: null, // 'kakao' 또는 'google'

  // 로그인 성공 시 상태 업데이트
  setAuth: async (userData, tokens, type) => {
    try {
      // AsyncStorage에 토큰 저장
      await AsyncStorage.setItem('accessToken', tokens.accessToken);
      await AsyncStorage.setItem('refreshToken', tokens.refreshToken);

      // 스토어 상태 업데이트
      set({
        user: userData,
        isLoggedIn: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        loginType: type,
      });

      return true;
    } catch (error) {
      console.error('인증 정보 저장 실패:', error);
      return false;
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      // AsyncStorage에서 토큰 제거
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');

      // 스토어 상태 초기화
      set({
        user: null,
        isLoggedIn: false,
        accessToken: null,
        refreshToken: null,
        loginType: null,
      });

      return true;
    } catch (error) {
      console.error('로그아웃 실패:', error);
      return false;
    }
  },

  // 앱 실행 시 토큰 복원
  restoreAuth: async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      if (accessToken && refreshToken) {
        // 토큰으로부터 사용자 정보 가져오기 (필요 시 API 호출)
        // 여기서는 간단히 로그인 상태만 업데이트
        set({
          isLoggedIn: true,
          accessToken,
          refreshToken,
          // 사용자 정보와 로그인 타입은 API 응답에 따라 업데이트 필요
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('인증 정보 복원 실패:', error);
      return false;
    }
  },

  // 토큰 업데이트
  updateTokens: async (newAccessToken, newRefreshToken) => {
    try {
      if (newAccessToken) {
        await AsyncStorage.setItem('accessToken', newAccessToken);
      }

      if (newRefreshToken) {
        await AsyncStorage.setItem('refreshToken', newRefreshToken);
      }

      set({
        accessToken: newAccessToken || get().accessToken,
        refreshToken: newRefreshToken || get().refreshToken,
      });

      return true;
    } catch (error) {
      console.error('토큰 업데이트 실패:', error);
      return false;
    }
  },
}));

export default useAuthStore;
