import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';
// axios 등 HTTP 클라이언트 라이브러리
import apiClient from '../api/apiClient'; // 백엔드 통신용으로 설정한 클라이언트
import { API_CONFIG } from '../config/apiConfig'; // 추가: API 설정 import
// 실제 소셜 로그인 SDK import (예시)
// import { GoogleSignin } from '@react-native-google-signin/google-signin';

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
      const kakaoApiToken = await kakaoLogin(); // 카카오 SDK 로그인 시도

      // --- 카카오 SDK 응답 확인 로직 추가 ---
      console.log('[ACHACHA_DEBUG] Kakao SDK Response (kakaoApiToken):', JSON.stringify(kakaoApiToken, null, 2));
      Alert.alert(
        '카카오 SDK 응답',
        `액세스 토큰: ${kakaoApiToken && kakaoApiToken.accessToken ? '받아옴' : '못 받아옴'}\n리프레시 토큰: ${kakaoApiToken && kakaoApiToken.refreshToken ? '받아옴' : '못 받아옴'}\nID 토큰: ${kakaoApiToken && kakaoApiToken.idToken ? '받아옴' : '못 받아옴'}\n\n전체 응답:\n${JSON.stringify(kakaoApiToken, null, 2)}`
      );
      // -------------------------------------

      // ▼▼▼ 백엔드 API 호출 부분 (테스트를 위해 잠시 주석 처리) ▼▼▼
      /*
      if (kakaoApiToken && kakaoApiToken.accessToken) {
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.KAKAO_LOGIN, {
          kakaoToken: kakaoApiToken.accessToken,
        });

        const { jwtToken, userData } = response.data;

        // TODO: JWT 저장
        setUser(userData);
        setAuthState('success');
        console.log('Backend JWT:', jwtToken);
        Alert.alert('로그인 성공', `환영합니다, ${userData.name || '사용자'}님!`);
        // navigation.navigate('Home');
      } else {
        // 이 부분은 카카오 토큰 자체를 못 받았을 때의 처리였으나, Alert 위에서 이미 확인함
        // Alert.alert('카카오 로그인 실패', '카카오로부터 유효한 토큰을 받지 못했습니다.');
        // setAuthState('error');
      }
      */
      // ▲▲▲ 백엔드 API 호출 부분 (테스트를 위해 잠시 주석 처리) ▲▲▲

      // 임시: 카카오 토큰 받았으면 일단 성공으로 간주 (백엔드 연동 전 테스트)
      if (kakaoApiToken && kakaoApiToken.accessToken) {
        console.log('[ACHACHA_DEBUG] Kakao token received successfully (before backend integration). Token:', JSON.stringify(kakaoApiToken, null, 2));
        Alert.alert("카카오 인증 성공", "카카오로부터 액세스 토큰을 받았습니다. (백엔드 연동 전)");
        setAuthState('success'); // 실제로는 백엔드 성공 후 변경
      } else {
         console.warn('[ACHACHA_DEBUG] Kakao login failed: No valid token received from kakaoLogin(). Response:', JSON.stringify(kakaoApiToken, null, 2));
         Alert.alert('카카오 로그인 실패', '카카오로부터 유효한 토큰을 받지 못했습니다. (kakaoApiToken 또는 accessToken 없음)');
         setAuthState('error');
      }

    } catch (err) {
      console.error('[ACHACHA_DEBUG] signInWithKakao Error (Raw Error Object):', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      if (err.code === 'E_USER_CANCELLED') {
        console.log('[ACHACHA_DEBUG] Kakao login cancelled by user.');
        Alert.alert('로그인 취소', '카카오 로그인이 사용자에 의해 취소되었습니다.');
      } else if (err.code === 'E_KAKAO_LOGIN_FAILED' || err.message?.includes('Kakao')) {
         console.error('[ACHACHA_DEBUG] Kakao login explicitly failed. Message:', err.message, 'Code:', err.code);
         Alert.alert('카카오 로그인 실패', err.message || '카카오 서버에서 오류가 발생했습니다.');
      } else {
        console.error('[ACHACHA_DEBUG] Unknown login error. Message:', err.message, 'Code:', err.code);
        Alert.alert('로그인 오류', err.message || '알 수 없는 오류가 발생했습니다.');
      }
      setError(err);
      setAuthState('error');
    }
  }, [navigation]);

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