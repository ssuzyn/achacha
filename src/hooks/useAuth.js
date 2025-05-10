import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';
// axios 등 HTTP 클라이언트 라이브러리
import apiClient from '../api/apiClient'; // 백엔드 통신용으로 설정한 클라이언트
import { API_CONFIG } from '../config/apiConfig'; // 추가: API 설정 import
// 실제 소셜 로그인 SDK import (예시)
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 소셜 로그인 관련 로직을 관리하는 커스텀 훅.
 * @returns {object} authState: 로그인 상태 ('idle', 'loading', 'success', 'error') - 필요 시 추가
 * @returns {function} signInWithKakao: 카카오 로그인 시도 함수
 * @returns {function} signInWithGoogle: 구글 로그인 시도 함수
 */
export const useAuth = () => {
  const navigation = useNavigation();
  // 필요에 따라 로딩/에러 상태 추가
  const [authState, setAuthState] = useState('idle');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // 카카오 로그인 처리 함수
  const signInWithKakao = useCallback(async () => {
    console.log('[ACHACHA_DEBUG] Attempting Kakao Login via @react-native-seoul/kakao-login...');
    setAuthState('loading');
    setError(null);
    try {
      console.log('[ACHACHA_DEBUG] Calling kakaoLogin() from @react-native-seoul/kakao-login');
      const kakaoAccessToken = await kakaoLogin(); // 카카오 SDK 로그인 시도
      console.log('[ACHACHA_DEBUG] kakaoAccessToken:', kakaoAccessToken);

      // 2. 백엔드에 토큰 전달
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.KAKAO_LOGIN, {
        kakaoAccessToken,
      });

      // 3. 자체 토큰 저장 (예: AsyncStorage, SecureStore 등)
      const { accessToken, refreshToken, expiresIn } = response.data;
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      // 저장 확인용 로그
      const storedAccessToken = await AsyncStorage.getItem('accessToken');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      console.log('[ACHACHA_DEBUG] AsyncStorage accessToken:', storedAccessToken);
      console.log('[ACHACHA_DEBUG] AsyncStorage refreshToken:', storedRefreshToken);

      setAuthState('success');
      // 이후 네비게이션 등 추가
    } catch (error) {
      console.error('[ACHACHA_DEBUG] Kakao login error:', error);
      setAuthState('error');
      // 에러 처리
    }
  }, []);

  // 구글 로그인 처리 함수
  const signInWithGoogle = useCallback(async () => {
    console.log('[useAuth] Attempting Google Login...');
    setAuthState('loading'); // 로딩 상태 시작 (옵션)
    try {
      // --- 실제 구글 로그인 로직 구현 ---
      // await GoogleSignin.hasPlayServices();
      // const userInfo = await GoogleSignin.signIn();
      // console.log('Google Login Success:', userInfo);
      // await handleBackendLogin('google', userInfo.idToken); // 백엔드 로그인 처리
      // ---------------------------------

      // 현재는 임시 로직
      alert('구글 로그인이 구현되지 않았습니다.');
      setAuthState('success'); // 성공 상태 (옵션)
      navigation.navigate('Home'); // 홈으로 이동

    } catch (error) {
      console.error('[useAuth] Google Login Error:', error);
      setAuthState('error'); // 에러 상태 (옵션)
      // 구글 로그인은 사용자가 취소한 경우 특정 에러 코드를 반환할 수 있음
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // 사용자가 로그인 흐름을 취소함
        console.log('[useAuth] Google Sign in cancelled');
      } else {
        Alert.alert('구글 로그인 오류', error.message || '로그인 중 오류가 발생했습니다.');
      }
    }
  }, [navigation]); // navigation 의존성 추가

  // 훅 사용 컴포넌트에 필요한 상태와 함수 반환
  return {
    authState, // 현재 상태 (로딩, 에러 등 표시 위해)
    user,
    error,
    signInWithKakao,
    signInWithGoogle,
  };
};

// 실제 구글 로그인 사용 시 필요할 수 있는 에러 코드 (참고용)
// import { statusCodes } from '@react-native-google-signin/google-signin';
const statusCodes = {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    // ... 다른 상태 코드들
}; 