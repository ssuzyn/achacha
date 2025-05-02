import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// 실제 소셜 로그인 SDK import (예시)
// import kakaoLogin from '@react-native-kakao/login';
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

  // 카카오 로그인 처리 함수
  const signInWithKakao = useCallback(async () => {
    console.log('[useAuth] Attempting Kakao Login...');
    setAuthState('loading'); // 로딩 상태 시작 (옵션)
    try {
      // --- 실제 카카오 로그인 로직 구현 ---
      // const token = await kakaoLogin.login();
      // console.log('Kakao Login Success:', token);
      // await handleBackendLogin('kakao', token); // 백엔드 로그인 처리
      // ---------------------------------

      // 현재는 임시 로직
      alert('카카오 로그인이 구현되지 않았습니다.');
      setAuthState('success'); // 성공 상태 (옵션)
      navigation.navigate('Main'); // 홈으로 이동
    } catch (error) {
      console.error('[useAuth] Kakao Login Error:', error);
      setAuthState('error'); // 에러 상태 (옵션)
      Alert.alert('카카오 로그인 오류', error.message || '로그인 중 오류가 발생했습니다.');
    }
  }, [navigation]); // navigation 의존성 추가

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
      navigation.navigate('Main'); // 홈으로 이동
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
