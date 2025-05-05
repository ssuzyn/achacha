import React from 'react';
import { Image, StyleSheet, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from 'react-native-elements';

// --- 로고 이미지 경로 ---
const LOGIN_LOGO_URL = '../assets/images/login_logo.png';
// -----------------------

const LoginScreen = () => {
  const { authState, signInWithKakao, signInWithGoogle } = useAuth();
  const { theme } = useTheme();

  const isLoading = authState === 'loading';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* 로고 영역 */}
          <View style={styles.logoContainer}>
            <Image source={require(LOGIN_LOGO_URL)} style={styles.logo} resizeMode="contain" />
          </View>

          {/* 텍스트 영역 */}
          <View style={styles.textContainer}>
            <Text variant="h1" weight="bold" size={22} center>
              소셜 계정으로
            </Text>
            <Text variant="h1" weight="bold" size={22} center>
              간편한 로그인
            </Text>
          </View>

          {/* 버튼 영역 */}
          <View style={styles.buttonContainer}>
            {/* 카카오톡 로그인 버튼 */}
            <TouchableOpacity
              onPress={signInWithKakao}
              disabled={isLoading}
              style={[
                styles.button,
                { backgroundColor: theme.colors.loginYellow },
                isLoading && styles.disabledButton,
              ]}
              activeOpacity={0.7}
            >
              <Text variant="button" weight="bold" size={16} color={theme.colors.textBrown}>
                카카오톡 로그인
              </Text>
            </TouchableOpacity>

            {/* 구글 로그인 버튼 */}
            <TouchableOpacity
              onPress={signInWithGoogle}
              disabled={isLoading}
              style={[
                styles.button,
                { backgroundColor: theme.colors.loginRed },
                isLoading && styles.disabledButton,
              ]}
              activeOpacity={0.7}
            >
              <Text variant="button" weight="bold" size={16} color={theme.colors.white}>
                Google 로그인
              </Text>
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
  buttonContainer: {
    width: '100%',
    marginTop: 16,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default LoginScreen;
