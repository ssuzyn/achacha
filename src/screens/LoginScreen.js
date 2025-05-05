import React from 'react';
import { StyleSheet, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from 'react-native-elements';

const LoginScreen = () => {
  const { authState, signInWithKakao, signInWithGoogle } = useAuth();
  const { theme } = useTheme();

  const isLoading = authState === 'loading';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.centerContainer}>
            {/* 텍스트 영역 */}
            <View style={styles.textContainer}>
              <Text variant="h1" weight="bold" size={20} center style={styles.loginText}>
                소셜 계정으로
              </Text>
              <Text variant="h1" weight="bold" size={20} center style={styles.loginText}>
                간편하게 로그인하고
              </Text>
              <Text variant="h1" weight="bold" size={20} center style={styles.loginText}>
                더 나은 서비스를 경험해보세요.
              </Text>
            </View>
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
    paddingVertical: 25,
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 45,
  },
  logo: {
    width: 400,
    height: 300,
  },
  textContainer: {
    alignItems: 'center',
  },
  loginText: {
    marginBottom: 6,
    lineHeight: 30,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
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
