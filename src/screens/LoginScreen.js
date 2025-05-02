import React from 'react';
import {
  Image,
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

// --- 로고 이미지 경로 ---
const LOGIN_LOGO_URL = '../../assets/login_logo.png';
// -----------------------

const LoginScreen = () => {
  const { authState, signInWithKakao, signInWithGoogle } = useAuth();

  const isLoading = authState === 'loading';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.content}>
          {/* 로고 영역 */}
          <View style={styles.logoContainer}>
            <Image source={require(LOGIN_LOGO_URL)} style={styles.loginLogo} resizeMode="contain" />
          </View>

          {/* 텍스트 영역 */}
          <View style={styles.textContainer}>
            <Text style={styles.heading}>소셜 계정으로</Text>
            <Text style={styles.heading}>간편한 로그인</Text>
          </View>

          {/* 버튼 영역 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.kakaoButton, isLoading && styles.disabledButton]}
              onPress={signInWithKakao}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#462000" />
              ) : (
                <Text style={styles.kakaoButtonText}>카카오톡 로그인</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.googleButton, isLoading && styles.disabledButton]}
              onPress={signInWithGoogle}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.googleButtonText}>Google 로그인</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  loginLogo: {
    width: 400,
    height: 300,
  },
  textContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  kakaoButton: {
    backgroundColor: '#FCE642',
  },
  googleButton: {
    backgroundColor: '#EF4040',
  },
  disabledButton: {
    opacity: 0.6,
  },
  kakaoButtonText: {
    color: '#462000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  googleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LoginScreen;
