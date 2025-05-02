import React from 'react';
import { Image, ActivityIndicator, StyleSheet } from 'react-native';
import { View, Text, SafeAreaView } from 'react-native-elements';
import { Button } from '../components/ui';
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
    <View style={[styles.container, { backgroundColor: theme.colors.white }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* 로고 영역 */}
          <View style={styles.logoContainer}>
            <Image source={require(LOGIN_LOGO_URL)} style={styles.logo} resizeMode="contain" />
          </View>

          {/* 텍스트 영역 */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.colors.black }]}>소셜 계정으로</Text>
            <Text style={[styles.title, { color: theme.colors.black }]}>간편한 로그인</Text>
          </View>

          {/* 버튼 영역 */}
          <View style={styles.buttonContainer}>
            <Button
              title={isLoading ? null : '카카오톡 로그인'}
              onPress={signInWithKakao}
              isDisabled={isLoading}
              isLoading={isLoading}
              style={[
                styles.kakaoButton,
                { backgroundColor: theme.colors.loginYellow },
                isLoading && styles.disabledButton,
              ]}
              textStyle={{ color: theme.colors.textBrown, fontWeight: 'bold', fontSize: 16 }}
            />

            <Button
              title={isLoading ? null : 'Google 로그인'}
              onPress={signInWithGoogle}
              isDisabled={isLoading}
              isLoading={isLoading}
              style={[
                styles.googleButton,
                { backgroundColor: theme.colors.loginRed },
                isLoading && styles.disabledButton,
              ]}
              textStyle={{ color: theme.colors.white, fontWeight: 'bold', fontSize: 16 }}
            />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 16,
  },
  kakaoButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  googleButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default LoginScreen;
