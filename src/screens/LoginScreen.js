import React from 'react';
import { StyleSheet, View, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Text } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from 'react-native-elements';
import Svg, { Path } from 'react-native-svg';

const GoogleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 48 48">
    <Path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <Path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <Path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <Path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </Svg>
);

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
              <View style={styles.buttonContentContainer}>
                <Image
                  source={require('../assets/images/login-kakaotalk.png')}
                  style={styles.buttonIcon}
                  resizeMode="contain"
                />
                <Text variant="button" weight="bold" size={18} color={theme.colors.textBrown}>
                  카카오톡 로그인
                </Text>
              </View>
            </TouchableOpacity>

            {/* 구글 로그인 버튼 */}
            <TouchableOpacity
              onPress={signInWithGoogle}
              disabled={isLoading}
              style={[
                styles.button,
                // eslint-disable-next-line react-native/no-inline-styles
                { backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd' },
                isLoading && styles.disabledButton,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.buttonContentContainer}>
                <View style={styles.googleIconContainer}>
                  <GoogleIcon />
                </View>
                <Text variant="button" weight="bold" size={18} color="#5F6368">
                  Google 로그인
                </Text>
              </View>
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
  buttonContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: 25,
    height: 25,
    marginRight: 15,
  },
  googleIconContainer: {
    marginRight: 15,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default LoginScreen;
