import React from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* 로고 영역 */}
          <View style={styles.logoContainer}>
            <Image source={require(LOGIN_LOGO_URL)} style={styles.logo} resizeMode="contain" />
          </View>

          {/* 텍스트 영역 */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>소셜 계정으로</Text>
            <Text style={styles.title}>간편한 로그인</Text>
          </View>

          {/* 버튼 영역 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.kakaoButton, isLoading && styles.disabledButton]}
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
              style={[styles.googleButton, isLoading && styles.disabledButton]}
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
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 400,
    height: 300,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 16,
  },
  kakaoButton: {
    backgroundColor: '#FCE642',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  googleButton: {
    backgroundColor: '#EF4040',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kakaoButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#462000',
  },
  googleButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default LoginScreen;
