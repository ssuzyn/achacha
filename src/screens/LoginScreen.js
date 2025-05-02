import React from 'react';
import { Image, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import {
  Box,
  Text,
  Button,
  ButtonText,
  VStack,
  Center,
  Heading,
  Spinner,
} from '@gluestack-ui/themed';

// --- 로고 이미지 경로 ---
const LOGIN_LOGO_URL = '../../assets/login_logo.png';
// -----------------------

const LoginScreen = () => {
  const { authState, signInWithKakao, signInWithGoogle } = useAuth();

  const isLoading = authState === 'loading';

  return (
    <Box flex={1} bg="$background">
      <SafeAreaView style={styles.flex}>
        <Box flex={1} justifyContent="center" alignItems="center" p="$6">
          {/* 로고 영역 */}
          <Center mb="$8">
            <Image source={require(LOGIN_LOGO_URL)} style={styles.loginLogo} resizeMode="contain" />
          </Center>

          {/* 텍스트 영역 */}
          <VStack space="$2" mb="$8" alignItems="center">
            <Heading size="xl" color="$text">
              소셜 계정으로
            </Heading>
            <Heading size="xl" color="$text">
              간편한 로그인
            </Heading>
          </VStack>

          {/* 버튼 영역 */}
          <VStack space="$4" width="$full">
            <Button
              size="lg"
              bg="$socialKakao"
              borderRadius="$md"
              onPress={signInWithKakao}
              disabled={isLoading}
              opacity={isLoading ? 0.6 : 1}
            >
              {isLoading ? (
                <Spinner color="$socialKakaoText" />
              ) : (
                <ButtonText color="$socialKakaoText">카카오톡 로그인</ButtonText>
              )}
            </Button>
            <Button
              size="lg"
              bg="$socialGoogle"
              borderRadius="$md"
              onPress={signInWithGoogle}
              disabled={isLoading}
              opacity={isLoading ? 0.6 : 1}
            >
              {isLoading ? (
                <Spinner color="$socialGoogleText" />
              ) : (
                <ButtonText color="$socialGoogleText">Google 로그인</ButtonText>
              )}
            </Button>
          </VStack>
        </Box>
      </SafeAreaView>
    </Box>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loginLogo: {
    width: 400,
    height: 300,
  },
});

export default LoginScreen;
