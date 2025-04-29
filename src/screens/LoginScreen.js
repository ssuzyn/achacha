import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

// --- 로고 이미지 경로 (실제 프로젝트 경로에 맞게 수정) ---
const GOOGLE_LOGO_URL = '../../assets/google_logo.png'; // 파일명 수정 (log -> logo)
const KAKAO_LOGO_URL = '../../assets/kakao-talk_logo.png'; // 파일명 수정
// -----------------------------------------------------

const LoginScreen = () => {
  const { authState, signInWithKakao, signInWithGoogle } = useAuth();

  const isLoading = authState === 'loading';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 로고 영역 */}
        <View style={styles.logoContainer}>
          <Image source={require(GOOGLE_LOGO_URL)} style={styles.googleLogo} resizeMode="contain" />
          <Image source={require(KAKAO_LOGO_URL)} style={styles.kakaoLogo} resizeMode="contain" />
        </View>

        {/* 텍스트 영역 */}
        <Text style={styles.title}>소셜 계정으로 간편하게 로그인</Text>

        {/* 버튼 영역 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.kakaoButton, isLoading && styles.buttonDisabled]}
            onPress={signInWithKakao}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#191919" />
            ) : (
              <Text style={[styles.buttonText, styles.kakaoButtonText]}>카카오톡 로그인</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.googleButton, isLoading && styles.buttonDisabled]}
            onPress={signInWithGoogle}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[styles.buttonText, styles.googleButtonText]}>Google 로그인</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40, // 하단 여백 추가
  },
  logoContainer: {
    flexDirection: 'column', // 세로 배치로 변경
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40, // 텍스트와의 간격 조정 (기존 60)
    // 이미지와 유사하게 배치하려면 flexDirection: 'column' 또는 각 로고 위치 조정 필요
  },
  googleLogo: {
    // 구글 로고 스타일 추가
    width: 140,
    height: 140,
    marginBottom: 0, // 아래 로고와의 간격
    transform: [{ translateX: -80 }, { translateY: 50 }], // 왼쪽으로 80만큼 이동 아래로 50만큼 이동
  },
  kakaoLogo: {
    width: 170,
    height: 170,
    marginBottom: 0,
    transform: [{ translateX: 80 }], // 오른쪽으로 80만큼 이동
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10, // 두 줄 사이 간격
  },
  buttonContainer: {
    width: '90%', // 버튼 너비 컨테이너
    marginTop: 60, // 텍스트와의 간격
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15, // 버튼 간 간격
    flexDirection: 'row', // 아이콘과 텍스트 가로 배치 위해
    justifyContent: 'center', // 내부 요소 중앙 정렬
  },
  kakaoButton: {
    backgroundColor: '#FEE500', // 카카오 표준 노란색
  },
  googleButton: {
    backgroundColor: '#EA4335', // 구글 표준 빨간색 (이미지 참고)
    // 표준 가이드라인은 흰색 배경에 로고 사용 권장
    // backgroundColor: '#FFFFFF',
    // borderWidth: 1,
    // borderColor: '#DDDDDD',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8, // 아이콘과 텍스트 간격 (아이콘 추가 시)
  },
  kakaoButtonText: {
    color: '#191919', // 카카오 텍스트 색상
  },
  googleButtonText: {
    color: '#FFFFFF', // 빨간 배경일 때 흰색 텍스트
    // color: '#5F6368', // 흰색 배경일 때 회색 텍스트
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default LoginScreen;
